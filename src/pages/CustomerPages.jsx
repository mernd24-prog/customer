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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Banknote, CreditCard, Heart, PackageCheck, ShieldCheck } from "lucide-react";
import ApiState from "../components/common/ApiState";
import Seo from "../components/common/Seo";
import StatusTimeline from "../components/common/StatusTimeline";
import ProductCard from "../components/product/ProductCard";
import { useToastThunk } from "../hooks/useToastThunk";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import { formatMoney } from "../utils/ecommerce";
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
  searchProducts,
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
  fetchMySubscriptions,
  purchaseSubscription,
} from "../features/subscription/subscriptionSlice";
import {
  fetchNotifications,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "../features/notification/notificationSlice";
import {
  fetchLoyaltyProfile,
  fetchLoyaltyBenefits,
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
import { trackRecommendationInteraction } from "../features/recommendation/recommendationSlice";
import { trackAnalyticsEvent } from "../features/analytics/analyticsSlice";
import { fetchCmsPageBySlug } from "../features/cms/cmsSlice";
import { fetchDynamicPrice } from "../features/dynamicPricing/dynamicPricingSlice";
import {
  fetchMe,
  updateMe,
  addAddress,
  submitUserKyc,
} from "../features/user/userSlice";
import { AUTH_ROUTES } from "../features/auth/authRoutes";
import {
  useFetch,
  itemsFrom,
  addProductToCartPayload,
  wishlistPayload,
} from "./customer/helpers";
export { HomePage } from "./customer/HomePage";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
const emailSchema = z.object({ email: z.string().email() });
const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
});
const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
  newPassword: z.string().min(8),
});
const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const displayLabel = (value = "") =>
  String(value || "N/A").replace(/_/g, " ");

const getProductId = (item = {}) => {
  const product = item.productId || item.product_id || item.product;
  return typeof product === "object"
    ? firstDefined(product._id, product.id, product.productId)
    : product;
};

const getProductTitle = (item = {}) => {
  const product = item.productId || item.product_id || item.product;
  return typeof product === "object"
    ? firstDefined(product.title, product.name, product.sku, product._id, product.id)
    : product;
};

const cartEstimate = (items = []) =>
  items.reduce((sum, item) => {
    const product = item.productId || item.product_id || item.product || {};
    const unit = Number(firstDefined(item.unitPrice, item.unit_price, product.salePrice, product.price, 0));
    return sum + unit * Number(item.quantity || 0);
  }, 0);

