import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import OtpInput from "../../components/ui/OtpInput";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { verifyRegistration, clearError, resendOtp } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  otp: z.string().trim().length(6, "Enter 6-digit OTP"),
});

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: location.state?.email || "" },
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
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div>
            <h2 className="text-2xl font-bold text-[#2E2E2E]">Verify your account</h2>
            <p className="mt-1 text-sm text-[#A6A6A6]">
              {location.state?.email
                ? `We sent an OTP to ${location.state.email}`
                : "Enter your email and the OTP we sent you."}
            </p>
          </div>

          <FormField
            id="email"
            label="Email address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />

          <label className="text-sm font-semibold text-[#2E2E2E]">OTP code</label>
          <input type="hidden" {...register("otp")} />
          <OtpInput
            value={watch("otp") || ""}
            onChange={(otp) => setValue("otp", otp, { shouldValidate: true })}
            error={errors.otp?.message}
          />

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            <CheckCircle size={18} /> Verify &amp; activate account
          </Button>

          <p className="text-center text-sm text-[#787878]">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
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
