import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  // Bell,
  Banknote,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Gift,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Wallet,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { notify } from "../utils/notify";
import ApiState from "../components/common/ApiState";
import Breadcrumbs from "../components/ecommerce/Breadcrumbs";
import Seo from "../components/common/Seo";
import BrandButton from "../components/ui/BrandButton";
import StatusTimeline from "../components/common/display/StatusTimeline";
import { ProductCard } from "../components/ecommerce";
import { useToastThunk } from "../hooks/useToastThunk";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import { formatMoney, getImageUrlFromValue } from "../utils/ecommerce";
// import { formatAddress, formatPhone } from "../utils/formatters";
import notificationData from "../data/notificationData";
import Tabs from "../components/ui/Tabs";

import { useProductActions } from "../hooks/useProductActions";
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyOtp,
  verifyRegistration,
  registerUserWithOtp,
  socialLogin,
} from "../features/auth/authSlice";
import {
  fetchProducts,
  fetchProductById,
} from "../features/product/productSlice";
import { fetchCategoryByKey } from "../features/catalog/catalogSlice";
import { fetchCart, updateCart } from "../features/cart/cartSlice";
import { createOrder } from "../features/order/orderSlice";
import {
  fetchPaymentOptions,
  initiatePayment,
  fetchPayments,
} from "../features/payment/paymentSlice";
import { checkServiceability } from "../features/delivery/deliverySlice";
import {
  fetchMyOrders,
  fetchOrderById,
  cancelOrder,
} from "../features/order/orderSlice";
import {
  requestReturn,
  fetchMyReturns,
  fetchReturnByOrder,
} from "../features/returns/returnsSlice";
import { fetchWallet } from "../features/wallet/walletSlice";
import {
  fetchSubscriptionPlans,
  purchaseSubscription,
} from "../features/subscription/subscriptionSlice";
import {
  fetchNotifications,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "../features/notification/notificationSlice";
import {
  fetchLoyaltyProfile,
  fetchLoyaltyHistory,
  redeemLoyaltyPoints,
} from "../features/loyalty/loyaltySlice";
import {
  fetchProductWarranty,
  fetchWarrantyById,
  fetchOrderWarranties,
  registerWarranty,
  claimWarranty,
} from "../features/warranty/warrantySlice";
import { fetchOrderInvoice } from "../features/tax/taxSlice";
import { fetchMarketplaceInvoices } from "../features/tax/taxSlice";
import { trackRecommendationInteraction } from "../features/recommendation/recommendationSlice";
import { trackAnalyticsEvent } from "../features/analytics/analyticsSlice";
import { fetchDynamicPrice } from "../features/dynamicPricing/dynamicPricingSlice";
import {
  fetchMe,
  updateMe,
  addAddress,
  submitUserKyc,
} from "../features/user/userSlice";
import { AUTH_ROUTES } from "../features/auth/authRoutes";
import { useFetch, itemsFrom } from "./customer/helpers";
import OrderDetailLayout from "./orders/components/OrderDetailLayout";
import { OrderDetailAside } from "./orders/components/OrderDetailLayout";
import OrderDetailSectionCard from "./orders/components/OrderDetailSectionCard";
import OrderItemsSection from "./orders/components/OrderItemsSection";
import OrderProgress from "./orders/components/OrderProgress";
// import OrderPaymentSummary from "./orders/components/OrderPaymentSummary";

import { SummaryRow } from "./orders/components/OrderPaymentSummary";
import { endpoints } from "../api/endpoints";
import { downloadAuthDocument } from "../utils/downloadAuthDocument";
import {
  loginSchema,
  emailSchema,
  otpSchema,
  resetSchema,
  registerSchema,
} from "../validations/validationSchemas";
import { sanitizeSearchQuery } from "../validations";
export { HomePage } from "./customer/HomePage";

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const displayLabel = (value = "") => String(value || "N/A").replace(/_/g, " ");

const getOrderId = (order) =>
  order?.id || order?._id || order?.orderId || order?.order_id;
const getOrderNumber = (order) =>
  order?.order_number || order?.orderNumber || getOrderId(order);
const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.lineItems ||
    order?.line_items ||
    order?.products;
  return Array.isArray(items) ? items : [];
};
const getItemProduct = (item) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product;
const getItemImage = (item) => {
  const product = getItemProduct(item);
  const candidateImages = [
    item?.image,
    item?.imageUrl,
    item?.images,
    item?.thumbnail,
    item?.thumbnailUrl,
    item?.product_image,
    item?.productImage,
    item?.product_image_url,
    item?.productImageUrl,
    item?.product_thumbnail,
    item?.productThumbnail,
    item?.variant?.image,
    item?.variant?.images,
    item?.variant?.imageUrl,
    item?.variant?.thumbnail,
    item?.variant?.thumbnailUrl,
    product?.image,
    product?.images,
    product?.imageUrl,
    product?.thumbnail,
    product?.thumbnailUrl,
  ];

  for (const candidate of candidateImages) {
    const url = getImageUrlFromValue(candidate);
    if (url) return url;
  }
  return "";
};
const getItemUnitPrice = (item) =>
  item?.unit_price ??
  item?.unitPrice ??
  item?.sale_price ??
  item?.salePrice ??
  item?.price ??
  item?.variant?.price ??
  getItemProduct(item)?.salePrice ??
  getItemProduct(item)?.sale_price ??
  getItemProduct(item)?.price ??
  0;
const getItemLineTotal = (item) =>
  item?.line_total ??
  item?.lineTotal ??
  item?.total_price ??
  item?.totalPrice ??
  asNumber(getItemUnitPrice(item)) * asNumber(item?.quantity || 1);
const getOrderProductTitle = (item) =>
  getItemProduct(item)?.title ||
  getItemProduct(item)?.name ||
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  "Product";
const getOrderItemColor = (item) => {
  const attributes =
    item?.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {};
  const found = Object.entries(attributes).find(([key]) =>
    String(key).toLowerCase().includes("color"),
  );
  return found?.[1] || item?.color || item?.selectedColor || "N/A";
};
const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const getOrderItemLineTotal = (item) => {
  const unitPrice =
    item?.unit_price ??
    item?.unitPrice ??
    item?.sale_price ??
    item?.salePrice ??
    item?.price ??
    item?.variant?.price ??
    getItemProduct(item)?.salePrice ??
    getItemProduct(item)?.sale_price ??
    getItemProduct(item)?.price ??
    0;
  const quantity = asNumber(item?.quantity || 1);
  return (
    item?.line_total ??
    item?.lineTotal ??
    item?.total_price ??
    item?.totalPrice ??
    asNumber(unitPrice) * quantity
  );
};
const getOrderCurrency = (order) => {
  const firstItem = getOrderItems(order)[0];
  const firstProduct = getItemProduct(firstItem);
  return order?.currency || firstProduct?.currency || "INR";
};
const getAddressValue = (address, camelKey, snakeKey = camelKey) =>
  address?.[camelKey] || address?.[snakeKey];
const getOrderAddressValue = getAddressValue;
const getOrderAddressName = (address) => {
  const source = address?.user || address?.customer || address?.data || address;
  if (source && source !== address) return getOrderAddressName(source);

  const firstName = address?.firstName || address?.first_name;
  const lastName = address?.lastName || address?.last_name;
  const joinedName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    getOrderAddressValue(address, "fullName", "full_name") ||
    address?.name ||
    address?.displayName ||
    address?.display_name ||
    address?.userName ||
    address?.user_name ||
    address?.username ||
    address?.customerName ||
    address?.customer_name ||
    address?.recipientName ||
    address?.recipient_name ||
    address?.receiverName ||
    address?.receiver_name ||
    address?.contactName ||
    address?.contact_name ||
    joinedName
  );
};
const getOrderPhone = (address) => {
  const source = address?.user || address?.customer || address?.data || address;
  if (source && source !== address) return getOrderPhone(source);

  return (
    address?.phone ||
    address?.phoneNumber ||
    address?.phone_number ||
    address?.mobile ||
    address?.mobileNo ||
    address?.mobile_no ||
    address?.contact ||
    address?.contactNumber ||
    address?.contact_number ||
    address?.telephone ||
    address?.telephoneNumber ||
    address?.telephone_number ||
    address?.mobileNumber ||
    address?.mobile_number
  );
};
const hasOrderShippingAddress = (address) =>
  Boolean(
    getOrderAddressName(address) ||
    getOrderPhone(address) ||
    address?.line1 ||
    address?.address_line1 ||
    address?.line2 ||
    address?.address_line2 ||
    address?.city ||
    address?.state ||
    getOrderAddressValue(address, "postalCode", "postal_code") ||
    address?.pincode ||
    address?.zip ||
    address?.country,
  );
