import { zodResolver } from "@hookform/resolvers/zod";
import { Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { registerUserWithOtp, clearError } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { registerOtpSchema } from "../../validations/validationSchemas";

export default function RegisterOtpPage() {
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
  } = useForm({ resolver: zodResolver(registerOtpSchema) });

  const submit = async (values) => {
    const payload = {
      email: values.email,
      phone: values.phone,
      password: "Admin@123",
      role: "buyer",
      profile: { firstName: values.firstName, lastName: values.lastName },
      referralCode: values.referralCode || undefined,
    };
    await run(dispatch, registerUserWithOtp(payload), "OTP sent to your email");
    navigate(AUTH_ROUTES.verifyRegistration, {
      state: { email: values.email },
    });
  };

  return (
    <>
      <Seo title="Register with OTP | Sam Global" />
      <AuthCard
        eyebrow="New account"
        title="Create account with OTP"
        subtitle="No password needed — we'll verify your email with a one-time code."
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div>
            <h2 className="text-2xl font-bold text-[#2E2E2E]">
              Register with OTP
            </h2>
            <p className="mt-1 text-sm text-[#A6A6A6]">
              We'll send an OTP to your email to complete registration.
            </p>
          </div>

          <div className="grid gap-4  sm:grid-cols-2">
            <FormField
              placeholder="John Doe"
              id="firstName"
              label="First name"
              registration={register("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <FormField
              id="lastName"
              label="Last name"
              registration={register("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
              placeholder="Doe"
            />
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
            id="phone"
            label="Phone number"
            type="tel"
            registration={register("phone")}
            error={errors.phone}
            autoComplete="tel"
            placeholder="+91 98765 43210"
          />

          <FormField
            id="referralCode"
            label="Referral code"
            registration={register("referralCode")}
            error={errors.referralCode}
            placeholder="Optional"
          />

          {error && (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            <Smartphone size={18} /> Send OTP &amp; register
          </Button>

          <p className="text-center text-sm text-[#787878]">
            Already have an account?{" "}
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
          <p className="text-center text-sm text-[#787878]">
            Prefer password?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
            >
              Register with password
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
