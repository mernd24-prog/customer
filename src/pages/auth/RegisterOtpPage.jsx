import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { registerUserWithOtp, clearError } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { registerOtpSchema } from "../../validations/validationSchemas";

export default function RegisterOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerOtpSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });

  const submit = async (values) => {
    const payload = {
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: "buyer",
      profile: { firstName: values.firstName, lastName: values.lastName },
      referralCode: values.referralCode || undefined,
    };
    await run(dispatch, registerUserWithOtp(payload), "OTP sent to your email");
    navigate(AUTH_ROUTES.verifyRegistration, {
      state: { email: values.email },
    });
  };

  return (
    <>
      <Seo title="Register with OTP | Sam Global" />
      <AuthCard
        eyebrow="New account"
        title="Create account with OTP"
        subtitle="Create your password now, then verify your email with a one-time code."
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div>
            <h2 className="text-2xl font-bold text-[#2E2E2E]">
              Register with OTP
            </h2>
            <p className="mt-1 text-sm text-[#A6A6A6]">
              We&apos;ll send an OTP to your email to complete registration.
            </p>
          </div>

          <div className="grid gap-4  sm:grid-cols-2">
            <FormField
              placeholder="John Doe"
              id="firstName"
              label="First name"
              registration={register("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <FormField
              id="lastName"
              label="Last name"
              registration={register("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
              placeholder="Doe"
            />
          </div>

          <FormField
            id="email"
            label="Email address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />

          <FormField
            id="phone"
            label="Phone number"
            type="tel"
            registration={register("phone")}
            error={errors.phone}
            autoComplete="tel"
            placeholder="+91 98765 43210"
          />

          <FormField
            id="referralCode"
            label="Referral code"
            registration={register("referralCode")}
            error={errors.referralCode}
            placeholder="Optional"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-[#2E2E2E]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register("password")}
                  className={`w-full rounded-md border bg-white px-4 py-3 pr-11 text-sm outline-none transition ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-[#d9d4c7] focus:border-[#ce9f2d] focus:ring-2 focus:ring-[#ce9f2d]/20"
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787878] transition hover:text-[#2E2E2E]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password?.message ? (
                <p className="text-xs text-red-700">{errors.password.message}</p>
              ) : null}
            </div>

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" disabled={!isValid || loading}>
            <Smartphone size={18} /> Send OTP &amp; register
          </Button>

          <p className="text-center text-sm text-[#787878]">
            Already have an account?{" "}
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
          <p className="text-center text-sm text-[#787878]">
            Prefer password?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
            >
              Register with password
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
