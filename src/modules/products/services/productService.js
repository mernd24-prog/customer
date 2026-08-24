import { apiRequest } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";

export const productService = {
  fetchProductById: async (productId) => {
    return await apiRequest({
      method: "get",
      url: endpoints.products.detail(productId),
    });
  },

  fetchProducts: async (params) => {
    return await apiRequest({
      method: "get",
      url: endpoints.products.list,
      params,
    });
  },

  fetchRelatedProducts: async (productId) => {
    return await apiRequest({
      method: "get",
      url: endpoints.products.related(productId),
    });
  },

  fetchCrossSellProducts: async (productId) => {
    return await apiRequest({
      method: "get",
      url: endpoints.products.crossSell(productId),
    });
  },
};
