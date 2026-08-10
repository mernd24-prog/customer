import { getImageUrlFromValue } from "../../../utils/ecommerce";

export function parseMultiValue(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeMultiValue(values) {
  const uniqueValues = [
    ...new Set(
      (values || [])
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  return uniqueValues.length ? uniqueValues.join(",") : undefined;
}

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
