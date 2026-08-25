import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";

import { AUTH_ROUTES } from "../routes/apiRoutes";
import { forgotPassword, clearError } from "../slices/authSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { forgotPasswordSchema } from "../../../validations/validationSchemas";

export default function useForgotPassword() {
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
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const submit = async (values) => {
    await run(
      dispatch,
      forgotPassword({ email: values.email }),
      "OTP sent to your email",
    );
    navigate(AUTH_ROUTES.resetPassword, { state: { email: values.email } });
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
