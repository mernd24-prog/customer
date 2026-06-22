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
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const submit = async (values) => {
    await run(
      dispatch,
      forgotPassword({ email: values.email }),
      "OTP sent to your email",
    );
    navigate(AUTH_ROUTES.resetPassword, { state: { email: values.email } });
  };

  return (
    <>
      <Seo title="Forgot Password | Sam Global" />
      <AuthCard
        title="Password Recovery"
        subtitle="Enter your email to recover your password."
        image="/image/png/authImage.png"
        icon="/image/png/done.png"
        maxWidth="max-w-[60rem]"
        maxHeight="h-[600px]"
      >
        <form className="grid gap-4" onSubmit={handleSubmit(submit)} noValidate>
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
            <Mail size={18} /> Send reset OTP
          </Button>

          <p className="text-center  text-[0.8rem] text-muted">
            Remember your password?{" "}
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
