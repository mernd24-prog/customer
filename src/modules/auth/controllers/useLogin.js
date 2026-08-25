import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import {
  checkAuthStatus,
  loginUser,
  socialLogin,
  clearError,
} from "../slices/authSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { useAuthModal } from "../context/AuthModalContext";
import { notify } from "../../../utils/notify";
import { loginSchema } from "../../../validations/validationSchemas";
import { fetchCart, updateCart } from "../../cart/slices/cartSlice";
import { syncGuestCartWithServer } from "../../../utils/ecommerce/cart";
import { loadGoogleIdentityScript } from "../../../utils/pages/authUtils";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_AUTH_SCOPES = "openid email profile";
const CUSTOMER_LOGIN_REDIRECT = AUTH_ROUTES.home;

const BLOCKED_LOGIN_REDIRECT_PREFIXES = [
  "/admin",
  "/app",
  "/seller",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-registration",
];

const getCustomerLoginRedirect = (path) => {
  if (!path || typeof path !== "string") return CUSTOMER_LOGIN_REDIRECT;
  if (!path.startsWith("/") || path.startsWith("//")) return CUSTOMER_LOGIN_REDIRECT;

  const normalizedPath = path.split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
  const isBlockedPath = BLOCKED_LOGIN_REDIRECT_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  return isBlockedPath ? CUSTOMER_LOGIN_REDIRECT : path;
};

export default function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const run = useToastThunk();
  const { openGuestOtpModal } = useAuthModal();

  const { loading } = useSelector((state) => state.auth);
  const [googleLoading, setGoogleLoading] = useState(false);
  const loginRedirect = getCustomerLoginRedirect(location.state?.from);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: location.state?.email || "",
      password: "",
    },
  });

  const submit = useCallback(async (values) => {
    try {
      await run(
        dispatch,
        loginUser({
          email: values.email,
          password: values.password,
        }),
      );

      await run(dispatch, checkAuthStatus(), "Welcome back!");
      await syncGuestCartWithServer(dispatch, {
        fetchCartAction: fetchCart,
        updateCartAction: updateCart,
      });
      navigate(loginRedirect, { replace: true });
    } catch {
      // Errors are handled by Redux and useToastThunk.
    }
  }, [dispatch, run, navigate, loginRedirect]);

  const handleMobileOtpLogin = useCallback(() => {
    openGuestOtpModal(async () => {
      await dispatch(checkAuthStatus());
      navigate(loginRedirect, { replace: true });
    });
  }, [openGuestOtpModal, dispatch, navigate, loginRedirect]);

  const handleGoogleLogin = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) {
      notify.error({
        title: "Google sign-in is not configured",
        message:
          "Set VITE_GOOGLE_CLIENT_ID in customer/.env and restart the customer app.",
      });
      return;
    }

    setGoogleLoading(true);

    try {
      await loadGoogleIdentityScript();

      const codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_AUTH_SCOPES,
        ux_mode: "popup",
        include_granted_scopes: false,
        prompt: "select_account",
        callback: async (response) => {
          if (response?.error) {
            notify.error({
              title: "Google sign-in was not completed",
              message: response.error_description || response.error,
            });
            setGoogleLoading(false);
            return;
          }

          if (!response?.code) {
            notify.error("Google did not return an authorization code.");
            setGoogleLoading(false);
            return;
          }

          const grantedScopes = new Set(String(response.scope || "").split(/\s+/).filter(Boolean));
          const missingScopes = GOOGLE_AUTH_SCOPES
            .split(" ")
            .filter((scope) => !grantedScopes.has(scope));
          if (missingScopes.length) {
            notify.error({
              title: "Google sign-in needs basic profile access",
              message: "Please allow email and profile access to continue.",
            });
            setGoogleLoading(false);
            return;
          }

          try {
            await run(
              dispatch,
              socialLogin({
                provider: "google",
                authCode: response.code,
                clientId: GOOGLE_CLIENT_ID,
                redirectUri: window.location.origin,
                role: "buyer",
              }),
            );

            await run(dispatch, checkAuthStatus(), "Welcome!");
            await syncGuestCartWithServer(dispatch, {
              fetchCartAction: fetchCart,
              updateCartAction: updateCart,
            });
            navigate(loginRedirect, { replace: true });
          } finally {
            setGoogleLoading(false);
          }
        },
        error_callback: (error) => {
          if (error?.type === "popup_closed") {
            notify.info("Google sign-in was cancelled.");
          } else if (error?.type === "popup_failed_to_open") {
            notify.error({
              title: "Google popup was blocked",
              message: "Please allow popups for Sam Global and try again.",
            });
          } else {
            notify.error({
              title: "Google sign-in failed",
              message: error?.message || error?.type || "Please try again.",
            });
          }
          setGoogleLoading(false);
        },
      });

      codeClient.requestCode();
    } catch {
      setGoogleLoading(false);
      notify.error({
        title: "Google sign-in failed",
        message: "Unable to load Google sign-in. Please try again.",
      });
    }
  }, [dispatch, run, navigate, loginRedirect]);

  return {
    register,
    handleSubmit,
    errors,
    isValid,
    loading,
    googleLoading,
    submit,
    handleMobileOtpLogin,
    handleGoogleLogin
  };
}
