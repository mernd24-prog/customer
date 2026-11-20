import { CheckCircle } from "lucide-react";
import AuthCard from "../../../components/ui/AuthCard";
import FormField from "../../../components/ui/FormField";
import OtpInput from "../../../components/ui/OtpInput";
import Seo from "../../../components/ui/Seo";
import useVerifyRegistration from "../controllers/useVerifyRegistration";
import { DynamicButton } from "../../../components/ui/button";
import { PillButton } from "../../../components/ui/button/buttonSpecialized";
import DynamicInput from "../../../components/ui/input/input";

export default function VerifyRegistrationPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isValid,
    loading,
    verifying,
    resending,
    error,
    submit,
    deliveryMessage,
    registrationEmail,
    handleResendOtp,
  } = useVerifyRegistration();

  return (
    <>
      <Seo title="Verify Registration | Sam Global" />
      <AuthCard
        eyebrow="Almost there"
        title="Verify Your Account"
        subtitle="Enter the 6-digit registration OTP. The exact delivery destination is shown below."
        icon="/image/png/person.png"
        image="/image/png/authImage.png"
        maxWidth="max-w-[65rem]"
      >
        <form className="grid gap-3" onSubmit={handleSubmit(submit)} noValidate>
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
            {deliveryMessage}
          </p>
          {registrationEmail ? (
            <>
              <DynamicInput
                unwrapped
                variant="uiHidden"
                type="hidden"
                registration={register("email")}
              />
            </>
          ) : (
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
          )}

          <label className="text-sm font-semibold text-ink">
            OTP Code<span className="ml-0.5 text-red-500">*</span>
          </label>
          <DynamicInput unwrapped variant="uiHidden" type="hidden" registration={register("otp")} />
          <OtpInput
            value={watch("otp") || ""}
            onChange={(otp) =>
              setValue("otp", otp, { shouldValidate: true, shouldDirty: true })
            }
            error={errors.otp?.message}
          />

          <PillButton
            type="submit"
            size="md"
            shape="rounded"
            loading={verifying}
            disabled={!isValid || loading || verifying}
            className="w-full"
          >
            <CheckCircle size={18} />
            Verify &amp; activate account
          </PillButton>
          <p className="text-center text-[0.8rem] text-muted">
            Didn&apos;t receive the code?{" "}
            <DynamicButton
              type="button"
              variant="link"
              onClick={handleResendOtp}
              disabled={loading || resending}
            >
              {resending ? "Sending OTP…" : "Resend OTP"}
            </DynamicButton>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
