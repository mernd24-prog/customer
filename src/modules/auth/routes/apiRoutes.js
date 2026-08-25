import { API_PREFIX } from "../../../api/endpoints";

export const AUTH_API_ENDPOINTS = {
  register: `${API_PREFIX}/auth/register`,
  registerOtp: `${API_PREFIX}/auth/register-otp`,
  verifyRegistration: `${API_PREFIX}/auth/verify-registration`,
  login: `${API_PREFIX}/auth/login`,
  social: `${API_PREFIX}/auth/social`,
  refresh: `${API_PREFIX}/auth/refresh`,
  sendOtp: `${API_PREFIX}/auth/send-otp`,
  verifyOtp: `${API_PREFIX}/auth/verify-otp`,
  resendOtp: `${API_PREFIX}/auth/resend-otp`,
  otpAuth: `${API_PREFIX}/auth/otp-auth`,
  forgotPassword: `${API_PREFIX}/auth/forgot-password`,
  resetPassword: `${API_PREFIX}/auth/reset-password`,
  changePassword: `${API_PREFIX}/auth/change-password`,
  status: `${API_PREFIX}/auth/status`,
};


export const AUTH_ROUTES = Object.freeze({
  login: "/login",
  register: "/register",
  registerOtp: "/register/otp",
  verifyRegistration: "/verify-registration",
  verifyOtp: "/verify-otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  home: "/"
});

export const REGISTER_ROUTES = Object.freeze({
  register: AUTH_ROUTES.register,
  registerOtp: AUTH_ROUTES.registerOtp,
  verifyRegistration: AUTH_ROUTES.verifyRegistration
});
