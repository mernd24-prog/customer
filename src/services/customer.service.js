import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { normalizeApiError } from "../api/normalizeApiError";

export async function getCustomerProfile() {
  return apiRequest({ url: endpoints.users.me });
}

export async function updateCustomerProfile(data) {
  return apiRequest({ method: "patch", url: endpoints.users.me, data });
}

export async function listCustomerOrders(params = {}) {
  return apiRequest({ url: endpoints.orders.me, params });
}

export function handleCustomerApiError(error) {
  return normalizeApiError(error);
}

export default {
  getCustomerProfile,
  updateCustomerProfile,
  listCustomerOrders,
  handleCustomerApiError,
};
