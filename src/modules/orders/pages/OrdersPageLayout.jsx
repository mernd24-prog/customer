import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Seo from "../../../components/ui/Seo";
import OrderDetailPage from "./OrderDetailPage";
import OrderListPage from "./OrderListPage";
import { decodeRouteToken, getOpaqueOrderPath } from "../../../utils/routeTokens";
import { RETURNS_ROUTES } from "../../returns/routes/apiRoutes";

/**
 * Wrapper/layout page – decides whether to show Order List or Order Detail.
 * Actual order listing lives in OrderListPage.jsx.
 */
export default function OrdersPageLayout({ detail = false, track = false, returnOnly = false }) {
  const { orderId, orderToken } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tokenPayload = decodeRouteToken(orderToken, "order");
  const resolvedOrderId = tokenPayload?.id || orderId;

  const isReturnOnly = Boolean(
    returnOnly ||
    location.pathname === "/returns-refunds" ||
    location.pathname === RETURNS_ROUTES?.returnsRefunds,
  );

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
        title={isReturnOnly ? "Return & Refund - Sam Global" : "My Orders - Sam Global"} 
        metaDescription={
          isReturnOnly
            ? "View and track all your return and refund requests."
            : "View and manage all your past and current orders."
        } 
      />
      <OrderListPage returnOnly={isReturnOnly} />
    </>
  );
}
