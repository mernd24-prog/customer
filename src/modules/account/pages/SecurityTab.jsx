
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import OtpInput from "../../../components/ui/OtpInput";
import { notify } from "../../../utils/notify";
import FormField from "../../../components/ui/FormField";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { AccountTabHeader, AccountFormActions } from "../components";

import {
  changePassword,
  logout,
} from "../../../modules/auth/slices/authSlice";

import { AUTH_ROUTES } from "../../../modules/auth/routes/apiRoutes";
import { securitySchema } from "../../../validations/validationSchemas";


import DynamicButton from "../../../components/ui/button/button.jsx";
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

  const closeOtpModal = () => {
    if (loading) return;

    setOtpRequired(false);
    setOtp("");
    setDeliveryMessage("");
  };

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

    if (data?.otpRequired) {
      const message =
        data.deliveryMode === "static"
          ? `Testing mode: ${
              data.otp
                ? `enter OTP ${data.otp}`
                : "enter the configured test OTP"
            } to update your password.`
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

    notify.success(
      "Password changed successfully. Please sign in with your new password.",
    );

    setOtpRequired(false);
    setOtp("");
    setDeliveryMessage("");

    reset();
    dispatch(logout());

    navigate(AUTH_ROUTES.login, { replace: true });
  };

  return (
    <>
      {/* Password Form */}
      <form
        className="security-password-form grid gap-4"
        onSubmit={handleSubmit((values) => submit(values))}
        noValidate
      >
        <AccountTabHeader
          icon={UserRound}
          title="Security"
          description="Manage your password and security settings."
        />

        <FormField
          id="currentPassword"
          label="Current Password (if already set)"
          type="password"
          registration={register("currentPassword")}
          error={errors.currentPassword}
          autoComplete="current-password"
          placeholder="••••••••"
          readOnly={otpRequired}
          disabled={loading}
        />

        <p className="text-xs text-[#64708A]">
          If you signed up using OTP and have not set a password, leave the
          current password empty.
        </p>

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

        <AccountFormActions
          submitLabel="Send OTP"
          submitIcon={<Mail size={16} />}
          loading={loading}
          disabled={loading || otpRequired}
        />
      </form>

      {/* OTP Verification Modal */}
      <ConfirmModal
        open={otpRequired}
        title="Verify Password"
        icon={ShieldCheck}
        iconBgClassName = "bg-[#F5E9C9]"
        iconClassName="text-blue-600"
        iconSize={22}
        description={deliveryMessage}
        confirmLabel="Verify"
        cancelLabel="Edit"
        confirmDisabled={loading || !/^\d{6}$/.test(otp)}
        onConfirm={handleSubmit((values) => submit(values))}
        onCancel={closeOtpModal}
        maxWidth="max-w-[440px]"
        >
          <div className="space-y-4">
            <div className="text-center">
              <p className="mb-3 text-sm font-semibold text-[#2D2D2D]">
                Enter the 6-digit verification code
              </p>

              <div className="mx-auto w-full max-w-[320px]">
                <OtpInput value={otp} onChange={setOtp} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#F0E6D2] pt-3">
              <DynamicButton
                variant="link"
                disabled={loading}
                onClick={closeOtpModal}
                className="text-sm font-medium text-[#64708A] underline-offset-4 hover:text-[#1B1D60] hover:underline disabled:opacity-50"
              >
                Edit password details
              </DynamicButton>

              <DynamicButton
                variant="link"
                disabled={loading}
                onClick={handleSubmit((values) => submit(values, true))}
                className="text-sm font-semibold text-[#1B1D60] underline-offset-4 hover:underline disabled:opacity-50"
              >
                Resend OTP
              </DynamicButton>
            </div>
        </div>
      </ConfirmModal>
    </>
  );
}
