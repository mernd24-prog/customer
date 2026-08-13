import AppRoutes from "./routing/AppRoutes";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthModalProvider } from "./features/auth/AuthModalContext";
import AppLayout from "./layouts/AppLayout";
import {
  BuyerOnlyRoute,
  GuestRoute,
  ProtectedRoute,
} from "./routing/RouteGuards";
import { checkAuthStatus, logout } from "./features/auth/authSlice";
import { fetchCart, setGuestCart } from "./features/cart/cartSlice";
import { readGuestCart } from "./utils/ecommerce/cart";
import { fetchCmsPages } from "./features/cms/cmsSlice";
import { AUTH_ROUTES } from "./features/auth/authRoutes";
import { tokenStorage } from "./api/tokenStorage";
import { fetchRecommendations } from "./features/recommendation/recommendationSlice";

import ScrollToTop from "./components/ui/ScrollToTop";
import Loader from "./components/ui/Loader";

const CART_STORAGE_KEYS = [
  "sam_global_saved_for_later_items", // localStorage
];
const CART_SESSION_KEYS = [
  "sam_global_selected_checkout_item_ids", // sessionStorage
  "sam_global_checkout_cart_item_ids", // sessionStorage
  "sam_global_buy_now_items", // sessionStorage
];

function clearCartStorage() {
  CART_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  CART_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
}

export default function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.current);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const handler = () => {
      clearCartStorage();
      dispatch(logout());
    };
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
      .catch(() => {
        clearCartStorage();
        dispatch(logout());
      })
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
    dispatch(fetchCmsPages({ limit: 100 })).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart()).catch(() => {});
    } else {
      const guestCart = readGuestCart();
      dispatch(setGuestCart(guestCart));
    }
  }, [currentUser, dispatch]);

  if (!sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--customer-cream)]">
        <div className="flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <AuthModalProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthModalProvider>
    </BrowserRouter>
  );
}
