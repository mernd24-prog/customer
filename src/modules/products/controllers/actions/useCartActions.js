import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setGuestCart, updateCart } from "../../../../modules/cart/slices/cartSlice";
import { openAddedToCartModal } from "../../../../modules/cart/slices/cartUiSlice";
import { addProductToCartPayload, writeGuestCart } from "../../../../utils/ecommerce";
import { useToastThunk } from "../../../../hooks/useToastThunk";
import { useCheckServiceability } from "./useCheckServiceability";
import { store } from "../../../../app/store";

export function useCartActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const user = useSelector((state) => state.auth.current);
  const cart = useSelector((state) => state.cart.current);
  const checkSavedAddressServiceability = useCheckServiceability();

  return useCallback(
    async (product, quantity = 1) => {
      if (!(await checkSavedAddressServiceability(product))) return null;
      // Actions can be clicked before React has rendered the latest cart
      // response. Build the payload from Redux's current value to avoid
      // replacing items added by a previous action.
      const currentCart = store.getState().cart.current || cart || {};
      if (!user) {
        const nextCart = addProductToCartPayload(currentCart, product, quantity);
        const writtenCart = writeGuestCart(nextCart);
        dispatch(setGuestCart(writtenCart));
        dispatch(openAddedToCartModal({ product }));
        return writtenCart;
      }
      const result = await run(
        dispatch,
        updateCart(addProductToCartPayload(currentCart, product, quantity)),
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
}
