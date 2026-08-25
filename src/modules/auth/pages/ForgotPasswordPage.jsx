import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AuthCard from "../../../components/ui/AuthCard";
import Button from "../../../components/ui/buttons/Button";
import FormField from "../../../components/ui/FormField";
import Seo from "../../../components/ui/Seo";
import { AUTH_ROUTES } from "../routes/apiRoutes";
import useForgotPassword from "../controllers/useForgotPassword";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    loading,
    error,
    submit
  } = useForgotPassword();

  return (
    <>
      <Seo title="Forgot Password | Sam Global" />
      <AuthCard
        title="Password Recovery"
        subtitle="Enter your email to recover your password."
        image="/image/png/authImage.png"
        icon="/image/png/done.png"
        maxWidth="max-w-[60rem]"
        maxHeight="h-[600px]"
      >
        <form className="grid gap-4" onSubmit={handleSubmit(submit)} noValidate>
          <FormField
            id="email"
            label="Email Address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />

          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading}
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark text-[13px] leading-[20px] tracking-[0.5px] font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail size={18} /> Send Reset Otp
          </Button>

          <p className="text-center  text-[0.8rem] text-muted">
            Remember Your Password?{" "}
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