const getOrderAmount = (order, key) => {
  const snakeKey = {
    subtotal: "subtotal_amount",
    discount: "discount_amount",
    tax: "tax_amount",
    total: "total_amount",
    walletDiscount: "wallet_discount_amount",
    payable: "payable_amount",
    platformFee: "platform_fee_amount",
    shipping: "shipping_fee_amount",
  }[key];

  const aliases =
    {
      subtotal: ["subtotalAmount", "subTotal", "subtotal"],
      discount: ["discountAmount", "discount"],
      tax: ["taxAmount", "totalTaxAmount", "tax"],
      total: ["totalAmount", "orderTotal", "grandTotal", "total"],
      walletDiscount: ["walletDiscountAmount", "walletDiscount"],
      payable: ["payableAmount", "payable", "amountPayable", "totalAmount"],
      platformFee: ["platformFeeAmount", "platformFee"],
      shipping: [
        "shippingFeeAmount",
        "shippingFee",
        "shippingAmount",
        "shipping",
      ],
    }[key] || [];

  for (const field of [key, snakeKey, ...aliases]) {
    if (field && order?.summary?.[field] !== undefined)
      return order.summary[field];
    if (field && order?.amounts?.[field] !== undefined)
      return order.amounts[field];
    if (field && order?.[field] !== undefined) return order[field];
  }

  if (
    ["subtotal", "total", "payable"].includes(key) &&
    getOrderItems(order).length
  ) {
    return getOrderItems(order).reduce(
      (total, item) => total + asNumber(getOrderItemLineTotal(item)),
      0,
    );
  }

  return undefined;
};
const getCustomerOrderAmount = (order) => {
  const subtotal =
    getOrderAmount(order, "subtotal") ??
    getOrderItems(order).reduce(
      (sum, item) => sum + asNumber(getOrderItemLineTotal(item)),
      0,
    );
  const discount = getOrderAmount(order, "discount") ?? 0;
  const walletDiscount = getOrderAmount(order, "walletDiscount") ?? 0;
  const shipping = getOrderAmount(order, "shipping") ?? 0;
  const taxPayable =
    order?.summary?.taxPayableAmount ??
    order?.summary?.tax_payable_amount ??
    order?.taxBreakup?.taxPayableAmount ??
    order?.tax_breakup?.tax_payable_amount ??
    0;
  const codCharge =
    order?.summary?.codChargeAmount ??
    order?.summary?.cod_charge_amount ??
    order?.amounts?.codChargeAmount ??
    order?.amounts?.cod_charge_amount ??
    0;
  const calculatedAmount = Number(
    Math.max(
      0,
      asNumber(subtotal) -
        asNumber(discount) +
        asNumber(shipping) +
        asNumber(taxPayable) +
        asNumber(codCharge) -
        asNumber(walletDiscount),
    ).toFixed(2),
  );

  if (order?.summary?.customerPayableAmount !== undefined) {
    const payableAmount = asNumber(order.summary.customerPayableAmount);
    return payableAmount > 0 || calculatedAmount <= 0
      ? payableAmount
      : calculatedAmount;
  }
  if (order?.summary?.customerTotalAmount !== undefined) {
    const payableAmount = Math.max(
      0,
      asNumber(order.summary.customerTotalAmount) -
        asNumber(order.summary.walletDiscountAmount),
    );
    return payableAmount > 0 || calculatedAmount <= 0
      ? payableAmount
      : calculatedAmount;
  }
  return calculatedAmount;
};
const formatOrderDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
const formatOrderId = (id = "") => String(id);

const getDeliveryEtaDays = (order = {}) => {
  const metadata =
    order.metadata && typeof order.metadata === "object" ? order.metadata : {};
  const sellers = Array.isArray(metadata.deliveryCharge?.sellers)
    ? metadata.deliveryCharge.sellers
    : [];
  const etas = sellers.map((s) => s.estimatedDeliveryDays).filter(Boolean);
  if (!etas.length) return null;
  const minDays = Math.min(...etas.map((e) => Number(e.minDays ?? e.maxDays ?? 0)));
  const maxDays = Math.max(...etas.map((e) => Number(e.maxDays ?? e.minDays ?? 0)));
  if (!maxDays) return null;
  return { minDays: minDays > 0 ? minDays : null, maxDays };
};

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const getExpectedDeliveryDate = (order) =>
  order?.expected_delivery ||
  order?.expectedDelivery ||
  order?.delivery_date ||
  order?.deliveryDate ||
  order?.shipping?.expectedDelivery ||
  order?.shipmentDate ||
  order?.relations?.shipments?.[0]?.expected_delivery_at ||
  order?.relations?.shipments?.[0]?.expectedDeliveryAt ||
  null;

const getDeliveryDateRange = (order = {}) => {
  const explicit = getExpectedDeliveryDate(order);
  if (explicit) return { minDate: null, maxDate: new Date(explicit) };
  const eta = getDeliveryEtaDays(order);
  if (!eta) return null;
  const base = order.created_at || order.createdAt || new Date();
  return {
    minDate: eta.minDays ? addDays(base, eta.minDays) : null,
    maxDate: addDays(base, eta.maxDays),
  };
};
const unwrapOrder = (value) => {
  const wrapper = value?.data?.order ? value.data : value;
  const order = wrapper?.order || wrapper;

  if (wrapper?.order && typeof wrapper.order === "object") {
    return {
      ...wrapper.order,
      items: getOrderItems(wrapper.order).length
        ? getOrderItems(wrapper.order)
        : getOrderItems(wrapper),
      amounts: wrapper.order.amounts || wrapper.amounts,
      shipping_address:
        wrapper.order.shipping_address || wrapper.shipping_address,
      shippingAddress: wrapper.order.shippingAddress || wrapper.shippingAddress,
      tax_breakup: wrapper.order.tax_breakup || wrapper.tax_breakup,
      taxBreakup: wrapper.order.taxBreakup || wrapper.taxBreakup,
    };
  }

  return order;
};
const idsMatch = (left, right) => String(left || "") === String(right || "");
const findFetchedOrder = (orderState, orderId) => {
  if (!orderId) return null;
  const currentOrder = unwrapOrder(orderState.current);
  if (idsMatch(getOrderId(currentOrder), orderId)) return currentOrder;

  const entityOrder = unwrapOrder(orderState.entities?.[orderId]);
  if (idsMatch(getOrderId(entityOrder), orderId)) return entityOrder;

  const listOrder = Array.isArray(orderState.list)
    ? orderState.list.find((item) => idsMatch(getOrderId(item), orderId))
    : null;
  return listOrder ? unwrapOrder(listOrder) : null;
};

const getProductId = (item = {}) => {
  const product = item.productId || item.product_id || item.product || item;
  return typeof product === "object"
    ? firstDefined(product._id, product.id, product.productId, product.sku)
    : product;
};

const getProductTitle = (item = {}) => {
  const product = item.productId || item.product_id || item.product;
  return typeof product === "object"
    ? firstDefined(
        product.title,
        product.name,
        product.sku,
        product._id,
        product.id,
      )
    : product;
};

const cartEstimate = (items = []) =>
  items.reduce((sum, item) => {
    const product = item.productId || item.product_id || item.product || {};
    const unit = Number(
      firstDefined(
        item.unitPrice,
        item.unit_price,
        product.salePrice,
        product.price,
        0,
      ),
    );
    return sum + unit * Number(item.quantity || 0);
  }, 0);

export function AuthFormPage({ mode }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const run = useToastThunk();
  const [showPassword, setShowPassword] = useState(false);
  const schema =
    mode === "register" || mode === "register-otp"
      ? registerSchema
      : mode === "reset"
        ? resetSchema
        : mode === "forgot"
          ? emailSchema
          : mode === "verify-registration" || mode === "verify-otp"
            ? otpSchema
            : loginSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: location.state?.email || "",
    },
  });
  const title = {
    login: "Login",
    register: "Create account",
    "register-otp": "Register with OTP",
    "verify-registration": "Verify registration",
    "verify-otp": "Verify OTP",
    forgot: "Forgot password",
    reset: "Reset password",
  }[mode];

  const submit = async (values) => {
    const payload = values.firstName
      ? {
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: "buyer",
          profile: { firstName: values.firstName, lastName: values.lastName },
          referralCode: values.referralCode || undefined,
        }
      : values;
    const thunk =
      mode === "register"
        ? registerUser(payload)
        : mode === "register-otp"
          ? registerUserWithOtp(payload)
          : mode === "forgot"
            ? forgotPassword(values)
            : mode === "reset"
              ? resetPassword(values)
              : mode === "verify-registration"
                ? verifyRegistration(values)
                : mode === "verify-otp"
                  ? verifyOtp({ ...values, purpose: "login" })
                  : loginUser({
                      email: values.email,
                      password: values.password,
                    });
    const result = await run(dispatch, thunk, "Success");
    const session = result?.data || result || {};
    const hasSession = Boolean(session?.accessToken || session?.refreshToken);

    if (
      mode === "login" ||
      mode === "verify-registration" ||
      mode === "verify-otp"
    ) {
      navigate(AUTH_ROUTES.home);
      return;
    }

    if (mode === "register" || mode === "register-otp") {
      if (hasSession) {
        navigate(AUTH_ROUTES.home);
        return;
      }
      navigate(AUTH_ROUTES.verifyRegistration, {
        state: { email: values.email },
      });
      return;
    }

    if (mode === "forgot") {
      navigate(AUTH_ROUTES.resetPassword, { state: { email: values.email } });
      return;
    }

    if (mode === "reset") {
      navigate(AUTH_ROUTES.login);
    }
  };

  return (
    <section className="narrow">
      <Seo title={`${title} | Sam Global`} />
      <form
        className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
        onSubmit={handleSubmit(submit)}
      >
        <h1>{title}</h1>
        {(mode === "register" || mode === "register-otp") && (
          <>
            <input placeholder="First name" {...register("firstName")} />
            <small>{errors.firstName?.message}</small>
            <input placeholder="Last name" {...register("lastName")} />
            <small>{errors.lastName?.message}</small>
            {(() => {
              const { onChange, ...rest } = register("phone");
              return (
                <input
                  placeholder="Enter phone number"
                  maxLength={10}
                  {...rest}
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    onChange(e);
                  }}
                />
              );
            })()}
            <small>{errors.phone?.message}</small>
          </>
        )}
        <input placeholder="Email" {...register("email")} />
        <small>{errors.email?.message}</small>
        {(mode === "login" ||
          mode === "register" ||
          mode === "register-otp") && (
          <>
            <span className="relative block">
              <input
                className="w-full pr-10"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <small>{errors.password?.message}</small>
          </>
        )}
        {(mode === "verify-registration" ||
          mode === "verify-otp" ||
          mode === "reset") && (
          <>
            <input placeholder="OTP" {...register("otp")} />
            <small>{errors.otp?.message}</small>
          </>
        )}
        {mode === "reset" && (
          <>
            <span className="relative block">
              <input
                className="w-full pr-10"
                placeholder="New password"
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
              />
              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <small>{errors.newPassword?.message}</small>
          </>
        )}
        {(mode === "register" || mode === "register-otp") && (
          <input placeholder="Referral code" {...register("referralCode")} />
        )}
        {mode === "login" && (
          <input
            placeholder="Google ID token for social login"
            {...register("socialIdToken")}
          />
        )}
        {auth.error && <div className="state-box error">{auth.error}</div>}
        <button className="button" disabled={auth.loading}>
          {auth.loading ? "Please wait..." : title}
        </button>
        {mode === "login" && (
          <button
            className="button secondary"
            type="button"
            onClick={handleSubmit((values) =>
              values.socialIdToken
                ? run(
                    dispatch,
                    socialLogin({
                      provider: "google",
                      idToken: values.socialIdToken,
                      role: "buyer",
                    }),
                    "Social login complete",
                  )
                : notify.error({
                    title: "Missing token",
                    message: "Paste a provider ID token first",
                  }),
            )}
          >
            Continue with Google
          </button>
        )}
        {mode === "login" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.register}>
              Register
            </Link>
            <Link className="chip" to={AUTH_ROUTES.forgotPassword}>
              Forgot password
            </Link>
          </div>
        )}
        {mode === "register-otp" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.register}>
              Register with password
            </Link>
            <Link className="chip" to={AUTH_ROUTES.login}>
              Login
            </Link>
          </div>
        )}
        {mode === "verify-registration" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.register}>
              Back to register
            </Link>
          </div>
        )}
        {mode === "forgot" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.login}>
              Back to login
            </Link>
          </div>
        )}
        {mode === "reset" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.login}>
              Back to login
            </Link>
          </div>
        )}
      </form>
    </section>
  );
}

