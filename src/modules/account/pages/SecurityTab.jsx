import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../../components/ui/OtpInput";
import { notify } from "../../../utils/notify";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/buttons/Button";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { changePassword, logout } from "../../../modules/auth/slices/authSlice";
import { AUTH_ROUTES } from "../../../modules/auth/routes/apiRoutes";
import { securitySchema } from "../../../validations/validationSchemas";

export default function SecurityTab() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const { loading } = useSelector((s) => s.auth);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(securitySchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const submit = async (values, requestOtp = false) => {
    const result = await run(
      dispatch,
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        ...(otpRequired && !requestOtp ? { otp } : {}),
      }),
    );
    const data = result?.data || result;
    if (data.otpRequired) {
      const message = data.deliveryMode === "static"
        ? `Testing mode: ${data.otp ? `enter OTP ${data.otp}` : "enter the configured test OTP"} to update your password.`
        : data.deliveryMode === "fallback_email"
          ? "Mobile OTP delivery failed. Enter the OTP sent to your email to update your password."
          : data.deliveryMode === "third_party_sms"
            ? "Enter the OTP sent to your mobile to update your password."
            : "Enter the OTP sent to your email to update your password.";
      setOtpRequired(true);
      setOtp("");
      setDeliveryMessage(message);
      notify.success(message);
      return;
    }
    notify.success("Password changed successfully. Please sign in with your new password.");
    setOtpRequired(false);
    setOtp("");
    setDeliveryMessage("");
    reset();
    dispatch(logout());
    navigate(AUTH_ROUTES.login, { replace: true });
  };

  return (
    <form className="security-password-form grid gap-4" onSubmit={handleSubmit((values) => submit(values))} noValidate>
      <div className="rounded-[8px] border border-gold-soft bg-gold-soft px-4 py-3  text-sm text-gold-dark">
        Choose a strong password with at least 8 characters, including numbers
        and symbols.
        {" "}OTP verification is required. OTP goes to your mobile first, then email if mobile delivery fails.
      </div>

      <FormField
        id="currentPassword"
        label="Current Password"
        type="password"
        registration={register("currentPassword")}
        error={errors.currentPassword}
        autoComplete="current-password"
        placeholder="••••••••"
        readOnly={otpRequired}
        disabled={loading}
      />

      <FormField
        id="newPassword"
        label="New Password"
        type="password"
        registration={register("newPassword")}
        error={errors.newPassword}
        autoComplete="new-password"
        placeholder="••••••••"
        readOnly={otpRequired}
        disabled={loading}
      />

      <FormField
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword}
        autoComplete="new-password"
        placeholder="••••••••"
        readOnly={otpRequired}
        disabled={loading}
      />

      {otpRequired && (
        <section aria-label="Password verification" className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark"><ShieldCheck size={20} /></span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">Verify your password change</h3>
              <p role="status" aria-live="polite" className="mt-1 text-sm leading-relaxed text-muted">{deliveryMessage}</p>
            </div>
          </div>
          <div className="mx-auto my-5 w-full max-w-[320px]">
            <p className="mb-2 text-center text-xs font-medium text-muted">Enter the 6-digit verification code</p>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <button type="button" disabled={loading} className="text-sm text-muted underline-offset-4 hover:underline disabled:opacity-50" onClick={() => { setOtpRequired(false); setOtp(""); setDeliveryMessage(""); }}>Edit password details</button>
            <button type="button" disabled={loading} className="text-sm font-semibold text-gold-dark underline-offset-4 hover:underline disabled:opacity-50" onClick={handleSubmit((values) => submit(values, true))}>Resend OTP</button>
          </div>
        </section>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full sm:w-auto font-semibold text-white"
        size="lg"
        disabled={loading || (otpRequired && !/^\d{6}$/.test(otp))}
      >
        <KeyRound size={16} /> {otpRequired ? "Verify OTP & Change Password" : "Send OTP"}
      </Button>
    </form>
  );
}
