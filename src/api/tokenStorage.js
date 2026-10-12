const ACCESS_TOKEN_KEY = "sam_global_access_token";
const REFRESH_TOKEN_KEY = "sam_global_refresh_token";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: ({ accessToken, refreshToken }) => {
    const previousAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const previousRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const writeTokens = () => {
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    };
    try {
      try {
        writeTokens();
      } catch (error) {
        if (!isQuotaExceededError(error)) throw error;
        clearDisposableCache();
        writeTokens();
      }
    } catch (error) {
      // Avoid leaving a partially updated session after a failed write.
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      try {
        if (previousRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, previousRefreshToken);
        if (previousAccessToken) localStorage.setItem(ACCESS_TOKEN_KEY, previousAccessToken);
      } catch {}
      if (isQuotaExceededError(error)) {
        throw new Error("Browser storage is full. Please free up space for this site and sign in again.");
      }
      throw error;
    }
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("logoutReason");
  }
};
import { clearDisposableCache, isQuotaExceededError } from "../utils/cache";
