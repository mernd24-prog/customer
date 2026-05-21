import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, CreditCard, MapPin, Tag, Wallet } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { useToastThunk } from "../../hooks/useToastThunk";
import { fetchCart } from "../../features/cart/cartSlice";
import { fetchWallet } from "../../features/wallet/walletSlice";
import { fetchMe } from "../../features/user/userSlice";
import { createOrder } from "../../features/order/orderSlice";
import { initiatePayment } from "../../features/payment/paymentSlice";
import { formatMoney, getProductId, getProductTitle } from "../../utils/ecommerce";
import { addressSchema } from "../../validations/validationSchemas";



export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();

  const cartState = useSelector((s) => s.cart);
  const walletState = useSelector((s) => s.wallet);
  const userState = useSelector((s) => s.user);
  const orderState = useSelector((s) => s.order);
  const paymentState = useSelector((s) => s.payment);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const cart = cartState.current || {};
  const items = (cart.items || []).map((item, index) => {
    const product = item?.productId && typeof item.productId === "object" ? item.productId : item?.product || null;
    const safeProductId = getProductId(product || item?.productId || item?.id || `item-${index}`);
    return {
      ...item,
      _safeId: safeProductId || `item-${index}`,
      _safeTitle: item?.title || getProductTitle(product, "Product"),
    };
  });
  const addresses = userState.current?.addresses || [];
  const walletBalance = walletState.current?.balance || 0;

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWallet());
    dispatch(fetchMe());
  }, [dispatch]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id || def.id);
    }
    if (addresses.length === 0) setUseNewAddress(true);
  }, [addresses, selectedAddressId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India", walletAmount: 0 },
  });

  const loading = cartState.loading || walletState.loading || orderState.loading || paymentState.loading;

  const submit = async (values) => {
    let shippingAddress;
    if (!useNewAddress && selectedAddressId) {
      const saved = addresses.find((a) => (a._id || a.id) === selectedAddressId);
      shippingAddress = saved
        ? { fullName: saved.fullName, phone: saved.phone, line1: saved.line1, line2: saved.line2, city: saved.city, state: saved.state, postalCode: saved.postalCode, country: saved.country }
        : values;
    } else {
      shippingAddress = {
        fullName: values.fullName,
        phone: values.phone,
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
      };
    }

    const order = await run(
      dispatch,
      createOrder({
        currency: "INR",
        couponCode: values.couponCode || undefined,
        walletAmount: Number(values.walletAmount || 0),
        shippingAddress,
        items: items.map(({ productId, _safeId, quantity, variantId, variantSku, variantTitle, attributes }) => ({
          productId: typeof productId === "object" ? _safeId : productId,
          variantId: variantId || undefined,
          variantSku: variantSku || undefined,
          variantTitle: variantTitle || undefined,
          attributes: attributes || {},
          quantity,
        })),
      }),
      "Order created",
    );

    const orderId = order?.data?.id || order?.data?.orderId;
    if (!orderId) return;

    await run(
      dispatch,
      initiatePayment({
        orderId,
        provider: "razorpay",
        amount: order?.data?.amounts?.payableAmount || 0,
        currency: "INR",
        notes: { source: "web_checkout" },
      }),
      "Redirecting to payment…",
    );

    navigate("/payment/success");
  };

  return (
    <>
      <Seo title="Checkout | Sam Global" />

      <div className="w-container py-8 sm:py-10">
        <h1 className="mb-8 font-montserrat text-2xl font-bold text-[#2E2E2E] sm:text-3xl">Checkout</h1>

        <ApiState
          loading={cartState.loading}
          error={cartState.error}
          empty={items.length === 0}
          emptyTitle="Your cart is empty"
          emptyText="Add products to your cart before checking out."
          onRetry={() => dispatch(fetchCart())}
        >
          <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              {/* Left column: shipping + payment */}
              <div className="grid gap-6">
                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <section className="rounded-[12px] border border-[#e7dfd1] bg-white p-5">
                    <h2 className="mb-4 flex items-center gap-2 font-montserrat text-base font-semibold text-[#2E2E2E]">
                      <MapPin size={16} /> Delivery address
                    </h2>
                    <div className="grid gap-3">
                      {addresses.map((addr) => {
                        const addrId = addr._id || addr.id;
                        return (
                          <label
                            key={addrId}
                            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                              selectedAddressId === addrId && !useNewAddress
                                ? "border-[#CE9F2D] bg-[#FAF6EE]"
                                : "border-[#e7dfd1] hover:border-[#CE9F2D]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="addressSelect"
                              value={addrId}
                              checked={selectedAddressId === addrId && !useNewAddress}
                              onChange={() => { setSelectedAddressId(addrId); setUseNewAddress(false); }}
                              className="mt-1 h-4 w-4 accent-[#CE9F2D]"
                            />
                            <div className="text-sm">
                              <p className="font-medium text-[#2E2E2E]">{addr.label} {addr.isDefault && <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span>}</p>
                              <p className="text-[#787878]">{addr.fullName} · {addr.phone}</p>
                              <p className="text-[#787878]">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.postalCode}</p>
                            </div>
                          </label>
                        );
                      })}

                      <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${useNewAddress ? "border-[#CE9F2D] bg-[#FAF6EE]" : "border-[#e7dfd1] hover:border-[#CE9F2D]"}`}>
                        <input
                          type="radio"
                          name="addressSelect"
                          checked={useNewAddress}
                          onChange={() => setUseNewAddress(true)}
                          className="h-4 w-4 accent-[#CE9F2D]"
                        />
                        <span className="text-sm font-medium text-[#2E2E2E]">Use a different address</span>
                      </label>
                    </div>
                  </section>
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) && (
                  <section className="rounded-[12px] border border-[#e7dfd1] bg-white p-5">
                    <h2 className="mb-4 font-montserrat text-base font-semibold text-[#2E2E2E]">Shipping address</h2>
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField id="fullName" label="Full name" registration={register("fullName")} error={errors.fullName} autoComplete="name" />
                        <FormField id="phone" label="Phone" type="tel" registration={register("phone")} error={errors.phone} autoComplete="tel" />
                      </div>
                      <FormField id="line1" label="Address line 1" registration={register("line1")} error={errors.line1} autoComplete="address-line1" />
                      <FormField id="line2" label="Address line 2 (optional)" registration={register("line2")} error={errors.line2} autoComplete="address-line2" />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField id="city" label="City" registration={register("city")} error={errors.city} autoComplete="address-level2" />
                        <FormField id="state" label="State" registration={register("state")} error={errors.state} autoComplete="address-level1" />
                        <FormField id="postalCode" label="Postal code" registration={register("postalCode")} error={errors.postalCode} autoComplete="postal-code" />
                      </div>
                      <FormField id="country" label="Country" registration={register("country")} error={errors.country} autoComplete="country-name" />
                    </div>
                  </section>
                )}

                {/* Coupons & wallet */}
                <section className="rounded-[12px] border border-[#e7dfd1] bg-white p-5">
                  <h2 className="mb-4 font-montserrat text-base font-semibold text-[#2E2E2E]">Discounts</h2>
                  <div className="grid gap-4">
                    <FormField
                      id="couponCode"
                      label="Coupon code"
                      registration={register("couponCode")}
                      error={errors.couponCode}
                      placeholder="Enter coupon (applied on order)"
                    />
                    <label className="grid gap-1.5 text-sm font-medium text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Wallet size={14} /> Wallet amount (balance: {formatMoney(walletBalance, "INR")})
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={walletBalance}
                        placeholder="0"
                        {...register("walletAmount")}
                        className="min-h-11 rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-[#2E2E2E] outline-none transition placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
                      />
                    </label>
                  </div>
                </section>
              </div>

              {/* Right column: order summary */}
              <aside>
                <div className="rounded-lg border border-[#e7dfd1] bg-white p-5 sticky top-4">
                  <h2 className="mb-4 font-montserrat text-base font-semibold text-[#2E2E2E]">Order summary</h2>
                  <div className="grid gap-3 divide-y divide-[#e7dfd1]">
                    {items.map((item) => (
                      <div key={item._safeId} className="flex justify-between pt-3 text-sm first:pt-0">
                        <span className="text-slate-700 truncate max-w-[180px]">
                          {item._safeTitle}
                          <span className="text-[#A6A6A6]"> × {item.quantity}</span>
                        </span>
                        <span className="font-medium text-[#2E2E2E] shrink-0 ml-2">
                          {formatMoney((item.price || 0) * item.quantity, "INR")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-[#e7dfd1] pt-4">
                    <div className="flex justify-between text-sm text-[#787878]">
                      <span>Subtotal</span>
                      <span>{formatMoney(items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0), "INR")}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-[#787878]">
                      <span>Shipping</span>
                      <span>Calculated at order</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="mt-5 w-full"
                  >
                    <CreditCard size={16} /> Place order &amp; pay
                  </Button>

                  <p className="mt-3 text-center text-xs text-[#A6A6A6]">
                    Secured by Razorpay · SSL encrypted
                  </p>
                </div>
              </aside>
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}
