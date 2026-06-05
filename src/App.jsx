import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthModalProvider } from "./context/AuthModalContext";
import AppLayout from "./layouts/AppLayout";
import {
  AdminOnlyRoute,
  BuyerOnlyRoute,
  GuestRoute,
  ProtectedRoute,
  SellerOnlyRoute,
} from "./routing/RouteGuards";
import { checkAuthStatus, logout } from "./features/auth/authSlice";
import { fetchCart } from "./features/cart/cartSlice";
import { AUTH_ROUTES } from "./features/auth/authRoutes";
import { tokenStorage } from "./api/tokenStorage";
import { fetchRecommendations } from "./features/recommendation/recommendationSlice";
import { fetchLoyaltyBenefits } from "./features/loyalty/loyaltySlice";
import ScrollToTop from "./components/common/ScrollToTop";
import CategoryListingPage from "./pages/category/CategoryListingPage";


const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const BuyerRegisterPage = lazy(() => import("./features/auth/BuyerRegisterPage"));
const RegisterOtpPage = lazy(() => import("./pages/auth/RegisterOtpPage"));
const VerifyRegistrationPage = lazy(
  () => import("./pages/auth/VerifyRegistrationPage"),
);
const VerifyOtpPage = lazy(() => import("./pages/auth/VerifyOtpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

const FAQPage = lazy(() => import("./pages/faq/FAQPage"));
const SupportHelpCenter = lazy(() => import("./pages/contact/SupportHelpCenter"));
const ContactUs = lazy(() => import("./pages/contact/ContactUs"));
const CmsPage = lazy(() => import("./pages/cms/CmsPage"));
const BrandOutletPage = lazy(() => import("./pages/brand/BrandOutletPage"));
const WhyChooseUsPage = lazyNamed(
  () => import("./pages/StaticPages"),
  "WhyChooseUsPage",
);
const OurCommitmentPage = lazyNamed(
  () => import("./pages/StaticPages"),
  "OurCommitmentPage",
);
const FeaturesPage = lazyNamed(() => import("./pages/StaticPages"), "FeaturesPage");
const PolicyPage = lazy(() => import("./pages/policiesPage/PoliciesPages"));

const HomePage = lazyNamed(() => import("./pages/customer/HomePage"), "HomePage");
const WatchlistPage = lazy(() => import("./pages/customer/WatchlistPage"));
const SearchPage = lazy(() => import("./pages/search/SearchPage"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/products/ProductDetailPage"));
const NewArrivalsPage = lazyNamed(
  () => import("./pages/discovery/DiscoveryPages"),
  "NewArrivalsPage",
);
const RecentlyUploadedPage = lazyNamed(
  () => import("./pages/discovery/DiscoveryPages"),
  "RecentlyUploadedPage",
);
const RelatedProductsPage = lazyNamed(
  () => import("./pages/discovery/DiscoveryPages"),
  "RelatedProductsPage",
);
const TrendingNowPage = lazyNamed(
  () => import("./pages/discovery/DiscoveryPages"),
  "TrendingNowPage",
);
const RecentlyViewedPage = lazyNamed(
  () => import("./pages/discovery/DiscoveryPages"),
  "RecentlyViewedPage",
);
const AboutPage = lazy(() => import("./pages/about/AboutPage"));
const BrandListingPage = lazy(() => import("./pages/brand/BrandListingPage"));
const BrandPage = lazy(() => import("./pages/brand/BrandPage"));
const CategoryPage = lazy(() => import("./pages/category/CategoryPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const BackendGapNotes = lazyNamed(
  () => import("./pages/CustomerPages"),
  "BackendGapNotes",
);

const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const PaymentResultPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "PaymentResultPage",
);
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const ReturnsPage = lazy(() => import("./pages/returns/ReturnsPage"));
const WalletPage = lazyNamed(() => import("./pages/CustomerPages"), "WalletPage");
const PaymentsPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "PaymentsPage",
);
const SubscriptionPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "SubscriptionPage",
);
const LoyaltyPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "LoyaltyPage",
);
const SimpleApiPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "SimpleApiPage",
);
const WarrantyPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "WarrantyPage",
);
const NotificationsPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "NotificationsPage",
);
const PreferencesPage = lazyNamed(
  () => import("./pages/CustomerPages"),
  "PreferencesPage",
);

