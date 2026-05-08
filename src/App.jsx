import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppLayout from "./layouts/AppLayout";
import { BuyerOnlyRoute, ProtectedRoute, SellerOnlyRoute } from "./routing/RouteGuards";
import { checkAuthStatus, logout } from "./features/auth/authSlice";
import { AUTH_ROUTES } from "./features/auth/authRoutes";
import { tokenStorage } from "./api/tokenStorage";
import {
  AccountPage,
  AuthFormPage,
  BackendGapNotes,
  CartPage,
  CategoryPage,
  CheckoutPage,
  CmsPage,
  HomePage,
  LoyaltyPage,
  NotificationsPage,
  OrdersPage,
  PaymentResultPage,
  PaymentsPage,
  PreferencesPage,
  ProductDetailPage,
  ProductsPage,
  ReturnsPage,
  SimpleApiPage,
  SubscriptionPage,
  WalletPage,
  WarrantyPage
} from "./pages/CustomerPages";
import { BuyerRegisterPage } from "./features/auth";
import { SellerStatusPage, SellerTrackingDetailPage, SellerTrackingPage } from "./pages/SellerPages";
import {
  FaqPage,
  SupportCenterPage,
  WhyChooseUsPage,
  OurCommitmentPage,
  FeaturesPage,
} from "./pages/StaticPages";
import { fetchRecommendations } from "./features/recommendation/recommendationSlice";
import { fetchLoyaltyBenefits } from "./features/loyalty/loyaltySlice";




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
    const hasStoredSession = tokenStorage.getAccessToken() || tokenStorage.getRefreshToken();
    if (!hasStoredSession || currentUser) {
      setSessionReady(true);
      return;
    }

    dispatch(checkAuthStatus())
      .unwrap()
      .catch(() => dispatch(logout()))
      .finally(() => setSessionReady(true));
  }, [currentUser, dispatch]);

  if (!sessionReady) {
    return (

      <main>

        <div className="state-box">
          <strong>Loading your session...</strong>
          <p>Please wait while Sam Global gets your account ready.</p>
        </div>
        
      </main>
    );
  }

  return (
    <BrowserRouter>

      <Routes>
        <Route element={<AppLayout />}>
          <Route path={AUTH_ROUTES.login} element={<AuthFormPage mode="login" />} />
          <Route path={AUTH_ROUTES.register} element={<BuyerRegisterPage />} />
          <Route path={AUTH_ROUTES.registerOtp} element={<AuthFormPage mode="register-otp" />} />
          <Route path={AUTH_ROUTES.verifyRegistration} element={<AuthFormPage mode="verify-registration" />} />
          <Route path={AUTH_ROUTES.verifyOtp} element={<AuthFormPage mode="verify-otp" />} />
          <Route path={AUTH_ROUTES.forgotPassword} element={<AuthFormPage mode="forgot" />} />
          <Route path={AUTH_ROUTES.resetPassword} element={<AuthFormPage mode="reset" />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/support" element={<SupportCenterPage />} />
          <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
          <Route path="/our-commitment" element={<OurCommitmentPage />} />
          <Route path="/features" element={<FeaturesPage />} />

          <Route element={<BuyerOnlyRoute />}>
            <Route index element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/search" element={<ProductsPage search />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/categories/:categoryKey" element={<CategoryPage />} />
            <Route path="/cms/:slug" element={<CmsPage />} />
            <Route path="/backend-gaps" element={<BackendGapNotes />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<BuyerOnlyRoute />}>
              <Route path="/account" element={<Navigate to="/account/profile" replace />} />
              <Route path="/account/profile" element={<AccountPage tab="profile" />} />
              <Route path="/account/addresses" element={<AccountPage tab="addresses" />} />
              <Route path="/account/security" element={<AccountPage tab="security" />} />
              <Route path="/account/kyc" element={<AccountPage tab="kyc" />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment/success" element={<PaymentResultPage />} />
              <Route path="/payment/failed" element={<PaymentResultPage failed />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId" element={<OrdersPage detail />} />
              <Route path="/orders/:orderId/track" element={<OrdersPage detail track />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/returns/request/:orderId" element={<ReturnsPage request />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/subscriptions" element={<SubscriptionPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
              <Route path="/warranty" element={<WarrantyPage />} />
              <Route path="/warranty/:warrantyId" element={<WarrantyPage detail />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notification-preferences" element={<PreferencesPage />} />
              <Route path="/recommendations" element={<SimpleApiPage title="Recommendations" selector={(s) => s.recommendation} thunk={fetchRecommendations} />} />
              <Route path="/loyalty/benefits" element={<SimpleApiPage title="Loyalty benefits" selector={(s) => s.loyalty} thunk={fetchLoyaltyBenefits} />} />
            </Route>
            <Route element={<SellerOnlyRoute />}>
              <Route path="/seller/status" element={<SellerStatusPage />} />
              <Route path="/seller/tracking" element={<SellerTrackingPage />} />
              <Route path="/seller/tracking/:orderId" element={<SellerTrackingDetailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
