import { apiRequest } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";

export const supportService = {
  fetchSupportQueries: async (selectedCategory = "") => {
    const result = await apiRequest({
      method: "get",
      url: endpoints.support.queries,
      params: {
        limit: 5,
        ...(selectedCategory ? { category: selectedCategory } : {}),
      },
    });
    return result;
  },

  submitTicket: async (category, subject, message) => {
    const response = await apiRequest({
      method: "post",
      url: endpoints.support.queries,
      data: {
        category,
        subject,
        message,
        metadata: {
          source: "customer_support_center",
          channel: "chat",
        },
      },
    });
    return response;
  }
};
