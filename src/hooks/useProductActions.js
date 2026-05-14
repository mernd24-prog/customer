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

export function useProductActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const cart = useSelector((state) => state.cart.current);
  const wishlistIds = useMemo(
    () => (cart?.wishlist || []).map((item) => getProductId(item)),
    [cart?.wishlist],
  );

  const isWishlisted = useCallback(
    (product) => wishlistIds.includes(getProductId(product)),
    [wishlistIds],
  );

  const addToCart = useCallback(async (product, quantity = 1) => {
    const result = await run(
      dispatch,
      updateCart(addProductToCartPayload(cart, product, quantity)),
      "Added to cart",
    );
    dispatch(openAddedToCartModal({ product }));
    return result;
  }, [cart, dispatch, run]);

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
