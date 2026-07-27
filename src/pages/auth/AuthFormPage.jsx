import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import Seo from "../../components/common/Seo";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  verifyOtp,
  verifyRegistration,
  registerUserWithOtp,
  socialLogin,
} from "../../features/auth/authSlice";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { notify } from "../../utils/notify";
import {
  loginSchema,
  emailSchema,
  otpSchema,
  resetSchema,
  registerSchema,
} from "../../validations/validationSchemas";

export function AuthFormPage({ mode }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const run = useToastThunk();
  const [showPassword, setShowPassword] = useState(false);

  const schema =
    mode === "register" || mode === "register-otp"
      ? registerSchema
      : mode === "reset"
        ? resetSchema
        : mode === "forgot"
          ? emailSchema
          : mode === "verify-registration" || mode === "verify-otp"
            ? otpSchema
            : loginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: location.state?.email || "",
    },
  });

  const title = {
    login: "Login",
    register: "Create account",
    "register-otp": "Register with OTP",
    "verify-registration": "Verify registration",
    "verify-otp": "Verify OTP",
    forgot: "Forgot password",
    reset: "Reset password",
  }[mode];

  const submit = async (values) => {
    const payload = values.firstName
      ? {
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: "buyer",
          profile: { firstName: values.firstName, lastName: values.lastName },
          referralCode: values.referralCode || undefined,
        }
      : values;

    const thunk =
      mode === "register"
        ? registerUser(payload)
        : mode === "register-otp"
          ? registerUserWithOtp(payload)
          : mode === "forgot"
            ? forgotPassword(values)
            : mode === "reset"
              ? resetPassword(values)
              : mode === "verify-registration"
                ? verifyRegistration(values)
                : mode === "verify-otp"
                  ? verifyOtp({ ...values, purpose: "login" })
                  : loginUser({
                      email: values.email,
                      password: values.password,
                    });

    const result = await run(dispatch, thunk, "Success");
    const session = result?.data || result || {};
    const hasSession = Boolean(session?.accessToken || session?.refreshToken);

    if (
      mode === "login" ||
      mode === "verify-registration" ||
      mode === "verify-otp"
    ) {
      navigate(AUTH_ROUTES.home);
      return;
    }

    if (mode === "register" || mode === "register-otp") {
      if (hasSession) {
        navigate(AUTH_ROUTES.home);
        return;
      }
      navigate(AUTH_ROUTES.verifyRegistration, {
        state: { email: values.email },
      });
      return;
    }

    if (mode === "forgot") {
      navigate(AUTH_ROUTES.resetPassword, { state: { email: values.email } });
      return;
    }

    if (mode === "reset") {
      navigate(AUTH_ROUTES.login);
    }
  };

  return (
    <section className="narrow">
      <Seo title={`${title} | Sam Global`} />
      <form
        className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10"
        onSubmit={handleSubmit(submit)}
      >
        <h1>{title}</h1>
        {(mode === "register" || mode === "register-otp") && (
          <>
            <input placeholder="First Name" {...register("firstName")} />
            <small>{errors.firstName?.message}</small>
            <input placeholder="Last Name" {...register("lastName")} />
            <small>{errors.lastName?.message}</small>
            {(() => {
              const { onChange, ...rest } = register("phone");
              return (
                <input
                  placeholder="Enter Phone Number"
                  maxLength={10}
                  {...rest}
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    onChange(e);
                  }}
                />
              );
            })()}
            <small>{errors.phone?.message}</small>
          </>
        )}
        <input placeholder="Email" {...register("email")} />
        <small>{errors.email?.message}</small>
        {(mode === "login" ||
          mode === "register" ||
          mode === "register-otp") && (
          <>
            <span className="relative block">
              <input
                className="w-full pr-10"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <small>{errors.password?.message}</small>
          </>
        )}
        {(mode === "verify-registration" ||
          mode === "verify-otp" ||
          mode === "reset") && (
          <>
            <input placeholder="Otp" {...register("otp")} />
            <small>{errors.otp?.message}</small>
          </>
        )}
        {mode === "reset" && (
          <>
            <span className="relative block">
              <input
                className="w-full pr-10"
                placeholder="New Password"
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <small>{errors.newPassword?.message}</small>
          </>
        )}
        {(mode === "register" || mode === "register-otp") && (
          <input placeholder="Referral Code" {...register("referralCode")} />
        )}
        {mode === "login" && (
          <input
            placeholder="Google Id Token for Social Login"
            {...register("socialIdToken")}
          />
        )}
        {auth.error && <div className="state-box error">{auth.error}</div>}
        <button className="button" disabled={auth.loading}>
          {auth.loading ? "Please wait..." : title}
        </button>
        {mode === "login" && (
          <button
            className="button secondary"
            type="button"
            onClick={handleSubmit((values) =>
              values.socialIdToken
                ? run(
                    dispatch,
                    socialLogin({
                      provider: "google",
                      idToken: values.socialIdToken,
                      role: "buyer",
                    }),
                    "Social login complete",
                  )
                : notify.error({
                    title: "Missing token",
                    message: "Paste a provider ID token first",
                  }),
            )}
          >
            Continue with Google
          </button>
        )}
        {mode === "login" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.register}>
              Register
            </Link>
            <Link className="chip" to={AUTH_ROUTES.forgotPassword}>
              Forgot Password
            </Link>
          </div>
        )}
        {mode === "register-otp" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.register}>
              Register with Password
            </Link>
            <Link className="chip" to={AUTH_ROUTES.login}>
              Login
            </Link>
          </div>
        )}
        {mode === "verify-registration" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.register}>
              Back to Register
            </Link>
          </div>
        )}
        {mode === "forgot" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.login}>
              Back to Login
            </Link>
          </div>
        )}
        {mode === "reset" && (
          <div className="toolbar">
            <Link className="chip" to={AUTH_ROUTES.login}>
              Back to login
            </Link>
          </div>
        )}
      </form>
    </section>
  );
}
