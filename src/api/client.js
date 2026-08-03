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

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://192.168.16.42:4000"
).replace(/\/+$/, "");

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000);
const API_RETRY_DELAY_MS = Number(
  import.meta.env.VITE_API_RETRY_DELAY_MS || 500,
);
const buildApiUrl = (path = "") =>
  `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Pragma: "no-cache",
  },
});

let refreshPromise = null;

const FORCE_LOGOUT_CODES = new Set([
  "USER_NOT_FOUND",
  "USER_INACTIVE",
  "USER_BLOCKED",
  "USER_DELETED",
  "TOKEN_EXPIRED",
  "TOKEN_INVALID",
  "ROLE_CHANGED",
  "ROLE_INACTIVE",
  "PERMISSION_REMOVED",
  "SESSION_INVALID",
  "FORCE_LOGOUT",
]);

const FORCE_LOGOUT_MESSAGES = {
  USER_NOT_FOUND:
    "Your account no longer exists. Please contact administrator.",
  USER_DELETED: "Your account has been removed. Please contact administrator.",
  USER_INACTIVE:
    "Your account has been deactivated. Please contact administrator.",
  USER_BLOCKED: "Your account has been blocked. Please contact support.",
  TOKEN_EXPIRED: "Your session has expired. Please login again.",
  TOKEN_INVALID: "Invalid session. Please login again.",
  ROLE_CHANGED: "Your role was changed. Please login again.",
  ROLE_INACTIVE: "Your role is no longer active. Please contact administrator.",
  PERMISSION_REMOVED: "Your permissions were updated. Please login again.",
  SESSION_INVALID: "Your session is no longer valid. Please login again.",
  FORCE_LOGOUT: "Please login again to continue.",
};

const getAuthCode = (error = {}) => {
  const data = error?.response?.data || error?.data || error || {};
  return data?.code || data?.error?.code || null;
};

const getAuthMessage = (error = {}) => {
  const data = error?.response?.data || error?.data || error || {};
  const code = getAuthCode(error);
  return (
    data?.message ||
    data?.error?.message ||
    FORCE_LOGOUT_MESSAGES[code] ||
    "Your session has expired. Please login again."
  );
};

const forceLogout = (error = {}) => {
  const code = getAuthCode(error) || "SESSION_INVALID";
  const message = getAuthMessage(error);
  tokenStorage.clear();
  localStorage.setItem("logoutReason", JSON.stringify({ code, message }));
  window.dispatchEvent(
    new CustomEvent("auth:logout", { detail: { code, message } }),
  );
};

const isPublicAuthEndpoint = (url = "") =>
  [
    endpoints.auth.login,
    endpoints.auth.register,
    endpoints.auth.registerOtp,
    endpoints.auth.verifyRegistration,
    endpoints.auth.social,
    endpoints.auth.sendOtp,
    endpoints.auth.verifyOtp,
    endpoints.auth.resendOtp,
    endpoints.auth.forgotPassword,
    endpoints.auth.resetPassword,
  ].some((endpoint) => String(url || "").includes(endpoint));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetriableReadError = (error) =>
  error?.code === "ECONNABORTED" ||
  error?.code === "ERR_NETWORK" ||
  (!error?.response && Boolean(error?.request));

const requestWithReadRetry = async (config) => {
  try {
    return await api.request(config);
  } catch (error) {
    const method = String(config?.method || "get").toLowerCase();
    if (
      method !== "get" ||
      config?._retryRead ||
      !isRetriableReadError(error)
    ) {
      throw error;
    }

    await wait(API_RETRY_DELAY_MS);
    return api.request({ ...config, _retryRead: true });
  }
};

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["Cache-Control"] = "no-store";
  config.headers.Pragma = "no-cache";
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (
    typeof globalThis.FormData !== "undefined" &&
    config.data instanceof globalThis.FormData
  ) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (isPublicAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }
    const authCode = getAuthCode(error);
    const shouldForceLogout =
      FORCE_LOGOUT_CODES.has(authCode) || error?.response?.status === 401;
    if (
      error?.response?.status !== 401 ||
      (authCode &&
        authCode !== "TOKEN_EXPIRED" &&
        authCode !== "TOKEN_INVALID") ||
      originalRequest?._retry ||
      originalRequest?.url === endpoints.auth.refresh
    ) {
      if (
        shouldForceLogout &&
        originalRequest?.url !== endpoints.auth.refresh
      ) {
        forceLogout(error);
      }
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      forceLogout(error);
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshPromise =
        refreshPromise ||
        axios
          .post(buildApiUrl(endpoints.auth.refresh), { refreshToken })
          .then((response) => normalizeApiResponse(response).data);
      const session = await refreshPromise;
      refreshPromise = null;
      const tokens = session?.tokens || session || {};
      tokenStorage.setTokens(tokens);
      originalRequest.headers.Authorization = `Bearer ${tokens?.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      forceLogout(refreshError);
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
    const response = await requestWithReadRetry({ method, url, data, params });
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
