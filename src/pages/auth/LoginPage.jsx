import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Smartphone } from "lucide-react";

import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/buttons/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/ui/Seo";

import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import {
  checkAuthStatus,
  loginUser,
  socialLogin,
  clearError,
} from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { useAuthModal } from "../../features/auth/AuthModalContext";
import { notify } from "../../utils/notify";
import { loginSchema } from "../../validations/validationSchemas";
import { fetchCart, updateCart } from "../../features/cart/cartSlice";
import { syncGuestCartWithServer } from "../../utils/ecommerce/cart";
import { loadGoogleIdentityScript } from "../../utils/pages/authUtils";

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

export default function LoginPage() {
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

  const submit = async (values) => {
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
  };

  const handleMobileOtpLogin = () => {
    openGuestOtpModal(async () => {
      await dispatch(checkAuthStatus());
      navigate(loginRedirect, { replace: true });
    });
  };

  const handleGoogleLogin = async () => {
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
  };

  return (
    <>
      <Seo
        title="Login | Sam Global"
        description="Sign in to your Sam Global account to shop, track orders, and manage your profile."
      />

      <AuthCard
        title="Login to Sam Global"
        subtitle="Sign in with your email or continue securely using mobile OTP."  
        icon="/image/png/person.png"
        maxWidth="max-w-[56rem]"
        image="/image/png/authImage.png"
      >
        <form
          className="grid gap-4 sm:gap-5"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <FormField
            id="email"
            label="Email Address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={loading || googleLoading}
          />

          <div className="grid gap-1">
            <FormField                                                                 
              id="password"
              label="Password"
              type="password"
              registration={register("password")}
              error={errors.password}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading || googleLoading}
            />

            <div className="mt-1 flex justify-end">
              <Link
                to={AUTH_ROUTES.forgotPassword}
                className="text-xs font-medium text-muted underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading || googleLoading}
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark text-[13px] font-semibold tracking-[0.5px] text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            Sign In
          </Button>

          <div className="relative flex items-center gap-3 py-0.5">
            <hr className="flex-1 border-border" />
            <span className="text-xs text-gray">Or continue with</span>
            <hr className="flex-1 border-border" />
          </div>

          <Button
            type="button"
            onClick={handleMobileOtpLogin}
            disabled={loading || googleLoading}
            className="h-12 w-full rounded-[8px] border border-gold bg-white text-[13px] font-semibold tracking-[0.5px] text-gold shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:bg-gold/5 hover:text-gold-dark hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Smartphone size={18} />
            Continue with Mobile OTP
          </Button>

          <Button
            type="button"
            variant="google"
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading || googleLoading}
            className="h-12 w-full rounded-[8px] border-border bg-white text-[13px] font-semibold tracking-[0.5px] text-ink shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:border-border-strong hover:bg-white hover:text-ink hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-navy-soft"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span>Continue with Google</span>
          </Button>

          <p className="text-center text-[0.8rem] text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Create Account
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
