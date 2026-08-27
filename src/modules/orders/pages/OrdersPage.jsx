import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Seo from "../../../components/ui/Seo";
import OrderDetailPage from "./OrderDetailPage";
import OrderListPage from "./OrderListPage";
import { decodeRouteToken, getOpaqueOrderPath } from "../../../utils/routeTokens";

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId, orderToken } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tokenPayload = decodeRouteToken(orderToken, "order");
  const resolvedOrderId = tokenPayload?.id || orderId;

  useEffect(() => {
    if (!orderId || !resolvedOrderId) return;
    navigate(getOpaqueOrderPath(resolvedOrderId, { track, query: location.search }), {
      replace: true,
    });
  }, [location.search, navigate, orderId, resolvedOrderId, track]);
  
  if (detail || track) {
    return (
      <>
        <Seo 
          title="Order Details - Sam Global"
          metaDescription="View your order details and track its status." 
        />
        <OrderDetailPage orderId={resolvedOrderId} track={track} />
      </>
    );
  }
  
  return (
    <>
      <Seo 
        title="My Orders - Sam Global" 
        metaDescription="View and manage all your past and current orders." 
      />
      <OrderListPage />
    </>
  );
}
