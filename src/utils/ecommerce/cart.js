import { getProductId } from "./product";

function normalizeId(value) {
  return getProductId(value);
}

function cartItemProductId(item) {
  return normalizeId(item?.productId || item?.product || item);
}

function normalizeCartItemForWrite(item) {
  const productObj = item?.productId && typeof item.productId === "object" ? item.productId : item?.product;
  const productId = cartItemProductId(item);
  return {
    ...item,
    productId,
    quantity: Number(item?.quantity) > 0 ? Number(item.quantity) : 1,
    price: item?.price ?? productObj?.price ?? item?.salePrice ?? 0,
  };
}

export function normalizeCartPayloadForWrite(cart = {}) {
  const items = (cart?.items || [])
    .map(normalizeCartItemForWrite)
    .filter((item) => Boolean(item.productId));
  const wishlist = Array.from(
    new Set((cart?.wishlist || []).map((item) => normalizeId(item)).filter(Boolean)),
  );
  return { items, wishlist };
}

export function buildCartItem(product, quantity = 1) {
  return {
    productId: normalizeId(product),
    quantity,
    price: product?.price,
  };
}

export function addProductToCartPayload(cart, product, quantity = 1) {
  const id = normalizeId(product);
  const existing = (cart?.items || []).map(normalizeCartItemForWrite);
  const items = existing.some((item) => cartItemProductId(item) === id)
    ? existing.map((item) =>
        cartItemProductId(item) === id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    : [...existing, buildCartItem(product, quantity)];

  return { items, wishlist: cart?.wishlist || [] };
}

export function wishlistPayload(cart, product, remove = false) {
  const id = normalizeId(product);
  const current = (cart?.wishlist || []).map((item) => normalizeId(item));

  return {
    items: (cart?.items || []).map(normalizeCartItemForWrite),
    wishlist: remove
      ? current.filter((item) => item !== id)
      : Array.from(new Set([...current, id])),
  };
}
