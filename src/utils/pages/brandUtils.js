import { getImageUrlFromValue } from "../../utils/ecommerce";

export function listFromPayload(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.brands)) return data.brands;
  if (Array.isArray(data?.results)) return data.results;
  if (data?.data) return listFromPayload(data.data);
  return [];
}

export function getBrandName(brand) {
  if (!brand) return "";
  return typeof brand === "string"
    ? brand
    : brand.name || brand.brandName || brand.title || brand.code || "";
}

export function slugifyBrand(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBrandRouteKey(brand) {
  if (!brand) return "";
  if (typeof brand === "string") return slugifyBrand(brand);
  return brand.slug || brand.code || slugifyBrand(getBrandName(brand));
}

export function getBrandLogo(brand) {
  if (!brand || typeof brand === "string") return "";
  return (
    getImageUrlFromValue(brand.logo) ||
    getImageUrlFromValue(brand.logoUrl) ||
    ""
  );
}

export function getBrandProductCount(brand) {
  if (!brand || typeof brand === "string") return undefined;
  const count =
    brand.productCount ??
    brand.count ??
    brand.productsCount ??
    brand.product_count ??
    brand.products_count ??
    brand.counts?.products ??
    brand.meta?.productCount ??
    brand.totalProducts ??
    brand.total_products;
  return count !== undefined && count !== null ? Number(count) : undefined;
}
