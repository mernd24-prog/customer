import { apiRequest } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";

export const supportService = {
  fetchSupportQueries: async (selectedCategory = "", limit = 5) => {
    const result = await apiRequest({
      method: "get",
      url: endpoints.support.queries,
      params: {
        limit,
        ...(selectedCategory ? { category: selectedCategory } : {}),
      },
    });
    return result;
  },

  fetchSupportTicket: async (queryId) => {
    const result = await apiRequest({
      method: "get",
      url: endpoints.support.query(queryId),
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
  },

  sendAiChatMessage: async (message, history = []) => {
    const response = await apiRequest({
      method: "post",
      url: endpoints.support.aiChat,
      data: {
        message,
        history,
      },
    });
    return response;
  },
};
