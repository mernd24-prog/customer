import { createSlice } from "@reduxjs/toolkit";
import { defaultInitialState } from "../createApiSlice";
import { authThunks } from "../domainThunks";
import { tokenStorage } from "../../api/tokenStorage";

const sessionThunks = [
  authThunks.loginUser,
  authThunks.socialLogin,
  authThunks.registerUser,
  authThunks.verifyRegistration,
  authThunks.verifyOtp,
  authThunks.refreshSession,
];
const currentPayloadThunks = [authThunks.checkAuthStatus];

function extractTokens(payload = {}) {
  if (payload?.tokens) return payload.tokens;
  if (payload?.session?.tokens) return payload.session.tokens;
  return payload;
}

function extractSessionUser(payload = {}) {
  return payload?.user || payload?.session?.user || payload;
}

function hasSession(payload = {}) {
  const tokens = extractTokens(payload);
  return Boolean(tokens?.accessToken || tokens?.refreshToken || payload?.user || payload?.session?.user);
}

const authSlice = createSlice({
  name: "auth",
  initialState: defaultInitialState,
  reducers: {
    logout: () => {
      tokenStorage.clear();
      return defaultInitialState;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => defaultInitialState
  },
  extraReducers: (builder) => {
    Object.values(authThunks).forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          const session = action.payload.data || {};
          const tokens = extractTokens(session);
          if (tokens?.accessToken || tokens?.refreshToken) tokenStorage.setTokens(tokens);
          state.loading = false;
          state.meta = action.payload.meta;
          state.lastFetchedAt = Date.now();
          if (sessionThunks.includes(thunk) && hasSession(session)) {
            state.current = extractSessionUser(session);
          } else if (currentPayloadThunks.includes(thunk)) {
            state.current = extractSessionUser(session);
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        });
    });
  }
});

export const {
  registerUser,
  registerUserWithOtp,
  verifyRegistration,
  loginUser,
  socialLogin,
  refreshSession,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  checkAuthStatus
} = authThunks;

export const { logout, clearError, resetState } = authSlice.actions;
export default authSlice.reducer;
