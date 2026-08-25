import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import { registerUserWithOtp, clearError } from "../slices/authSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { registerOtpSchema } from "../../../validations/validationSchemas";

export default function useRegisterOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerOtpSchema),
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

  const submit = async (values) => {
    const payload = {
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: "buyer",
      profile: { firstName: values.firstName, lastName: values.lastName },
      referralCode: values.referralCode || undefined,
    };
    await run(dispatch, registerUserWithOtp(payload), "OTP sent to your email");
    navigate(AUTH_ROUTES.verifyRegistration, {
      state: { email: values.email },
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    isValid,
    loading,
    error,
    submit
  };
}
