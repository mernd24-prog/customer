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
