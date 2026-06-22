import { getProductId, getProductPrice, getVariantPrice } from "./product";

export function normalizeId(value) {
  return getProductId(value);
}

function cartItemProductId(item) {
  return normalizeId(item?.productId || item?.product || item);
}

function cartItemKey(item) {
  return [
    cartItemProductId(item),
    item?.variantId || item?.variantSku || "",
  ].join(":");
}

function getDefaultVariant(product) {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return null;
  }
  return (
    product.variants.find((variant) => variant.isDefault) || product.variants[0]
  );
}

function normalizeCartItemForWrite(item) {
  const productObj =
    item?.productId && typeof item.productId === "object"
      ? item.productId
      : item?.product;
  const defaultVariant =
    !item?.variantId && !item?.variantSku
      ? getDefaultVariant(productObj)
      : null;
  const productId = cartItemProductId(item);
  return {
    ...item,
    productId,
    variantId:
      item?.variantId || defaultVariant?._id || defaultVariant?.id || "",
    variantSku: item?.variantSku || defaultVariant?.sku || "",
    variantTitle: item?.variantTitle || defaultVariant?.title || "",
    attributes: item?.attributes || defaultVariant?.attributes || {},
    quantity: Number(item?.quantity) > 0 ? Number(item.quantity) : 1,
    price:
      getProductPrice(item) ??
      getVariantPrice(defaultVariant) ??
      getProductPrice(productObj) ??
      0,
  };
}

function mergeCartItems(items = []) {
  const byKey = new Map();

  items
    .map(normalizeCartItemForWrite)
    .filter((item) => Boolean(item.productId))
    .forEach((item) => {
      const key = cartItemKey(item);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, item);
        return;
      }

      byKey.set(key, {
        ...existing,
        ...item,
        quantity: Number(existing.quantity || 0) + Number(item.quantity || 0),
        price: item.price ?? existing.price,
      });
    });

  return [...byKey.values()].map((item) => ({
    ...item,
    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
  }));
}

export function normalizeCartPayloadForWrite(cart = {}) {
  const items = mergeCartItems(cart?.items || []);
  const wishlist = Array.from(
    new Set(
      (cart?.wishlist || []).map((item) => normalizeId(item)).filter(Boolean),
    ),
  );
  return { items, wishlist };
}

export function buildCartItem(product, quantity = 1) {
  const variant = product?.selectedVariant || getDefaultVariant(product);
  return {
    productId: normalizeId(product),
    variantId: variant?._id || variant?.id || "",
    variantSku: variant?.sku || "",
    variantTitle: variant?.title || "",
    attributes: variant?.attributes || {},
    quantity,
    price: getVariantPrice(variant) ?? getProductPrice(product),
  };
}

export function addProductToCartPayload(cart, product, quantity = 1) {
  const nextItem = buildCartItem(product, quantity);
  const key = cartItemKey(nextItem);
  const existing = mergeCartItems(cart?.items || []);

  const items = existing.some((item) => cartItemKey(item) === key)
    ? existing.map((item) =>
        cartItemKey(item) === key
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    : [nextItem, ...existing]; // Add new item at the top

  return {
    wishlist: cart?.wishlist || [],
    items,
  };
}
export function wishlistPayload(cart, product, remove = false) {
  const id = normalizeId(product);
  const current = (cart?.wishlist || []).map((item) => normalizeId(item));

  return {
    items: (cart?.items || []).map(normalizeCartItemForWrite),
    wishlist: remove
      ? current.filter((item) => item !== id)
      : [id, ...current.filter((item) => item !== id)],
  };
}
