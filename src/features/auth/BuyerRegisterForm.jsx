import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { AUTH_ROUTES } from "./authRoutes";
import { buildBuyerRegistrationPayload } from "./buildBuyerRegistrationPayload";
import { buyerRegisterSchema } from "./validation";

export default function BuyerRegisterForm({ error, loading, onSubmit }) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    resolver: zodResolver(buyerRegisterSchema),
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

  const submit = (values) => onSubmit(buildBuyerRegistrationPayload(values));

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="First name"
          registration={register("firstName")}
          error={errors.firstName}
          autoComplete="given-name"
          placeholder="Enter first name"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="email"
          label="Email"
          type="email"
          registration={register("email")}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          id="phone"
          label="Phone"
          registration={register("phone")}
          error={errors.phone}
          autoComplete="tel"
          placeholder="Enter phone number"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="password"
          label="Password"
          type="password"
          registration={register("password")}
          error={errors.password}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </div>

      <FormField
        id="referralCode"
        label="Referral code"
        registration={register("referralCode")}
        error={errors.referralCode}
      />

      {error && (
        <div
          className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 font-montserrat text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <Button
        className="h-12 w-full rounded-[8px] bg-gradient-to-r from-[#CE9F2D] to-[#A26D27] font-montserrat text-[0.9rem] font-semibold tracking-wide text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        loading={loading}
        type="submit"
      >
        <UserPlus size={18} /> Register as buyer
      </Button>

      <p className="text-center font-montserrat text-[0.8rem] text-[#9E886A]">
        Already have an account?{" "}
        <Link
          className="font-semibold text-[#CE9F2D] underline-offset-4 transition-all duration-500 ease-in-out hover:text-[#A26D27] hover:underline"
          to={AUTH_ROUTES.login}
        >
          Login
        </Link>
      </p>
      <p className="text-center font-montserrat text-[0.8rem] text-[#9E886A]">
        Prefer OTP registration?{" "}
        <Link
          className="font-semibold text-[#CE9F2D] underline-offset-4 transition-all duration-500 ease-in-out hover:text-[#A26D27] hover:underline"
          to={AUTH_ROUTES.registerOtp}
        >
          Continue with OTP
        </Link>
      </p>
    </form>
  );
}
