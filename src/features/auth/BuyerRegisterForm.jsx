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
    <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Create buyer account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Use this account for shopping, checkout, orders, returns, and customer
          services.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-3">
        <FormField
          id="firstName"
          label="First name*"
          registration={register("firstName")}
          error={errors.firstName}
          autoComplete="given-name"
          placeholder="John"
        />
        <FormField
          id="lastName"
          label="Last name*"
          registration={register("lastName")}
          error={errors.lastName}
          autoComplete="family-name"
          placeholder="Doe"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="email"
          label="Email*"
          type="email"
          registration={register("email")}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          id="phone"
          label="Phone*"
          registration={register("phone")}
          error={errors.phone}
          autoComplete="tel"
          placeholder="+91 98765 43210"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="password"
          label="Password*"
          type="password"
          registration={register("password")}
          error={errors.password}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <FormField
          id="confirmPassword"
          label="Confirm password*"
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
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <Button className="w-full" loading={loading} type="submit">
        <UserPlus size={18} /> Register as buyer
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
          to={AUTH_ROUTES.login}
        >
          Login
        </Link>
      </p>
      <p className="text-center text-sm text-slate-600">
        Prefer OTP registration?{" "}
        <Link
          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
          to={AUTH_ROUTES.registerOtp}
        >
          Continue with OTP
        </Link>
      </p>
    </form>
  );
}
