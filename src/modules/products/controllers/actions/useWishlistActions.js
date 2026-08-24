import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../../../../features/cart/cartSlice";
import { openAddedToCartModal } from "../../../../features/cart/cartUiSlice";
import { addProductToCartPayload, wishlistItemKey, wishlistPayload } from "../../../../utils/ecommerce";
import { useToastThunk } from "../../../../hooks/useToastThunk";
import { useAuthModal } from "../../../../features/auth/AuthModalContext";
import { store } from "../../../../app/store";
import { useCheckServiceability } from "./useCheckServiceability";

export function useWishlistActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { openGuestOtpModal } = useAuthModal();
  const user = useSelector((state) => state.auth.current);
  const cart = useSelector((state) => state.cart.current);
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const checkSavedAddressServiceability = useCheckServiceability();

  const wishlistIds = useMemo(
    () => (Array.isArray(wishlist) ? wishlist.map(wishlistItemKey) : []),
    [wishlist],
  );

  const isWishlisted = useCallback(
    (product) => wishlistIds.includes(wishlistItemKey(product)),
    [wishlistIds],
  );

  const toggleWishlist = useCallback(
    (product) => {
      const added = isWishlisted(product);
      if (!user) {
        openGuestOtpModal(async () => {
          const currentCart = store.getState().cart.current;
          return run(
            dispatch,
            updateCart(wishlistPayload(currentCart, product, added, true)),
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
        updateCart(wishlistPayload(cart, product, added, true)),
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

  const moveWishlistToCart = useCallback(
    (product, quantity = 1) => {
      const move = async (currentCart) => {
        if (!(await checkSavedAddressServiceability(product))) return null;
        const withCartItem = addProductToCartPayload(currentCart, product, quantity);
        const result = await run(
          dispatch,
          updateCart(wishlistPayload(withCartItem, product, true, true)),
          {
            title: "Moved to cart",
            message: "The item was moved from your wishlist to the cart.",
            tone: "cart",
          },
        );
        dispatch(openAddedToCartModal({ product }));
        return result;
      };

      if (!user) {
        openGuestOtpModal(() => move(store.getState().cart.current || {}));
        return null;
      }
      return move(cart);
    },
    [cart, checkSavedAddressServiceability, dispatch, openGuestOtpModal, run, user],
  );

  return {
    wishlistIds,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    moveWishlistToCart,
  };
}
