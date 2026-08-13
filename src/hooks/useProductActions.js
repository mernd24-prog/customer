import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setGuestCart, updateCart } from "../features/cart/cartSlice";
import { openAddedToCartModal } from "../features/cart/cartUiSlice";
import { addProductToCartPayload, getProductId, writeGuestCart, wishlistPayload } from "../utils/ecommerce";
import { useToastThunk } from "./useToastThunk";
import { useAuthModal } from "../features/auth/AuthModalContext";
import { store } from "../app/store";

export function useProductActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { openGuestOtpModal } = useAuthModal();

  const user = useSelector((state) => state.auth.current);
  const cart = useSelector((state) => state.cart.current);
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const wishlistIds = useMemo(
    () =>
      Array.isArray(wishlist) ? wishlist.map((item) => getProductId(item)) : [],
    [wishlist],
  );

  const isWishlisted = useCallback(
    (product) => wishlistIds.includes(getProductId(product)),
    [wishlistIds],
  );

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!user) {
        const nextCart = addProductToCartPayload(cart, product, quantity);
        const writtenCart = writeGuestCart(nextCart);
        dispatch(setGuestCart(writtenCart));
        dispatch(openAddedToCartModal({ product }));
        return writtenCart;
      }
      const result = await run(
        dispatch,
        updateCart(addProductToCartPayload(cart, product, quantity)),
        {
          title: "Added to cart",
          message: "Your item has been added to the cart successfully.",
          tone: "cart",
        },
      );
      dispatch(openAddedToCartModal({ product }));
      return result;
    },
    [cart, dispatch, run, user],
  );

  const toggleWishlist = useCallback(
    (product) => {
      const added = isWishlisted(product);
      if (!user) {
        openGuestOtpModal(async () => {
          const currentCart = store.getState().cart.current;
          return run(
            dispatch,
            updateCart(wishlistPayload(currentCart, product, added)),
            added
              ? {
                  title: "Removed from wishlist",
                  message: "The item has been removed from your wishlist.",
                  tone: "remove",
                }
              : {
                  title: "Added to wishlist",
                  message: "The item has been saved to your wishlist.",
                  tone: "wishlist",
                },
          );
        });
        return null;
      }
      return run(
        dispatch,
        updateCart(wishlistPayload(cart, product, added)),
        added
          ? {
              title: "Removed from wishlist",
              message: "The item has been removed from your wishlist.",
              tone: "remove",
            }
          : {
              title: "Added to wishlist",
              message: "The item has been saved to your wishlist.",
              tone: "wishlist",
            },
      );
    },
    [cart, dispatch, isWishlisted, openGuestOtpModal, run, user],
  );

  const removeFromWishlist = useCallback(
    (product) => {
      if (!user) {
        openGuestOtpModal(() => {
          const currentCart = store.getState().cart.current;
          run(dispatch, updateCart(wishlistPayload(currentCart, product, true)), {
            title: "Removed from wishlist",
            message: "The item has been removed from your wishlist.",
            tone: "remove",
          });
        });
        return null;
      }
      return run(dispatch, updateCart(wishlistPayload(cart, product, true)), {
        title: "Removed from wishlist",
        message: "The item has been removed from your wishlist.",
        tone: "remove",
      });
    },
    [cart, dispatch, openGuestOtpModal, run, user],
  );

  return {
    addToCart,
    cart,
    isWishlisted,
    removeFromWishlist,
    toggleWishlist,
    wishlistIds,
  };
}
