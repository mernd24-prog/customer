import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { resetPassword, clearError } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";

const schema = z
  .object({
    email: z.string().trim().email("Enter a valid email address"),
    otp: z.string().trim().min(4, "Enter the OTP sent to your email"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
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
            <h2 className="text-2xl font-bold text-slate-950">Set new password</h2>
            <p className="mt-1 text-sm text-slate-500">Check your email for the OTP code.</p>
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

          <FormField
            id="otp"
            label="OTP code"
            registration={register("otp")}
            error={errors.otp}
            autoComplete="one-time-code"
            placeholder="Enter OTP"
            inputMode="numeric"
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

          <p className="text-center text-sm text-slate-600">
            <Link to={AUTH_ROUTES.forgotPassword} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
              Resend OTP
            </Link>
            {" · "}
            <Link to={AUTH_ROUTES.login} className="text-slate-600 underline-offset-4 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
