import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock } from "lucide-react";
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
import {
  resetPassword,
  clearError,
  resendOtp,
} from "../../features/auth/authSlice";
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
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: location.state?.email || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = async (values) => {
    await run(
      dispatch,
      resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      }),
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
        icon="/image/png/person.png"
        maxWidth="max-w-[70rem]"
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

          <label className="text-sm font-semibold text-ink">OTP code</label>
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
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark text-label-md font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={18} /> Reset password
          </Button>

          <p className="text-center  text-[0.8rem] text-muted">
            Didn&apos;t receive the OTP?{" "}
            <button
              type="button"
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
              onClick={() => {
                const email = watch("email");
                if (!email) return;
                run(
                  dispatch,
                  resendOtp({ email, purpose: "forgot_password" }),
                  "OTP resent",
                );
              }}
            >
              Resend OTP
            </button>
          </p>

          <p className="text-center  text-[0.8rem] text-muted">
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Back to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
