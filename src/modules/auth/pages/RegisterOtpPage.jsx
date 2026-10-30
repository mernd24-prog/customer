import { Navigate } from "react-router-dom";
import { AUTH_ROUTES } from "../routes/apiRoutes";

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
        title="Create Account with OTP"
        subtitle="Enter your details, then verify the OTP sent to your mobile or email."
        image="/image/png/authImg1.png"
        icon="/image/png/person.png"
        maxWidth="max-w-[1000px]"
        maxHeight="h-[440px]"
      >
        <form
          className="grid gap-3"
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

          <Button
            type="submit"
            loading={loading}
            className="h-11 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isValid || loading}
          >
            <Smartphone size={18} /> Send OTP &amp; register
          </Button>

          <p className="text-center text-sm leading-[20px] text-muted">
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
