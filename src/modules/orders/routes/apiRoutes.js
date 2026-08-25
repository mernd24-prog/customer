import { API_PREFIX } from "../../../api/endpoints";

export const ORDER_API_ENDPOINTS = {
  me: `${API_PREFIX}/orders/me`,
  sellerMe: `${API_PREFIX}/orders/seller/me`,
  create: `${API_PREFIX}/orders`,
  quote: `${API_PREFIX}/orders/quote`,
  detail: (orderId) => `${API_PREFIX}/orders/${orderId}`,
  cancel: (orderId) => `${API_PREFIX}/orders/${orderId}/cancel`,
  status: (orderId) => `${API_PREFIX}/orders/${orderId}/status`,
  retryPayment: (orderId) => `${API_PREFIX}/orders/${orderId}/payment/retry`,
};
export const ORDER_ROUTES = Object.freeze({
  list: "/orders",
  detail: (orderId = ":orderId") => `/orders/${orderId}`,
  track: (orderId = ":orderId") => `/orders/${orderId}/track`,
});
