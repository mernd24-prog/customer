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
    handleGoogleLogin
  } = useLogin();

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
          className="grid gap-4 sm:gap-5"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <FormField
            id="email"
            label="Email Address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={loading || googleLoading}
          />

          <div className="grid gap-1">
            <FormField                                                                 
              id="password"
              label="Password"
              type="password"
              registration={register("password")}
              error={errors.password}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading || googleLoading}
            />

            <div className="mt-1 flex justify-end">
              <Link
                to={AUTH_ROUTES.forgotPassword}
                className="text-xs font-medium text-muted underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading || googleLoading}
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark text-[13px] font-semibold tracking-[0.5px] text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            Sign In
          </Button>

          <div className="relative flex items-center gap-3 py-0.5">
            <hr className="flex-1 border-border" />
            <span className="text-xs text-gray">Or continue with</span>
            <hr className="flex-1 border-border" />
          </div>

          <Button
            type="button"
            onClick={handleMobileOtpLogin}
            disabled={loading || googleLoading}
            className="h-12 w-full rounded-[8px] border border-gold bg-white text-[13px] font-semibold tracking-[0.5px] text-gold shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:bg-gold/5 hover:text-gold-dark hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Smartphone size={18} />
            Continue with Mobile OTP
          </Button>

          <Button
            type="button"
            variant="google"
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading || googleLoading}
            className="h-12 w-full rounded-[8px] border-border bg-white text-[13px] font-semibold tracking-[0.5px] text-ink shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:border-border-strong hover:bg-white hover:text-ink hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-navy-soft"
          >
            <img loading="lazy" width="400" height="400"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span>Continue with Google</span>
          </Button>

          <p className="text-center text-[0.8rem] text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Create Account
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
