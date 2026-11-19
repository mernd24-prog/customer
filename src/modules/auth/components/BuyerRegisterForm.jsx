import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import FormField from "../../../components/ui/FormField";
import PhoneField from "../../../components/ui/PhoneField";
import { AUTH_ROUTES } from "../routes/apiRoutes";
import { buildBuyerRegistrationPayload } from "../utils/buildBuyerRegistrationPayload";
import { buyerRegisterSchema } from "../../../validations/schemas/authSchemas";
import { PillButton } from "../../../components/ui/button/buttonSpecialized";

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
      dialCode: "+91",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });

  const submit = (values) => onSubmit(buildBuyerRegistrationPayload(values));

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
      <div className="rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-xs leading-5 text-[#4B5265]">
        Complete all details below. We will send the registration OTP to the
        delivery destination shown on the next screen.
      </div>

      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 items-start gap-x-3 gap-y-2 sm:grid-cols-2">
        <div className="min-w-0">
          <FormField
            id="firstName"
            label="First Name"
            registration={register("firstName")}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="Enter First Name"
            required
          />
        </div>

        <div className="min-w-0">
          <FormField
            id="lastName"
            label="Last Name"
            registration={register("lastName")}
            error={errors.lastName}
            autoComplete="family-name"
            placeholder="Enter Last Name"
            required
          />
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 items-start gap-x-3 gap-y-2 sm:grid-cols-2">
        <div className="min-w-0">
          <FormField
            id="email"
            label="Email"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="min-w-0">
          <PhoneField
            id="phone"
            label="Phone"
            phoneRegistration={register("phone")}
            dialCodeRegistration={register("dialCode")}
            error={errors.phone || errors.dialCode}
            autoComplete="tel"
            placeholder="Enter Phone Number"
            required
          />
        </div>
      </div>

      {/* Password and Confirm Password */}
      <div className="grid grid-cols-1 items-start gap-x-3 gap-y-2 sm:grid-cols-2">
        <div className="min-w-0">
          <FormField
            id="password"
            label="Password"
            type="password"
            registration={register("password")}
            error={errors.password}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="min-w-0">
          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <PillButton
        className="w-full"
        isLoading={loading}
        size="md"
        type="submit"
        leftIcon={<UserPlus />}
      >
        Create Account &amp; Send OTP
      </PillButton>

      <p className="text-center text-[0.8rem] text-muted">
        Already Have an Account?{" "}
        <Link
          className="font-semibold text-gold underline-offset-4 transition-colors duration-300 hover:text-gold-dark hover:underline"
          to={AUTH_ROUTES.login}
        >
          Login
        </Link>
      </p>
    </form>
  );
}