import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export function ProtectedRoute() {
  const user = useSelector((state) => state.auth.current);
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function GuestRoute() {
  const user = useSelector((state) => state.auth.current);
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export function BuyerOnlyRoute() {
  return <Outlet />;
}
