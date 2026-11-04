
import { Link } from "react-router-dom";
import { LogIn, Smartphone } from "lucide-react";

import AuthCard from "../../../components/ui/AuthCard";
import Button from "../../../components/ui/buttons/Button";
import FormField from "../../../components/ui/FormField";
import Seo from "../../../components/ui/Seo";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import useLogin from "../controllers/useLogin";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    loading,
    googleLoading,
    submit,
    handleMobileOtpLogin,
    handleGoogleLogin,
  } = useLogin();

  const isDisabled = loading || googleLoading;

  const buttonBase =
    "flex h-10 sm:h-11 md:h-12 w-full items-center justify-center gap-2 rounded-lg px-3 sm:px-4 text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-normal sm:tracking-[0.2px] transition-colors duration-200 shadow-none sm:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-60";

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
          className="grid w-full gap-3 sm:gap-4"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <div className="grid gap-3 sm:gap-4">
            <FormField
              id="email"
              label="Email Address"
              type="email"
              registration={register("email")}
              error={errors.email}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isDisabled}
              required
            />

            <div>
              <FormField
                id="password"
                label="Password"
                type="password"
                registration={register("password")}
                error={errors.password}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isDisabled}
                required
              />

              <div className="mt-2 flex justify-end">
                <Link
                  to={AUTH_ROUTES.forgotPassword}
                  className="text-xs sm:text-sm font-medium text-muted underline-offset-4 transition-colors duration-200 hover:text-gold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || isDisabled}
            className={`${buttonBase} bg-gradient-to-r from-gold to-gold-dark text-white hover:brightness-105 active:brightness-95`}
          >
            <LogIn className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
            <span>Sign In</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3 py-1">
            <hr className="flex-1 border-border" />
            <span className="whitespace-nowrap text-[11px] sm:text-xs text-gray">
              Or continue with
            </span>
            <hr className="flex-1 border-border" />
          </div>

          <Button
            type="button"
            onClick={handleMobileOtpLogin}
            disabled={isDisabled}
            className={`${buttonBase} border border-gold bg-white text-gold hover:bg-gold/5 hover:text-gold-dark active:scale-[0.99]`}
          >
            <Smartphone className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
            <span>Login or Register with Mobile OTP</span>
          </Button>

          <Button
            type="button"
            variant="google"
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={isDisabled}
            className={`${buttonBase} border border-border bg-white text-ink hover:border-border-strong hover:bg-gray-50 active:scale-[0.99]`}
          >
            <img
              loading="lazy"
              width="20"
              height="20"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"
            />
            <span>Continue with Google</span>
          </Button>

          <p className="pt-1 text-center text-xs sm:text-sm text-muted leading-relaxed">
            Don&apos;t have an account?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-colors duration-200 hover:text-gold-dark hover:underline"
            >
              Create Account
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
