import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Header, CategoryBar } from "./Header";
import React, { Suspense } from "react";
const AddedToCartModal = React.lazy(
  () => import("../modules/cart/components/AddedToCartModal"),
);
const GuestOtpAuthModal = React.lazy(
  () => import("../components/ui/overlay/GuestOtpAuthModal"),
);
const ScrollTopButton = React.lazy(
  () => import("../components/ui/ScrollTopButton"),
);
import { closeAddedToCartModal } from "../modules/cart/slices/cartUiSlice";
import { footerData } from "../data/footer";
import { AUTH_ROUTES } from "../modules/auth/routes/apiRoutes";

const LazyFooter = React.lazy(() =>
  import("./Footer").then((module) => ({ default: module.Footer })),
);

import {
  normalizeCartItemId,
  normalizeCartItemIds,
  normalizeCartPayloadForWrite,
} from "../utils/ecommerce";

import {
  writeCheckoutCartItemIds,
  writeGuestCart,
  writeSelectedCheckoutItemIds,
} from "../utils/ecommerce/cart";

import {
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../constants";

const EMPTY_ITEMS = [];

const HIDE_CATEGORY_BAR_ROUTES = [
  ...Object.values(AUTH_ROUTES),
  "/checkout",
  "/categories",
];

export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showGuestOtpModal, setShowGuestOtpModal] = useState(false);

  const addedModalOpen = useSelector((state) => state.cartUi.addedModalOpen);

  const addedProduct = useSelector((state) => state.cartUi.addedProduct);

  const cart = useSelector((state) => state.cart.current || {});

  const cartItems = useSelector(
    (state) => state.cart.current?.items ?? EMPTY_ITEMS,
  );

  const currentUser = useSelector((state) => state.auth.current);

  const showCategoryBar = !HIDE_CATEGORY_BAR_ROUTES.some(
    (route) =>
      location.pathname === route ||
      (route !== "/" && location.pathname.startsWith(`${route}/`)),
  );

  const handleCloseAddedToCartModal = () => {
    dispatch(closeAddedToCartModal());
  };

  const handleAddedModalCheckout = () => {
    if (!cartItems.length) return;

    const selectedItemIds = normalizeCartItemIds(
      cartItems.map((item) => normalizeCartItemId(item)),
    );

    /*
     * Keep the guest cart saved before opening the OTP modal.
     * Closing the OTP modal will not remove these items.
     */
    if (!currentUser) {
      const guestCartPayload = normalizeCartPayloadForWrite({
        items: cartItems,
        wishlist: cart?.wishlist || [],
      });

      writeGuestCart(guestCartPayload);
    }

    writeSelectedCheckoutItemIds(selectedItemIds);
    writeCheckoutCartItemIds(selectedItemIds);

    window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);

    window.sessionStorage.setItem(
      SELECTED_CHECKOUT_STORAGE_KEY,
      JSON.stringify(selectedItemIds),
    );

    dispatch(closeAddedToCartModal());

    if (!currentUser) {
      setShowGuestOtpModal(true);
      return;
    }

    navigate("/checkout");
  };

  const handleGuestLoginSuccess = () => {
    setShowGuestOtpModal(false);
    navigate("/checkout");
  };

  return (
    <div className="customer-shell app-shell">
      <Header />

      <main
        className={`main-content customer-container pt-[var(--customer-header-height,0px)] ${
          showCategoryBar ? "mt-[46px]" : ""
        }`}
      >
        {showCategoryBar && <CategoryBar compact />}

        <Outlet />
      </main>

      <Suspense fallback={<div className="h-[400px] w-full" />}>
        <LazyFooter data={footerData} />
      </Suspense>

      <Suspense fallback={null}>
        <ScrollTopButton />

        {addedModalOpen && (
          <AddedToCartModal
            open={addedModalOpen}
            onClose={handleCloseAddedToCartModal}
            onCheckout={handleAddedModalCheckout}
            addedProduct={addedProduct}
            cartItems={cartItems}
          />
        )}

        {showGuestOtpModal && (
          <GuestOtpAuthModal
            open={showGuestOtpModal}
            onClose={() => setShowGuestOtpModal(false)}
            onSuccess={handleGuestLoginSuccess}
          />
        )}
      </Suspense>
    </div>
  );
}
