import { apiRequest } from "../../../api/client";
import { ORDER_API_ENDPOINTS } from "../routes/apiRoutes";

export const orderService = {
  quoteOrder: async (data) => {
    return await apiRequest({
      method: "post",
      url: ORDER_API_ENDPOINTS.quote,
      data,
    });
  },

  createOrder: async (data) => {
    return await apiRequest({
      method: "post",
      url: ORDER_API_ENDPOINTS.create,
      data,
    });
  },

  fetchMyOrders: async () => {
    return await apiRequest({
      method: "get",
      url: ORDER_API_ENDPOINTS.me,
    });
  },

  fetchSellerOrders: async () => {
    return await apiRequest({
      method: "get",
      url: ORDER_API_ENDPOINTS.sellerMe,
    });
  },

  fetchOrderById: async (orderId) => {
    return await apiRequest({
      method: "get",
      url: ORDER_API_ENDPOINTS.detail(orderId),
    });
  },

  cancelOrder: async ({ orderId, data }) => {
    return await apiRequest({
      method: "post",
      url: ORDER_API_ENDPOINTS.cancel(orderId),
      data,
    });
  },

  updateOrderStatus: async ({ orderId, data }) => {
    return await apiRequest({
      method: "patch",
      url: ORDER_API_ENDPOINTS.status(orderId),
      data,
    });
  },

  retryOrderPayment: async ({ orderId, data }) => {
    return await apiRequest({
      method: "post",
      url: ORDER_API_ENDPOINTS.retryPayment(orderId),
      data,
    });
  },
};
