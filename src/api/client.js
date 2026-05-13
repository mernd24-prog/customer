import axios from "axios";
import { endpoints } from "./endpoints";
import { normalizeApiError, normalizeApiResponse } from "./normalizeApiError";
import { tokenStorage } from "./tokenStorage";
import {
  createCacheKey,
  getCache,
  removeCache,
  setCache,
} from "../utils/cache";

const api = axios.create({
  // baseURL: "http://localhost:4000",
  baseURL: "http://192.168.16.47:4000",

  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error?.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url === endpoints.auth.refresh
    ) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshPromise =
        refreshPromise ||
        axios
          .post(
            `${import.meta.env.VITE_API_BASE_URL || ""}${
              endpoints.auth.refresh
            }`,
            { refreshToken },
          )
          .then((response) => normalizeApiResponse(response).data);
      const session = await refreshPromise;
      refreshPromise = null;
      const tokens = session?.tokens || session || {};
      tokenStorage.setTokens(tokens);
      originalRequest.headers.Authorization = `Bearer ${tokens?.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      return Promise.reject(refreshError);
    }
  },
);

export async function apiRequest({
  method = "get",
  url,
  data,
  params,
  cache = false,
  cacheTtl,
  cacheKey,
}) {
  const normalizedMethod = method.toLowerCase();
  const shouldCache = cache && normalizedMethod === "get";
  const resolvedCacheKey =
    cacheKey || createCacheKey("api", [normalizedMethod, url, params]);

  if (shouldCache) {
    const cached = getCache(resolvedCacheKey);
    if (cached) return cached;
  }

  try {
    const response = await api.request({ method, url, data, params });
    const result = normalizeApiResponse(response);

    if (shouldCache) {
      setCache(resolvedCacheKey, result, { ttl: cacheTtl });
    } else if (normalizedMethod !== "get") {
      removeCache(resolvedCacheKey);
    }

    return result;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

export default api;
