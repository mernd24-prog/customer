import { getProductId } from "./product";

export function buildCartItem(product, quantity = 1) {
  return {
    productId: getProductId(product),
    quantity,
    price: product?.price,
  };
}

export function addProductToCartPayload(cart, product, quantity = 1) {
  const id = getProductId(product);
  const existing = cart?.items || [];
  const items = existing.some((item) => item.productId === id)
    ? existing.map((item) =>
        item.productId === id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    : [...existing, buildCartItem(product, quantity)];

  return { items, wishlist: cart?.wishlist || [] };
}

export function wishlistPayload(cart, product, remove = false) {
  const id = getProductId(product);
  const current = cart?.wishlist || [];

  return {
    items: cart?.items || [],
    wishlist: remove
      ? current.filter((item) => item !== id)
      : Array.from(new Set([...current, id])),
  };
}
