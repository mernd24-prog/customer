import { Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

import AuthCard from "../../../components/ui/AuthCard";
import Button from "../../../components/ui/buttons/Button";
import FormField from "../../../components/ui/FormField";
import Seo from "../../../components/ui/Seo";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import useRegisterOtp from "../controllers/useRegisterOtp";

export default function RegisterOtpPage() {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    loading,
    error,
    submit
  } = useRegisterOtp();

  return (
    <>
      <Seo title="Register with OTP | Sam Global" />

      <AuthCard
        title="Create Account with Otp"
        subtitle="Create your password now, then verify your email with a one-time code."
        image="/image/png/authImg1.png"
        icon="/image/png/person.png"
        maxWidth="max-w-[1000px]"
        maxHeight="h-[780px]"
      >
        <form
          className="grid gap-3 sm:gap-5"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              placeholder="Enter First Name"
              id="firstName"
              label="First Name"
              registration={register("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <FormField
              id="lastName"
              label="Last Name"
              registration={register("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
              placeholder="Enter Last Name"
            />
          </div>

          <FormField
            id="email"
            label="Email Address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />

          <FormField
            id="phone"
            label="Phone Number"
            type="tel"
            registration={register("phone")}
            error={errors.phone}
            autoComplete="tel"
            placeholder="Enter Phone Number"
          />

          <FormField
            id="referralCode"
            label="Referral Code"
            registration={register("referralCode")}
            error={errors.referralCode}
            placeholder="Optional"
          />

          {/* PASSWORD & CONFIRM PASSWORD FIELDS using FormField */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="password"
              label="Password"
              type="password"
              registration={register("password")}
              error={errors.password}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
            />

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isValid || loading}
          >
            <Smartphone size={18} /> Send OTP &amp; register
          </Button>

          <p className="text-center text-[13px] leading-[20px] text-muted">
            Already Have an Account?{" "}
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Login
            </Link>
          </p>

          <p className="text-center text-[0.8rem] text-muted">
            Prefer Password?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Register with Password
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
