import { Link } from "react-router-dom";
import { LogIn, Smartphone } from "lucide-react";
import { DynamicButton } from "../../../components/ui/button";
import {
  PillButton,
  GoldOutlineButton,
} from "../../../components/ui/button/buttonSpecialized";
import AuthCard from "../../../components/ui/AuthCard";
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
                <DynamicButton
                  variant="link"
                  onClick={() => navigate(AUTH_ROUTES.forgotPassword)}
                  className=" text-muted "
                >
            
                  Forgot Password?
                </DynamicButton>
              </div>
            </div>
          </div>

          <PillButton
            type="submit"
            size="md"
            className="w-full"
            loading={loading}
            disabled={!isValid || isDisabled}
            leftIcon={
              <LogIn className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" />
            }
          >
            Sign In
          </PillButton>

          <div className="flex items-center gap-2 sm:gap-3 py-1">
            <hr className="flex-1 border-border" />
            <span className="whitespace-nowrap text-[11px] sm:text-xs text-gray">
              Or continue with
            </span>
            <hr className="flex-1 border-border" />
          </div>

          <GoldOutlineButton
  
            size="md"
            onClick={handleMobileOtpLogin}
            disabled={isDisabled}
            className="w-full"
            leftIcon={
              <Smartphone className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
            }
          >
            Login or Register with Mobile OTP
          </GoldOutlineButton>

          <DynamicButton
            type="button"
            variant="google"
            size="md"
            shape="rounded"
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={isDisabled}
            leftIcon={
              <img
                loading="lazy"
                width="20"
                height="20"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"
              />
            }
          >
            Continue with Google
          </DynamicButton>

          <p className="pt-1 text-center text-xs leading-relaxed text-muted sm:text-sm">
            Don&apos;t have an account?{" "}
            <DynamicButton
              variant="link"
              onClick={() => navigate(AUTH_ROUTES.register)}
              className="inline-flex items-center gap-1 p-0 font-semibold text-gold hover:text-gold-dark"
            >
              Create Account
            
            </DynamicButton>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
