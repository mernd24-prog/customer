import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { normalizeApiError } from "../api/normalizeApiError";

export async function listCategories(params = {}) {
  return apiRequest({
    url: endpoints.platform.categories,
    params,
    cache: true,
    cacheTtl: 300000,
  });
}

export async function getCategory(categoryKey) {
  return apiRequest({ url: endpoints.platform.category(categoryKey) });
}

export async function getCategoryAttributes(categoryKey) {
  return apiRequest({ url: endpoints.platform.categoryAttributes(categoryKey) });
}

export function handleCategoryApiError(error) {
  return normalizeApiError(error);
}

export default {
  listCategories,
  getCategory,
  getCategoryAttributes,
  handleCategoryApiError,
};
