import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import {
  verifyRegistration,
  clearError,
  resendOtp,
} from "../slices/authSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { verifyOtpSchema } from "../../../validations/validationSchemas";
import { registrationOtpMessage } from "../utils/registrationOtp";
import { notify } from "../../../utils/notify";

export default function useVerifyRegistration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [deliveryMessage, setDeliveryMessage] = useState(
    location.state?.deliveryMessage || registrationOtpMessage(),
  );
  const run = useToastThunk();
  const { error } = useSelector((s) => s.auth);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const loading = verifying || resending;

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
    if (loading) return;
    setVerifying(true);
    try {
      await run(
        dispatch,
        verifyRegistration({ email: values.email, otp: values.otp }),
        "Account verified! Welcome.",
      );
      navigate(AUTH_ROUTES.home);
    } catch {
      // The thunk and toast expose the error; keep the form available for retry.
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    const email = watch("email");
    if (!email || loading) return;
    setResending(true);
    try {
      const result = await run(
        dispatch,
        resendOtp({ email, purpose: "registration" }),
      );
      const message = registrationOtpMessage(result);
      setDeliveryMessage(message);
      notify.success(message);
    } catch {
      // Keep resend available after a rejected request.
    } finally {
      setResending(false);
    }
  };

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isValid,
    loading,
    verifying,
    resending,
    error,
    submit,
    deliveryMessage,
    registrationEmail: location.state?.email,
    handleResendOtp
  };
}
