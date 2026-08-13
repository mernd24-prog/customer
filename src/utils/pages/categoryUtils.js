import { getImageUrlFromValue } from "../../utils/ecommerce";

export function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  if (data?.category && typeof data.category === "object")
    return [data.category];
  if (data?.data) return getCategoryListFromResponse(data.data);
  if (data?.categoryKey || data?.title) return [data];
  return [];
}

export function paginationFromPayload(payload, fallbackCount = 0, currentPage = 1, pageSize = 20) {
  const data = payload?.data ?? payload;
  const meta =
    payload?.meta?.pagination || payload?.meta || data?.pagination || {};
  const total = Number(
    meta.total ||
      meta.totalItems ||
      meta.count ||
      data?.total ||
      data?.count ||
      fallbackCount,
  );
  const totalPages = Number(
    meta.totalPages ||
      meta.pages ||
      data?.totalPages ||
      data?.pages ||
      Math.max(1, Math.ceil(total / pageSize)),
  );
  const page = Number(
    meta.page || meta.currentPage || data?.page || currentPage,
  );

  return {
    page,
    totalPages,
    total,
    hasMore: page < totalPages,
  };
}

export { parseMultiValue, serializeMultiValue } from "../../utils/filterUtils";

export function normalizeFacetValue(value = "") {
  return String(value).trim().toLowerCase();
}

export function getFacetOptionCount(countMap = {}, option = "") {
  const directCount = countMap[option];
  if (directCount != null) return directCount;

  const normalizedOption = normalizeFacetValue(option);
  const matchingKey = Object.keys(countMap).find(
    (key) => normalizeFacetValue(key) === normalizedOption,
  );
  return matchingKey ? countMap[matchingKey] : 0;
}

export function slugifyCategory(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategoryLabel(category = {}) {
  return (
    category.title ||
    category.name ||
    category.label ||
    category.categoryName ||
    category.categoryKey ||
    category.key ||
    ""
  );
}

export function getCategoryKey(category = {}) {
  return (
    category.categoryKey ||
    category.key ||
    category.slug ||
    slugifyCategory(getCategoryLabel(category))
  );
}

export function getCategoryImage(category = {}) {
  return (
    getImageUrlFromValue(category.iconUrl) ||
    getImageUrlFromValue(category.icon) ||
    getImageUrlFromValue(category.imageUrl) ||
    getImageUrlFromValue(category.image) ||
    getImageUrlFromValue(category.thumbnailUrl) ||
    getImageUrlFromValue(category.thumbnail) ||
    getImageUrlFromValue(category.bannerUrl) ||
    getImageUrlFromValue(category.coverImage)
  );
}

export function getCategoryCount(category = {}) {
  return (
    category.productCount ??
    category.productsCount ??
    category.totalProducts ??
    category.count
  );
}

export function getMatchingCategoryKeys(targetCats, categoryTree) {
  const keys = new Set();

  const addNodeAndChildren = (node) => {
    if (!node) return;
    keys.add(
      String(node.categoryKey || node.key)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""),
    );
    const children = [...(node.children || []), ...(node.subs || [])];
    children.forEach(addNodeAndChildren);
  };

  const findAndAdd = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      const nodeKey = String(node.categoryKey || node.key)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (
        targetCats.some(
          (tc) =>
            tc === nodeKey || nodeKey.includes(tc) || tc.includes(nodeKey),
        )
      ) {
        addNodeAndChildren(node);
      } else {
        const children = [...(node.children || []), ...(node.subs || [])];
        if (children.length > 0) {
          findAndAdd(children);
        }
      }
    }
  };

  findAndAdd(categoryTree);
  return keys;
}

export function normalizeCategory(category = {}) {
  const routeKey = getCategoryKey(category);
  const displayName = getCategoryLabel(category);
  const imageUrl = getImageUrlFromValue(category.imageUrl);
  const bannerUrl = getImageUrlFromValue(category.bannerUrl);
  const iconUrl = getImageUrlFromValue(category.iconUrl);

  return {
    id: category._id || category.id || routeKey,
    categoryKey: category.categoryKey || routeKey,
    displayName,
    imageUrl,
    bannerUrl,
    iconUrl,
    displayImage:
      imageUrl || bannerUrl || iconUrl || getCategoryImage(category),
    routeKey,
    parentKey: category.parentKey,
    level: category.level,
    active: category.active,
    sortOrder: category.sortOrder,
    productCount: getCategoryCount(category),
  };
}

export function getRootCategories(list = []) {
  const categories = getCategoryListFromResponse(list);
  const byKey = new Map();
  const sortByOrder = (a, b) =>
    Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0);

  categories.forEach((category) => {
    const normalized = normalizeCategory(category);
    if (!normalized.routeKey || !normalized.displayName) return;
    byKey.set(normalized.routeKey, normalized);
  });

  return Array.from(byKey.values())
    .filter(
      (category) =>
        category.parentKey === null ||
        category.parentKey === undefined ||
        !byKey.has(category.parentKey) ||
        Number(category.level || 0) === 0,
    )
    .sort(sortByOrder);
}

