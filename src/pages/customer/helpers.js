import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useFetch(thunk, arg, selector) {
  const dispatch = useDispatch();
  const state = useSelector(selector);
  useEffect(() => {
    dispatch(thunk(arg));
  }, [dispatch, thunk, JSON.stringify(arg)]);
  return state;
}

export function itemsFrom(state) {
  if (Array.isArray(state.current)) return state.current;
  if (Array.isArray(state.current?.items)) return state.current.items;
  if (Array.isArray(state.current?.orders)) return state.current.orders;
  return state.list || [];
}

export function addProductToCartPayload(cart, product, quantity = 1) {
  const id = product?.id || product?._id || product?.productId;
  const existing = cart?.items || [];
  const items = existing.some((item) => item.productId === id)
    ? existing.map((item) =>
        item.productId === id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    : [...existing, { productId: id, quantity, price: product.price }];
  return { items, wishlist: cart?.wishlist || [] };
}

export function wishlistPayload(cart, product, remove = false) {
  const id = product?.id || product?._id || product?.productId || product;
  const current = cart?.wishlist || [];
  return {
    items: cart?.items || [],
    wishlist: remove
      ? current.filter((item) => item !== id)
      : Array.from(new Set([...current, id])),
  };
}
