import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { forgotPassword, clearError } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { forgotPasswordSchema } from "../../validations/validationSchemas";

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const submit = async (values) => {
    await run(dispatch, forgotPassword({ email: values.email }), "OTP sent to your email");
    navigate(AUTH_ROUTES.resetPassword, { state: { email: values.email } });
  };

  return (
    <>
      <Seo title="Forgot Password | Sam Global" />
      <AuthCard
        eyebrow="Password recovery"
        title="Forgot your password?"
        subtitle="Enter your registered email and we'll send you a one-time password to reset your account."
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div>
            <h2 className="text-2xl font-bold text-[#2E2E2E]">Reset your password</h2>
            <p className="mt-1 text-sm text-[#A6A6A6]">We'll send an OTP to your email address.</p>
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

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            <Mail size={18} /> Send reset OTP
          </Button>

          <p className="text-center text-sm text-[#787878]">
            Remember your password?{" "}
            <Link to={AUTH_ROUTES.login} className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