export function AccountPage({ tab = "profile" }) {
  const dispatch = useDispatch();
  const user = useFetch(fetchMe, undefined, (s) => s.user);
  const run = useToastThunk();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const submitProfile = (values) =>
    run(dispatch, updateMe({ profile: values }), "Profile updated");
  const submitAddress = (values) =>
    run(
      dispatch,
      addAddress({
        ...values,
        country: values.country || "India",
        isDefault: Boolean(values.isDefault),
      }),
      "Address saved",
    );
  const submitKyc = (values) =>
    run(
      dispatch,
      submitUserKyc({
        legalName: values.legalName,
        panNumber: values.panNumber,
        aadhaarNumber: values.aadhaarNumber,
        documents: {},
      }),
      "KYC submitted",
    );

  return (
    <section>
      <Seo title="Account | Sam Global" />
      <h1>Account</h1>
      <div className="tabs">
        <Link to="/account/profile">Profile</Link>
        <Link to="/account/addresses">Addresses</Link>
        <Link to="/account/security">Security</Link>
        <Link to="/account/kyc">KYC</Link>
      </div>
      <ApiState loading={user.loading} error={user.error} empty={!user.current}>
        {tab === "profile" && (
          <form
            className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
            onSubmit={handleSubmit(submitProfile)}
          >
            <input
              placeholder="First name"
              defaultValue={user.current?.profile?.firstName}
              {...register("firstName", { required: true })}
            />
            <small>{errors.firstName && "Required"}</small>
            <input
              placeholder="Last name"
              defaultValue={user.current?.profile?.lastName}
              {...register("lastName")}
            />
            <input placeholder="Avatar URL" {...register("avatarUrl")} />
            <button className="button">Save profile</button>
          </form>
        )}
        {tab === "addresses" && (
          <form
            className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
            onSubmit={handleSubmit(submitAddress)}
          >
            <input
              placeholder="Label"
              {...register("label", { required: true })}
            />
            <input
              placeholder="Full name"
              {...register("fullName", { required: true })}
            />
            {(() => {
              const { onChange, ...rest } = register("phone", {
                required: true,
              });
              return (
                <input
                  placeholder="Enter phone number"
                  maxLength={10}
                  {...rest}
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    onChange(e);
                  }}
                />
              );
            })()}
            <input
              placeholder="Line 1"
              {...register("line1", { required: true })}
            />
            <input
              placeholder="City"
              {...register("city", { required: true })}
            />
            <input
              placeholder="State"
              {...register("state", { required: true })}
            />
            <input
              placeholder="Postal code"
              {...register("postalCode", { required: true })}
            />
            <label>
              <input type="checkbox" {...register("isDefault")} /> Default
              address
            </label>
            <button className="button">Add address</button>
          </form>
        )}
        {tab === "security" && (
          <form
            className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
            onSubmit={handleSubmit((values) =>
              run(dispatch, changePassword(values), "Password changed"),
            )}
          >
            <span className="relative block">
              <input
                className="w-full pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Current password"
                {...register("currentPassword", { required: true })}
              />
              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <span className="relative block">
              <input
                className="w-full pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                {...register("newPassword", { required: true })}
              />
              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <button className="button">Change password</button>
          </form>
        )}
        {tab === "kyc" && (
          <form
            className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
            onSubmit={handleSubmit(submitKyc)}
          >
            <input
              placeholder="Legal name"
              {...register("legalName", { required: true })}
            />
            <input
              placeholder="PAN"
              {...register("panNumber", { required: true })}
            />
            <input
              placeholder="Aadhaar"
              {...register("aadhaarNumber", { required: true })}
            />
            <p className="todo">
              TODO: file upload API is missing for KYC documents, so URLs are
              not uploaded from this app yet.
            </p>
            <button className="button">Submit KYC</button>
          </form>
        )}
      </ApiState>
    </section>
  );
}

export function ProductsPage({ search = false }) {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const productState = useFetch(
    fetchProducts,
    search ? { q: query } : Object.fromEntries(params),
    (s) => s.product,
  );
  const products = itemsFrom(productState);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  return (
    <section>
      <Seo
        title={
          search ? `Search ${query} | Sam Global` : "Products | Sam Global"
        }
        description="Browse products with filters, pagination, dynamic prices, delivery checks, wishlist, and compare."
      />
      <div className="section-head">
        <h1>{search ? "Search products" : "Products"}</h1>
        <Link className="button secondary" to="/cart">
          View cart
        </Link>
      </div>
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          const searchValue = sanitizeSearchQuery(query);
          if (!searchValue) return;
          setQuery(searchValue);
          setParams({ q: searchValue });
          dispatch(fetchProducts({ q: searchValue }));
        }}
      >
        <input
          value={query}
          onChange={(event) =>
            setQuery(sanitizeSearchQuery(event.target.value))
          }
          placeholder="Search phones, appliances, fashion..."
        />
        <select
          onChange={(event) =>
            setParams({
              ...Object.fromEntries(params),
              sort: event.target.value,
            })
          }
        >
          <option value="">Sort</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
        </select>
        <button className="button">Search</button>
      </form>
      <ApiState
        loading={productState.loading}
        error={productState.error}
        empty={!products.length}
        emptyTitle="No products found"
        emptyText="Try a different search or filter."
      >
        <div className="grid-auto-fit">
          {products.map((product) => (
            <ProductCard
              key={getProductId(product)}
              product={product}
              onAddToCart={addToCart}
              onWishlist={toggleWishlist}
              isWishlisted={isWishlisted(product)}
            />
          ))}
        </div>
      </ApiState>
    </section>
  );
}

export function CategoryPage() {
  const { categoryKey } = useParams();
  // const dispatch = useDispatch();
  const category = useFetch(
    fetchCategoryByKey,
    { categoryKey },
    (s) => s.catalog,
  );
  const products = useFetch(
    fetchProducts,
    { category: categoryKey, page: 1, limit: 20 },
    (s) => s.product,
  );
  const { isWishlisted, toggleWishlist } = useProductActions();
  return (
    <section>
      <Seo title={`${category.current?.title || categoryKey} | Sam Global`} />
      <h1>{category.current?.title || categoryKey}</h1>
      <ApiState
        loading={products.loading}
        error={products.error}
        empty={!itemsFrom(products).length}
      >
        <div className="grid">
          {itemsFrom(products).map((product) => (
            <ProductCard
              key={getProductId(product)}
              product={product}
              onWishlist={toggleWishlist}
              isWishlisted={isWishlisted(product)}
            />
          ))}
        </div>
      </ApiState>
    </section>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const productState = useFetch(
    fetchProductById,
    { productId },
    (s) => s.product,
  );
  const warranty = useFetch(
    fetchProductWarranty,
    { productId },
    (s) => s.warranty,
  );
  const dynamic = useSelector((s) => s.dynamicPricing);
  const delivery = useSelector((s) => s.delivery);
  const product = productState.current;
  const [pincode, setPincode] = useState("");
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      dispatch(
        trackAnalyticsEvent({
          eventName: "product_view",
          metadata: { productId, source: "product_detail" },
        }),
      ).catch(() => {});
      dispatch(
        trackRecommendationInteraction({
          productId,
          interactionType: "viewed",
        }),
      ).catch(() => {});
      dispatch(fetchDynamicPrice({ productId, quantity: 1 })).catch(() => {});
    }
  }, [dispatch, product, productId]);

  return (
    <section>
      <Seo
        title={`${product?.title || "Product"} | Sam Global`}
        description={
          product?.description ||
          "Product detail, warranty, delivery, dynamic pricing, and recommendations."
        }
      />
      <ApiState
        loading={productState.loading}
        error={productState.error}
        empty={!product}
      >
        <div className="detail">
          <div className="gallery">
            {product?.images?.length ? (
              product.images.map((src) => (
                <img key={src} src={src} alt={product.title} />
              ))
            ) : (
              <div className="empty-media">No image</div>
            )}
          </div>
          <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h1>{product?.title}</h1>
            <p>{product?.description}</p>
            <strong>
              {formatMoney(
                dynamic.current?.price || product?.price,
                product?.currency,
              )}
            </strong>
            {dynamic.current?.loyalty && (
              <p className="success">Loyalty-aware price available.</p>
            )}
            <div className="button-row">
              <button className="button" onClick={() => addToCart(product)}>
                Add to cart
              </button>
              <button
                className="button secondary"
                onClick={() => toggleWishlist(product)}
                aria-pressed={isWishlisted(product)}
              >
                <Heart
                  size={16}
                  fill={isWishlisted(product) ? "red" : "none"}
                  color={isWishlisted(product) ? "red" : "currentColor"}
                />{" "}
                Wishlist
              </button>
            </div>
            <form
              className="toolbar"
              onSubmit={(event) => {
                event.preventDefault();
                dispatch(checkServiceability({ pincode }));
              }}
            >
              <input
                value={pincode}
                onChange={(event) => setPincode(event.target.value)}
                placeholder="Delivery pincode"
              />
              <button className="button secondary">Check</button>
            </form>
            {delivery.current && (
              <p className="success">Delivery serviceability checked.</p>
            )}
            {warranty.current && (
              <p>
                <ShieldCheck size={16} /> Warranty:{" "}
                {warranty.current.period ||
                  warranty.current.type ||
                  "available"}
              </p>
            )}
            <p className="todo">
              TODO: product reviews, standalone wishlist, compare API, and
              public autocomplete are backend gaps. Wishlist uses cart.wishlist
              and compare is local-only.
            </p>
          </div>
        </div>
      </ApiState>
    </section>
  );
}

