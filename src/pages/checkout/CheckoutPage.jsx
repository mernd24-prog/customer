import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { formatMoney } from "../../utils/ecommerce";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(8, "Phone is required"),
  line1: z.string().trim().min(3, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().min(4, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required"),
  couponCode: z.string().trim().optional(),
  walletAmount: z.coerce.number().min(0).optional(),
});

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
  const items = cart.items || [];
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
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
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

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="mb-8 text-2xl font-bold text-slate-950 sm:text-3xl">Checkout</h1>

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
                  <section className="rounded-lg border border-stone-200 bg-white p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
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
                                ? "border-slate-950 bg-slate-50"
                                : "border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="addressSelect"
                              value={addrId}
                              checked={selectedAddressId === addrId && !useNewAddress}
                              onChange={() => { setSelectedAddressId(addrId); setUseNewAddress(false); }}
                              className="mt-1 h-4 w-4 accent-slate-950"
                            />
                            <div className="text-sm">
                              <p className="font-medium text-slate-900">{addr.label} {addr.isDefault && <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span>}</p>
                              <p className="text-slate-600">{addr.fullName} · {addr.phone}</p>
                              <p className="text-slate-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.postalCode}</p>
                            </div>
                          </label>
                        );
                      })}

                      <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${useNewAddress ? "border-slate-950 bg-slate-50" : "border-stone-200 hover:border-stone-400"}`}>
                        <input
                          type="radio"
                          name="addressSelect"
                          checked={useNewAddress}
                          onChange={() => setUseNewAddress(true)}
                          className="h-4 w-4 accent-slate-950"
                        />
                        <span className="text-sm font-medium text-slate-900">Use a different address</span>
                      </label>
                    </div>
                  </section>
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) && (
                  <section className="rounded-lg border border-stone-200 bg-white p-5">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">Shipping address</h2>
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
                <section className="rounded-lg border border-stone-200 bg-white p-5">
                  <h2 className="mb-4 text-base font-semibold text-slate-900">Discounts</h2>
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
                        className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-stone-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                      />
                    </label>
                  </div>
                </section>
              </div>

              {/* Right column: order summary */}
              <aside>
                <div className="rounded-lg border border-stone-200 bg-white p-5 sticky top-4">
                  <h2 className="mb-4 text-base font-semibold text-slate-900">Order summary</h2>
                  <div className="grid gap-3 divide-y divide-stone-100">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between pt-3 text-sm first:pt-0">
                        <span className="text-slate-700 truncate max-w-[180px]">
                          {item.title || item.productId}
                          <span className="text-slate-400"> × {item.quantity}</span>
                        </span>
                        <span className="font-medium text-slate-900 shrink-0 ml-2">
                          {formatMoney((item.price || 0) * item.quantity, "INR")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-stone-200 pt-4">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatMoney(items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0), "INR")}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-slate-500">
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

                  <p className="mt-3 text-center text-xs text-slate-400">
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
