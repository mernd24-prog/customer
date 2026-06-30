import {
  CHECKOUT_CART_ITEM_IDS_STORAGE_KEY,
  SAVED_FOR_LATER_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../constants";
import {
  getAvailableStock,
  getImageFallbackSrc,
  getProductAvailableStock,
  getProductId,
  getProductImage,
  getProductPrice,
  getProductTitle,
  getVariantPrice,
} from "./product";

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

export function normalizeCartItemId(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const [rawProductId, ...variantParts] = value.split(":");
    const productId = normalizeId(rawProductId);
    const variantId = normalizeId(variantParts.join(":"));
    return [productId, variantId].filter(Boolean).join(":");
  }

  if (typeof value === "object") {
    const productId = normalizeId(
      value.productId ||
        value.product ||
        value._raw?.productId ||
        value.id ||
        value,
    );
    const variantId = normalizeId(
      value.variantId ||
        value.variantSku ||
        value._raw?.variantId ||
        value._raw?.variantSku ||
        "",
    );
    return [productId, variantId].filter(Boolean).join(":");
  }

  return normalizeId(value);
}

export function normalizeCartItemIds(values = []) {
  return Array.from(
    new Set(values.map((value) => normalizeCartItemId(value)).filter(Boolean)),
  );
}

function getNumericValue(...values) {
  const value = values.find(
    (entry) => entry !== undefined && entry !== null && entry !== "",
  );
  if (value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getCartItemStock(item = {}, product = {}) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const matchingVariant = variants.find(
    (variant) =>
      String(variant?._id || variant?.id || "") ===
        String(item.variantId || "") ||
      String(variant?.sku || "") === String(item.variantSku || ""),
  );

  return getNumericValue(
    getAvailableStock(item.variant),
    getAvailableStock(matchingVariant),
    getProductAvailableStock(product),
    getAvailableStock(item),
    item.availableStock,
  );
}

export function cartLineKey(item) {
  const product =
    item.productId && typeof item.productId === "object"
      ? item.productId
      : item.product;
  const productId = normalizeId(item.productId || item.product);
  const defaultVariant =
    !item.variantId && !item.variantSku && Array.isArray(product?.variants)
      ? product.variants.find((variant) => variant.isDefault) ||
        product.variants[0]
      : null;
  return normalizeCartItemId({
    productId,
    variantId:
      item.variantId || defaultVariant?._id || defaultVariant?.id || "",
    variantSku: item.variantSku || defaultVariant?.sku || "",
  });
}

export function mergeDisplayCartItems(items = []) {
  const byKey = new Map();

  items.forEach((item) => {
    const key = cartLineKey(item);
    if (!key) return;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      return;
    }

    byKey.set(key, {
      ...existing,
      ...item,
      productId:
        typeof existing.productId === "object"
          ? existing.productId
          : item.productId,
      image: existing.image || item.image,
      title: existing.title || item.title,
      quantity: Number(existing.quantity || 0) + Number(item.quantity || 0),
    });
  });

  return [...byKey.values()];
}

export function buildSavedProductView(wishlistProduct, resolvedProduct) {
  const product =
    resolvedProduct ||
    (typeof wishlistProduct === "object" ? wishlistProduct : null);
  const id = getProductId(product || wishlistProduct);
  const title = product
    ? getProductTitle(product, "Saved product")
    : "Saved product";
  const image = product ? getProductImage(product) : "";

  return {
    id,
    title,
    image: image || getImageFallbackSrc(title, "saved"),
    price: product?.price ?? product?.sellingPrice ?? product?.salePrice,
    brand:
      product?.brand?.name || product?.brand || product?.seller?.name || "",
    productForCart: product || wishlistProduct,
  };
}


export function readSavedForLaterItems() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SAVED_FOR_LATER_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedForLaterItems(items) {
  window.localStorage.setItem(
    SAVED_FOR_LATER_STORAGE_KEY,
    JSON.stringify(items),
  );
}

export function readSelectedCheckoutItemIds() {
  try {
    const storedValue = window.sessionStorage.getItem(
      SELECTED_CHECKOUT_STORAGE_KEY,
    );
    if (storedValue === null) return null;
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? normalizeCartItemIds(parsed) : null;
  } catch {
    return null;
  }
}

export function writeSelectedCheckoutItemIds(itemIds) {
  window.sessionStorage.setItem(
    SELECTED_CHECKOUT_STORAGE_KEY,
    JSON.stringify(itemIds),
  );
}

export function readCheckoutCartItemIds() {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? normalizeCartItemIds(parsed) : [];
  } catch {
    return [];
  }
}

export function writeCheckoutCartItemIds(itemIds) {
  window.sessionStorage.setItem(
    CHECKOUT_CART_ITEM_IDS_STORAGE_KEY,
    JSON.stringify(itemIds),
  );
}