export function CartPage() {
  const dispatch = useDispatch();
  const cartState = useFetch(fetchCart, undefined, (s) => s.cart);
  const run = useToastThunk();
  const cart = cartState.current || {};
  const items = cart.items || [];
  const remove = (productId) =>
    run(
      dispatch,
      updateCart({
        items: items.filter((item) => getProductId(item) !== productId),
        wishlist: cart.wishlist || [],
      }),
      "Removed from cart",
    );
  const moveToCart = (productId) =>
    run(
      dispatch,
      updateCart({
        items: [...items, { productId, quantity: 1 }],
        wishlist: (cart.wishlist || []).filter((id) => id !== productId),
      }),
      "Moved to cart",
    );

  return (
    <section>
      <Seo title="Cart | Sam Global" />
      <h1>Cart</h1>
      <ApiState
        loading={cartState.loading}
        error={cartState.error}
        empty={!items.length && !(cart.wishlist || []).length}
      >
        <div className="split">
          <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h2>Items</h2>
            {items.map((item) => (
              <div className="line-item" key={getProductId(item)}>
                <span>{getProductTitle(item)}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    run(
                      dispatch,
                      updateCart({
                        items: items.map((x) =>
                          getProductId(x) === getProductId(item)
                            ? { ...x, quantity: Number(e.target.value) }
                            : x,
                        ),
                        wishlist: cart.wishlist || [],
                      }),
                      "Quantity updated",
                    )
                  }
                />
                <button
                  className="button secondary"
                  onClick={() => remove(getProductId(item))}
                >
                  Remove
                </button>
                {item.stockMismatch && (
                  <span className="warning">Stock changed</span>
                )}
                {item.priceMismatch && (
                  <span className="warning">Price changed</span>
                )}
              </div>
            ))}
            <Link className="button" to="/checkout">
              Checkout
            </Link>
          </div>
          <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h2>Wishlist</h2>
            {(cart.wishlist || []).map((id) => (
              <div className="line-item" key={id}>
                <span>{id}</span>
                <button
                  className="button secondary"
                  onClick={() => moveToCart(id)}
                >
                  Move to cart
                </button>
              </div>
            ))}
            <p className="todo">
              TODO: standalone wishlist API is missing; this screen persists
              wishlist via PUT /carts/me.
            </p>
          </div>
        </div>
      </ApiState>
    </section>
  );
}

