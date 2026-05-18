import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";

import { AUTH_ROUTES } from "../../features/auth/authRoutes";

import {
  loginUser,
  clearError,
} from "../../features/auth/authSlice";

import { useToastThunk } from "../../hooks/useToastThunk";
import { loginSchema } from "../../validations/validationSchemas";


export default function LoginPage() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const run = useToastThunk();

  const [showPassword, setShowPassword] = useState(false);

  const { loading, error } = useSelector((s) => s.auth);

  const from = location.state?.from || AUTH_ROUTES.home;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isValid,
    },
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
    await run(
      dispatch,
      loginUser({
        email: values.email,
        password: values.password,
      }),
      "Welcome back!"
    );

    navigate(from, { replace: true });
  };

  const handleGoogleLogin = () => {
    toast.info(
      "Google sign-in requires Firebase authentication integration."
    );
  };

  return (
    <>
      <Seo
        title="Login | Sam Global"
        description="Sign in to your Sam Global account to shop, track orders, and manage your profile."
      />

      <AuthCard
        eyebrow="Welcome back"
        title="Sign in to Sam Global"
        subtitle="Access your orders, wallet, loyalty rewards, and personalized deals — all in one place."
      >
        <form
          className="grid gap-4 sm:gap-5"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          {/* HEADING */}
          <div>
            <h2 className="text-2xl font-bold text-[#1E1B6D] sm:text-3xl">
              Login to your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Enter your credentials to continue shopping.
            </p>
          </div>

          {/* EMAIL */}
          <FormField
            id="email"
            label="Email address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={loading}
          />

          {/* PASSWORD */}
          <div className="grid gap-2">

            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={loading}
                {...register("password")}
                className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition sm:text-base ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-300 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/20"
                }`}
              />

              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#1E1B6D]"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

            {/* PASSWORD ERROR */}
            {errors.password?.message && (
              <p className="min-h-4 font-montserrat text-xs font-normal text-red-600">
                {errors.password.message}
              </p>
            )} 

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <Link
                to={AUTH_ROUTES.forgotPassword}
                className="text-xs font-medium text-slate-600 underline-offset-4 transition hover:text-[#1E1B6D] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

          </div>

          {/* API ERROR */}
          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading}
            className="h-12 w-full rounded-xl bg-[#D4A017] text-white transition hover:bg-[#B8860B] disabled:cursor-not-allowed disabled:opacity-60 sm:h-14"
          >
            <LogIn size={18} />
            Sign in
          </Button>

          {/* DIVIDER */}
          <div className="relative flex items-center gap-3 py-1">
            <hr className="flex-1 border-stone-200" />

            <span className="text-xs text-slate-400">
              or
            </span>

            <hr className="flex-1 border-stone-200" />
          </div>

          {/* GOOGLE LOGIN */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            className="h-12 w-full rounded-xl border border-[#D4A017] bg-white text-[#1E1B6D] transition hover:bg-[#FFF8E1] sm:h-14"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-4 w-4"
            />

            Continue with Google
          </Button>

          {/* REGISTER */}
          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}

            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-[#1E1B6D] underline-offset-4 transition hover:underline"
            >
              Create account
            </Link>
          </p>

          {/* OTP LOGIN */}
          <p className="text-center text-sm text-slate-600">
            Seller account login?{" "}

            <Link
              to={AUTH_ROUTES.verifyOtp}
              className="font-semibold text-[#1E1B6D] underline-offset-4 transition hover:underline"
            >
              Verify with OTP
            </Link>
          </p>

        </form>
      </AuthCard>
    </>
  );
}
