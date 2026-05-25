import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import OtpInput from "../../components/ui/OtpInput";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { verifyRegistration, clearError, resendOtp } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { verifyOtpSchema } from "../../validations/validationSchemas";


export default function VerifyRegistrationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: { email: location.state?.email || "", otp: "" },
  });

  const submit = async (values) => {
    await run(dispatch, verifyRegistration({ email: values.email, otp: values.otp }), "Account verified! Welcome.");
    navigate(AUTH_ROUTES.home);
  };

  return (
    <>
      <Seo title="Verify Registration | Sam Global" />
      <AuthCard
        eyebrow="Almost there"
        title="Verify your email"
        subtitle="Enter the 6-digit OTP sent to your email to activate your account."
        icon={<CheckCircle size={28} />}
        maxWidth="max-w-[460px]"
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <FormField
            id="email"
            label="Email address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />

          <label className="font-montserrat text-sm font-semibold text-[#2E2E2E]">OTP code</label>
          <input type="hidden" {...register("otp")} />
          <OtpInput
            value={watch("otp") || ""}
            onChange={(otp) => setValue("otp", otp, { shouldValidate: true, shouldDirty: true })}
            error={errors.otp?.message}
          />

          {error && (
            <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 font-montserrat text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="h-12 w-full rounded-[8px] bg-gradient-to-r from-[#CE9F2D] to-[#A26D27] font-montserrat text-[0.9rem] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isValid || loading}>
            <CheckCircle size={18} /> Verify &amp; activate account
          </Button>

          <p className="text-center font-montserrat text-[0.8rem] text-[#9E886A]">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-[#CE9F2D] underline-offset-4 transition hover:text-[#A26D27] hover:underline"
              onClick={() => {
                const email = watch("email");
                if (!email) return;
                run(dispatch, resendOtp({ email, purpose: "registration" }), "OTP resent");
              }}
            >
              Resend OTP
            </button>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
