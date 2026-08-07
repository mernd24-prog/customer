import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Smartphone } from "lucide-react";

import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";

import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import {
  checkAuthStatus,
  loginUser,
  socialLogin,
  clearError,
} from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { useAuthModal } from "../../context/AuthModalContext";
import { notify } from "../../utils/notify";
import { loginSchema } from "../../validations/validationSchemas";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${GOOGLE_SCRIPT_SRC}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const run = useToastThunk();
  const { openGuestOtpModal } = useAuthModal();

  const { loading } = useSelector((state) => state.auth);
  const [googleLoading, setGoogleLoading] = useState(false);
  const from = location.state?.from || AUTH_ROUTES.home;

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
      navigate(from, { replace: true });
    } catch {
      // Errors are handled by Redux and useToastThunk.
    }
  };

  const handleMobileOtpLogin = () => {
    openGuestOtpModal(async () => {
      await dispatch(checkAuthStatus());
      navigate(from, { replace: true });
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

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) {
            notify.error("Google did not return a sign-in token.");
            setGoogleLoading(false);
            return;
          }

          try {
            await run(
              dispatch,
              socialLogin({
                provider: "google",
                idToken: response.credential,
                role: "buyer",
              }),
            );

            await run(dispatch, checkAuthStatus(), "Welcome!");
            navigate(from, { replace: true });
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (
          notification.isNotDisplayed?.() ||
          notification.isSkippedMoment?.()
        ) {
          setGoogleLoading(false);
        }
      });
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
        maxHeight="h-[650px]"
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

          {/* {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )} */}

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
