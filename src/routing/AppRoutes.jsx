import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { BuyerOnlyRoute, GuestRoute, ProtectedRoute } from "./RouteGuards";
import { AUTH_ROUTES } from "../features/auth/authRoutes";
import Loader from "../components/ui/Loader";


const CategoryListingPage = lazy(() => import("../pages/category/CategoryListingPage"),);
const DownloadApp = lazy(() => import("../pages/downloadApp/DownloadApp"));
const PolicyPage = lazy(() => import("../pages/policiesPage/PoliciesPages"));
const ReturnsPage = lazy(() => import("../pages/returns/ReturnsPage.jsx"));
const ContactUs = lazy(() => import("../pages/contact/ContactUs.jsx"));
const SellerPolicy = lazy(
  () => import("../pages/seller/sellerPolicy/sellerPolicy.jsx"),
);
const BecomeASeller = lazy(
  () => import("../pages/seller/becomeASeller/becomeASeller.jsx"),
);

const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const BuyerRegisterPage = lazy(
  () => import("../features/auth/BuyerRegisterPage"),
);
const RegisterOtpPage = lazy(() => import("../pages/auth/RegisterOtpPage"));
const VerifyRegistrationPage = lazy(
  () => import("../pages/auth/VerifyRegistrationPage"),
);
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));

const FAQPage = lazy(() => import("../pages/faq/FAQPage"));
const SupportHelpCenter = lazy(
  () => import("../pages/contact/SupportHelpCenter"),
);
const CmsPage = lazy(() => import("../pages/cms/CmsPage"));
const BrandOutletPage = lazy(() => import("../pages/brand/BrandOutletPage"));

