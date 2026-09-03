import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../slices/orderSlice";
import { ORDER_FILTERS } from "../../../data/orderPage";
import {
  getOrderCollection,
  getOrderId,
  getApiOrderId,
  formatOrderId,
  getOrderItems,
  getOrderStatus,
  resolveOrderItemDisplayStatus,
  getProductTitle,
  normalizeOrderSearchText,
} from "../../../utils/pages/orderUtils";
import { getPagination } from "../../../utils/filterUtils";

export function useOrderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s.order);
  const [statusFilters, setStatusFilters] = useState([]);
  const [timeFilters, setTimeFilters] = useState([]);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrdersState, setTotalOrdersState] = useState(0);

  const allOrders = state.list.length
    ? state.list
    : getOrderCollection(state.current);

  const currentYear = new Date().getFullYear();

  const { statusCounts, timeCounts } = useMemo(() => {
    const sCounts = { on_the_way: 0, delivered: 0, cancelled: 0, returned: 0 };
    const tCounts = { last_30_days: 0, [String(currentYear)]: 0, [String(currentYear - 1)]: 0, [String(currentYear - 2)]: 0, older: 0 };

    allOrders.forEach((order) => {
      const shipments = Array.isArray(order?.relations?.shipments) ? order.relations.shipments : [];
      const orderDate = new Date(order?.created_at || order?.createdAt || Date.now());
      
      getOrderItems(order).forEach((item) => {
        const itemStatus = resolveOrderItemDisplayStatus(item, getOrderStatus(order), shipments, [], order?.relations?.cancellations || order?.cancellations || []);
        const normalizedItemStatus = String(itemStatus || "").toLowerCase();
        const normalizedOrderStatus = String(getOrderStatus(order) || "").toLowerCase();
        
        const isDelivered = ["delivered", "fulfilled", "completed", "partially_delivered"].includes(normalizedItemStatus) || ["delivered", "fulfilled", "completed", "partially_delivered"].includes(normalizedOrderStatus);
        const isCancelled = ["cancelled", "payment_failed", "cancellation_requested", "cancellation_approved"].includes(normalizedItemStatus) || ["cancelled", "payment_failed", "cancellation_requested", "cancellation_approved"].includes(normalizedOrderStatus);
        const isReturned = ["returned", "return_requested", "return_approved", "partially_returned", "refunded", "partially_refunded"].includes(normalizedItemStatus) || ["returned", "return_requested", "return_approved", "partially_returned", "refunded", "partially_refunded"].includes(normalizedOrderStatus);
        const isOnTheWay = !isDelivered && !isCancelled && !isReturned;

        if (isDelivered) sCounts.delivered++;
        if (isCancelled) sCounts.cancelled++;
        if (isReturned) sCounts.returned++;
        if (isOnTheWay) sCounts.on_the_way++;

        const now = new Date();
        const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
        const orderYear = orderDate.getFullYear();

        if (daysDiff <= 30) tCounts.last_30_days++;
        if (orderYear === currentYear) tCounts[String(currentYear)]++;
        if (orderYear === currentYear - 1) tCounts[String(currentYear - 1)]++;
        if (orderYear === currentYear - 2) tCounts[String(currentYear - 2)]++;
        if (orderYear < currentYear - 2) tCounts.older++;
      });
    });

    return { statusCounts: sCounts, timeCounts: tCounts };
  }, [allOrders, currentYear]);

  const availableStatusFilters = [
    { label: "On the way", value: "on_the_way", count: statusCounts.on_the_way },
    { label: "Delivered", value: "delivered", count: statusCounts.delivered },
    { label: "Cancelled", value: "cancelled", count: statusCounts.cancelled },
    { label: "Returned", value: "returned", count: statusCounts.returned },
  ].filter(f => f.count > 0 || statusFilters.includes(f.value));

  const availableTimeFilters = [
    { label: "Last 30 days", value: "last_30_days", count: timeCounts.last_30_days },
    { label: String(currentYear), value: String(currentYear), count: timeCounts[String(currentYear)] },
    { label: String(currentYear - 1), value: String(currentYear - 1), count: timeCounts[String(currentYear - 1)] },
    { label: String(currentYear - 2), value: String(currentYear - 2), count: timeCounts[String(currentYear - 2)] },
    { label: "Older", value: "older", count: timeCounts.older },
  ].filter(f => f.count > 0 || timeFilters.includes(f.value));

  const orderItemsList = useMemo(() => {
    let term = query.trim().toLowerCase();
    const normalizedTerm = normalizeOrderSearchText(query);

    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    return allOrders.flatMap((order) => {
      const id = String(getOrderId(order) || "").toLowerCase();
      const apiOrderId = getApiOrderId(order);
      const orderNumber = String(apiOrderId || "").toLowerCase();
      const formattedId = String(
        formatOrderId(orderNumber || id),
      ).toLowerCase();
      const visibleOrderIdText = `order id #${apiOrderId}`.toLowerCase();
      const shipments = Array.isArray(order?.relations?.shipments)
        ? order.relations.shipments
        : [];
      
      const orderDate = new Date(order?.created_at || order?.createdAt || Date.now());

      return getOrderItems(order)
        .map((item) => {
          const itemStatus = resolveOrderItemDisplayStatus(
            item,
            getOrderStatus(order),
            shipments,
            [],
            order?.relations?.cancellations || order?.cancellations || [],
          );
          return { order, item, itemStatus, orderDate };
        })
        .filter(({ order, item, itemStatus, orderDate }) => {
          // Status Filtering
          if (statusFilters.length > 0) {
            const normalizedItemStatus = String(itemStatus || "").toLowerCase();
            const normalizedOrderStatus = String(
              getOrderStatus(order) || "",
            ).toLowerCase();
            
            const isDelivered = ["delivered", "fulfilled", "completed", "partially_delivered"].includes(normalizedItemStatus) || ["delivered", "fulfilled", "completed", "partially_delivered"].includes(normalizedOrderStatus);
            const isCancelled = ["cancelled", "payment_failed", "cancellation_requested", "cancellation_approved"].includes(normalizedItemStatus) || ["cancelled", "payment_failed", "cancellation_requested", "cancellation_approved"].includes(normalizedOrderStatus);
            const isReturned = ["returned", "return_requested", "return_approved", "partially_returned", "refunded", "partially_refunded"].includes(normalizedItemStatus) || ["returned", "return_requested", "return_approved", "partially_returned", "refunded", "partially_refunded"].includes(normalizedOrderStatus);
            const isOnTheWay = !isDelivered && !isCancelled && !isReturned; // anything else like processing, shipped, etc.

            const matchesStatus = statusFilters.some(f => {
              if (f === "delivered") return isDelivered;
              if (f === "cancelled") return isCancelled;
              if (f === "returned") return isReturned;
              if (f === "on_the_way") return isOnTheWay;
              return false;
            });

            if (!matchesStatus) return false;
          }

          // Time Filtering
          if (timeFilters.length > 0) {
            const now = new Date();
            const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
            const orderYear = orderDate.getFullYear();
            
            const matchesTime = timeFilters.some(f => {
              if (f === "last_30_days") return daysDiff <= 30;
              if (f === String(currentYear)) return orderYear === currentYear;
              if (f === String(currentYear - 1)) return orderYear === currentYear - 1;
              if (f === String(currentYear - 2)) return orderYear === currentYear - 2;
              if (f === "older") return orderYear < currentYear - 2;
              return false;
            });

            if (!matchesTime) return false;
          }

          if (!query) return true;
          const term = query.toLowerCase();
          const normalizedTerm = normalizeOrderSearchText(term);
          const id = String(order.id || "").toLowerCase();
          const apiOrderId = String(order.api_order_id || "").toLowerCase();
          const orderNumber = String(order.order_number || "").toLowerCase();
          const formattedId = `ord-${order.id}`.toLowerCase();
          const visibleOrderIdText = (order.order_number || `ORD-${order.id}`).toLowerCase();

          const itemText = getProductTitle(item).toLowerCase();
          const normalizedOrderText = normalizeOrderSearchText(
            [
              id,
              apiOrderId,
              formattedId,
              visibleOrderIdText,
              itemText,
              itemStatus,
            ].join(" "),
          );

          return (
            id.includes(term) ||
            orderNumber.includes(term) ||
            formattedId.includes(term) ||
            itemText.includes(term) ||
            visibleOrderIdText.includes(term) ||
            String(itemStatus || "")
              .toLowerCase()
              .includes(term) ||
            (Boolean(normalizedTerm) &&
              normalizedOrderText.includes(normalizedTerm))
          );
        });
    });

    return result.sort((a, b) => b.orderDate - a.orderDate);
  }, [allOrders, currentYear, statusFilters, timeFilters, query]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilters, timeFilters, query, pageSize]);

  const totalOrders = orderItemsList.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orderItemsList.slice(start, start + pageSize);
  }, [orderItemsList, currentPage, pageSize]);

  useEffect(() => {
    dispatch(fetchMyOrders({ params: { limit: 200 } }));
  }, [dispatch]);

  return {
    state,
    navigate,
    statusFilters,
    setStatusFilters,
    timeFilters,
    setTimeFilters,
    query,
    setQuery,
    availableStatusFilters,
    availableTimeFilters,
    orderItemsList: paginatedOrders,
    totalOrders,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}
