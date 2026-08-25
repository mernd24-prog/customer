import { apiRequest } from "../../../api/client";
import { PRODUCT_API_ENDPOINTS } from "../routes/apiRoutes";

export const productService = {
  fetchProductById: async (productId) => {
    return await apiRequest({
      method: "get",
      url: PRODUCT_API_ENDPOINTS.detail(productId),
    });
  },

  fetchProducts: async (params) => {
    return await apiRequest({
      method: "get",
      url: PRODUCT_API_ENDPOINTS.list,
      params,
    });
  },

  fetchRelatedProducts: async (productId) => {
    return await apiRequest({
      method: "get",
      url: PRODUCT_API_ENDPOINTS.related(productId),
    });
  },

  fetchCrossSellProducts: async (productId) => {
    return await apiRequest({
      method: "get",
      url: PRODUCT_API_ENDPOINTS.crossSell(productId),
    });
  },
};
