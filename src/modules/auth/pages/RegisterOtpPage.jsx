import { Navigate } from "react-router-dom";
import { AUTH_ROUTES } from "../routes/apiRoutes";

export default function RegisterOtpPage() {
  return <Navigate to={AUTH_ROUTES.register} replace />;
}
