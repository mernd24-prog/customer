import api from "./client";
import { endpoints } from "./endpoints";

/**
 * Fetch public deals/placements for customers
 * Shows active deals and promotional placements
 *
 * @param {Object} params - Query parameters
 * @param {string} params.placement_type - Type of placement (e.g., 'banner', 'featured', 'sponsored')
 * @param {string} params.category_id - Filter by category ID (optional)
 * @param {number} params.limit - Number of results to return (default: 20)
 * @param {number} params.offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} Response with deals array
 */
export const getPublicDeals = async (params = {}) => {
  const response = await api.get(endpoints.deals.publicPlacements, {
    params: {
      limit: params.limit || 20,
      offset: params.offset || 0,
      ...params,
    },
  });

  return response.data;
};

export const getPublicDealProducts = async (params = {}) => {
  const normalizedParams = {
    page: params.page || 1,
    limit: params.limit || 12,
    q: params.q,
    sort: params.sort,
  };
  if (params.category && !normalizedParams.category_id) {
    normalizedParams.category_id = params.category;
  }
  if (params.brand && !normalizedParams.brand_id) {
    normalizedParams.brand_id = params.brand;
  }
  if (params.minPrice && !normalizedParams.min_price) {
    normalizedParams.min_price = params.minPrice;
  }
  if (params.maxPrice && !normalizedParams.max_price) {
    normalizedParams.max_price = params.maxPrice;
  }
  if (params.rating && !normalizedParams.min_rating) {
    normalizedParams.min_rating = params.rating;
  }
  if (params.minRating && !normalizedParams.min_rating) {
    normalizedParams.min_rating = params.minRating;
  }
  if (params.inStock && !normalizedParams.in_stock) {
    normalizedParams.in_stock = params.inStock;
  }
  if (params.outOfStock && !normalizedParams.out_of_stock) {
    normalizedParams.out_of_stock = params.outOfStock;
  }
  if (params.expressDelivery && !normalizedParams.express_delivery) {
    normalizedParams.express_delivery = params.expressDelivery;
  }
  if (params.freeDelivery && !normalizedParams.free_delivery) {
    normalizedParams.free_delivery = params.freeDelivery;
  }

  const response = await api.get(endpoints.deals.publicProducts, {
    params: normalizedParams,
  });

  return response.data;
};

/**
 * Fetch all public products
 * Shows products available for customers to browse and purchase
 *
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of results per page (default: 20)
 * @param {number} params.offset - Pagination offset (default: 0)
 * @param {string} params.sort - Sort order: 'newest', 'price_asc', 'price_desc', 'rating'
 * @param {string} params.category_id - Filter by category ID (optional)
 * @param {string} params.search - Search keyword (optional)
 * @param {number} params.min_price - Minimum price filter (optional)
 * @param {number} params.max_price - Maximum price filter (optional)
 * @returns {Promise<Object>} Response with products array
 */
export const getProducts = async (params = {}) => {
  const response = await api.get(endpoints.products.list, {
    params: {
      limit: params.limit || 20,
      offset: params.offset || 0,
      ...params,
    },
  });
  return response.data;
};

/**
 * Get product details
 *
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product details
 */
export const getProductDetail = async (productId) => {
  const response = await api.get(endpoints.products.detail(productId));
  return response.data;
};

/**
 * Search products
 *
 * @param {string} searchQuery - Search query string
 * @param {Object} params - Additional search parameters
 * @param {number} params.limit - Number of results (default: 20)
 * @param {number} params.offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} Search results
 */
export const searchProducts = async (searchQuery, params = {}) => {
  const response = await api.get(endpoints.search.main, {
    params: {
      q: searchQuery,
      limit: params.limit || 20,
      offset: params.offset || 0,
      ...params,
    },
  });
  return response.data;
};

/**
 * Get related products
 *
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Related products
 */
export const getRelatedProducts = async (productId) => {
  const response = await api.get(endpoints.products.related(productId));
  return response.data;
};

/**
 * Get product reviews
 *
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of reviews
 * @param {number} params.offset - Pagination offset
 * @returns {Promise<Object>} Product reviews
 */
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(endpoints.products.reviews(productId), {
    params: {
      limit: params.limit || 10,
      offset: params.offset || 0,
      ...params,
    },
  });
  return response.data;
};
