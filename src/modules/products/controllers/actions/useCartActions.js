import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setGuestCart, updateCart } from "../../../../features/cart/cartSlice";
import { openAddedToCartModal } from "../../../../features/cart/cartUiSlice";
import { addProductToCartPayload, writeGuestCart } from "../../../../utils/ecommerce";
import { useToastThunk } from "../../../../hooks/useToastThunk";
import { useCheckServiceability } from "./useCheckServiceability";

export function useCartActions() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const user = useSelector((state) => state.auth.current);
  const cart = useSelector((state) => state.cart.current);
  const checkSavedAddressServiceability = useCheckServiceability();

  return useCallback(
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
}
