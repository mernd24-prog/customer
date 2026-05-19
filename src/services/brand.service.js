import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { normalizeApiError } from "../api/normalizeApiError";

export async function listBrands(params = {}) {
  return apiRequest({
    url: endpoints.platform.brands,
    params,
    cache: true,
    cacheTtl: 300000,
  });
}

export async function getBrand(brandId) {
  return apiRequest({ url: endpoints.platform.brand(brandId) });
}

export function handleBrandApiError(error) {
  return normalizeApiError(error);
}

export default {
  listBrands,
  getBrand,
  handleBrandApiError,
};
