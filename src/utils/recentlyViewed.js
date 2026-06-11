import { getCache, setCache } from "./cache";
import {
  getProductId,
  getProductImage,
  getProductPrice,
  getProductMrp,
  getProductTitle,
} from "./ecommerce";

const RECENT_KEY = "sam_global_recently_viewed";
const COMPARE_KEY = "sam_global_compare";
const STORAGE_OPTIONS = { ttl: Infinity, version: 1 };

const read = (key) => getCache(key, { ...STORAGE_OPTIONS, fallback: [] });
const write = (key, items) => setCache(key, items.slice(0, 8), STORAGE_OPTIONS);

function normalizeRecentlyViewedProduct(product) {
  return {
    id: getProductId(product),
    title: getProductTitle(product),
    image: getProductImage(product),
    price: getProductPrice(product),
    mrp: getProductMrp(product),
    category: product?.category,
    brand: product?.brand,
    currency: product?.currency,
    rating: product?.rating ?? product?.averageRating,
    ratingCount: product?.ratingCount ?? product?.reviewsCount,
  };
}

export function addRecentlyViewed(product) {
  if (!product) return;
  const normalizedProduct = normalizeRecentlyViewedProduct(product);
  const id = getProductId(normalizedProduct);
  const current = read(RECENT_KEY).filter((item) => getProductId(item) !== id);
  write(RECENT_KEY, [normalizedProduct, ...current]);
}

export function getRecentlyViewed() {
  return read(RECENT_KEY);
}

export function toggleCompare(product) {
  const id = getProductId(product);
  const current = read(COMPARE_KEY);
  const exists = current.some((item) => getProductId(item) === id);
  write(
    COMPARE_KEY,
    exists
      ? current.filter((item) => getProductId(item) !== id)
      : [product, ...current].slice(0, 4),
  );
}

export function getCompareList() {
  return read(COMPARE_KEY);
}