const HomePage = lazyNamed(
  () => import("../pages/customer/HomePage"),
  "HomePage",
);
const WatchlistPage = lazy(() => import("../pages/watchList/WatchListPage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const ProductsPage = lazy(() => import("../pages/products/ProductsPage"));
// const DealsPage = lazy(() => import("../pages/deals/DealsPage"));
const ProductDetailPage = lazy(
  () => import("../pages/products/ProductDetailPage"),
);
const ReviewDetailsPage = lazy(
  () => import("../pages/reviewAndRating/ReviewDetailsPage"),
);
const NewArrivalsPage = lazyNamed(
  () => import("../pages/discovery/DiscoveryPages"),
  "NewArrivalsPage",
);
const RecentlyUploadedPage = lazyNamed(
  () => import("../pages/discovery/DiscoveryPages"),
  "RecentlyUploadedPage",
);
const RelatedProductsPage = lazyNamed(
  () => import("../pages/discovery/DiscoveryPages"),
  "RelatedProductsPage",
);
const TrendingNowPage = lazyNamed(
  () => import("../pages/discovery/DiscoveryPages"),
  "TrendingNowPage",
);
const RecentlyViewedPage = lazyNamed(
  () => import("../pages/discovery/DiscoveryPages"),
  "RecentlyViewedPage",
);
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const BrandPage = lazy(() => import("../pages/brand/BrandPage"));
const CategoryPage = lazy(() => import("../pages/category/CategoryPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const AccountPage = lazy(() => import("../pages/account/AccountPage"));
const CartPage = lazy(() => import("../pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("../pages/checkout/CheckoutPage"));
const PaymentResultPage = lazyNamed(
  () => import("../pages/checkout/PaymentResultPage"),
  "PaymentResultPage",
);
const OrdersPage = lazy(() => import("../pages/orders/OrdersPage"));
const ReturnsRefundsPage = lazy(
  () => import("../pages/returnRefund/ReturnsRefunds.jsx"),
);
const WalletPage = lazyNamed(
  () => import("../pages/wallet/WalletPage"),
  "WalletPage",
);
const PaymentsPage = lazyNamed(
  () => import("../pages/payments/PaymentsPage"),
  "PaymentsPage",
);
const SubscriptionPage = lazyNamed(
  () => import("../pages/subscription/SubscriptionPage"),
  "SubscriptionPage",
);

const WarrantyPage = lazyNamed(
  () => import("../pages/warranty/WarrantyPage"),
  "WarrantyPage",
);
const NotificationsPage = lazyNamed(
  () => import("../pages/notifications/NotificationsPage"),
  "NotificationsPage",
);
const PreferencesPage = lazyNamed(
  () => import("../pages/preferences/PreferencesPage"),
  "PreferencesPage",
);

function PageNavigationLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white">
      <Loader size="xl" />
    </div>
  );
}

function RouteFallback() {
  return (
    <main className="flex min-h-[100vh] items-center justify-center bg-[var(--customer-cream)]">
      <div className="flex items-center justify-center">
        <Loader size="xl" />
      </div>
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* ── Auth routes (guest only) ───────────────────────────────── */}
          <Route element={<GuestRoute />}>
            <Route path={AUTH_ROUTES.login} element={<LoginPage />} />
            <Route
              path={AUTH_ROUTES.register}
              element={<BuyerRegisterPage />}
            />
            <Route
              path={AUTH_ROUTES.registerOtp}
              element={<RegisterOtpPage />}
            />
            <Route
              path={AUTH_ROUTES.verifyRegistration}
              element={<VerifyRegistrationPage />}
            />

            <Route
              path={AUTH_ROUTES.forgotPassword}
              element={<ForgotPasswordPage />}
            />
            <Route
              path={AUTH_ROUTES.resetPassword}
              element={<ResetPasswordPage />}
            />
          </Route>
          <Route path="/contact-us" element={<ContactUs />} />

          <Route path="/faq" element={<FAQPage />} />

          {/* Not working */}
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/support" element={<SupportHelpCenter />} />

          {/* <Route path="/deals" element={<DealsPage />} /> */}
          <Route path="/brand-outlet" element={<BrandOutletPage />} />
          <Route
            path="/who-we-are"
            element={<CmsPage slugOverride="who-we-are" />}
          />

          <Route path="/mobile-app" element={<DownloadApp />} />

          <Route
            path="/shipping-policy"
            element={<PolicyPage slugOverride="shipping-delivery-policy" />}
          />

          <Route
            path="/refund-policy"
            element={<PolicyPage slugOverride="return-refund-policy" />}
          />
          <Route
            path="/terms-of-use"
            element={<PolicyPage slugOverride="terms-of-use" />}
          />

          <Route path="/become-a-seller" element={<BecomeASeller />} />

          <Route path="/seller-policies" element={<SellerPolicy />} />

          {/* ── Public buyer routes ────────────────────────────────────── */}
          <Route element={<BuyerOnlyRoute />}>
            <Route index element={<HomePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
            <Route
              path="/recently-uploaded"
              element={<RecentlyUploadedPage />}
            />
            <Route path="/related-products" element={<RelatedProductsPage />} />
            <Route path="/trending-now" element={<TrendingNowPage />} />
            <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
            <Route
              path="/products/:productId"
              element={<ProductDetailPage />}
            />
            <Route
              path="/products/:productId/reviews"
              element={<ReviewDetailsPage />}
            />
            <Route path="/about-us" element={<AboutPage />} />

            <Route path="/categories/brand" element={<BrandOutletPage />} />
            <Route path="/categories" element={<CategoryListingPage />} />
            <Route
              path="/categories/brand/:brandSlug"
              element={<BrandPage />}
            />
            <Route
              path="/categories/brands/:brandSlug"
              element={<BrandPage />}
            />
            <Route path="/categories/:categoryKey" element={<CategoryPage />} />
            <Route path="/brands/:brandSlug" element={<BrandPage />} />
            <Route path="/cms/:slug" element={<CmsPage />} />

            <Route
              path="/profile"
              element={<Navigate to="/account/profile" replace />}
            />
            <Route
              path="/settings"
              element={<Navigate to="/notification-preferences" replace />}
            />
            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
          {/* ── Protected buyer routes (must be logged in) ────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<BuyerOnlyRoute />}>
              {/* Account */}
              <Route
                path="/account"
                element={<Navigate to="/account/profile" replace />}
              />
              <Route
                path="/account/profile"
                element={<AccountPage tab="profile" />}
              />
              <Route
                path="/account/addresses"
                element={<AccountPage tab="addresses" />}
              />
              <Route
                path="/account/security"
                element={<AccountPage tab="security" />}
              />
              <Route path="/account/kyc" element={<AccountPage tab="kyc" />} />

              {/* Payment results */}
              <Route path="/payment/success" element={<PaymentResultPage />} />
              <Route
                path="/payment/failed"
                element={<PaymentResultPage failed />}
              />

              {/* Orders */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId" element={<OrdersPage detail />} />
              <Route
                path="/orders/:orderId/track"
                element={<OrdersPage detail track />}
              />

              {/* Returns */}
              <Route path="/returns" element={<ReturnsPage />} />
              <Route
                path="/returns/request/:orderId"
                element={<ReturnsPage request />}
              />
              {/* Returns & Refunds */}
              <Route path="/returns-refunds" element={<ReturnsRefundsPage />} />

              {/* Financial */}
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/subscriptions" element={<SubscriptionPage />} />

              {/* Warranty */}
              <Route path="/warranty" element={<WarrantyPage />} />
              <Route
                path="/warranty/:warrantyId"
                element={<WarrantyPage detail />}
              />

              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route
                path="/notification-preferences"
                element={<PreferencesPage />}
              />
            </Route>

            {/* ── Seller-only routes ─────────────────────────────────── */}
          </Route>
          {/* ── 404 catch-all ─────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