export function CheckoutPage() {
  const dispatch = useDispatch();
  const cart = useFetch(fetchCart, undefined, (s) => s.cart);
  const wallet = useFetch(fetchWallet, undefined, (s) => s.wallet);
  const checkout = useSelector((s) => s.checkout);
  const payment = useSelector((s) => s.payment);
  const run = useToastThunk();
  const navigate = useNavigate();
  const [paymentProvider, setPaymentProvider] = useState("razorpay");
  const cartItems = cart.current?.items || [];
  const estimatedAmount = cartEstimate(cartItems);
  const paymentOptions = Array.isArray(payment.current?.providers)
    ? payment.current.providers
    : [];

  useEffect(() => {
    dispatch(fetchPaymentOptions({ orderAmount: estimatedAmount }));
  }, [dispatch, estimatedAmount]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const submit = async (values) => {
    const order = await run(
      dispatch,
      createOrder({
        currency: "INR",
        couponCode: values.couponCode || undefined,
        walletAmount: Number(values.walletAmount || 0),
        paymentProvider,
        shippingAddress: values,
        items: cartItems.map((item) => ({
          productId: getProductId(item),
          variantId: firstDefined(item.variantId, item.variant_id, ""),
          variantSku: firstDefined(item.variantSku, item.variant_sku, ""),
          quantity: Number(item.quantity || 1),
        })),
      }),
      "Order created",
    );
    const orderData = order.data || order;
    const orderId = firstDefined(orderData?.id, orderData?.orderId);
    const paymentResult = await run(
      dispatch,
      initiatePayment({
        orderId,
        provider: paymentProvider,
        amount: firstDefined(
          orderData?.payableAmount,
          orderData?.payable_amount,
          orderData?.totalAmount,
          0,
        ),
        currency: "INR",
        notes: { source: "web_checkout", paymentProvider },
      }),
      paymentProvider === "cod" ? "COD order confirmed" : "Payment initiated",
    );
    const status = firstDefined(
      paymentResult?.data?.status,
      paymentResult?.status,
    );
    navigate(status === "failed" ? "/payment/failed" : `/orders/${orderId}`);
  };
  return (
    <section>
      <Seo title="Checkout | Sam Global" />
      <h1>Checkout</h1>
      <ApiState
        loading={cart.loading || wallet.loading || checkout.loading}
        error={cart.error || wallet.error || checkout.error}
        empty={!(cart.current?.items || []).length}
        emptyTitle="Your cart is empty"
      >
        <div className="split">
          <form
            className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
            onSubmit={handleSubmit(submit)}
          >
            <h2>Delivery address</h2>
            <input
              placeholder="Line 1"
              {...register("line1", { required: true })}
            />
            <small>{errors.line1 && "Required"}</small>
            <input placeholder="Line 2" {...register("line2")} />
            <input
              placeholder="City"
              {...register("city", { required: true })}
            />
            <input
              placeholder="State"
              {...register("state", { required: true })}
            />
            <input
              placeholder="Postal code"
              {...register("postalCode", { required: true })}
            />
            <input
              placeholder="Country"
              defaultValue="India"
              {...register("country", { required: true })}
            />
            <input placeholder="Coupon code" {...register("couponCode")} />
            <input
              type="number"
              placeholder={`Wallet amount, balance ${wallet.current?.balance || 0}`}
              {...register("walletAmount")}
            />
            <button className="button">
              {paymentProvider === "cod" ? (
                <Banknote size={16} />
              ) : (
                <CreditCard size={16} />
              )}
              {paymentProvider === "cod"
                ? "Place COD order"
                : "Place order and continue"}
            </button>
          </form>

          <aside className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h2>Payment option</h2>
            <div className="payment-options">
              {paymentOptions.map((option) => (
                <label
                  key={option.provider}
                  className={`payment-option ${paymentProvider === option.provider ? "selected" : ""} ${option.enabled ? "" : "disabled"}`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    value={option.provider}
                    checked={paymentProvider === option.provider}
                    disabled={!option.enabled}
                    onChange={(event) => setPaymentProvider(event.target.value)}
                  />
                  <span>
                    <strong>
                      {option.label || displayLabel(option.provider)}
                    </strong>
                    <small>
                      {option.chargeAmount > 0
                        ? `Charge ${formatMoney(option.chargeAmount, option.config?.currency || "INR")}`
                        : option.payableNow
                          ? "Pay securely online"
                          : "Pay after placing the order"}
                    </small>
                  </span>
                </label>
              ))}
              {!paymentOptions.length && (
                <div className="state-box">Loading payment options...</div>
              )}
            </div>
            <div className="summary-lines">
              <div>
                <span>Estimated cart</span>
                <strong>{formatMoney(estimatedAmount)}</strong>
              </div>
              <div>
                <span>Selected method</span>
                <strong>{displayLabel(paymentProvider)}</strong>
              </div>
              <div>
                <span>Final payable</span>
                <strong>Calculated after order validation</strong>
              </div>
            </div>
          </aside>
        </div>
      </ApiState>
    </section>
  );
}
export function PaymentResultPage({ failed = false }) {
  const dispatch = useDispatch();
  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);
  const [invoices, setInvoices] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const order = findFetchedOrder(orderState, orderId);
  const currentUser = userState.current || userState.data || {};

  const items = getOrderItems(order || {});
  const currency = getOrderCurrency(order || {});
  const shippingAddress =
    order?.shipping_address || order?.shippingAddress || {};

  const discount = getOrderAmount(order || {}, "discount");
  const shipping = getOrderAmount(order || {}, "shipping");
  const customerAmount = getCustomerOrderAmount(order || {});
  const status = firstDefined(order?.status, order?.orderStatus, "confirmed");
  const deliveryDateRange = getDeliveryDateRange(order || {});
  const deliveryLabel = deliveryDateRange
    ? deliveryDateRange.minDate
      ? `${formatOrderDate(deliveryDateRange.minDate)} – ${formatOrderDate(deliveryDateRange.maxDate)}`
      : formatOrderDate(deliveryDateRange.maxDate)
    : "To be confirmed";
  const orderCustomer =
    order?.customer ||
    order?.user ||
    order?.buyer ||
    order?.relations?.customer ||
    order?.relations?.user ||
    order?.relations?.buyer ||
    {};

  const displayName =
    orderCustomer.profile?.firstName + " " + orderCustomer.profile?.lastName;

  const deliveryPhone =
    getOrderPhone(shippingAddress) ||
    getOrderPhone(orderCustomer) ||
    getOrderPhone(currentUser);
  const getInvoiceUrl = (order) =>
    order?.invoice_url ||
    order?.invoiceUrl ||
    order?.relations?.invoice?.url ||
    null;
  const orderInvoiceId =
    invoices?.orderInvoice?.id || invoices?.orderInvoice?._id;
  const invoiceDownloadPath = orderInvoiceId
    ? endpoints.tax.invoiceDownload(orderInvoiceId)
    : "";
  const fallbackInvoiceUrl = getInvoiceUrl(order);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId }));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) {
      setInvoices(null);
      return;
    }
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => setInvoices(null));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id && !userState.loading) {
      dispatch(fetchMe());
    }
  }, [currentUser?._id, currentUser?.id, dispatch, userState.loading]);

  const handleDownload = async (apiPath, filename) => {
    setDownloadingId(apiPath);
    try {
      await downloadAuthDocument(apiPath, filename);
    } catch {
      notify.error("Invoice download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleInvoiceDownload = () => {
    if (!orderId) {
      notify.error("Order ID is missing, so invoice cannot be downloaded.");
      return;
    }

    if (invoiceDownloadPath) {
      handleDownload(
        invoiceDownloadPath,
        `invoice-${getOrderNumber(order)}.pdf`,
      );
      return;
    }

    if (fallbackInvoiceUrl) {
      window.open(fallbackInvoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    notify.error("Invoice is not available yet.");
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
    { label: failed ? "Payment Failed" : "Order Placed" },
  ];

  const failureCard = (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={breadcrumbItems}
        className="mb-6 text-[#2E2E2E]"
        linkClassName="text-[#2E2E2E]"
        currentClassName="text-[#CE9F2D]"
        separatorClassName="text-[#2E2E2E]"
      />
      <section className="overflow-hidden rounded-[20px] border border-red-200 bg-white shadow-[0_24px_60px_rgba(27,29,96,0.06)]">
        <div className="bg-[linear-gradient(135deg,#FFF6F6_0%,#FFFFFF_100%)] px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[32px] font-bold leading-tight text-[#3E4093]">
                Payment Failed
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#2E2E2E]">
                Your payment could not be processed. Try the payment again from
                your orders page or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-red-100 px-6 py-5 sm:px-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <BrandButton
              variant="secondary"
              rounded
              loading={downloadingId === invoiceDownloadPath}
              onClick={handleInvoiceDownload}
              icon={<Download size={18} />}
              label="Download Invoice"
              className="h-12 w-full min-w-[220px] text-sm sm:w-auto"
            />
          </div>
        </div>
      </section>
    </div>
  );

  if (failed || !orderId) {
    return (
      <>
        <Seo
          title={
            failed
              ? "Payment Failed | Sam Global"
              : "Payment Successful | Sam Global"
          }
        />
        {failed ? (
          failureCard
        ) : (
          <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center px-4 py-12">
            <div className="w-full rounded-[var(--customer-radius)] border border-border bg-white p-8 text-center">
              <h1 className="text-2xl font-bold text-ink">Order Placed!</h1>
              <p className="mt-2 text-sm text-muted">
                Your order has been placed successfully.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Seo
        title={
          failed
            ? "Payment Failed | Sam Global"
            : "Payment Successful | Sam Global"
        }
      />
      <div className="!main-container py-4 min-[375px]:py-10 sm:py-2 lg:py-[3rem]  ">
        <ApiState
          loading={orderState.loading && !order}
          error={orderState.error}
          empty={!order}
        >
          <div className="grid xl:gap-12 gap-6">
            <section className="grid !sm:mt-10">
              <Breadcrumbs
                items={breadcrumbItems}
                className="sm:mt-6 xl:mt-2  flex flex-wrap items-center gap-[10px]  sm:gap-[12px] lg:gap-[15px] "
                linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
                currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
                separatorClassName="text-[#2E2E2E]"
              />
            </section>

            <OrderDetailLayout>
              <div className="grid gap-3 min-[375px]:gap-4 min-[425px]:gap-5 md:gap-6 xl:gap-12 ">
                <section className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#CE9F2D]/40 bg-[#fffcf6] sm:rounded-[18px] xl:rounded-[20px]">
                  <div className="flex flex-col gap-4 px-4 py-5 min-[375px]:gap-5 min-[375px]:px-5 min-[425px]:gap-6 sm:px-7 sm:py-6 md:px-8 xl:mt-5 xl:px-[57px]">
                    <div className="flex flex-col items-center gap-5 text-center min-[375px]:gap-6 sm:gap-7 md:flex-row md:items-center md:text-left xl:gap-10">
                      <div className="shrink-0">
                        <img
                          src="/image/png/Group.png"
                          alt="Order placed successfully"
                          className="h-20 w-20 object-contain min-[375px]:h-24 min-[375px]:w-24 min-[425px]:h-24 min-[425px]:w-24 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 xl:h-[160px] xl:w-[157px]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h1 className="break-words text-[18px] font-bold leading-[1.25] text-[#3E4093] min-[375px]:text-[20px] min-[425px]:text-[22px] sm:text-[24px] sm:leading-[1.25] md:text-[36px] xl:text-[36px] xl:leading-[2.1]">
                          Order Placed Successfully !
                        </h1>

                        <p className="mt-2 max-w-3xl text-[13px] font-medium leading-[21px] text-[#2E2E2E] min-[375px]:text-sm min-[375px]:leading-6 min-[425px]:text-[15px] sm:text-[15px] sm:leading-7 xl:text-[18px] xl:leading-[30px]">
                          Thank you for shopping with Sam Global.
                          <br className="hidden sm:block" />
                          Your order has been received and is being prepared for
                          shipment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 bg-[#BBBBCB] px-4 py-3 text-[13px] font-semibold text-[#1B1D60] min-[375px]:px-5 min-[375px]:text-sm min-[425px]:gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4 sm:text-[12px] md:px-8 xl:text-[20px]">
                    <span className="break-words">Order ID : # {orderId}</span>

                    <span className="break-words">
                      Estimated Delivery : {deliveryLabel}
                    </span>
                  </div>
                </section>

                <OrderDetailSectionCard
                  bodyClassName="overflow-x-auto  !px-4 py-3 sm:px-8"
                  titleClassName="font-bold leading-[100%]"
                >
                  <div className="w-full">
                    <OrderProgress
                      noteClassName="text-center font-medium text-[18px] leading-none tracking-normal text-[#6F7480] "
                      status={status}
                    />
                  </div>
                </OrderDetailSectionCard>

                <div className="w-full ">
                  <OrderItemsSection
                    items={items}
                    orderId={orderId}
                    orderStatus={status}
                    title={null}
                    borderClassName="border-[#CE9F2D]"
                    bodyClassName="grid  divide-y divide-[#E9E9EF] p-4 min-[375px]:p-5 min-[425px]:p-6 lg:p-[25px]"
                    itemClassName="py-3 first:pt-0 last:pb-0 min-[375px]:py-4 lg:py-5 lg:gap-6"
                    currency={currency}
                    getItemImage={getItemImage}
                    getProductTitle={getOrderProductTitle}
                    getOrderItemColor={getOrderItemColor}
                    getItemLineTotal={getItemLineTotal}
                    formatMoney={formatMoney}
                    className="md:text-[18px] font-bold"
                  />
                </div>
              </div>

              <OrderDetailAside className="w-full  gap-4 min-[425px]:gap-5 xl:sticky xl:top-28 xl:self-start xl:gap-6 ">
                <OrderDetailSectionCard
                  title="Order Summary"
                  className="w-full rounded-[20px]"
                  headerClassName="min-h-[64px] px-4 py-4 min-[375px]:px-5 sm:min-h-[72px] sm:px-6 xl:px-[20px] xl:py-[25px]"
                  titleClassName="text-[10px] leading-tight min-[375px]:text-[18px] sm:text-[22px] xl:text-[24px]"
                  borderClassName="border-[#CE9F2D66]"
                  bodyClassName="grid gap-2 px-4 py-4  sm:px-6"
                >
                  <SummaryRow
                    label={`${items.length.toString().padStart(2, "0")} Item(s)`}
                    value=""
                  />

                  {items.map((item, index) => (
                    <SummaryRow
                      key={`${getOrderProductTitle(item)}-${index}`}
                      label={`${String(item.quantity || 1)} x ${getOrderProductTitle(item)}`}
                      value={formatMoney(getOrderItemLineTotal(item), currency)}
                    />
                  ))}

                  {asNumber(discount) > 0 && (
                    <SummaryRow
                      label="Discount"
                      value={`-${formatMoney(discount, currency)}`}
                      savings
                    />
                  )}

                  <SummaryRow
                    label="Delivery"
                    value={
                      asNumber(shipping) === 0
                        ? "FREE"
                        : formatMoney(shipping, currency)
                    }
                  />

                  <div className="border-t border-dashed border-[#04258626] pt-3">
                    <SummaryRow
                      label="Total Payable"
                      value={formatMoney(customerAmount, currency)}
                    />
                  </div>

                  <div className="mt-3 rounded-[14px]  ">
                    <div className="flex items-start  gap-3">
                      <img
                        src="/image/png/Frame1.png"
                        alt=""
                        className="h-[50px] w-[50px] object-contain min-[375px]:h-[50px] min-[375px]:w-[50px] min-[425px]:h-[48px] min-[425px]:w-[48px] sm:h-[56px] sm:w-[56px] md:h-[64px] md:w-[64px] lg:h-[70px] lg:w-[70px]"
                      />

                      <div className="min-w-0 flex flex-col gap-2 sm:gap-3">
                        <p
                          className="
                          font-semibold text-[#2E2E2E]
                          text-[14px]
                          min-[375px]:text-[15px]
                          min-[425px]:text-[16px]
                          sm:text-[19px]
                          md:text-[19px]
                          lg:text-[20px]
                        "
                        >
                          Expected Delivery
                        </p>

                        <p
                          className="break-words font-bold leading-tight text-[#CE9F2D]
                          text-[16px]
                          min-[375px]:text-[18px]
                          min-[425px]:text-[20px]
                          sm:text-[22px]
                          md:text-[24px]
                          lg:text-[26px]
                          xl:text-[30px]"
                        >
                          {deliveryLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-[10px]">
                    <BrandButton
                      variant="secondary"
                      rounded
                      loading={downloadingId === invoiceDownloadPath}
                      onClick={handleInvoiceDownload}
                      icon={<Download size={18} />}
                      label="Download invoice"
                      className="h-[54px] w-full !rounded-[10px] px-[15px] text-sm font-semibold"
                    />
                  </div>
                </OrderDetailSectionCard>

                {hasOrderShippingAddress(shippingAddress) && (
                  <OrderDetailSectionCard
                    title="Delivery Address"
                    className="w-full rounded-[20px]"
                    headerClassName="min-h-[64px] px-4 py-4 min-[375px]:px-5 sm:min-h-[72px] sm:px-6 xl:px-[20px] xl:py-[25px]"
                    titleClassName="text-[18px] leading-tight min-[375px]:text-[20px] sm:text-[22px] xl:text-[24px]"
                    borderClassName="border-[#CE9F2D66]"
                    bodyClassName="grid gap-4 px-4 py-4  sm:px-6"
                  >
                    <div className="inline-flex h-[30px] w-[65px] items-center justify-center rounded-full bg-[#CE9F2D] px-2 py-1 text-[14px] font-semibold text-white sm:h-[37px] sm:w-[81px] sm:px-3 sm:text-[18px]">
                      Home
                    </div>

                    <div className="grid gap-3 text-[#2E2E2E]">
                      {displayName && (
                        <p className="break-words text-[18px] font-bold leading-tight text-[#2E2E2E] sm:text-[26px]">
                          {displayName}
                        </p>
                      )}

                      <div className="flex  items-start gap-2 text-[13px] font-medium leading-6 min-[375px]:text-[16px] sm:text-[20px]">
                        <Phone className="mt-1 h-[18px] w-[18px] shrink-0 text-[#CE9F2D]" />
                        <span className="break-words">
                          {deliveryPhone || "Phone unavailable"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-[13px] font-medium leading-6 min-[375px]:text-[16px] sm:text-[20px]">
                        <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-[#CE9F2D]" />
                        <span className="break-words">
                          {[
                            shippingAddress.line1 ||
                              shippingAddress.addressLine1 ||
                              shippingAddress.address_line1,
                            shippingAddress.line2 ||
                              shippingAddress.addressLine2 ||
                              shippingAddress.address_line2,
                            shippingAddress.city,
                            shippingAddress.state,
                            getOrderAddressValue(
                              shippingAddress,
                              "postalCode",
                              "postal_code",
                            ),
                            shippingAddress.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </OrderDetailSectionCard>
                )}
              </OrderDetailAside>
            </OrderDetailLayout>
          </div>
        </ApiState>
      </div>
    </>
  );
}

export function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const state = useFetch(
    detail || track ? fetchOrderById : fetchMyOrders,
    detail || track ? { orderId } : undefined,
    (s) => s.order,
  );
  const taxState = useSelector((s) => s.tax);
  const run = useToastThunk();
  const orders = itemsFrom(state);
  const order = state.current;
  const invoice =
    taxState.current?.order_id === orderId ||
    taxState.current?.orderId === orderId
      ? taxState.current
      : null;
  const invoiceVisible = ["delivered", "fulfilled"].includes(
    String(order?.status || order?.orderStatus || "").toLowerCase(),
  );

  useEffect(() => {
    if ((detail || track) && invoiceVisible) {
      dispatch(fetchOrderInvoice({ orderId })).catch(() => {});
    }
  }, [detail, dispatch, invoiceVisible, orderId, track]);

  if (detail || track)
    return (
      <section>
        <Seo title={`Order ${orderId} | Sam Global`} />
        <ApiState loading={state.loading} error={state.error} empty={!order}>
          <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h1>Order {orderId}</h1>
            <StatusTimeline status={order?.status || order?.orderStatus} />
            <p>
              {formatMoney(
                firstDefined(
                  order?.payable_amount,
                  order?.payableAmount,
                  order?.amounts?.payableAmount,
                  order?.total_amount,
                  order?.totalAmount,
                ),
                order?.currency,
              )}
            </p>
            <div className="summary-lines">
              <div>
                <span>Payment method</span>
                <strong>
                  {displayLabel(
                    firstDefined(
                      order?.payment_provider,
                      order?.paymentProvider,
                    ),
                  )}
                </strong>
              </div>
              <div>
                <span>Payment status</span>
                <strong>
                  {displayLabel(
                    firstDefined(order?.payment_status, order?.paymentStatus),
                  )}
                </strong>
              </div>
              <div>
                <span>COD charge</span>
                <strong>
                  {formatMoney(
                    firstDefined(
                      order?.cod_charge_amount,
                      order?.codChargeAmount,
                      0,
                    ),
                    order?.currency,
                  )}
                </strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>
                  {formatMoney(
                    firstDefined(order?.tax_amount, order?.taxAmount, 0),
                    order?.currency,
                  )}
                </strong>
              </div>
            </div>
            <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10 nested-border">
              <h2>Invoice</h2>
              {taxState.loading && <p>Loading invoice...</p>}
              {!taxState.loading && invoiceVisible && invoice ? (
                <div className="summary-lines">
                  <div>
                    <span>Invoice number</span>
                    <strong>
                      {invoice.invoice_number || invoice.invoiceNumber}
                    </strong>
                  </div>
                  <div>
                    <span>Taxable amount</span>
                    <strong>
                      {formatMoney(
                        invoice.taxable_amount || invoice.taxableAmount,
                        invoice.currency,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>CGST</span>
                    <strong>
                      {formatMoney(
                        invoice.cgst_amount || invoice.cgstAmount,
                        invoice.currency,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>SGST</span>
                    <strong>
                      {formatMoney(
                        invoice.sgst_amount || invoice.sgstAmount,
                        invoice.currency,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>IGST</span>
                    <strong>
                      {formatMoney(
                        invoice.igst_amount || invoice.igstAmount,
                        invoice.currency,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>Total invoice</span>
                    <strong>
                      {formatMoney(
                        invoice.total_amount || invoice.totalAmount,
                        invoice.currency,
                      )}
                    </strong>
                  </div>
                </div>
              ) : (
                !taxState.loading && (
                  <p>Invoice will appear here after the order is delivered.</p>
                )
              )}
            </div>
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() =>
                  run(
                    dispatch,
                    cancelOrder({ orderId, reason: "Requested by customer" }),
                    "Order cancelled",
                  )
                }
              >
                Cancel order
              </button>
              <Link className="button" to={`/returns/request/${orderId}`}>
                Request return
              </Link>
              <button
                className="button secondary"
                onClick={() =>
                  notify.info({
                    title: "Reorder",
                    message: "Reorder builds a new cart from order items.",
                    tone: "cart",
                  })
                }
              >
                Reorder
              </button>
            </div>
          </div>
        </ApiState>
      </section>
    );
  return (
    <section>
      <Seo title="Orders | Sam Global" />
      <h1>Orders</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!orders.length}
      >
        <div className="list">
          {orders.map((order) => (
            <Link
              className="list-row"
              key={order.id || order.orderId}
              to={`/orders/${order.id || order.orderId}`}
            >
              <span>{order.id || order.orderId}</span>
              <strong>{order.status || order.orderStatus}</strong>
            </Link>
          ))}
        </div>
      </ApiState>
    </section>
  );
}

export function ReturnsPage({ request = false }) {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const state = useFetch(
    request ? fetchReturnByOrder : fetchMyReturns,
    request ? { orderId } : undefined,
    (s) => s.returns,
  );
  const run = useToastThunk();
  const { register, handleSubmit } = useForm();
  if (request)
    return (
      <section>
        <Seo title="Request return" />
        <form
          className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
          onSubmit={handleSubmit((values) =>
            run(
              dispatch,
              requestReturn({
                orderId,
                items: [
                  {
                    productId: values.productId,
                    quantity: Number(values.quantity),
                    unitPrice: Number(values.unitPrice),
                  },
                ],
                reason: values.reason,
                description: values.description,
              }),
              "Return requested",
            ),
          )}
        >
          <h1>Request return</h1>
          <input
            placeholder="Product ID"
            {...register("productId", { required: true })}
          />
          <input
            type="number"
            placeholder="Quantity"
            {...register("quantity", { required: true })}
          />
          <input
            type="number"
            placeholder="Unit price"
            {...register("unitPrice", { required: true })}
          />
          <select {...register("reason")}>
            <option value="defective">Defective</option>
            <option value="not_as_described">Not as described</option>
            <option value="changed_mind">Changed mind</option>
            <option value="other">Other</option>
          </select>
          <textarea placeholder="Description" {...register("description")} />
          <p className="todo">TODO: return proof upload API is missing.</p>
          <button className="button">Submit return</button>
        </form>
      </section>
    );
  return (
    <section>
      <Seo title="Returns | Sam Global" />
      <h1>Returns</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!itemsFrom(state).length}
      >
        <div className="list">
          {itemsFrom(state).map((item) => (
            <div className="list-row" key={item.id || item.returnId}>
              <span>{item.id || item.returnId}</span>
              <strong>{item.status || item.refundStatus}</strong>
            </div>
          ))}
        </div>
      </ApiState>
    </section>
  );
}

export function SimpleApiPage({ title, selector, thunk, action }) {
  // const dispatch = useDispatch();
  const state = useFetch(thunk, action?.arg, selector);
  const list = itemsFrom(state);
  return (
    <>
      <Seo title={`${title} | Sam Global`} />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">{title}</h1>
        <ApiState
          loading={state.loading}
          error={state.error}
          empty={!list.length && !state.current}
        >
          <div className="rounded-[12px] border border-border bg-white p-6">
            <pre className="overflow-x-auto font-mono text-xs text-muted">
              {JSON.stringify(list.length ? list : state.current, null, 2)}
            </pre>
          </div>
        </ApiState>
      </div>
    </>
  );
}

export function SubscriptionPage() {
  const dispatch = useDispatch();
  const plans = useFetch(
    fetchSubscriptionPlans,
    undefined,
    (s) => s.subscription,
  );
  const run = useToastThunk();
  return (
    <>
      <Seo title="Subscriptions | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">
          Subscription Plans
        </h1>
        <ApiState
          loading={plans.loading}
          error={plans.error}
          empty={!itemsFrom(plans).length}
          emptyTitle="No plans available"
          emptyText="Subscription plans will appear here."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {itemsFrom(plans).map((plan) => (
              <div
                key={plan.id || plan.planId || plan.planCode}
                className="flex flex-col rounded-[var(--customer-radius)] border border-border bg-white p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft">
                  <Star size={18} className="text-gold" />
                </div>
                <h2 className=" text-lg font-semibold text-ink">
                  {plan.title}
                </h2>
                <p className="mt-1  text-sm text-muted">{plan.description}</p>
                <p className="mt-4  text-2xl font-bold text-gold">
                  {formatMoney(plan.monthlyPrice, plan.currency || "INR")}
                  <span className=" text-sm font-normal text-gray">/mo</span>
                </p>
                <div className="mt-auto pt-5">
                  <BrandButton
                    variant="primary"
                    rounded
                    label="Subscribe"
                    className="w-full h-11 text-sm font-semibold"
                    onClick={() =>
                      run(
                        dispatch,
                        purchaseSubscription({
                          planId: plan.id || plan.planId,
                          billingCycle: "monthly",
                          metadata: {},
                        }),
                        "Subscription purchased",
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </ApiState>
      </div>
    </>
  );
}

export function PreferencesPage() {
  const dispatch = useDispatch();
  const state = useFetch(
    fetchNotificationPreferences,
    undefined,
    (s) => s.notification,
  );
  const run = useToastThunk();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
      frequency: "real_time",
      timezone: "Asia/Kolkata",
    },
  });

  useEffect(() => {
    if (!state.current) return;
    const prefs = state.current;
    reset({
      email: prefs.channels?.email ?? true,
      sms: prefs.channels?.sms ?? true,
      push: prefs.channels?.push ?? true,
      inApp: prefs.channels?.inApp ?? true,
      frequency: prefs.frequency || "real_time",
      timezone: prefs.timezone || "Asia/Kolkata",
    });
  }, [state.current, reset]);

  const CHANNELS = [
    { key: "email", label: "Email notifications" },
    { key: "sms", label: "SMS notifications" },
    { key: "push", label: "Push notifications" },
    { key: "inApp", label: "In-app notifications" },
  ];

  return (
    <>
      <Seo title="Notification Preferences | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">
          Notification Preferences
        </h1>
        <ApiState loading={state.loading} error={state.error} empty={false}>
          <form
            className="rounded-[12px] border border-border bg-white p-6 sm:p-8"
            onSubmit={handleSubmit((v) =>
              run(
                dispatch,
                updateNotificationPreferences({
                  channels: {
                    email: v.email,
                    sms: v.sms,
                    push: v.push,
                    inApp: v.inApp,
                  },
                  eventTypes: {
                    order: true,
                    payment: true,
                    shipping: true,
                    promo: true,
                    referral: true,
                    newProduct: true,
                  },
                  frequency: v.frequency,
                  doNotDisturbStart: "22:00",
                  doNotDisturbEnd: "07:00",
                  timezone: v.timezone,
                }),
                "Preferences saved",
              ),
            )}
          >
            <div className="mb-6">
              <h2 className="mb-1  text-base font-semibold text-ink">
                Channels
              </h2>
              <p className=" text-sm text-muted">
                Choose how you&apos;d like to receive notifications.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {CHANNELS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-border px-4 py-3"
                >
                  <span className=" text-sm font-medium text-ink">{label}</span>
                  <input
                    type="checkbox"
                    {...register(key)}
                    className="h-4 w-4 accent-gold"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className=" text-sm font-medium text-ink">Frequency</span>
                <select
                  {...register("frequency")}
                  className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5  text-sm text-ink outline-none focus:border-gold"
                >
                  <option value="real_time">Real time</option>
                  <option value="daily">Daily digest</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className=" text-sm font-medium text-ink">Timezone</span>
                <input
                  {...register("timezone")}
                  className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5  text-sm text-ink outline-none focus:border-gold"
                />
              </label>
            </div>
            <div className="mt-6">
              <BrandButton
                variant="primary"
                rounded
                type="submit"
                label="Save preferences"
                className="h-11 px-8 text-sm font-semibold"
              />
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}

export function LoyaltyPage() {
  const dispatch = useDispatch();
  const loyaltyState = useSelector((s) => s.loyalty);
  const profile = loyaltyState.current;
  const [history, setHistory] = useState([]);
  const run = useToastThunk();

  useEffect(() => {
    dispatch(fetchLoyaltyProfile());
    dispatch(fetchLoyaltyHistory({ limit: 20, offset: 0 }))
      .unwrap()
      .then((result) => {
        const items = Array.isArray(result?.data)
          ? result.data
          : result?.data?.items || result?.data?.list || [];
        setHistory(items);
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <>
      <Seo title="Loyalty Rewards | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">Loyalty Rewards</h1>
        <ApiState
          loading={loyaltyState.loading && !profile}
          error={loyaltyState.error}
          empty={!profile && !loyaltyState.loading}
          emptyTitle="No loyalty profile"
          emptyText="Start shopping to earn loyalty points."
        >
          {/* Points card */}
          {profile && (
            <div className="mb-6 rounded-[var(--customer-radius)] bg-gradient-to-br from-gold to-gold-dark p-6 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Gift size={18} />
                <span className=" text-sm font-medium opacity-80">
                  Available Points
                </span>
              </div>
              <p className=" text-4xl font-bold">
                {profile.points || profile.balance || 0}
              </p>
              <p className="mt-1  text-sm opacity-70">
                Tier: {profile.tier || profile.level || "Standard"}
              </p>
              <div className="mt-5">
                <BrandButton
                  variant="secondary"
                  rounded
                  label="Redeem 50 Points"
                  className="h-10 border-white px-6 text-sm font-semibold text-white hover:bg-white/20"
                  onClick={() =>
                    run(
                      dispatch,
                      redeemLoyaltyPoints({ points: 50 }),
                      "Points redeemed",
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* Transaction history */}
          {history.length > 0 && (
            <div className="rounded-[12px] border border-border bg-white">
              <div className="border-b border-border px-5 py-4">
                <h2 className=" text-base font-semibold text-ink">
                  Transaction History
                </h2>
              </div>
              <div className="divide-y divide-border">
                {history.map((tx, i) => (
                  <div
                    key={tx.id || i}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className=" text-sm font-medium text-ink">
                        {tx.reason || tx.description || "Points transaction"}
                      </p>
                      <p className=" text-xs text-gray">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString("en-IN")
                          : ""}
                      </p>
                    </div>
                    <span
                      className={` text-sm font-semibold ${(tx.points || tx.amount || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {(tx.points || tx.amount || 0) >= 0 ? "+" : ""}
                      {tx.points || tx.amount || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}

export function WarrantyPage({ detail = false }) {
  const { warrantyId } = useParams();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.warranty);
  const run = useToastThunk();
  const lookupForm = useForm();
  const registerForm = useForm();

  useEffect(() => {
    if (detail) dispatch(fetchWarrantyById({ warrantyId }));
  }, [detail, dispatch, warrantyId]);

  const warranty = state.current;
  const warranties = Array.isArray(state.list) ? state.list : [];

  return (
    <>
      <Seo
        title={
          detail
            ? "Warranty Details | Sam Global"
            : "My Warranties | Sam Global"
        }
      />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">
          {detail ? "Warranty Details" : "My Warranties"}
        </h1>

        {!detail && (
          <form
            className="mb-6 rounded-[12px] border border-border bg-white p-5"
            onSubmit={lookupForm.handleSubmit((v) => {
              dispatch(fetchOrderWarranties({ orderId: v.orderId }));
              lookupForm.reset();
            })}
          >
            <h2 className="mb-3  text-sm font-semibold text-ink">
              Look up by Order ID
            </h2>
            <div className="flex gap-3">
              <input
                placeholder="Enter Order ID"
                {...lookupForm.register("orderId", { required: true })}
                className="flex-1 rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
              <BrandButton
                variant="secondary"
                rounded
                type="submit"
                label="Search"
                className="h-11 px-5 text-sm"
              />
            </div>
          </form>
        )}

        <ApiState
          loading={state.loading}
          error={state.error}
          empty={!warranty && !warranties.length && !state.loading}
          emptyTitle="No warranties found"
          emptyText="Your registered warranties will appear here."
        >
          {(warranty || warranties.length > 0) && (
            <div className="rounded-[12px] border border-border bg-white">
              {warranty && (
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft">
                      <ShieldCheck size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className=" text-sm font-semibold text-ink">
                        {warranty.type || "Product Warranty"}
                      </p>
                      <p className=" text-xs text-gray">
                        ID: {warranty.id || warrantyId}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {warranty.period && (
                      <div className="flex gap-2">
                        <span className="text-muted">Period:</span>
                        <span className="font-medium text-ink">
                          {warranty.period}
                        </span>
                      </div>
                    )}
                    {warranty.expiresAt && (
                      <div className="flex gap-2">
                        <span className="text-muted">Expires:</span>
                        <span className="font-medium text-ink">
                          {new Date(warranty.expiresAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  {detail && (
                    <div className="mt-5">
                      <BrandButton
                        variant="secondary"
                        rounded
                        label="File a Claim"
                        className="h-10 px-6 text-sm"
                        onClick={() =>
                          run(
                            dispatch,
                            claimWarranty({
                              warrantyId,
                              reason: "Issue reported",
                              description: "Customer warranty claim",
                            }),
                            "Claim submitted",
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {warranties.map((w, i) => (
                <div
                  key={w.id || i}
                  className="flex items-center justify-between border-t border-border px-5 py-4 first:border-t-0"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-gold" />
                    <div>
                      <p className=" text-sm font-medium text-ink">
                        {w.type || "Warranty"}
                      </p>
                      <p className=" text-xs text-gray">{w.period}</p>
                    </div>
                  </div>
                  <Link to={`/warranty/${w.id}`}>
                    <BrandButton
                      variant="secondary"
                      rounded
                      size="sm"
                      label="View"
                      className="h-8 px-3 text-xs"
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Register warranty form */}
          <form
            className="mt-6 rounded-[12px] border border-border bg-white p-5"
            onSubmit={registerForm.handleSubmit((v) =>
              run(
                dispatch,
                registerWarranty({
                  orderId: v.orderId,
                  productId: v.productId,
                  variantId: v.variantId || undefined,
                }),
                "Warranty registered",
              ),
            )}
          >
            <h2 className="mb-4  text-sm font-semibold text-ink">
              Register a Warranty
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                placeholder="Order ID"
                {...registerForm.register("orderId", { required: true })}
                className="rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Product ID"
                {...registerForm.register("productId", { required: true })}
                className="rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Variant ID (optional)"
                {...registerForm.register("variantId")}
                className="rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="mt-4">
              <BrandButton
                variant="primary"
                rounded
                type="submit"
                label="Register Warranty"
                className="h-10 px-6 text-sm"
              />
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}

export function BackendGapNotes() {
  return (
    <>
      <Seo title="API Notes | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-4  text-2xl font-bold text-ink">
          API Integration Notes
        </h1>
        <div className="rounded-[12px] border border-border bg-white p-6">
          <p className=" text-sm text-muted">
            Wishlist uses{" "}
            <code className="rounded bg-cream px-1.5 py-0.5 text-gold-dark">
              cart.wishlist
            </code>
            . Coupon validation flows through the order&apos;s{" "}
            <code className="rounded bg-cream px-1.5 py-0.5 text-gold-dark">
              couponCode
            </code>{" "}
            field. File uploads, invoice download, referral routes, product
            reviews, public autocomplete, product compare, live carrier
            tracking, and marketing banner APIs are backend-only features not
            yet exposed.
          </p>
        </div>
      </div>
    </>
  );
}

export function WalletPage() {
  const dispatch = useDispatch();
  const walletState = useSelector((s) => s.wallet);
  const wallet = walletState.current;

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Wallet | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">My Wallet</h1>
        <ApiState
          loading={walletState.loading && !wallet}
          error={walletState.error}
          empty={!wallet && !walletState.loading}
          emptyTitle="Wallet not available"
          emptyText="Your wallet information will appear here."
        >
          {wallet && (
            <div className="rounded-[var(--customer-radius)] bg-gradient-to-br from-ink to-muted p-6 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Wallet size={18} />
                <span className=" text-sm font-medium opacity-80">
                  Available Balance
                </span>
              </div>
              <p className=" text-4xl font-bold">
                {formatMoney(wallet.balance || 0, wallet.currency || "INR")}
              </p>
              {wallet.lockedBalance > 0 && (
                <p className="mt-1  text-sm opacity-60">
                  Locked:{" "}
                  {formatMoney(wallet.lockedBalance, wallet.currency || "INR")}
                </p>
              )}
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}

export function PaymentsPage() {
  const dispatch = useDispatch();
  const paymentState = useSelector((s) => s.payment);
  const payments = Array.isArray(paymentState.list) ? paymentState.list : [];

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  return (
    <>
      <Seo title="Payment History | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">Payment History</h1>
        <ApiState
          loading={paymentState.loading && !payments.length}
          error={paymentState.error}
          empty={!payments.length && !paymentState.loading}
          emptyTitle="No payments yet"
          emptyText="Your payment transactions will appear here."
        >
          <div className="rounded-[12px] border border-border bg-white">
            {payments.map((payment, i) => {
              const id = payment.id || payment.paymentId;
              const status = payment.status;
              const statusColor =
                status === "success" || status === "paid"
                  ? "text-emerald-600 bg-emerald-50"
                  : status === "failed"
                    ? "text-red-600 bg-red-50"
                    : "text-amber-600 bg-amber-50";
              return (
                <div
                  key={id || i}
                  className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-soft">
                      <CreditCard size={14} className="text-gold" />
                    </div>
                    <div>
                      <p className=" text-sm font-medium text-ink">
                        {payment.provider || "Payment"}
                      </p>
                      <p className=" text-xs text-gray">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5  text-xs font-semibold capitalize ${statusColor}`}
                    >
                      {status}
                    </span>
                    <span className=" text-sm font-bold text-ink">
                      {formatMoney(
                        payment.amount || 0,
                        payment.currency || "INR",
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ApiState>
      </div>
    </>
  );
}

export function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifState = useSelector((s) => s.notification);
  const notifications = Array.isArray(notifState.list) ? notifState.list : [];

  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(5);

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
  };

  const categoryOf = (notification) => {
    const eventName = String(notification.payload?.eventName || notification.subject || "").toLowerCase();
    if (["return", "refund", "cancellation", "credit_note"].some((term) => eventName.includes(term))) return "returns";
    if (["order", "shipment", "delivery", "payment", "invoice"].some((term) => eventName.includes(term))) return "orders";
    return "account";
  };
  const categoryCounts = notifications.reduce((counts, notification) => {
    const category = categoryOf(notification);
    counts[category] += 1;
    return counts;
  }, { orders: 0, returns: 0, account: 0 });
  const tabs = [
    { id: "all", label: "All", count: notifications.length },
    { id: "orders", label: "Orders & Delivery", count: categoryCounts.orders },
    { id: "returns", label: "Returns & Refunds", count: categoryCounts.returns },
    { id: "account", label: "Account", count: categoryCounts.account },
  ];
  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter((notification) => categoryOf(notification) === activeTab);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Notifications", href: "/notifications" },
  ];
  const formatNotificationDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Today
    if (date.toDateString() === now.toDateString()) {
      if (diffHours < 1) {
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
      }

      if (diffHours < 3) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      }

      return `Today, ${time}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${time}`;
    }

    // Last 7 days
    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }

    // Older dates
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    setVisibleCount(5);
  }, [activeTab]);

  return (
    <>
      <Seo title="Notifications | Sam Global" />

      <div className="main-container overflow-visible py-6 sm:py-8">
        <Breadcrumbs
          items={breadcrumbItems}
          heading={null}
          className="mb-6 text-[#2E2E2E]"
          linkClassName="text-[#2E2E2E]"
          currentClassName="text-[#CE9F2D]"
          separatorClassName="text-[#2E2E2E]"
        />
        <h1 className="mb-4 font-sans text-[28px] font-bold text-[#3E4093] min-[375px]:text-[30px] min-[425px]:text-[32px] sm:text-[34px] lg:text-[38px]">
          Notifications
        </h1>
        <p className="mb-6 max-w-[600px] font-sans text-[13px] font-medium leading-[20px] text-[#2E2E2E] min-[375px]:text-[14px] min-[375px]:leading-[22px] sm:text-[16px] sm:leading-[24px] xl:text-[20px] xl:leading-[30px]">
          Stay updated with your orders, offers and account activity.
        </p>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          sticky
        />
        <ApiState
          loading={notifState.loading && !notifications.length}
          error={notifState.error}
          empty={!filteredNotifications.length && !notifState.loading}
          emptyTitle="No notifications"
          emptyText="You're all caught up! Notifications will appear here."
        >
          <div className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white">
            {filteredNotifications.slice(0, visibleCount).map((notif, i) => {
              const isRead = notif.read || notif.isRead;

              const notificationItem =
                notificationData[notif.payload?.eventName] ||
                notificationData[notif.subject] ||
                notificationData.default;

              const orderId = notif.payload?.orderId;

              const actionPath = orderId
                ? notificationItem.actionPath === "/orders/:orderId/track"
                  ? `/orders/${orderId}/track`
                  : notificationItem.actionPath === "/orders"
                    ? `/orders/${orderId}`
                    : notificationItem.actionPath
                : notificationItem.actionPath;

              return (
                <div
                  key={notif._id || notif.id || i}
                  className="flex min-h-[150px] gap-3 border-b-[1.5px] border-[#CE9F2D]/50 bg-white px-3 py-5 last:border-b-0 min-[375px]:min-h-[170px] min-[375px]:px-4 min-[425px]:min-h-[180px] sm:min-h-[190px] sm:px-8 sm:py-8 lg:min-h-[190px] lg:gap-5 lg:px-8 lg:py-8 xl:min-h-[212px] xl:gap-[24px] xl:px-[48px] xl:py-[41px]"
                >
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#FFC933] min-[375px]:h-[56px] min-[375px]:w-[56px] sm:h-[64px] sm:w-[64px] lg:h-[90px] lg:w-[90px] xl:h-[130px] xl:w-[130px]">
                    <img
                      src={notificationItem.icon}
                      alt={notif.subject || "Notification"}
                      className="h-[30px] w-[30px] object-contain sm:h-[38px] sm:w-[38px] lg:h-[52px] lg:w-[52px] xl:h-[72.81px] xl:w-[70.62px]"
                    />
                  </div>

                  <div className="min-w-0 flex-1 py-1 min-[375px]:py-2 lg:py-2 xl:py-3">
                    <div className="flex flex-wrap items-center !gap-4 sm:gap-3">
                      <h3 className="font-sans text-[13px] font-bold leading-tight text-[#1B1D60] min-[375px]:text-[14px] sm:text-[16px] lg:text-[20px] xl:text-[24px]">
                        {notif.title || notif.subject || "Notification"}
                      </h3>

                      {!isRead && (
                        <span className="flex items-center justify-center rounded-[20px] bg-[#cacae2] px-2.5 py-0.5 text-[9px] font-medium text-[#1B1D60] min-[375px]:text-[10px] sm:px-3 sm:py-1 sm:text-[10px] lg:h-[26px] lg:w-[65px] lg:text-[13px] xl:h-[31px] xl:w-[79px] xl:text-[16px]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-2 break-words font-sans text-[11px] font-medium leading-[17px] text-[#2E2E2E] min-[375px]:text-[12px] min-[375px]:leading-[19px] min-[425px]:text-[13px] min-[425px]:leading-[21px] sm:text-[13px] sm:leading-[21px] md:text-[14px] md:leading-[22px] lg:text-[16px] lg:leading-6 xl:text-[20px] xl:leading-10">
                      {notif.template ||
                        notif.message ||
                        notif.body ||
                        notificationItem.message ||
                        ""}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleNavigate(actionPath)}
                      className="mt-2 font-sans text-[11px] font-semibold text-[#1B1D60] hover:underline min-[375px]:text-[12px] sm:text-[16px]"
                    >
                      {notificationItem.action || "View Details"}
                    </button>
                  </div>

                  <div className="flex w-[68px] shrink-0 flex-col items-end min-[375px]:w-[72px] sm:w-[105px]">
                    <p className="mb-3 whitespace-nowrap font-sans text-[8px] font-medium text-[#2E2E2E] min-[375px]:text-[9px] sm:text-[12px] lg:text-[14px] xl:text-[20px]">
                      {formatNotificationDate(notif.createdAt)}
                    </p>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {!isRead && (
                        <span className="h-[6px] w-[6px] rounded-full bg-[#CE9F2D] sm:h-2 sm:w-2 lg:h-[10px] lg:w-[10px] xl:h-[15px] xl:w-[15px]" />
                      )}

                      <button type="button" className="leading-none">
                        <MoreVertical
                          size={18}
                          className="text-[#666666] lg:h-[22px] lg:w-[22px] xl:h-[25px] xl:w-[25px]"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length > 5 && (
              <div className="flex h-[60px] items-center justify-center bg-white sm:h-[76px]">
                <button
                  type="button"
                  onClick={() => {
                    if (visibleCount >= filteredNotifications.length) {
                      setVisibleCount(5);
                    } else {
                      setVisibleCount((prev) => prev + 5);
                    }
                  }}
                  className="flex items-center gap-2 text-[13px] font-bold text-[#1B1D60] sm:text-[14px] lg:text-[18px] xl:text-[24px]"
                >
                  {visibleCount >= filteredNotifications.length
                    ? "Show Less"
                    : "Load More"}

                  <ChevronDown
                    size={16}
                    strokeWidth={3}
                    className={
                      visibleCount >= filteredNotifications.length ? "rotate-180" : ""
                    }
                  />
                </button>
              </div>
            )}
          </div>
        </ApiState>
      </div>
    </>
  );
}
