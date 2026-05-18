import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/ui/AuthCard";
import Seo from "../../components/common/Seo";
import { useToastThunk } from "../../hooks/useToastThunk";
import { registerUser } from "./authSlice";
import { AUTH_ROUTES } from "./authRoutes";
import BuyerRegisterForm from "./BuyerRegisterForm";

export default function BuyerRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const run = useToastThunk();

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

  return (
    <>
      <Seo
        title="Buyer registration | Sam Global"
        description="Create a Sam Global buyer account."
      />
      <AuthCard
        eyebrow="Buyer registration"
        title="Start shopping with a customer account."
        subtitle="Your role is locked to buyer on submit, so this form cannot accidentally create a seller or admin profile."
      >
        <BuyerRegisterForm
          error={auth.error}
          loading={auth.loading}
          onSubmit={registerBuyer}
        />
      </AuthCard>
    </>
  );
}
