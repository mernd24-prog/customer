import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useSelector((s) => s.order);
  const syncTimerRef = useRef(null);

  // Initialize from URL search params so filters persist across navigation
  const initialStatus = (() => {
    const v = searchParams.get("status");
    return v ? v.split(",").filter(Boolean) : [];
  })();
  const initialTime = (() => {
    const v = searchParams.get("time");
    return v ? v.split(",").filter(Boolean) : [];
  })();
  const initialQuery = searchParams.get("q") || "";
  const initialPageSize = Number(searchParams.get("limit") || 4);
  const initialPage = Number(searchParams.get("page") || 1);

  const [statusFilters, setStatusFilters] = useState(initialStatus);
  const [timeFilters, setTimeFilters] = useState(initialTime);
  const [query, setQuery] = useState(initialQuery);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalOrdersState, setTotalOrdersState] = useState(0);

  const allOrders = state.list.length
    ? state.list
    : getOrderCollection(state.current);
  const currentYear = new Date().getFullYear();

  const { statusCounts, timeCounts } = useMemo(() => {
    const sCounts = {
      on_the_way: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      payment_failed: 0,
    };
    const tCounts = {
      last_30_days: 0,
      [String(currentYear)]: 0,
      [String(currentYear - 1)]: 0,
      [String(currentYear - 2)]: 0,
      older: 0,
    };

    allOrders.forEach((order) => {
      const shipments = Array.isArray(order?.relations?.shipments)
        ? order.relations.shipments
        : [];
      const orderDate = new Date(
        order?.created_at || order?.createdAt || Date.now(),
      );

      getOrderItems(order).forEach((item) => {
        const itemStatus = resolveOrderItemDisplayStatus(
          item,
          getOrderStatus(order),
          shipments,
          [],
          order?.relations?.cancellations || order?.cancellations || [],
        );

        const normalizedItemStatus = String(itemStatus || "").toLowerCase();
        const normalizedOrderStatus = String(
          getOrderStatus(order) || "",
        ).toLowerCase();

        const deliveredSet = new Set([
          "delivered",
          "fulfilled",
          "completed",
          "partially_delivered",
        ]);
        const paymentFailedSet = new Set(["payment_failed"]);
        const cancelledSet = new Set([
          "cancelled",
          "cancellation_requested",
          "cancellation_approved",
        ]);
        const returnedSet = new Set([
          "returned",
          "return_requested",
          "return_approved",
          "partially_returned",
          "refunded",
          "partially_refunded",
        ]);

        // Prefer item-level status when available; payment_failed and
        // cancelled/returned should override delivered to avoid false positives.
        let category = "on_the_way";
        if (
          paymentFailedSet.has(normalizedItemStatus) ||
          paymentFailedSet.has(normalizedOrderStatus)
        ) {
          category = "payment_failed";
        } else if (
          cancelledSet.has(normalizedItemStatus) ||
          cancelledSet.has(normalizedOrderStatus)
        ) {
          category = "cancelled";
        } else if (
          returnedSet.has(normalizedItemStatus) ||
          returnedSet.has(normalizedOrderStatus)
        ) {
          category = "returned";
        } else if (
          deliveredSet.has(normalizedItemStatus) ||
          deliveredSet.has(normalizedOrderStatus)
        ) {
          category = "delivered";
        }

        if (category === "delivered") sCounts.delivered++;
        else if (category === "cancelled") sCounts.cancelled++;
        else if (category === "returned") sCounts.returned++;
        else if (category === "payment_failed") sCounts.payment_failed++;
        else sCounts.on_the_way++;

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
    {
      label: "On the way",
      value: "on_the_way",
      count: statusCounts.on_the_way,
    },
    { label: "Delivered", value: "delivered", count: statusCounts.delivered },
    { label: "Cancelled", value: "cancelled", count: statusCounts.cancelled },
    {
      label: "Payment Failed",
      value: "payment_failed",
      count: statusCounts.payment_failed,
    },
    { label: "Returned", value: "returned", count: statusCounts.returned },
  ].filter((f) => f.count > 0 || statusFilters.includes(f.value));

  const availableTimeFilters = [
    {
      label: "Last 30 days",
      value: "last_30_days",
      count: timeCounts.last_30_days,
    },
    {
      label: String(currentYear),
      value: String(currentYear),
      count: timeCounts[String(currentYear)],
    },
    {
      label: String(currentYear - 1),
      value: String(currentYear - 1),
      count: timeCounts[String(currentYear - 1)],
    },
    {
      label: String(currentYear - 2),
      value: String(currentYear - 2),
      count: timeCounts[String(currentYear - 2)],
    },
    { label: "Older", value: "older", count: timeCounts.older },
  ].filter((f) => f.count > 0 || timeFilters.includes(f.value));

  const orderItemsList = useMemo(() => {
    let term = (query || "").trim().toLowerCase();
    const normalizedTerm = normalizeOrderSearchText(query || "");

    if (term.startsWith("#")) term = term.slice(1);

    const results = allOrders.flatMap((order) => {
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
      const orderDate = new Date(
        order?.created_at || order?.createdAt || Date.now(),
      );

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
          // Status Filtering: canonical category
          if (statusFilters.length > 0) {
            const normalizedItemStatus = String(itemStatus || "").toLowerCase();
            const normalizedOrderStatus = String(
              getOrderStatus(order) || "",
            ).toLowerCase();
            const deliveredSet = new Set([
              "delivered",
              "fulfilled",
              "completed",
              "partially_delivered",
            ]);
            const paymentFailedSet = new Set(["payment_failed"]);
            const cancelledSet = new Set([
              "cancelled",
              "cancellation_requested",
              "cancellation_approved",
            ]);
            const returnedSet = new Set([
              "returned",
              "return_requested",
              "return_approved",
              "partially_returned",
              "refunded",
              "partially_refunded",
            ]);

            // Prefer item-level status when available; payment_failed and
            // cancelled/returned should override delivered.
            let category = "on_the_way";
            if (
              paymentFailedSet.has(normalizedItemStatus) ||
              paymentFailedSet.has(normalizedOrderStatus)
            ) {
              category = "payment_failed";
            } else if (
              cancelledSet.has(normalizedItemStatus) ||
              cancelledSet.has(normalizedOrderStatus)
            ) {
              category = "cancelled";
            } else if (
              returnedSet.has(normalizedItemStatus) ||
              returnedSet.has(normalizedOrderStatus)
            ) {
              category = "returned";
            } else if (
              deliveredSet.has(normalizedItemStatus) ||
              deliveredSet.has(normalizedOrderStatus)
            ) {
              category = "delivered";
            }

            if (!statusFilters.includes(category)) return false;
          }

          // Time Filtering
          if (timeFilters.length > 0) {
            const now = new Date();
            const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
            const orderYear = orderDate.getFullYear();

            const matchesTime = timeFilters.some((f) => {
              if (f === "last_30_days") return daysDiff <= 30;
              if (f === String(currentYear)) return orderYear === currentYear;
              if (f === String(currentYear - 1))
                return orderYear === currentYear - 1;
              if (f === String(currentYear - 2))
                return orderYear === currentYear - 2;
              if (f === "older") return orderYear < currentYear - 2;
              return false;
            });

            if (!matchesTime) return false;
          }

          if (!query) return true;

          const searchTerm = query.toLowerCase();
          const normalizedSearchTerm = normalizeOrderSearchText(searchTerm);
          const idText = String(order.id || "").toLowerCase();
          const apiIdText = String(order.api_order_id || "").toLowerCase();
          const orderNumText = String(order.order_number || "").toLowerCase();
          const formattedIdText = `ord-${order.id}`.toLowerCase();
          const visibleOrderText = (
            order.order_number || `ORD-${order.id}`
          ).toLowerCase();

          const itemText = getProductTitle(item).toLowerCase();
          const normalizedOrderText = normalizeOrderSearchText(
            [
              idText,
              apiIdText,
              formattedIdText,
              visibleOrderText,
              itemText,
              itemStatus,
            ].join(" "),
          );

          return (
            idText.includes(searchTerm) ||
            orderNumText.includes(searchTerm) ||
            formattedIdText.includes(searchTerm) ||
            itemText.includes(searchTerm) ||
            visibleOrderText.includes(searchTerm) ||
            String(itemStatus || "")
              .toLowerCase()
              .includes(searchTerm) ||
            (Boolean(normalizedSearchTerm) &&
              normalizedOrderText.includes(normalizedSearchTerm))
          );
        });
    });

    return results.sort((a, b) => b.orderDate - a.orderDate);
  }, [allOrders, currentYear, statusFilters, timeFilters, query]);

  const totalOrders = orderItemsList.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orderItemsList.slice(start, start + pageSize);
  }, [orderItemsList, currentPage, pageSize]);

  useEffect(() => {
    dispatch(fetchMyOrders({ params: { limit: 200 } }));
  }, [dispatch]);

  // Keep URL search params in sync with filter state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const statusSorted = Array.from(new Set(statusFilters)).slice().sort();
    if (statusSorted.length) params.set("status", statusSorted.join(","));
    else params.delete("status");

    const timeSorted = Array.from(new Set(timeFilters)).slice().sort();
    if (timeSorted.length) params.set("time", timeSorted.join(","));
    else params.delete("time");

    if (query) params.set("q", query);
    else params.delete("q");

    if (pageSize && Number(pageSize) !== 2)
      params.set("limit", String(pageSize));
    else params.delete("limit");

    if (currentPage && Number(currentPage) !== 1)
      params.set("page", String(currentPage));
    else params.delete("page");

    // Only update if different to avoid pushing identical entries. Debounce
    // updates slightly to avoid rapid URL writes that can cause UI flicker.
    const current = searchParams.toString();
    const next = params.toString();
    if (current !== next) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        setSearchParams(params, { replace: true });
        syncTimerRef.current = null;
      }, 120);
    }
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [statusFilters, timeFilters, query, pageSize, currentPage]);

  // If search params change (browser back/forward), update internal state
  useEffect(() => {
    const spStatus = searchParams.get("status")
      ? searchParams.get("status").split(",").filter(Boolean)
      : [];
    const spTime = searchParams.get("time")
      ? searchParams.get("time").split(",").filter(Boolean)
      : [];
    const spQuery = searchParams.get("q") || "";
    const spLimit = Number(searchParams.get("limit") || 4);
    const spPage = Number(searchParams.get("page") || 1);

    // Avoid unnecessary updates
    const sameStatus =
      spStatus.length === statusFilters.length &&
      spStatus.every((v, i) => v === statusFilters[i]);
    const sameTime =
      spTime.length === timeFilters.length &&
      spTime.every((v, i) => v === timeFilters[i]);

    if (!sameStatus) setStatusFilters(spStatus);
    if (!sameTime) setTimeFilters(spTime);
    if (spQuery !== query) setQuery(spQuery);
    if (spLimit !== pageSize) setPageSize(spLimit);
    if (spPage !== currentPage) setCurrentPage(spPage);
  }, [searchParams]);

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
