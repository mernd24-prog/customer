import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { registerUser, clearError } from "../slices/authSlice";
import { AUTH_ROUTES } from "../routes/apiRoutes";
import { registrationOtpMessage } from "../utils/registrationOtp";
import { notify } from "../../../utils/notify";

export default function useBuyerRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const run = useToastThunk();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const registerBuyer = async (payload) => {
    const result = await run(
      dispatch,
      registerUser(payload),
    );
    const deliveryMessage = registrationOtpMessage(result);
    notify.success(deliveryMessage);
    navigate(AUTH_ROUTES.verifyRegistration, {
      state: { email: payload.email, phone: payload.phone, deliveryMode: (result?.data || result)?.deliveryMode, deliveryMessage },
    });
  };

  return {
    error: auth.error,
    loading: auth.loading,
    registerBuyer
  };
}
