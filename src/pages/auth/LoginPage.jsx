import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
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
        icon={<User size={28} />}
        maxWidth="max-w-[460px]"
      >
        <form
          className="grid gap-4 sm:gap-5"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
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
                className={`min-h-11 w-full rounded-[8px] border bg-white px-3 py-2.5 pr-12 font-montserrat text-sm text-[#2E2E2E] outline-none transition-all duration-500 ease-in-out placeholder:text-[#A6A6A6] ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-[#cfc6b8] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
                }`}
              />

              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#9E886A] transition-all duration-500 ease-in-out hover:bg-[#FAF6EE] hover:text-[#2E2E2E]"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                className="font-montserrat text-xs font-medium text-[#9E886A] underline-offset-4 transition-all duration-500 ease-in-out hover:text-[#CE9F2D] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

          </div>

          {/* API ERROR */}
          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 font-montserrat text-sm text-red-700"
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
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-[#CE9F2D] to-[#A26D27] font-montserrat text-[0.9rem] font-semibold tracking-wide text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            Sign in
          </Button>

          {/* DIVIDER */}
          <div className="relative flex items-center gap-3 py-0.5">
            <hr className="flex-1 border-[#f0e9da]" />

            <span className="font-montserrat text-xs text-[#A6A6A6]">
              or
            </span>

            <hr className="flex-1 border-[#f0e9da]" />
          </div>

          {/* GOOGLE LOGIN */}
          <Button
            type="button"
            variant="google"
            onClick={handleGoogleLogin}
            className="h-12 w-full rounded-[8px] border-[#dadce0] bg-white font-montserrat text-[0.9rem] font-semibold tracking-wide text-[#2E2E2E] shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:border-[#c8ccd0] hover:bg-white hover:text-[#1f1f1f] hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-[#f8fafd]"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />

            <span>Continue with Google</span>
          </Button>

          {/* REGISTER */}
          <p className="text-center font-montserrat text-[0.8rem] text-[#9E886A]">
            Don&apos;t have an account?{" "}

            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-[#CE9F2D] underline-offset-4 transition-all duration-500 ease-in-out hover:text-[#A26D27] hover:underline"
            >
              Create account
            </Link>
          </p>

          {/* OTP LOGIN */}
          <p className="text-center font-montserrat text-[0.8rem] text-[#9E886A]">
            Seller account login?{" "}

            <Link
              to={AUTH_ROUTES.verifyOtp}
              className="font-semibold text-[#CE9F2D] underline-offset-4 transition-all duration-500 ease-in-out hover:text-[#A26D27] hover:underline"
            >
              Verify with OTP
            </Link>
          </p>

        </form>
      </AuthCard>
    </>
  );
}
