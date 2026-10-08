import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import { registerUserWithOtp, clearError } from "../slices/authSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { registerOtpSchema } from "../../../validations/validationSchemas";
import { registrationOtpMessage } from "../utils/registrationOtp";
import { notify } from "../../../utils/notify";

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
    const result = await run(dispatch, registerUserWithOtp(payload));
    const deliveryMessage = registrationOtpMessage(result);
    notify.success(deliveryMessage);
    navigate(AUTH_ROUTES.verifyRegistration, {
      state: { email: values.email, phone: payload.phone, deliveryMode: (result?.data || result)?.deliveryMode, deliveryMessage },
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
