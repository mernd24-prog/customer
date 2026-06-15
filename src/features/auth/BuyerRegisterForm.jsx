import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PhoneField from "../../components/ui/PhoneField";
import { fetchCountries } from "../global/globalSlice";
import { AUTH_ROUTES } from "./authRoutes";
import { buildBuyerRegistrationPayload } from "./buildBuyerRegistrationPayload";
import { buyerRegisterSchema } from "./validation";

async function fetchFullList(dispatch, thunkAction, params = {}) {
  const res = await dispatch(thunkAction({ params })).unwrap();
  const total = res.meta?.total || 20;
  const limit = res.meta?.limit || 20;
  if (total > limit) {
    const allRes = await dispatch(
      thunkAction({ params: { ...params, limit: total } }),
    ).unwrap();
    return allRes.data || allRes.list || allRes || [];
  }
  return res.data || res.list || res || [];
}

export default function BuyerRegisterForm({ error, loading, onSubmit }) {
  const dispatch = useDispatch();
  const [countries, setCountries] = useState([]);
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

  useEffect(() => {
    fetchFullList(dispatch, fetchCountries)
      .then((list) => {
        setCountries(list);
      })
      .catch((err) => console.error("Error fetching countries:", err));
  }, [dispatch]);

  const submit = (values) => onSubmit(buildBuyerRegistrationPayload(values));

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
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
        <PhoneField
          id="phone"
          label="Phone"
          countries={countries}
          phoneRegistration={register("phone")}
          dialCodeRegistration={register("dialCode")}
          error={errors.phone || errors.dialCode}
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
          className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3  text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <Button
        className="h-12 w-full rounded-[8px] bg-gradient-to-r from-gold to-gold-dark  font-semibold tracking-normal text-white shadow-sm transition-all duration-500 ease-in-out hover:brightness-105 hover:shadow-md active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        loading={loading}
        size="lg"
        type="submit"
      >
        <UserPlus size={18} /> Register as buyer
      </Button>

      <p className="text-center  text-[0.8rem] text-muted">
        Already have an account?{" "}
        <Link
          className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
          to={AUTH_ROUTES.login}
        >
          Login
        </Link>
      </p>
      <p className="text-center  text-[0.8rem] text-muted">
        Prefer OTP registration?{" "}
        <Link
          className="font-semibold text-gold underline-offset-4 transition-all duration-500 ease-in-out hover:text-gold-dark hover:underline"
          to={AUTH_ROUTES.registerOtp}
        >
          Continue with OTP
        </Link>
      </p>
    </form>
  );
}
