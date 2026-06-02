import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Smartphone, UserPlus } from "lucide-react";
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
        icon={<UserPlus size={28} />}
        maxWidth="max-w-[1120px]"
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div className="grid gap-4  sm:grid-cols-2">
            <FormField
              placeholder="Enter first name"
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
              placeholder="Enter last name"
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
            placeholder="Enter phone number"
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
              <label htmlFor="password" className="text-sm font-semibold text-ink">
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
                  className={`min-h-11 w-full rounded-[8px] border bg-white px-3 py-2.5 pr-11  text-sm text-ink outline-none transition-all duration-500 ease-in-out placeholder:text-gray ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-border-strong focus:border-gold focus:ring-2 focus:ring-gold/20"
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-all duration-500 ease-in-out hover:bg-cream hover:text-ink"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password?.message ? (
                <p className=" text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-ink">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register("confirmPassword")}
                  className={`min-h-11 w-full rounded-[8px] border bg-white px-3 py-2.5 pr-11  text-sm text-ink outline-none transition-all duration-500 ease-in-out placeholder:text-gray ${
                    errors.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-border-strong focus:border-gold focus:ring-2 focus:ring-gold/20"
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-all duration-500 ease-in-out hover:bg-cream hover:text-ink"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword?.message ? (
                <p className=" text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>

          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark  text-[0.9rem] font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isValid || loading}>
            <Smartphone size={18} /> Send OTP &amp; register
          </Button>

          <p className="text-center  text-[0.8rem] text-muted">
            Already have an account?{" "}
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Login
            </Link>
          </p>
          <p className="text-center  text-[0.8rem] text-muted">
            Prefer password?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Register with password
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
