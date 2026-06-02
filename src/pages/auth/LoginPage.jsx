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
                className={`min-h-11 w-full rounded-[8px] border bg-white px-3 py-2.5 pr-12  text-sm text-ink outline-none transition-all duration-500 ease-in-out placeholder:text-gray ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-border-strong focus:border-gold focus:ring-2 focus:ring-gold/20"
                }`}
              />

              {/* SHOW/HIDE PASSWORD */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-all duration-500 ease-in-out hover:bg-cream hover:text-ink"
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
              <p className="min-h-4  text-xs font-normal text-red-600">
                {errors.password.message}
              </p>
            )} 

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <Link
                to={AUTH_ROUTES.forgotPassword}
                className=" text-xs font-medium text-muted underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

          </div>

          {/* API ERROR */}
          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700"
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
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark  text-[0.9rem] font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            Sign in
          </Button>

          {/* DIVIDER */}
          <div className="relative flex items-center gap-3 py-0.5">
            <hr className="flex-1 border-border" />

            <span className=" text-xs text-gray">
              or
            </span>

            <hr className="flex-1 border-border" />
          </div>

          {/* GOOGLE LOGIN */}
          <Button
            type="button"
            variant="google"
            onClick={handleGoogleLogin}
            className="h-12 w-full rounded-[8px] border-border bg-white  text-[0.9rem] font-semibold tracking-normal text-ink shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:border-border-strong hover:bg-white hover:text-ink hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-navy-soft"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />

            <span>Continue with Google</span>
          </Button>

          {/* REGISTER */}
          <p className="text-center  text-[0.8rem] text-muted">
            Don&apos;t have an account?{" "}

            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Create account
            </Link>
          </p>

          {/* OTP LOGIN */}
          <p className="text-center  text-[0.8rem] text-muted">
            Seller account login?{" "}

            <Link
              to={AUTH_ROUTES.verifyOtp}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Verify with OTP
            </Link>
          </p>

        </form>
      </AuthCard>
    </>
  );
}
