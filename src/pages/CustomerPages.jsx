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
import { toast } from "react-toastify";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  Heart,
  PackageCheck,
  ShieldCheck,
  Star,
  Wallet,
  XCircle,
} from "lucide-react";
import ApiState from "../components/common/ApiState";
import Seo from "../components/common/Seo";
import BrandButton from "../components/ui/BrandButton";
import StatusTimeline from "../components/common/StatusTimeline";
import { ProductCard } from "../components/ecommerce";
import { useToastThunk } from "../hooks/useToastThunk";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import { formatMoney, getProductId } from "../utils/ecommerce";
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
  searchProducts,
  fetchProductById,
} from "../features/product/productSlice";
import { fetchCategoryByKey } from "../features/catalog/catalogSlice";
import { fetchCart, updateCart } from "../features/cart/cartSlice";
import { createOrder } from "../features/order/orderSlice";
import {
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
import { fetchSubscriptionPlans, purchaseSubscription } from "../features/subscription/subscriptionSlice";
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
import {
  useFetch,
  itemsFrom,
} from "./customer/helpers";
import { loginSchema, emailSchema, otpSchema, resetSchema, registerSchema } from "../validations/validationSchemas";
import { sanitizeSearchQuery } from "../validations";
export { HomePage } from "./customer/HomePage";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getOrderPayableAmount = (order = {}) =>
  toNumber(
    order.amounts?.payableAmount ??
      order.amounts?.payable_amount ??
      order.order?.amounts?.payableAmount ??
      order.order?.amounts?.payable_amount ??
      order.order?.payable_amount ??
      order.order?.total_amount ??
      order.payable_amount ??
      order.total_amount ??
      order.totalAmount,
  );

const getCreatedOrder = (result = {}) =>
  result?.data?.order ||
  result?.data?.data?.order ||
  result?.data?.data ||
  result?.order ||
  result?.data ||
  result;

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
      <form className="panel" onSubmit={handleSubmit(submit)}>
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
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
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
            {(() => {
              const { onChange, ...rest } = register("phone", { required: true });
              return (
                <input
                  placeholder="Enter phone number"
                  maxLength={10}
                  {...rest}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
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
            className="panel"
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
          dispatch(searchProducts({ q: searchValue }));
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(sanitizeSearchQuery(event.target.value))}
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
  const { isWishlisted, toggleWishlist } = useProductActions();
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
        items: items.filter((item) => item.productId !== productId),
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
              <div className="line-item" key={item.productId}>
                <span>{item.productId}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    run(
                      dispatch,
                      updateCart({
                        items: items.map((x) =>
                          x.productId === item.productId
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
                  onClick={() => remove(item.productId)}
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
  const run = useToastThunk();
  const navigate = useNavigate();
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
        shippingAddress: values,
        items: (cart.current?.items || []).map(({ productId, product, quantity, variantId, variantSku, variantTitle, attributes }) => ({
          productId: getProductId(productId || product),
          variantId: variantId || undefined,
          variantSku: variantSku || undefined,
          variantTitle: variantTitle || undefined,
          attributes: attributes || {},
          quantity,
        })),
      }),
      "Order created",
    );
    const createdOrder = getCreatedOrder(order);
    const orderId = createdOrder?.id || createdOrder?.orderId || createdOrder?.order_id;
    let paymentOrder = createdOrder;
    let payableAmount = getOrderPayableAmount(paymentOrder);
    if (payableAmount <= 0 && orderId) {
      const orderDetail = await dispatch(fetchOrderById({ orderId })).unwrap();
      paymentOrder = getCreatedOrder(orderDetail);
      payableAmount = getOrderPayableAmount(paymentOrder);
    }

    if (payableAmount <= 0) {
      toast.error("Payment amount is missing from order response. Please try again.");
      return;
    }
    await run(
      dispatch,
      initiatePayment({
        orderId,
        provider: "razorpay",
        amount: payableAmount,
        currency: paymentOrder?.currency || createdOrder?.currency || "INR",
        notes: { source: "web_checkout" },
      }),
      "Payment initiated",
    );
    navigate("/payment/success");
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
        <form className="panel" onSubmit={handleSubmit(submit)}>
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
          <p className="todo">
            TODO: coupon validation/apply API is missing; couponCode is sent
            through order creation.
          </p>
          <input
            type="number"
            placeholder={`Wallet amount, balance ${wallet.current?.balance || 0}`}
            {...register("walletAmount")}
          />
          <button className="button">
            <CreditCard size={16} /> Place order and pay
          </button>
        </form>
      </ApiState>
    </section>
  );
}

export function PaymentResultPage({ failed = false }) {
  return (
    <>
      <Seo
        title={
          failed
            ? "Payment Failed | Sam Global"
            : "Payment Successful | Sam Global"
        }
      />
      <div className="w-container flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-[16px] border border-[#e7dfd1] bg-white p-8 text-center">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${failed ? "bg-red-100" : "bg-[#F5ECDD]"}`}
          >
            {failed ? (
              <svg
                className="h-8 w-8 text-red-500"
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
            ) : (
              <svg
                className="h-8 w-8 text-[#CE9F2D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <h1 className="font-montserrat text-2xl font-bold text-[#2E2E2E]">
            {failed ? "Payment Failed" : "Order Placed!"}
          </h1>
          <p className="mt-2 font-montserrat text-sm text-[#787878]">
            {failed
              ? "Your payment could not be processed. Please try again or contact support."
              : "Your order has been placed successfully. We'll send you a confirmation soon."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/orders">
              <BrandButton
                variant="primary"
                rounded
                label={failed ? "View Orders" : "Track My Order"}
                className="w-full h-11 text-sm font-semibold"
              />
            </Link>
            <Link to="/">
              <BrandButton
                variant="secondary"
                rounded
                label="Continue Shopping"
                className="w-full h-11 text-sm"
              />
            </Link>
          </div>
        </div>
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
  const run = useToastThunk();
  const orders = itemsFrom(state);
  const order = state.current;
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
                order?.amounts?.payableAmount || order?.totalAmount,
                order?.currency,
              )}
            </p>
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
            <p className="todo">
              TODO: customer live carrier tracking and invoice download APIs are
              missing.
            </p>
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
    <>
      <Seo title={`${title} | Sam Global`} />
      <div className="w-container py-8">
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          {title}
        </h1>
        <ApiState
          loading={state.loading}
          error={state.error}
          empty={!list.length && !state.current}
          onRetry={() => dispatch(thunk(action?.arg))}
        >
          <div className="rounded-[12px] border border-[#e7dfd1] bg-white p-6">
            <pre className="overflow-x-auto font-mono text-xs text-[#787878]">
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
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          Subscription Plans
        </h1>
        <ApiState
          loading={plans.loading}
          error={plans.error}
          empty={!itemsFrom(plans).length}
          emptyTitle="No plans available"
          emptyText="Subscription plans will appear here."
          onRetry={() => dispatch(fetchSubscriptionPlans())}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {itemsFrom(plans).map((plan) => (
              <div
                key={plan.id || plan.planId || plan.planCode}
                className="flex flex-col rounded-[16px] border border-[#e7dfd1] bg-white p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5ECDD]">
                  <Star size={18} className="text-[#CE9F2D]" />
                </div>
                <h2 className="font-montserrat text-lg font-semibold text-[#2E2E2E]">
                  {plan.title}
                </h2>
                <p className="mt-1 font-montserrat text-sm text-[#787878]">
                  {plan.description}
                </p>
                <p className="mt-4 font-montserrat text-2xl font-bold text-[#CE9F2D]">
                  {formatMoney(plan.monthlyPrice, plan.currency || "INR")}
                  <span className="font-montserrat text-sm font-normal text-[#A6A6A6]">
                    /mo
                  </span>
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
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          Notification Preferences
        </h1>
        <ApiState
          loading={state.loading}
          error={state.error}
          empty={false}
          onRetry={() => dispatch(fetchNotificationPreferences())}
        >
          <form
            className="rounded-[12px] border border-[#e7dfd1] bg-white p-6 sm:p-8"
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
              <h2 className="mb-1 font-montserrat text-base font-semibold text-[#2E2E2E]">
                Channels
              </h2>
              <p className="font-montserrat text-sm text-[#787878]">
                Choose how you'd like to receive notifications.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {CHANNELS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#e7dfd1] px-4 py-3"
                >
                  <span className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                    {label}
                  </span>
                  <input
                    type="checkbox"
                    {...register(key)}
                    className="h-4 w-4 accent-[#CE9F2D]"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                  Frequency
                </span>
                <select
                  {...register("frequency")}
                  className="rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none focus:border-[#CE9F2D]"
                >
                  <option value="real_time">Real time</option>
                  <option value="daily">Daily digest</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                  Timezone
                </span>
                <input
                  {...register("timezone")}
                  className="rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none focus:border-[#CE9F2D]"
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
  const history = Array.isArray(loyaltyState.list) ? loyaltyState.list : [];
  const run = useToastThunk();

  useEffect(() => {
    dispatch(fetchLoyaltyProfile());
    dispatch(fetchLoyaltyBenefits());
    dispatch(fetchLoyaltyHistory({ limit: 20, offset: 0 }));
  }, [dispatch]);

  return (
    <>
      <Seo title="Loyalty Rewards | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          Loyalty Rewards
        </h1>
        <ApiState
          loading={loyaltyState.loading && !profile}
          error={loyaltyState.error}
          empty={!profile && !loyaltyState.loading}
          emptyTitle="No loyalty profile"
          emptyText="Start shopping to earn loyalty points."
          onRetry={() => dispatch(fetchLoyaltyProfile())}
        >
          {/* Points card */}
          {profile && (
            <div className="mb-6 rounded-[16px] bg-gradient-to-br from-[#CE9F2D] to-[#A26D27] p-6 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Gift size={18} />
                <span className="font-montserrat text-sm font-medium opacity-80">
                  Available Points
                </span>
              </div>
              <p className="font-montserrat text-4xl font-bold">
                {profile.points || profile.balance || 0}
              </p>
              <p className="mt-1 font-montserrat text-sm opacity-70">
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
            <div className="rounded-[12px] border border-[#e7dfd1] bg-white">
              <div className="border-b border-[#e7dfd1] px-5 py-4">
                <h2 className="font-montserrat text-base font-semibold text-[#2E2E2E]">
                  Transaction History
                </h2>
              </div>
              <div className="divide-y divide-[#e7dfd1]">
                {history.map((tx, i) => (
                  <div
                    key={tx.id || i}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                        {tx.reason || tx.description || "Points transaction"}
                      </p>
                      <p className="font-montserrat text-xs text-[#A6A6A6]">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString("en-IN")
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`font-montserrat text-sm font-semibold ${(tx.points || tx.amount || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}
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
  const { register, handleSubmit, reset } = useForm();

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
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          {detail ? "Warranty Details" : "My Warranties"}
        </h1>

        {!detail && (
          <form
            className="mb-6 rounded-[12px] border border-[#e7dfd1] bg-white p-5"
            onSubmit={handleSubmit((v) => {
              dispatch(fetchOrderWarranties({ orderId: v.orderId }));
              reset();
            })}
          >
            <h2 className="mb-3 font-montserrat text-sm font-semibold text-[#2E2E2E]">
              Look up by Order ID
            </h2>
            <div className="flex gap-3">
              <input
                placeholder="Enter Order ID"
                {...register("orderId", { required: true })}
                className="flex-1 rounded-[8px] border border-[#cfc6b8] px-3 py-2.5 font-montserrat text-sm outline-none focus:border-[#CE9F2D]"
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
          onRetry={() => detail && dispatch(fetchWarrantyById({ warrantyId }))}
        >
          {(warranty || warranties.length > 0) && (
            <div className="rounded-[12px] border border-[#e7dfd1] bg-white">
              {warranty && (
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5ECDD]">
                      <ShieldCheck size={18} className="text-[#CE9F2D]" />
                    </div>
                    <div>
                      <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
                        {warranty.type || "Product Warranty"}
                      </p>
                      <p className="font-montserrat text-xs text-[#A6A6A6]">
                        ID: {warranty.id || warrantyId}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {warranty.period && (
                      <div className="flex gap-2">
                        <span className="text-[#787878]">Period:</span>
                        <span className="font-medium text-[#2E2E2E]">
                          {warranty.period}
                        </span>
                      </div>
                    )}
                    {warranty.expiresAt && (
                      <div className="flex gap-2">
                        <span className="text-[#787878]">Expires:</span>
                        <span className="font-medium text-[#2E2E2E]">
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
                  className="flex items-center justify-between border-t border-[#e7dfd1] px-5 py-4 first:border-t-0"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-[#CE9F2D]" />
                    <div>
                      <p className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                        {w.type || "Warranty"}
                      </p>
                      <p className="font-montserrat text-xs text-[#A6A6A6]">
                        {w.period}
                      </p>
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
            className="mt-6 rounded-[12px] border border-[#e7dfd1] bg-white p-5"
            onSubmit={handleSubmit((v) =>
              run(
                dispatch,
                registerWarranty({
                  orderId: v.reg_orderId,
                  productId: v.reg_productId,
                  variantId: v.reg_variantId,
                }),
                "Warranty registered",
              ),
            )}
          >
            <h2 className="mb-4 font-montserrat text-sm font-semibold text-[#2E2E2E]">
              Register a Warranty
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                placeholder="Order ID"
                {...register("reg_orderId")}
                className="rounded-[8px] border border-[#cfc6b8] px-3 py-2.5 font-montserrat text-sm outline-none focus:border-[#CE9F2D]"
              />
              <input
                placeholder="Product ID"
                {...register("reg_productId")}
                className="rounded-[8px] border border-[#cfc6b8] px-3 py-2.5 font-montserrat text-sm outline-none focus:border-[#CE9F2D]"
              />
              <input
                placeholder="Variant ID (optional)"
                {...register("reg_variantId")}
                className="rounded-[8px] border border-[#cfc6b8] px-3 py-2.5 font-montserrat text-sm outline-none focus:border-[#CE9F2D]"
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
        <h1 className="mb-4 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          API Integration Notes
        </h1>
        <div className="rounded-[12px] border border-[#e7dfd1] bg-white p-6">
          <p className="font-montserrat text-sm text-[#787878]">
            Wishlist uses{" "}
            <code className="rounded bg-[#FAF6EE] px-1.5 py-0.5 text-[#A26D27]">
              cart.wishlist
            </code>
            . Coupon validation flows through the order's{" "}
            <code className="rounded bg-[#FAF6EE] px-1.5 py-0.5 text-[#A26D27]">
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
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          My Wallet
        </h1>
        <ApiState
          loading={walletState.loading && !wallet}
          error={walletState.error}
          empty={!wallet && !walletState.loading}
          emptyTitle="Wallet not available"
          emptyText="Your wallet information will appear here."
          onRetry={() => dispatch(fetchWallet())}
        >
          {wallet && (
            <div className="rounded-[16px] bg-gradient-to-br from-[#2E2E2E] to-[#4a4a4a] p-6 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Wallet size={18} />
                <span className="font-montserrat text-sm font-medium opacity-80">
                  Available Balance
                </span>
              </div>
              <p className="font-montserrat text-4xl font-bold">
                {formatMoney(wallet.balance || 0, wallet.currency || "INR")}
              </p>
              {wallet.lockedBalance > 0 && (
                <p className="mt-1 font-montserrat text-sm opacity-60">
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
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          Payment History
        </h1>
        <ApiState
          loading={paymentState.loading && !payments.length}
          error={paymentState.error}
          empty={!payments.length && !paymentState.loading}
          emptyTitle="No payments yet"
          emptyText="Your payment transactions will appear here."
          onRetry={() => dispatch(fetchPayments())}
        >
          <div className="rounded-[12px] border border-[#e7dfd1] bg-white">
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
                  className="flex items-center justify-between border-b border-[#e7dfd1] px-5 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5ECDD]">
                      <CreditCard size={14} className="text-[#CE9F2D]" />
                    </div>
                    <div>
                      <p className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                        {payment.provider || "Payment"}
                      </p>
                      <p className="font-montserrat text-xs text-[#A6A6A6]">
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
                      className={`rounded-full px-2.5 py-0.5 font-montserrat text-xs font-semibold capitalize ${statusColor}`}
                    >
                      {status}
                    </span>
                    <span className="font-montserrat text-sm font-bold text-[#2E2E2E]">
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
  const notifState = useSelector((s) => s.notification);
  const notifications = Array.isArray(notifState.list) ? notifState.list : [];

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <>
      <Seo title="Notifications | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          Notifications
        </h1>
        <ApiState
          loading={notifState.loading && !notifications.length}
          error={notifState.error}
          empty={!notifications.length && !notifState.loading}
          emptyTitle="No notifications"
          emptyText="You're all caught up! Notifications will appear here."
          onRetry={() => dispatch(fetchNotifications())}
        >
          <div className="rounded-[12px] border border-[#e7dfd1] bg-white">
            {notifications.map((notif, i) => {
              const isRead = notif.read || notif.isRead;
              return (
                <div
                  key={notif.id || i}
                  className={`flex gap-4 border-b border-[#e7dfd1] px-5 py-4 last:border-b-0 ${isRead ? "" : "bg-[#FAF6EE]"}`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isRead ? "bg-[#FAF6EE]" : "bg-[#F5ECDD]"}`}
                  >
                    <Bell
                      size={14}
                      className={isRead ? "text-[#A6A6A6]" : "text-[#CE9F2D]"}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                      {notif.title || notif.subject || "Notification"}
                    </p>
                    <p className="mt-0.5 font-montserrat text-xs text-[#787878]">
                      {notif.message || notif.body || ""}
                    </p>
                    <p className="mt-1 font-montserrat text-xs text-[#A6A6A6]">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleDateString("en-IN")
                        : ""}
                    </p>
                  </div>
                  {!isRead && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#CE9F2D]" />
                  )}
                </div>
              );
            })}
          </div>
        </ApiState>
      </div>
    </>
  );
}
