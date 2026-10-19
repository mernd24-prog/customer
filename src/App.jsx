import AppRoutes from "./routing/AppRoutes";
import {
  BrowserRouter,
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthModalProvider } from "./modules/auth/context/AuthModalContext";
import { checkAuthStatus, logout } from "./modules/auth/slices/authSlice";
import { fetchCart, setGuestCart } from "./modules/cart/slices/cartSlice";
import { readGuestCart } from "./utils/ecommerce/cart";
import { fetchCmsPages } from "./features/cms/cmsSlice";
import {
  fetchBrands,
  fetchCategories,
  setGlobalBrands,
  setGlobalCategories,
} from "./features/catalog/catalogSlice";
import { getCategoryListFromResponse } from "./utils/pages/categoryUtils";
import { tokenStorage } from "./api/tokenStorage";
import { disconnectRealtime, reconnectRealtime } from "./api/realtime";

import ScrollToTop from "./components/ui/ScrollToTop";
import AiSupportChatWidget from "./modules/support/components/AiSupportChatWidget";
import { RaiseTicketModal } from "./modules/support/components/RaiseTicketModal";
import { TicketSuccessModal } from "./modules/support/components/TicketSuccessModal";
import ServiceUnavailableDialog from "./components/ui/ServiceUnavailableDialog";
import { getServiceFailureKind, isServiceUnavailable } from "./api/client";

const CART_STORAGE_KEYS = [
  "sam_global_saved_for_later_items", // localStorage
];
const CART_SESSION_KEYS = [
  "sam_global_selected_checkout_item_ids", // sessionStorage
  "sam_global_checkout_cart_item_ids", // sessionStorage
  "sam_global_buy_now_items", // sessionStorage
];

const getBrandList = (result) => {
  const data = result?.data || result;
  if (Array.isArray(data)) return data;
  return data?.items || data?.brands || data?.list || [];
};

function clearCartStorage() {
  CART_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  CART_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
}

export default function  App() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.current);

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
    if (!hasStoredSession || currentUser) return;

    dispatch(checkAuthStatus())
      .unwrap()
      .catch((error) => {
        if (getServiceFailureKind(error) || isServiceUnavailable()) return;
        clearCartStorage();
        dispatch(logout());
      })
      .catch(() => {});
  }, [currentUser, dispatch]);

  useEffect(() => {
    dispatch(fetchCmsPages({ limit: 100 })).catch(() => {});
    dispatch(fetchCategories({ navigation: true }))
      .unwrap()
      .then((result) => {
        dispatch(setGlobalCategories(getCategoryListFromResponse(result?.data || result)));
      })
      .catch(() => {});
    dispatch(fetchBrands({ limit: 100, active: true, hasProducts: true }))
      .unwrap()
      .then((result) => {
        dispatch(setGlobalBrands(getBrandList(result)));
      })
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      reconnectRealtime();
      dispatch(fetchCart()).catch(() => {});
    } else {
      disconnectRealtime();
      const guestCart = readGuestCart();
      dispatch(setGuestCart(guestCart));
    }
  }, [currentUser, dispatch]);

  return (
    <BrowserRouter>
      <AuthModalProvider>
        <ScrollToTop />
        <AppRoutes />
        <AiSupportChatWidget />
        <RaiseTicketModal />
        <TicketSuccessModal />
        <ServiceUnavailableDialog />
      </AuthModalProvider>
    </BrowserRouter>
  );
}
