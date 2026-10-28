import { CheckCircle } from "lucide-react";
import AuthCard from "../../../components/ui/AuthCard";
import Button from "../../../components/ui/buttons/Button";
import FormField from "../../../components/ui/FormField";
import OtpInput from "../../../components/ui/OtpInput";
import Seo from "../../../components/ui/Seo";
import useVerifyRegistration from "../controllers/useVerifyRegistration";

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
              <input type="hidden" {...register("email")} />
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
          <input type="hidden" {...register("otp")} />
          <OtpInput
            value={watch("otp") || ""}
            onChange={(otp) =>
              setValue("otp", otp, { shouldValidate: true, shouldDirty: true })
            }
            error={errors.otp?.message}
          />

          {/* {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )} */}

          <Button
            type="submit"
            loading={verifying}
            className="h-11 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark text-label leading-[20px] tracking-[0.5px] font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isValid || loading}
          >
            <CheckCircle size={18} /> Verify &amp; activate account
          </Button>

          <p className="text-center  text-label text-muted">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
              onClick={handleResendOtp}
              disabled={loading}
            >
              {resending ? "Sending OTP…" : "Resend OTP"}
            </button>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
