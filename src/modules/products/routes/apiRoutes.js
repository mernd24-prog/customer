import { API_PREFIX } from "../../../api/endpoints";

export const PRODUCT_API_ENDPOINTS = {
  list: `${API_PREFIX}/products`,
  discover: `${API_PREFIX}/products/discover`,
  sellerMe: `${API_PREFIX}/products/seller/me`,
  detail: (productId) => `${API_PREFIX}/products/${productId}`,
  create: `${API_PREFIX}/products`,
  review: (productId) => `${API_PREFIX}/products/${productId}/review`,
  reviews: (productId) => `${API_PREFIX}/products/${productId}/reviews`,
  reviewItem: (productId, reviewId) =>
    `${API_PREFIX}/products/${productId}/reviews/${reviewId}`,
  reviewHelpful: (productId, reviewId) =>
    `${API_PREFIX}/products/${productId}/reviews/${reviewId}/helpful`,
  myReview: (productId) => `${API_PREFIX}/products/${productId}/my-review`,
  related: (productId) => `${API_PREFIX}/products/${productId}/related`,
  crossSell: (productId) => `${API_PREFIX}/products/${productId}/cross-sell`,
  upSell: (productId) => `${API_PREFIX}/products/${productId}/up-sell`,
};
export const PRODUCT_ROUTES = Object.freeze({
  products: "/products",
  productDetail: (productId = ":productId") => `/products/${productId}`,
  productReviews: (productId = ":productId") => `/products/${productId}/reviews`,
  search: "/search",
  newArrivals: "/new-arrivals",
  recentlyUploaded: "/recently-uploaded",
  relatedProducts: "/related-products",
  trendingNow: "/trending-now",
  recentlyViewed: "/recently-viewed"
});
