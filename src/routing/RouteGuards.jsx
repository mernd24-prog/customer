import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { tokenStorage } from "../api/tokenStorage";

export function ProtectedRoute() {
  const user = useSelector((state) => state.auth.current);
  const location = useLocation();
  const hasStoredSession = Boolean(
    tokenStorage.getAccessToken() || tokenStorage.getRefreshToken(),
  );

  return user || hasStoredSession ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}

export function GuestRoute() {
  const user = useSelector((state) => state.auth.current);
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export function BuyerOnlyRoute() {
  return <Outlet />;
}
