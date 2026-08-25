import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchOrderById } from "../../orders/slices/orderSlice";
import { fetchMe } from "../../../features/user/userSlice";
import {
  findFetchedOrder,
  getDeliveryDateRange,
  formatOrderDate,
} from "../../../utils/orderHelpers";

export default function usePaymentResult() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const [pageReady, setPageReady] = useState(false);

  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason") || "";

  const order = findFetchedOrder(orderState, orderId);
  const currentUser = userState.current || userState.data || {};
  const orderStatus = String(order?.status || order?.orderStatus || "").toLowerCase();
  const paymentStatus = String(
    order?.paymentStatus || order?.payment_status || "",
  ).toLowerCase();
  const isCod = String(
    order?.paymentProvider || order?.payment_provider || order?.paymentMethod || "",
  ).toLowerCase() === "cod";
  const isConfirmed = Boolean(order) &&
    (isCod ? paymentStatus === "authorized" : paymentStatus === "captured") &&
    !["pending_payment", "payment_failed"].includes(orderStatus);
  const isActuallyFailed = paymentStatus === "failed" || orderStatus === "payment_failed";
  const isPending = Boolean(orderId) && !isConfirmed && !isActuallyFailed;

  const deliveryDateRange = getDeliveryDateRange(order || {});
  const deliveryLabel = deliveryDateRange
    ? deliveryDateRange.minDate
      ? `${formatOrderDate(deliveryDateRange.minDate)} – ${formatOrderDate(deliveryDateRange.maxDate)}`
      : formatOrderDate(deliveryDateRange.maxDate)
    : "To be confirmed";

  useEffect(() => {
    if (orderId) {
      setPageReady(false);
      dispatch(fetchOrderById({ orderId })).finally(() => {
        setPageReady(true);
      });
    } else {
      setPageReady(true);
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId || !isPending) return undefined;
    const interval = window.setInterval(() => {
      dispatch(fetchOrderById({ orderId }));
    }, 3000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 30000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [dispatch, isPending, orderId]);

  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id && !userState.loading) {
      dispatch(fetchMe());
    }
  }, [currentUser?._id, currentUser?.id, dispatch, userState.loading]);

  const handleViewOrder = () => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId })).unwrap().finally(() => {
        navigate(`/orders/${encodeURIComponent(orderId)}`);
      });
    } else {
      navigate("/orders");
    }
  };

  return {
    orderId,
    reason,
    order,
    orderState,
    isConfirmed,
    isActuallyFailed,
    isPending,
    deliveryLabel,
    handleViewOrder,
    navigate
  };
}
