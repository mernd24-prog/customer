import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import OtpInput from "../../components/ui/OtpInput";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { resetPassword, clearError, resendOtp } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { resetPasswordSchema } from "../../validations/validationSchemas";

export default function ResetPasswordPage() {
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
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: location.state?.email || "" },
  });

  const submit = async (values) => {
    await run(
      dispatch,
      resetPassword({ email: values.email, otp: values.otp, newPassword: values.newPassword }),
      "Password reset successfully",
    );
    navigate(AUTH_ROUTES.login, { state: { email: values.email } });
  };

  return (
    <>
      <Seo title="Reset Password | Sam Global" />
      <AuthCard
        eyebrow="Password recovery"
        title="Create a new password"
        subtitle="Enter the OTP we sent to your email along with your new password."
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div>
            <h2 className="text-2xl font-bold text-[#2E2E2E]">Set new password</h2>
            <p className="mt-1 text-sm text-[#A6A6A6]">Check your email for the OTP code.</p>
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

          <FormField
            id="newPassword"
            label="New password"
            type="password"
            registration={register("newPassword")}
            error={errors.newPassword}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <FormField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            <KeyRound size={18} /> Reset password
          </Button>

          <p className="text-center text-sm text-[#787878]">
            <button
              type="button"
              className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
              onClick={() => {
                const email = watch("email");
                if (!email) return;
                run(dispatch, resendOtp({ email, purpose: "forgot_password" }), "OTP resent");
              }}
            >
              Resend OTP
            </button>
            {" · "}
            <Link to={AUTH_ROUTES.login} className="text-[#787878] underline-offset-4 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
