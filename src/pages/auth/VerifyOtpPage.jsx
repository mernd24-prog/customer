import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
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
import { verifyOtp, clearError, resendOtp, sendOtp } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { verifyOtpSchema } from "../../validations/validationSchemas";



export default function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);
  const from = location.state?.from || AUTH_ROUTES.home;

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
    await run(dispatch, verifyOtp({ email: values.email, otp: values.otp, purpose: "login" }), "Logged in successfully!");
    navigate(from, { replace: true });
  };

  return (
    <>
      <Seo title="Verify OTP | Sam Global" />
      <AuthCard
        eyebrow="OTP login"
        title="Verify your identity"
        subtitle="Enter the OTP sent to your email to sign in to your account."
        icon={<ShieldCheck size={28} />}
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

          <div className="flex justify-end">
            <button
              type="button"
              className=" text-sm font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
              onClick={() => {
                const email = watch("email");
                if (!email) return;
                run(dispatch, sendOtp({ email, purpose: "login" }), "OTP sent");
              }}
            >
              Send OTP
            </button>
          </div>

          <label className=" text-sm font-semibold text-ink">OTP code</label>
          <input type="hidden" {...register("otp")} />
          <OtpInput
            value={watch("otp") || ""}
            onChange={(otp) => setValue("otp", otp, { shouldValidate: true, shouldDirty: true })}
            error={errors.otp?.message}
          />

          {error && (
            <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark  text-[0.9rem] font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isValid || loading}>
            <ShieldCheck size={18} /> Verify &amp; sign in
          </Button>

          <p className="text-center  text-[0.8rem] text-muted">
            <Link to={AUTH_ROUTES.login} className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline">
              Back to login
            </Link>
          </p>
          <p className="text-center  text-[0.8rem] text-muted">
            Didn&apos;t get OTP?{" "}
            <button
              type="button"
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
              onClick={() => {
                const email = watch("email");
                if (!email) return;
                run(dispatch, resendOtp({ email, purpose: "login" }), "OTP resent");
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
