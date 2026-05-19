import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { normalizeApiError } from "../api/normalizeApiError";

export async function listProducts(params = {}) {
  return apiRequest({ url: endpoints.products.list, params });
}

export async function searchProducts(params = {}) {
  return apiRequest({ url: endpoints.products.search, params });
}

export async function getProduct(productId) {
  return apiRequest({ url: endpoints.products.detail(productId) });
}

export function handleProductApiError(error) {
  return normalizeApiError(error);
}

export default {
  listProducts,
  searchProducts,
  getProduct,
  handleProductApiError,
};
