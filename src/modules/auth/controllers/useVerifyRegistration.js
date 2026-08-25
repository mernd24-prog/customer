import { useEffect } from "react";
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

export default function useVerifyRegistration() {
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
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: { email: location.state?.email || "", otp: "" },
  });

  const submit = async (values) => {
    await run(
      dispatch,
      verifyRegistration({ email: values.email, otp: values.otp }),
      "Account verified! Welcome.",
    );
    navigate(AUTH_ROUTES.home);
  };

  const handleResendOtp = () => {
    const email = watch("email");
    if (!email) return;
    run(
      dispatch,
      resendOtp({ email, purpose: "registration" }),
      "OTP resent",
    );
  };

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
