import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateCart } from "../features/cart/cartSlice";
import {
  addProductToCartPayload,
  getProductId,
  wishlistPayload,
} from "../utils/ecommerce";
import { useToastThunk } from "./useToastThunk";

export function useProductActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const cart = useSelector((state) => state.cart.current);
  const wishlistIds = useSelector((state) => state.cart.current?.wishlist || []);

  const isWishlisted = useCallback(
    (product) => wishlistIds.includes(getProductId(product)),
    [wishlistIds],
  );

  const addToCart = useCallback(
    (product, quantity = 1) =>
      run(
        dispatch,
        updateCart(addProductToCartPayload(cart, product, quantity)),
        "Added to cart",
      ),
    [cart, dispatch, run],
  );

  const toggleWishlist = useCallback(
    (product) => {
      const added = isWishlisted(product);

      return run(
        dispatch,
        updateCart(wishlistPayload(cart, product, added)),
        added ? "Removed from wishlist" : "Saved to wishlist",
      );
    },
    [cart, dispatch, isWishlisted, run],
  );

  const removeFromWishlist = useCallback(
    (product) =>
      run(
        dispatch,
        updateCart(wishlistPayload(cart, product, true)),
        "Removed from wishlist",
      ),
    [cart, dispatch, run],
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
