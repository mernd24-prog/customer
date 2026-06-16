import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateCart } from "../features/cart/cartSlice";
import { openAddedToCartModal } from "../features/cart/cartUiSlice";
import {
  addProductToCartPayload,
  getProductId,
  wishlistPayload,
} from "../utils/ecommerce";
import { useToastThunk } from "./useToastThunk";
import { useAuthModal } from "../context/AuthModalContext";

export function useProductActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { openAuthModal } = useAuthModal();

  const user = useSelector((state) => state.auth.current);
  const cart = useSelector((state) => state.cart.current);
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const wishlistIds = useMemo(
    () => (Array.isArray(wishlist) ? wishlist.map((item) => getProductId(item)) : []),
    [wishlist],
  );

  const isWishlisted = useCallback(
    (product) => wishlistIds.includes(getProductId(product)),
    [wishlistIds],
  );

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!user) {
        openAuthModal();
        return;
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
    [cart, dispatch, run, user, openAuthModal],
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!user) {
        openAuthModal();
        return;
      }
      const added = isWishlisted(product);
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
    [cart, dispatch, isWishlisted, run, user, openAuthModal],
  );

  const removeFromWishlist = useCallback(
    (product) => {
      if (!user) {
        openAuthModal();
        return;
      }
      return run(
        dispatch,
        updateCart(wishlistPayload(cart, product, true)),
        {
          title: "Removed from wishlist",
          message: "The item has been removed from your wishlist.",
          tone: "remove",
        },
      );
    },
    [cart, dispatch, run, user, openAuthModal],
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
