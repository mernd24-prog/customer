import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import {
  resetPassword,
  clearError,
  resendOtp,
} from "../slices/authSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { resetSchema } from "../../../validations/validationSchemas";

export default function useResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);

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
    resolver: zodResolver(resetSchema),
    mode: "onChange",
    defaultValues: {
      email: location.state?.email || "",
      otp: "",
      newPassword: "",
    },
  });

  const submit = useCallback(async (values) => {
    try {
      const response = await run(
        dispatch,
        resetPassword({
          email: values.email,
          otp: values.otp,
          newPassword: values.newPassword,
        }),
        "Password reset successfully",
      );

      window.setTimeout(() => {
        navigate(AUTH_ROUTES.login, { state: { email: values.email } });
      }, 1500);
    } catch (requestError) {
      // Errors handled by thunk/toast
    }
  }, [dispatch, run, navigate]);

  const handleResendOtp = useCallback(() => {
    const email = watch("email");
    if (!email) return;
    run(
      dispatch,
      resendOtp({ email, purpose: "forgot_password" }),
      "OTP resent",
    );
  }, [watch, dispatch, run]);

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isValid,
    loading,
    error,
    submit,
    handleResendOtp
  };
}
