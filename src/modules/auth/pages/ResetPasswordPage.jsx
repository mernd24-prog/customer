import AuthCard from "../../../components/ui/AuthCard";
import FormField from "../../../components/ui/FormField";
import OtpInput from "../../../components/ui/OtpInput";
import Seo from "../../../components/ui/Seo";
import { AUTH_ROUTES } from "../routes/apiRoutes";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import useResetPassword from "../controllers/useResetPassword";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DynamicButton } from "../../../components/ui/button";
import { PillButton } from "../../../components/ui/button/buttonSpecialized";
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isValid,
    loading,
    error,
    submit,
    handleResendOtp,
  } = useResetPassword();

  return (
    <AppErrorBoundary>
      <Seo title="Reset Password | Sam Global" />
      <AuthCard
        title="Reset Password"
        subtitle="Enter your new password below and make sure it’s something strong and unique."
        icon="/image/png/done.png"
        image="/image/png/authImage.png"
        maxWidth="max-w-[56rem]"
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

          <label className="text-sm font-semibold text-ink">
            Otp Code<span className="ml-0.5 text-red-500">*</span>
          </label>
          <input type="hidden" {...register("otp")} />
          <OtpInput
            value={watch("otp") || ""}
            onChange={(otp) =>
              setValue("otp", otp, { shouldValidate: true, shouldDirty: true })
            }
            error={errors.otp?.message}
          />

          <FormField
            id="newPassword"
            label="New Password"
            type="password"
            registration={register("newPassword")}
            error={errors.newPassword}
            autoComplete="new-password"
            placeholder="Enter a Strong New Password"
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
            type="submit"
            size="md"
            shape="rounded"
            loading={loading}
            disabled={!isValid || loading}
            className="w-full"
          >
            Reset Password
          </PillButton>

          <p className="text-center text-[0.8rem] text-muted">
            Didn&apos;t receive the OTP?{" "}
            <DynamicButton
              variant="link"
              onClick={handleResendOtp}
            >
              
              Resend OTP
            </DynamicButton>
          </p>

          <p className="text-center text-[0.8rem] text-muted">
            <DynamicButton
              variant="link"
              onClick={() => navigate(AUTH_ROUTES.login)}
            >
              <ArrowLeft/>
              Back to Login
            </DynamicButton>
          </p>
        </form>
      </AuthCard>
    </AppErrorBoundary>
  );
}
