import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setGuestCart, updateCart } from "../features/cart/cartSlice";
import { checkServiceability } from "../features/delivery/deliverySlice";
import { openAddedToCartModal } from "../features/cart/cartUiSlice";
import { addProductToCartPayload, wishlistItemKey, writeGuestCart, wishlistPayload } from "../utils/ecommerce";
import { useToastThunk } from "./useToastThunk";
import { useAuthModal } from "../features/auth/AuthModalContext";
import { store } from "../app/store";
import { notify } from "../utils/notify";

export function useProductActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { openGuestOtpModal } = useAuthModal();

  const user = useSelector((state) => state.auth.current);
  const customer = useSelector((state) => state.user.current);
  const cart = useSelector((state) => state.cart.current);
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const wishlistIds = useMemo(
    () =>
      Array.isArray(wishlist) ? wishlist.map(wishlistItemKey) : [],
    [wishlist],
  );

  const isWishlisted = useCallback(
    (product) => wishlistIds.includes(wishlistItemKey(product)),
    [wishlistIds],
  );

  const checkSavedAddressServiceability = useCallback(async (product) => {
    const addresses = customer?.addresses || user?.addresses || [];
    const address = addresses.find((item) => item?.isDefault || item?.is_default) || addresses[0];
    const pincode = String(
      address?.postalCode || address?.postal_code || address?.pincode || address?.zip || "",
    ).trim();
    const productId = product?._id || product?.id || product?.productId?._id || product?.productId;
    if (!/^\d{6}$/.test(pincode) || !productId) return true;

    try {
      const payload = await dispatch(
        checkServiceability({ pincode, productId }),
      ).unwrap();
      const result = payload?.data || payload;
      if (result?.serviceable !== false) return true;
      notify.error({
        title: "Not deliverable to your address",
        message: `This product cannot be delivered to pincode ${pincode}. Choose another address or product.`,
      });
      return false;
    } catch (error) {
      notify.error({
        title: "Delivery check unavailable",
        message: typeof error === "string" ? error : "Please try adding this product again.",
      });
      return false;
    }
  }, [customer?.addresses, dispatch, user?.addresses]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!(await checkSavedAddressServiceability(product))) return null;
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
    [cart, checkSavedAddressServiceability, dispatch, run, user],
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

  const moveWishlistToCart = useCallback(
    (product, quantity = 1) => {
      const move = async (currentCart) => {
        if (!(await checkSavedAddressServiceability(product))) return null;
        const withCartItem = addProductToCartPayload(currentCart, product, quantity);
        const result = await run(
          dispatch,
          updateCart(wishlistPayload(withCartItem, product, true)),
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
    addToCart,
    cart,
    isWishlisted,
    moveWishlistToCart,
    removeFromWishlist,
    toggleWishlist,
    wishlistIds,
  };
}
