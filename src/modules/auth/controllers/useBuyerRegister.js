import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { registerUser, clearError } from "../slices/authSlice";
import { AUTH_ROUTES } from "../routes/apiRoutes";

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
      "Buyer account created",
    );
    const session = result?.data || result || {};
    const hasSession = Boolean(session?.accessToken || session?.refreshToken);
    if (hasSession) {
      navigate(AUTH_ROUTES.home);
      return;
    }
    navigate(AUTH_ROUTES.verifyRegistration, {
      state: { email: payload.email },
    });
  };

  return {
    error: auth.error,
    loading: auth.loading,
    registerBuyer
  };
}