export function AuthFormPage({ mode }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const run = useToastThunk();
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
      <form className="panel" onSubmit={handleSubmit(submit)}>
        <h1>{title}</h1>
        {(mode === "register" || mode === "register-otp") && (
          <>
            <input placeholder="First name" {...register("firstName")} />
            <small>{errors.firstName?.message}</small>
            <input placeholder="Last name" {...register("lastName")} />
            <small>{errors.lastName?.message}</small>
            <input placeholder="Phone" {...register("phone")} />
            <small>{errors.phone?.message}</small>
          </>
        )}
        <input placeholder="Email" {...register("email")} />
        <small>{errors.email?.message}</small>
        {(mode === "login" ||
          mode === "register" ||
          mode === "register-otp") && (
          <>
            <input
              placeholder="Password"
              type="password"
              {...register("password")}
            />
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
            <input
              placeholder="New password"
              type="password"
              {...register("newPassword")}
            />
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
                : toast.error("Paste a provider ID token first"),
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
      <ApiState
        loading={user.loading}
        error={user.error}
        empty={!user.current}
        onRetry={() => dispatch(fetchMe())}
      >
        {tab === "profile" && (
          <form className="panel" onSubmit={handleSubmit(submitProfile)}>
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
          <form className="panel" onSubmit={handleSubmit(submitAddress)}>
            <input
              placeholder="Label"
              {...register("label", { required: true })}
            />
            <input
              placeholder="Full name"
              {...register("fullName", { required: true })}
            />
            <input
              placeholder="Phone"
              {...register("phone", { required: true })}
            />
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
            className="panel"
            onSubmit={handleSubmit((values) =>
              run(dispatch, changePassword(values), "Password changed"),
            )}
          >
            <input
              type="password"
              placeholder="Current password"
              {...register("currentPassword", { required: true })}
            />
            <input
              type="password"
              placeholder="New password"
              {...register("newPassword", { required: true })}
            />
            <button className="button">Change password</button>
          </form>
        )}
        {tab === "kyc" && (
          <form className="panel" onSubmit={handleSubmit(submitKyc)}>
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
    search ? searchProducts : fetchProducts,
    search ? { q: query } : Object.fromEntries(params),
    (s) => s.product,
  );
  const cart = useSelector((s) => s.cart.current);
  const run = useToastThunk();
  const products = itemsFrom(productState);
  const addToCart = (product) =>
    run(
      dispatch,
      updateCart(addProductToCartPayload(cart, product)),
      "Added to cart",
    );
  const wishlist = (product) =>
    run(
      dispatch,
      updateCart(wishlistPayload(cart, product)),
      "Saved to wishlist",
    );

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
          setParams({ q: query });
          dispatch(searchProducts({ q: query }));
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
        onRetry={() =>
          dispatch(
            search
              ? searchProducts({ q: query })
              : fetchProducts(Object.fromEntries(params)),
          )
        }
      >
        <div className="grid">
          {products.map((product) => (
            <ProductCard
              key={product.id || product._id || product.productId}
              product={product}
              onAddToCart={addToCart}
              onWishlist={wishlist}
            />
          ))}
        </div>
      </ApiState>
    </section>
  );
}

export function CategoryPage() {
  const { categoryKey } = useParams();
  const dispatch = useDispatch();
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
  return (
    <section>
      <Seo title={`${category.current?.title || categoryKey} | Sam Global`} />
      <h1>{category.current?.title || categoryKey}</h1>
      <ApiState
        loading={products.loading}
        error={products.error}
        empty={!itemsFrom(products).length}
        onRetry={() => dispatch(fetchProducts({ category: categoryKey }))}
      >
        <div className="grid">
          {itemsFrom(products).map((product) => (
            <ProductCard
              key={product.id || product._id || product.productId}
              product={product}
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
  const cart = useSelector((s) => s.cart.current);
  const run = useToastThunk();
  const product = productState.current;
  const [pincode, setPincode] = useState("");

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
        onRetry={() => dispatch(fetchProductById({ productId }))}
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
          <div className="panel">
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
              <button
                className="button"
                onClick={() =>
                  run(
                    dispatch,
                    updateCart(addProductToCartPayload(cart, product)),
                    "Added to cart",
                  )
                }
              >
                Add to cart
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  run(
                    dispatch,
                    updateCart(wishlistPayload(cart, product)),
                    "Saved to wishlist",
                  )
                }
              >
                <Heart size={16} /> Wishlist
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
        onRetry={() => dispatch(fetchCart())}
      >
        <div className="split">
          <div className="panel">
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
          <div className="panel">
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
        amount: firstDefined(orderData?.payableAmount, orderData?.payable_amount, orderData?.totalAmount, 0),
        currency: "INR",
        notes: { source: "web_checkout", paymentProvider },
      }),
      paymentProvider === "cod" ? "COD order confirmed" : "Payment initiated",
    );
    const status = firstDefined(paymentResult?.data?.status, paymentResult?.status);
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
        onRetry={() => dispatch(fetchCart())}
      >
        <div className="split">
          <form className="panel" onSubmit={handleSubmit(submit)}>
            <h2>Delivery address</h2>
            <input
              placeholder="Line 1"
              {...register("line1", { required: true })}
            />
            <small>{errors.line1 && "Required"}</small>
            <input placeholder="Line 2" {...register("line2")} />
            <input placeholder="City" {...register("city", { required: true })} />
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
              {paymentProvider === "cod" ? <Banknote size={16} /> : <CreditCard size={16} />}
              {paymentProvider === "cod" ? "Place COD order" : "Place order and continue"}
            </button>
          </form>

          <aside className="panel">
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
                    <strong>{option.label || displayLabel(option.provider)}</strong>
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
              <div><span>Estimated cart</span><strong>{formatMoney(estimatedAmount)}</strong></div>
              <div><span>Selected method</span><strong>{displayLabel(paymentProvider)}</strong></div>
              <div><span>Final payable</span><strong>Calculated after order validation</strong></div>
            </div>
          </aside>
        </div>
      </ApiState>
    </section>
  );
}

export function PaymentResultPage({ failed = false }) {
  return (
    <section className="narrow">
      <Seo title={failed ? "Payment failed" : "Payment success"} />
      <div className={`state-box ${failed ? "error" : ""}`}>
        <h1>{failed ? "Payment failed" : "Payment successful"}</h1>
        <p>
          {failed
            ? "You can retry from payment history or the order detail page."
            : "Your order has been placed."}
        </p>
        <Link className="button" to={failed ? "/orders" : "/orders"}>
          {failed ? "Review orders" : "View orders"}
        </Link>
      </div>
    </section>
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
  const invoice = taxState.current?.order_id === orderId || taxState.current?.orderId === orderId ? taxState.current : null;

  useEffect(() => {
    if (detail || track) {
      dispatch(fetchOrderInvoice({ orderId })).catch(() => {});
    }
  }, [detail, dispatch, orderId, track]);

  if (detail || track)
    return (
      <section>
        <Seo title={`Order ${orderId} | Sam Global`} />
        <ApiState
          loading={state.loading}
          error={state.error}
          empty={!order}
          onRetry={() => dispatch(fetchOrderById({ orderId }))}
        >
          <div className="panel">
            <h1>Order {orderId}</h1>
            <StatusTimeline status={order?.status || order?.orderStatus} />
            <p>
              {formatMoney(
                firstDefined(order?.payable_amount, order?.payableAmount, order?.amounts?.payableAmount, order?.total_amount, order?.totalAmount),
                order?.currency,
              )}
            </p>
            <div className="summary-lines">
              <div><span>Payment method</span><strong>{displayLabel(firstDefined(order?.payment_provider, order?.paymentProvider))}</strong></div>
              <div><span>Payment status</span><strong>{displayLabel(firstDefined(order?.payment_status, order?.paymentStatus))}</strong></div>
              <div><span>COD charge</span><strong>{formatMoney(firstDefined(order?.cod_charge_amount, order?.codChargeAmount, 0), order?.currency)}</strong></div>
              <div><span>Tax</span><strong>{formatMoney(firstDefined(order?.tax_amount, order?.taxAmount, 0), order?.currency)}</strong></div>
            </div>
            <div className="panel nested-panel">
              <h2>Invoice</h2>
              {taxState.loading && <p>Loading invoice...</p>}
              {!taxState.loading && invoice ? (
                <div className="summary-lines">
                  <div><span>Invoice number</span><strong>{invoice.invoice_number || invoice.invoiceNumber}</strong></div>
                  <div><span>Taxable amount</span><strong>{formatMoney(invoice.taxable_amount || invoice.taxableAmount, invoice.currency)}</strong></div>
                  <div><span>CGST</span><strong>{formatMoney(invoice.cgst_amount || invoice.cgstAmount, invoice.currency)}</strong></div>
                  <div><span>SGST</span><strong>{formatMoney(invoice.sgst_amount || invoice.sgstAmount, invoice.currency)}</strong></div>
                  <div><span>IGST</span><strong>{formatMoney(invoice.igst_amount || invoice.igstAmount, invoice.currency)}</strong></div>
                  <div><span>Total invoice</span><strong>{formatMoney(invoice.total_amount || invoice.totalAmount, invoice.currency)}</strong></div>
                </div>
              ) : (
                !taxState.loading && <p>Invoice will appear here after payment is confirmed.</p>
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
                  toast.info("Reorder builds a new cart from order items.")
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
        onRetry={() => dispatch(fetchMyOrders())}
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
          className="panel"
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
        onRetry={() => dispatch(fetchMyReturns())}
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

export function SimpleApiPage({
  title,
  selector,
  thunk,
  icon: Icon = PackageCheck,
  action,
}) {
  const dispatch = useDispatch();
  const state = useFetch(thunk, action?.arg, selector);
  const list = itemsFrom(state);
  return (
    <section>
      <Seo title={`${title} | Sam Global`} />
      <div className="section-head">
        <h1>{title}</h1>
        <Icon />
      </div>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!list.length && !state.current}
        onRetry={() => dispatch(thunk(action?.arg))}
      >
        <pre className="json">
          {JSON.stringify(list.length ? list : state.current, null, 2)}
        </pre>
      </ApiState>
    </section>
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
    <section>
      <Seo title="Subscriptions" />
      <h1>Subscriptions</h1>
      <ApiState
        loading={plans.loading}
        error={plans.error}
        empty={!itemsFrom(plans).length}
        onRetry={() => dispatch(fetchSubscriptionPlans())}
      >
        <div className="grid">
          {itemsFrom(plans).map((plan) => (
            <div className="card" key={plan.id || plan.planId || plan.planCode}>
              <h2>{plan.title}</h2>
              <p>{plan.description}</p>
              <strong>{formatMoney(plan.monthlyPrice, plan.currency)}</strong>
              <button
                className="button"
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
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
      </ApiState>
      <div className="panel">
        <button
          className="button secondary"
          onClick={() => dispatch(fetchMySubscriptions())}
        >
          Load my subscriptions
        </button>
        <p>
          Pause, resume, and cancel actions are available from a loaded
          subscription record when its subscriptionId is known.
        </p>
      </div>
    </section>
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
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
      frequency: "real_time",
      timezone: "Asia/Kolkata",
    },
  });
  return (
    <section>
      <Seo title="Notification preferences" />
      <form
        className="panel"
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
        <h1>Notification preferences</h1>
        <ApiState
          loading={state.loading}
          error={state.error}
          empty={false}
          onRetry={() => dispatch(fetchNotificationPreferences())}
        >
          <label>
            <input type="checkbox" {...register("email")} /> Email
          </label>
          <label>
            <input type="checkbox" {...register("sms")} /> SMS
          </label>
          <label>
            <input type="checkbox" {...register("push")} /> Push
          </label>
          <label>
            <input type="checkbox" {...register("inApp")} /> In-app
          </label>
          <select {...register("frequency")}>
            <option value="real_time">Real time</option>
            <option value="daily">Daily</option>
          </select>
          <input {...register("timezone")} />
          <button className="button">Save</button>
        </ApiState>
      </form>
    </section>
  );
}

export function LoyaltyPage() {
  const dispatch = useDispatch();
  const profile = useFetch(fetchLoyaltyProfile, undefined, (s) => s.loyalty);
  const run = useToastThunk();
  useEffect(() => {
    dispatch(fetchLoyaltyBenefits());
    dispatch(fetchLoyaltyHistory({ limit: 50, offset: 0 }));
  }, [dispatch]);
  return (
    <section>
      <Seo title="Loyalty" />
      <h1>Loyalty</h1>
      <ApiState
        loading={profile.loading}
        error={profile.error}
        empty={!profile.current}
        onRetry={() => dispatch(fetchLoyaltyProfile())}
      >
        <pre className="json">{JSON.stringify(profile.current, null, 2)}</pre>
        <button
          className="button"
          onClick={() =>
            run(
              dispatch,
              redeemLoyaltyPoints({ points: 50 }),
              "Points redeemed",
            )
          }
        >
          Redeem 50 points
        </button>
      </ApiState>
    </section>
  );
}

export function WarrantyPage({ detail = false }) {
  const { warrantyId } = useParams();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.warranty);
  const run = useToastThunk();
  const { register, handleSubmit } = useForm();
  useEffect(() => {
    if (detail) dispatch(fetchWarrantyById({ warrantyId }));
  }, [detail, dispatch, warrantyId]);
  return (
    <section>
      <Seo title="Warranty" />
      <h1>Warranty</h1>
      {!detail && (
        <form
          className="panel"
          onSubmit={handleSubmit((values) =>
            dispatch(fetchOrderWarranties({ orderId: values.orderId })),
          )}
        >
          <input
            placeholder="Order ID"
            {...register("orderId", { required: true })}
          />
          <button className="button secondary">Load order warranties</button>
        </form>
      )}
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!state.current && !itemsFrom(state).length}
        onRetry={() => detail && dispatch(fetchWarrantyById({ warrantyId }))}
      >
        <pre className="json">
          {JSON.stringify(state.current || itemsFrom(state), null, 2)}
        </pre>
        <form
          className="panel"
          onSubmit={handleSubmit((values) =>
            run(
              dispatch,
              registerWarranty({
                orderId: values.orderId,
                productId: values.productId,
                variantId: values.variantId,
              }),
              "Warranty registered",
            ),
          )}
        >
          <input placeholder="Order ID" {...register("orderId")} />
          <input placeholder="Product ID" {...register("productId")} />
          <input placeholder="Variant ID" {...register("variantId")} />
          <button className="button secondary">Register warranty</button>
        </form>
        {detail && (
          <button
            className="button"
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
          >
            Claim warranty
          </button>
        )}
        <p className="todo">
          TODO: warranty claim evidence upload API is missing.
        </p>
      </ApiState>
    </section>
  );
}

export function CmsPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const state = useFetch(fetchCmsPageBySlug, { slug }, (s) => s.cms);
  const page = state.current;
  return (
    <section className="content-page">
      <Seo
        title={`${page?.metadata?.seoTitle || page?.title || slug} | Sam Global`}
      />
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!page}
        onRetry={() => dispatch(fetchCmsPageBySlug({ slug }))}
      >
        <h1>{page?.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page?.body || "" }} />
      </ApiState>
    </section>
  );
}

export function BackendGapNotes() {
  return (
    <section>
      <Seo title="Backend gaps" />
      <h1>Backend TODO adapters</h1>
      <div className="panel">
        <p>
          Wishlist uses cart.wishlist. Coupon validation flows through order
          couponCode. File uploads, invoice download, referral routes, product
          reviews, public autocomplete, product compare API, live customer
          carrier tracking, and marketing banner APIs are intentionally left as
          TODOs without fake paths.
        </p>
      </div>
    </section>
  );
}

export function PaymentsPage() {
  return (
    <SimpleApiPage
      title="Payments"
      selector={(s) => s.payment}
      thunk={fetchPayments}
      icon={CreditCard}
    />
  );
}

export function WalletPage() {
  return (
    <SimpleApiPage
      title="Wallet"
      selector={(s) => s.wallet}
      thunk={fetchWallet}
      icon={CreditCard}
    />
  );
}

export function NotificationsPage() {
  return (
    <SimpleApiPage
      title="Notifications"
      selector={(s) => s.notification}
      thunk={fetchNotifications}
      icon={PackageCheck}
    />
  );
}