const SellerStatusPage = lazyNamed(
  () => import("./pages/SellerPages"),
  "SellerStatusPage",
);
const SellerTrackingPage = lazyNamed(
  () => import("./pages/SellerPages"),
  "SellerTrackingPage",
);
const SellerTrackingDetailPage = lazyNamed(
  () => import("./pages/SellerPages"),
  "SellerTrackingDetailPage",
);
const AdminProductManagementPage = lazy(
  () => import("./pages/admin/AdminProductManagementPage"),
);
const AdminCatalogManagementPage = lazy(
  () => import("./pages/admin/AdminCatalogManagementPage"),
);
const AdminBrandManagementPage = lazy(
  () => import("./pages/admin/AdminBrandManagementPage"),
);
const AdminRbacManagementPage = lazy(
  () => import("./pages/admin/AdminRbacManagementPage"),
);

function RouteFallback() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[var(--customer-cream)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--customer-border)] border-t-[var(--customer-gold)]" />
        <p className="text-sm text-[var(--customer-muted)]">Loading page…</p>
      </div>
    </main>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.current);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const handler = () => dispatch(logout());
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [dispatch]);

  useEffect(() => {
    const hasStoredSession =
      tokenStorage.getAccessToken() || tokenStorage.getRefreshToken();
    if (!hasStoredSession || currentUser) {
      setSessionReady(true);
      return;
    }

    let isDone = false;
    const timeoutId = window.setTimeout(() => {
      if (isDone) return;
      isDone = true;
      dispatch(logout());
      setSessionReady(true);
    }, 8000);

    dispatch(checkAuthStatus())
      .unwrap()
      .catch(() => dispatch(logout()))
      .finally(() => {
        if (isDone) return;
        isDone = true;
        window.clearTimeout(timeoutId);
        setSessionReady(true);
      });

    return () => {
      isDone = true;
      window.clearTimeout(timeoutId);
    };
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (!currentUser) return;
    dispatch(fetchCart()).catch(() => {});
  }, [currentUser, dispatch]);

  if (!sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--customer-cream)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--customer-border)] border-t-[var(--customer-gold)]" />
          <p className=" text-sm text-[var(--customer-muted)]">
            Loading your session…
          </p>
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <AuthModalProvider>
        <ScrollToTop />
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
              <Route path={AUTH_ROUTES.verifyOtp} element={<VerifyOtpPage />} />
              <Route
                path={AUTH_ROUTES.forgotPassword}
                element={<ForgotPasswordPage />}
              />
              <Route
                path={AUTH_ROUTES.resetPassword}
                element={<ResetPasswordPage />}
              />
            </Route>

            {/* ── Static / info pages (public) ──────────────────────────── */}
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/support" element={<SupportHelpCenter />} />
            <Route path="/help-contact" element={<ContactUs />} />
            <Route path="/deals" element={<CmsPage slugOverride="deals" />} />
            <Route path="/brand-outlet" element={<BrandOutletPage />} />

            <Route
              path="/who-we-are"
              element={<CmsPage slugOverride="who-we-are" />}
            />
            {/* <Route
            path="/about-us"
            element={<CmsPage slugOverride="about-us" />}
          /> */}
            <Route
              path="/mobile-app"
              element={<CmsPage slugOverride="mobile-app" />}
            />
            <Route
              path="/seller-policies"
              element={<CmsPage slugOverride="seller-policies" />}
            />
            <Route
              path="/growth-support"
              element={<CmsPage slugOverride="growth-support" />}
            />
            <Route
              path="/advertise"
              element={<CmsPage slugOverride="advertise" />}
            />
            <Route path="/blog" element={<CmsPage slugOverride="blog" />} />
            <Route
              path="/updates"
              element={<CmsPage slugOverride="updates" />}
            />
            <Route
              path="/announcements"
              element={<CmsPage slugOverride="announcements" />}
            />
            <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
            <Route path="/our-commitment" element={<OurCommitmentPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            {/* <Route path="/terms-of-use" element={<CmsPage slugOverride="terms-of-use" fallbackData={termsOfUseData} />} />
          <Route path="/terms-and-conditions" element={<CmsPage slugOverride="terms-and-conditions" fallbackData={termsOfUseData} />} />
          <Route path="/shipping-policy" element={<CmsPage slugOverride="shipping-policy" fallbackData={shippingPolicyData} />} />
          <Route path="/refund-policy" element={<CmsPage slugOverride="refund-policy" fallbackData={refundPolicyData} />} />
          <Route path="/return-refund-policy" element={<CmsPage slugOverride="return-refund-policy" fallbackData={refundPolicyData} />} /> */}
            {/* <Route path="/terms-of-use" element={<CmsPage slugOverride="terms-of-use" />} />
          <Route path="/shipping-policy" element={<CmsPage slugOverride="shipping-policy" />} />
          <Route path="/refund-policy" element={<CmsPage slugOverride="refund-policy" />} /> */}
            <Route path="/terms-of-use" element={<PolicyPage />} />
            <Route path="/shipping-policy" element={<PolicyPage />} />
            <Route path="/refund-policy" element={<PolicyPage />} />

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
              <Route
                path="/related-products"
                element={<RelatedProductsPage />}
              />
              <Route path="/trending-now" element={<TrendingNowPage />} />
              <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
              <Route
                path="/products/:productId"
                element={<ProductDetailPage />}
              />
              <Route path="/about-us" element={<AboutPage />} />

              <Route path="/categories/brand" element={<BrandListingPage />} />
              <Route path="/categories" element={<CategoryListingPage />} />
              <Route
                path="/categories/brand/:brandSlug"
                element={<BrandPage />}
              />
              <Route
                path="/categories/brands/:brandSlug"
                element={<BrandPage />}
              />
              <Route
                path="/categories/:categoryKey"
                element={<CategoryPage />}
              />
              <Route path="/brands" element={<BrandListingPage />} />
              <Route path="/brands/:brandSlug" element={<BrandPage />} />
              <Route path="/cms/:slug" element={<CmsPage />} />
              <Route path="/backend-gaps" element={<BackendGapNotes />} />
              <Route
                path="/profile"
                element={<Navigate to="/account/profile" replace />}
              />
              <Route
                path="/settings"
                element={<Navigate to="/notification-preferences" replace />}
              />
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
                <Route
                  path="/account/kyc"
                  element={<AccountPage tab="kyc" />}
                />

                {/* Cart & Checkout */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/payment/success"
                  element={<PaymentResultPage />}
                />
                <Route
                  path="/payment/failed"
                  element={<PaymentResultPage failed />}
                />

                {/* Orders */}
                <Route path="/orders" element={<OrdersPage />} />
                <Route
                  path="/orders/:orderId"
                  element={<OrdersPage detail />}
                />
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

                {/* Financial */}
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/subscriptions" element={<SubscriptionPage />} />

                {/* Loyalty & rewards */}
                <Route path="/loyalty" element={<LoyaltyPage />} />
                <Route
                  path="/loyalty/benefits"
                  element={
                    <SimpleApiPage
                      title="Loyalty benefits"
                      selector={(s) => s.loyalty}
                      thunk={fetchLoyaltyBenefits}
                    />
                  }
                />

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

                {/* Recommendations */}
                <Route
                  path="/recommendations"
                  element={
                    <SimpleApiPage
                      title="Recommendations"
                      selector={(s) => s.recommendation}
                      thunk={fetchRecommendations}
                    />
                  }
                />
              </Route>

              {/* ── Seller-only routes ─────────────────────────────────── */}
              <Route element={<SellerOnlyRoute />}>
                <Route path="/seller/status" element={<SellerStatusPage />} />
                <Route
                  path="/seller/tracking"
                  element={<SellerTrackingPage />}
                />
                <Route
                  path="/seller/tracking/:orderId"
                  element={<SellerTrackingDetailPage />}
                />
              </Route>

              <Route element={<AdminOnlyRoute />}>
                <Route
                  path="/admin/products"
                  element={<AdminProductManagementPage />}
                />
                <Route
                  path="/admin/catalog"
                  element={<AdminCatalogManagementPage />}
                />
                <Route
                  path="/admin/brands"
                  element={<AdminBrandManagementPage />}
                />
                <Route
                  path="/admin/rbac"
                  element={<AdminRbacManagementPage />}
                />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthModalProvider>
    </BrowserRouter>
  );
}
