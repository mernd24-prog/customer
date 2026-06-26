import { zodResolver } from "@hookform/resolvers/zod";
import { Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

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
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerOtpSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });

  const submit = async (values) => {
    const payload = {
      email: values.email,
      phone: values.phone,
      password: values.password,
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
        title="Create account with OTP"
        subtitle="Create your password now, then verify your email with a one-time code."
        image="/image/png/authImg1.png"
        icon="/image/png/person.png"
        maxWidth="max-w-[1000px]"
        maxHeight="h-[780px]"
      >
        <form
          className="grid gap-3 sm:gap-5"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              placeholder="Enter first name"
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
              placeholder="Enter last name"
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
            placeholder="Enter phone number"
          />

          <FormField
            id="referralCode"
            label="Referral code"
            registration={register("referralCode")}
            error={errors.referralCode}
            placeholder="Optional"
          />

          {/* PASSWORD & CONFIRM PASSWORD FIELDS using FormField */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="password"
              label="Password"
              type="password"
              registration={register("password")}
              error={errors.password}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
            />

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isValid || loading}
          >
            <Smartphone size={18} /> Send OTP &amp; register
          </Button>

          <p className="text-center text-caption-md text-muted">
            Already have an account?{" "}
            <Link
              to={AUTH_ROUTES.login}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Login
            </Link>
          </p>

          <p className="text-center text-[0.8rem] text-muted">
            Prefer password?{" "}
            <Link
              to={AUTH_ROUTES.register}
              className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
            >
              Register with password
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
