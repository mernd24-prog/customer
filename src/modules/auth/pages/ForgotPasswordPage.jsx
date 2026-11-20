import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AuthCard from "../../../components/ui/AuthCard";
import Button from "../../../components/ui/buttons/Button";
import FormField from "../../../components/ui/FormField";
import Seo from "../../../components/ui/Seo";
import { AUTH_ROUTES } from "../routes/apiRoutes";
import useForgotPassword from "../controllers/useForgotPassword";
import { PillButton } from "../../../components/ui/button/buttonSpecialized";
import DynamicButton from "../../../components/ui/button/button.jsx";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, errors, isValid, loading, error, submit } =
    useForgotPassword();

  return (
    <>
      <Seo title="Forgot Password | Sam Global" />
      <AuthCard
        title="Password Recovery"
        subtitle="Enter your email to recover your password."
        image="/image/png/authImage.png"
        icon="/image/png/done.png"
        maxWidth="max-w-[60rem]"
        maxHeight="h-[440px]"
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
            required
          />

          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <PillButton
            size="md"
            type="submit"
            loading={loading}
            disabled={!isValid || loading}
          >
            <Mail size={18} /> Send Reset Otp
          </PillButton>

          <p className="text-center  text-[0.8rem] text-muted">
            Remember Your Password?{" "}
            <DynamicButton 
            type="button"
            size="xs"
            variant="link"
             to={AUTH_ROUTES.login}>
              Back to Login
            </DynamicButton>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
