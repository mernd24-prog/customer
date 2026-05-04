const RECENT_KEY = "sam_global_recently_viewed";
const COMPARE_KEY = "sam_global_compare";

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const write = (key, items) => localStorage.setItem(key, JSON.stringify(items.slice(0, 12)));

export function addRecentlyViewed(product) {
  if (!product) return;
  const id = product.id || product._id || product.productId;
  const current = read(RECENT_KEY).filter((item) => (item.id || item._id || item.productId) !== id);
  write(RECENT_KEY, [product, ...current]);
}

export function getRecentlyViewed() {
  return read(RECENT_KEY);
}

export function toggleCompare(product) {
  const id = product.id || product._id || product.productId;
  const current = read(COMPARE_KEY);
  const exists = current.some((item) => (item.id || item._id || item.productId) === id);
  write(COMPARE_KEY, exists ? current.filter((item) => (item.id || item._id || item.productId) !== id) : [product, ...current].slice(0, 4));
}

export function getCompareList() {
  return read(COMPARE_KEY);
}
