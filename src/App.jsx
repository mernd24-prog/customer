import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import RegisterOtpPage from "./pages/auth/RegisterOtpPage";
import VerifyRegistrationPage from "./pages/auth/VerifyRegistrationPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import { BuyerRegisterPage } from "./features/auth";

// Account pages
import AccountPage from "./pages/account/AccountPage";

// Feature pages
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ReturnsPage from "./pages/returns/ReturnsPage";

import {
  BackendGapNotes,
  LoyaltyPage,
  NotificationsPage,
  PaymentResultPage,
  PaymentsPage,
  PreferencesPage,
  SimpleApiPage,
  SubscriptionPage,
  WalletPage,
  WarrantyPage,
} from "./pages/CustomerPages";

import CartPage from "./pages/cart/CartPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import CategoryPage from "./pages/category/CategoryPage";
import SearchPage from "./pages/search/SearchPage";
import CmsPage from "./pages/cms/CmsPage";

import { HomePage } from "./pages/customer/HomePage";
import {
  SellerStatusPage,
  SellerTrackingDetailPage,
  SellerTrackingPage,
} from "./pages/SellerPages";
import {
  SupportCenterPage,
  WhyChooseUsPage,
  OurCommitmentPage,
  FeaturesPage,
} from "./pages/StaticPages";
import { fetchRecommendations } from "./features/recommendation/recommendationSlice";
import { fetchLoyaltyBenefits } from "./features/loyalty/loyaltySlice";
import {
  NewArrivalsPage,
  RecentlyUploadedPage,
  RelatedProductsPage,
  TrendingNowPage,
  RecentlyViewedPage,
} from "./pages/discovery/DiscoveryPages";
import ScrollToTop from "./components/common/ScrollToTop";
import WatchlistPage from "./pages/customer/WatchlistPage";
import AdminProductManagementPage from "./pages/admin/AdminProductManagementPage";
import AdminBrandManagementPage from "./pages/admin/AdminBrandManagementPage";
import AdminCatalogManagementPage from "./pages/admin/AdminCatalogManagementPage";
import AdminRbacManagementPage from "./pages/admin/AdminRbacManagementPage";
import FAQPage from "./pages/faq/FAQPage";
import AboutPage from "./pages/about/AboutPage";

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
      <main className="flex min-h-screen items-center justify-center bg-[#FAF6EE]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#e7dfd1] border-t-[#CE9F2D]" />
          <p className="font-montserrat text-sm text-[#787878]">
            Loading your session…
          </p>
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
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
          <Route path="/support" element={<SupportCenterPage />} />
          <Route path="/help-contact" element={<CmsPage slugOverride="help-contact" />} />
          <Route path="/deals" element={<CmsPage slugOverride="deals" />} />
          <Route path="/brand-outlet" element={<CmsPage slugOverride="brand-outlet" />} />
          <Route path="/gift-cards" element={<CmsPage slugOverride="gift-cards" />} />
          <Route path="/who-we-are" element={<CmsPage slugOverride="who-we-are" />} />
          {/* <Route path="/about-us" element={<CmsPage slugOverride="about-us" />} /> */}

          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/mobile-app" element={<CmsPage slugOverride="mobile-app" />} />
          <Route path="/seller-policies" element={<CmsPage slugOverride="seller-policies" />} />
          <Route path="/growth-support" element={<CmsPage slugOverride="growth-support" />} />
          <Route path="/advertise" element={<CmsPage slugOverride="advertise" />} />
          <Route path="/blog" element={<CmsPage slugOverride="blog" />} />
          <Route path="/updates" element={<CmsPage slugOverride="updates" />} />
          <Route path="/announcements" element={<CmsPage slugOverride="announcements" />} />
          <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
          <Route path="/our-commitment" element={<OurCommitmentPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          {/* <Route path="/terms-of-use" element={<CmsPage slugOverride="terms-of-use" fallbackData={termsOfUseData} />} />
          <Route path="/terms-and-conditions" element={<CmsPage slugOverride="terms-and-conditions" fallbackData={termsOfUseData} />} />
          <Route path="/shipping-policy" element={<CmsPage slugOverride="shipping-policy" fallbackData={shippingPolicyData} />} />
          <Route path="/refund-policy" element={<CmsPage slugOverride="refund-policy" fallbackData={refundPolicyData} />} />
          <Route path="/return-refund-policy" element={<CmsPage slugOverride="return-refund-policy" fallbackData={refundPolicyData} />} /> */}
          <Route path="/terms-of-use" element={<CmsPage slugOverride="terms-of-use" />} />
          <Route path="/shipping-policy" element={<CmsPage slugOverride="shipping-policy" />} />
          <Route path="/refund-policy" element={<CmsPage slugOverride="refund-policy" />} />

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
            <Route path="/categories/:categoryKey" element={<CategoryPage />} />
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
              <Route path="/account/kyc" element={<AccountPage tab="kyc" />} />

              {/* Cart & Checkout */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
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
              <Route path="/seller/tracking" element={<SellerTrackingPage />} />
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
              <Route path="/admin/rbac" element={<AdminRbacManagementPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
