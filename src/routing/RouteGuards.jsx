import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRole, isSellerRole } from "../utils/roles";

export function ProtectedRoute() {
  const user = useSelector((state) => state.auth.current);
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function BuyerOnlyRoute() {
  const role = getRole(useSelector((state) => state.auth.current));
  return isSellerRole(role) ? <Navigate to="/seller/status" replace /> : <Outlet />;
}

export function SellerOnlyRoute() {
  const role = getRole(useSelector((state) => state.auth.current));
  return isSellerRole(role) ? <Outlet /> : <Navigate to="/" replace />;
}
