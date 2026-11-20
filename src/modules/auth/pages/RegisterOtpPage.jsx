import { Navigate } from "react-router-dom";
import { AUTH_ROUTES } from "../routes/apiRoutes";
import { DynamicButton } from "../../../components/ui/button";
import { PillButton } from "../../../components/ui/button/buttonSpecialized";
import { Smartphone } from "lucide-react";

export default function RegisterOtpPage() {
  const { register, handleSubmit, errors, isValid, loading, error, submit } =
    useRegisterOtp();

  return (
    <>
      <Seo title="Register with OTP | Sam Global" />

      <AuthCard
        title="Create Account with OTP"
        subtitle="Enter your details, then verify the OTP sent to your mobile or email."
        image="/image/png/authImg1.png"
        icon="/image/png/person.png"
        maxWidth="max-w-[1000px]"
        maxHeight="h-[440px]"
      >
        <form className="grid gap-3" onSubmit={handleSubmit(submit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              placeholder="Enter First Name"
              id="firstName"
              label="First Name"
              registration={register("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
              required
            />
            <FormField
              id="lastName"
              label="Last Name"
              registration={register("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
              placeholder="Enter Last Name"
              required
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
            required
          />

          <FormField
            id="phone"
            label="Phone Number"
            type="tel"
            registration={register("phone")}
            error={errors.phone}
            autoComplete="tel"
            placeholder="Enter Phone Number"
            required
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
              required
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
              required
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

          <PillButton
            type="submit"
            size="md"
            shape="rounded"
            loading={loading}
            disabled={!isValid || loading}
            className="w-full"
          >
            <Smartphone size={18} />
            Send OTP &amp; register
          </PillButton>

          <p className="text-center text-sm leading-[20px] text-muted">
            Already Have an Account?{" "}
            <DynamicButton
              type="button"
              variant="link"
              to={AUTH_ROUTES.login}
              className="inline p-0 font-semibold text-gold underline-offset-4 hover:text-gold-dark hover:underline"
            >
              Login
            </DynamicButton>
          </p>

          <p className="text-center text-[0.8rem] text-muted">
            Prefer Password?{" "}
            <DynamicButton
              type="button"
              variant="link"
              to={AUTH_ROUTES.register}
              className="inline p-0 font-semibold text-gold underline-offset-4 hover:text-gold-dark hover:underline"
            >
              Register with Password
            </DynamicButton>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
