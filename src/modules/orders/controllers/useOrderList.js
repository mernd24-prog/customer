import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchMyOrders } from "../slices/orderSlice";
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

const ORDER_HISTORY_FETCH_LIMIT = 200;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function useOrderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useSelector((s) => s.order);
  const syncTimerRef = useRef(null);
  const locallySyncedSearchRef = useRef(searchParams.toString());

  // ---------------------------------------------------------
  // URL INITIAL VALUES
  // ---------------------------------------------------------

  const initialStatus = (() => {
    const v = searchParams.get("status");
    return v ? v.split(",").filter(Boolean) : [];
  })();

  const initialTime = (() => {
    const v = searchParams.get("time");
    return v ? v.split(",").filter(Boolean) : [];
  })();

  const initialQuery = searchParams.get("q") || "";

  const initialPageSize = toPositiveInteger(searchParams.get("limit"), 10);

  const initialPage = toPositiveInteger(searchParams.get("page"), 1);

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [statusFilters, setStatusFilters] =
    useState(initialStatus);

  const [timeFilters, setTimeFilters] =
    useState(initialTime);

  const [query, setQuery] =
    useState(initialQuery);

  const [pageSize, setPageSize] =
    useState(initialPageSize);

  const [currentPage, setCurrentPage] =
    useState(initialPage);

  // ---------------------------------------------------------
  // ORDERS
  // ---------------------------------------------------------

  const allOrders =
    state.list.length
      ? state.list
      : getOrderCollection(state.current);

  const currentYear = new Date().getFullYear();

  // ---------------------------------------------------------
  // STATUS / TIME COUNTS
  // ---------------------------------------------------------

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
      const shipments = Array.isArray(
        order?.relations?.shipments
      )
        ? order.relations.shipments
        : [];

      const orderDate = new Date(
        order?.created_at ||
          order?.createdAt ||
          Date.now()
      );

      getOrderItems(order).forEach((item) => {
        const itemStatus =
          resolveOrderItemDisplayStatus(
            item,
            getOrderStatus(order),
            shipments,
            [],
            order?.relations?.cancellations ||
              order?.cancellations ||
              []
          );

        const normalizedItemStatus =
          String(itemStatus || "").toLowerCase();

        const normalizedOrderStatus =
          String(
            getOrderStatus(order) || ""
          ).toLowerCase();

        const deliveredSet = new Set([
          "delivered",
          "fulfilled",
          "completed",
          "partially_delivered",
        ]);

        const paymentFailedSet = new Set([
          "payment_failed",
        ]);

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

        if (category === "delivered") {
          sCounts.delivered++;
        } else if (category === "cancelled") {
          sCounts.cancelled++;
        } else if (category === "returned") {
          sCounts.returned++;
        } else if (category === "payment_failed") {
          sCounts.payment_failed++;
        } else {
          sCounts.on_the_way++;
        }

        const now = new Date();

        const daysDiff =
          (now - orderDate) /
          (1000 * 60 * 60 * 24);

        const orderYear = orderDate.getFullYear();

        if (daysDiff <= 30) {
          tCounts.last_30_days++;
        }

        if (orderYear === currentYear) {
          tCounts[String(currentYear)]++;
        }

        if (orderYear === currentYear - 1) {
          tCounts[String(currentYear - 1)]++;
        }

        if (orderYear === currentYear - 2) {
          tCounts[String(currentYear - 2)]++;
        }

        if (orderYear < currentYear - 2) {
          tCounts.older++;
        }
      });
    });

    return {
      statusCounts: sCounts,
      timeCounts: tCounts,
    };
  }, [allOrders, currentYear]);

  // ---------------------------------------------------------
  // AVAILABLE STATUS FILTERS
  // ---------------------------------------------------------

  const availableStatusFilters = [
    {
      label: "On the way",
      value: "on_the_way",
      count: statusCounts.on_the_way,
    },
    {
      label: "Delivered",
      value: "delivered",
      count: statusCounts.delivered,
    },
    {
      label: "Cancelled",
      value: "cancelled",
      count: statusCounts.cancelled,
    },
    {
      label: "Payment Failed",
      value: "payment_failed",
      count: statusCounts.payment_failed,
    },
    {
      label: "Returned",
      value: "returned",
      count: statusCounts.returned,
    },
  ].filter(
    (f) =>
      f.count > 0 ||
      statusFilters.includes(f.value)
  );

  // ---------------------------------------------------------
  // AVAILABLE TIME FILTERS
  // ---------------------------------------------------------

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
    {
      label: "Older",
      value: "older",
      count: timeCounts.older,
    },
  ].filter(
    (f) =>
      f.count > 0 ||
      timeFilters.includes(f.value)
  );

  // ---------------------------------------------------------
  // FILTER CURRENT API RESULT
  // ---------------------------------------------------------

  const orderItemsList = useMemo(() => {
    let term = (query || "")
      .trim()
      .toLowerCase();

    const normalizedTerm =
      normalizeOrderSearchText(query || "");

    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    const results = allOrders.flatMap((order) => {
      const id = String(
        getOrderId(order) || ""
      ).toLowerCase();

      const apiOrderId =
        getApiOrderId(order);

      const orderNumber = String(
        apiOrderId || ""
      ).toLowerCase();

      const formattedId = String(
        formatOrderId(
          orderNumber || id
        )
      ).toLowerCase();

      const visibleOrderIdText =
        `order id #${apiOrderId}`.toLowerCase();

      const shipments = Array.isArray(
        order?.relations?.shipments
      )
        ? order.relations.shipments
        : [];

      const trackingText = shipments
        .flatMap((shipment) => [
          shipment?.tracking_number,
          shipment?.trackingNumber,
          shipment?.awb_number,
          shipment?.awbNumber,
          ...(Array.isArray(shipment?.trackingEvents)
            ? shipment.trackingEvents.flatMap((event) => [
                event?.tracking_number,
                event?.trackingNumber,
                event?.awb_number,
                event?.awbNumber,
              ])
            : []),
        ])
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const orderDate = new Date(
        order?.created_at ||
          order?.createdAt ||
          Date.now()
      );

      return getOrderItems(order)
        .map((item) => {
          const itemStatus =
            resolveOrderItemDisplayStatus(
              item,
              getOrderStatus(order),
              shipments,
              [],
              order?.relations?.cancellations ||
                order?.cancellations ||
                []
            );

          return {
            order,
            item,
            itemStatus,
            orderDate,
          };
        })
        .filter(
          ({
            order,
            item,
            itemStatus,
            orderDate,
          }) => {
            // -------------------------------------------------
            // STATUS FILTER
            // -------------------------------------------------

            if (statusFilters.length > 0) {
              const normalizedItemStatus =
                String(
                  itemStatus || ""
                ).toLowerCase();

              const normalizedOrderStatus =
                String(
                  getOrderStatus(order) || ""
                ).toLowerCase();

              const deliveredSet =
                new Set([
                  "delivered",
                  "fulfilled",
                  "completed",
                  "partially_delivered",
                ]);

              const paymentFailedSet =
                new Set([
                  "payment_failed",
                ]);

              const cancelledSet =
                new Set([
                  "cancelled",
                  "cancellation_requested",
                  "cancellation_approved",
                ]);

              const returnedSet =
                new Set([
                  "returned",
                  "return_requested",
                  "return_approved",
                  "partially_returned",
                  "refunded",
                  "partially_refunded",
                ]);

              let category =
                "on_the_way";

              if (
                paymentFailedSet.has(
                  normalizedItemStatus
                ) ||
                paymentFailedSet.has(
                  normalizedOrderStatus
                )
              ) {
                category =
                  "payment_failed";
              } else if (
                cancelledSet.has(
                  normalizedItemStatus
                ) ||
                cancelledSet.has(
                  normalizedOrderStatus
                )
              ) {
                category = "cancelled";
              } else if (
                returnedSet.has(
                  normalizedItemStatus
                ) ||
                returnedSet.has(
                  normalizedOrderStatus
                )
              ) {
                category = "returned";
              } else if (
                deliveredSet.has(
                  normalizedItemStatus
                ) ||
                deliveredSet.has(
                  normalizedOrderStatus
                )
              ) {
                category = "delivered";
              }

              if (
                !statusFilters.includes(
                  category
                )
              ) {
                return false;
              }
            }

            // -------------------------------------------------
            // TIME FILTER
            // -------------------------------------------------

            if (timeFilters.length > 0) {
              const now = new Date();

              const daysDiff =
                (now - orderDate) /
                (1000 * 60 * 60 * 24);

              const orderYear =
                orderDate.getFullYear();

              const matchesTime =
                timeFilters.some((f) => {
                  if (
                    f === "last_30_days"
                  ) {
                    return daysDiff <= 30;
                  }

                  if (
                    f === String(
                      currentYear
                    )
                  ) {
                    return (
                      orderYear ===
                      currentYear
                    );
                  }

                  if (
                    f === String(
                      currentYear - 1
                    )
                  ) {
                    return (
                      orderYear ===
                      currentYear - 1
                    );
                  }

                  if (
                    f === String(
                      currentYear - 2
                    )
                  ) {
                    return (
                      orderYear ===
                      currentYear - 2
                    );
                  }

                  if (f === "older") {
                    return (
                      orderYear <
                      currentYear - 2
                    );
                  }

                  return false;
                });

              if (!matchesTime) {
                return false;
              }
            }

            // -------------------------------------------------
            // SEARCH
            // -------------------------------------------------

            if (!query) {
              return true;
            }

            const searchTerm =
              query.toLowerCase();

            const normalizedSearchTerm =
              normalizeOrderSearchText(
                searchTerm
              );

            const idText = String(
              order.id || ""
            ).toLowerCase();

            const apiIdText = String(
              order.api_order_id || ""
            ).toLowerCase();

            const orderNumText =
              String(
                order.order_number || ""
              ).toLowerCase();

            const formattedIdText =
              `ord-${order.id}`.toLowerCase();

            const visibleOrderText =
              (
                order.order_number ||
                `ORD-${order.id}`
              ).toLowerCase();

            const itemText =
              getProductTitle(
                item
              ).toLowerCase();

            const normalizedOrderText =
              normalizeOrderSearchText(
                [
                  idText,
                  apiIdText,
                  formattedIdText,
                  visibleOrderText,
                  itemText,
                  itemStatus,
                  trackingText,
                ].join(" ")
              );

            return (
              idText.includes(searchTerm) ||
              orderNumText.includes(
                searchTerm
              ) ||
              formattedIdText.includes(
                searchTerm
              ) ||
              itemText.includes(
                searchTerm
              ) ||
              trackingText.includes(
                searchTerm
              ) ||
              visibleOrderText.includes(
                searchTerm
              ) ||
              String(
                itemStatus || ""
              )
                .toLowerCase()
                .includes(searchTerm) ||
              (Boolean(
                normalizedSearchTerm
              ) &&
                normalizedOrderText.includes(
                  normalizedSearchTerm
                ))
            );
          }
        );
    });

    return results.sort(
      (a, b) =>
        b.orderDate - a.orderDate
    );
  }, [
    allOrders,
    currentYear,
    statusFilters,
    timeFilters,
    query,
  ]);

  // ---------------------------------------------------------
  // PAGINATE THE FILTERED ITEM RESULTS
  // ---------------------------------------------------------

  const totalOrders = orderItemsList.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedOrders = orderItemsList.slice(pageStart, pageStart + pageSize);

  // ---------------------------------------------------------
  // FETCH THE HISTORY USED BY ITEM-LEVEL SEARCH/FILTER/PAGINATION
  // ---------------------------------------------------------

  useEffect(() => {
    dispatch(
      fetchMyOrders({
        params: {
          limit: ORDER_HISTORY_FETCH_LIMIT,
          offset: 0,
        },
      })
    );
  }, [dispatch]);

  // A page selected for the previous result set may not exist after a filter,
  // search, time range, or page-size change.
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilters, timeFilters, query, pageSize]);

  // ---------------------------------------------------------
  // KEEP URL IN SYNC
  // ---------------------------------------------------------

  useEffect(() => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    const statusSorted = Array.from(
      new Set(statusFilters)
    )
      .slice()
      .sort();

    if (statusSorted.length) {
      params.set(
        "status",
        statusSorted.join(",")
      );
    } else {
      params.delete("status");
    }

    const timeSorted = Array.from(
      new Set(timeFilters)
    )
      .slice()
      .sort();

    if (timeSorted.length) {
      params.set(
        "time",
        timeSorted.join(",")
      );
    } else {
      params.delete("time");
    }

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    // Always keep the selected limit
    if (pageSize) {
      params.set(
        "limit",
        String(pageSize)
      );
    } else {
      params.delete("limit");
    }

    // Always keep the current page
    if (currentPage) {
      params.set(
        "page",
        String(currentPage)
      );
    } else {
      params.delete("page");
    }

    const current =
      searchParams.toString();

    const next =
      params.toString();

    if (current !== next) {
      if (syncTimerRef.current) {
        clearTimeout(
          syncTimerRef.current
        );
      }

      syncTimerRef.current =
        setTimeout(() => {
          // Mark this URL as an internal write before navigation updates
          // searchParams. This prevents the URL reader below from restoring
          // stale values while a dropdown/search change is being synchronized.
          locallySyncedSearchRef.current = next;
          setSearchParams(
            params,
            {
              replace: true,
            }
          );

          syncTimerRef.current =
            null;
        }, 120);
    }

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(
          syncTimerRef.current
        );

        syncTimerRef.current =
          null;
      }
    };
  }, [
    statusFilters,
    timeFilters,
    query,
    pageSize,
    currentPage,
    searchParams,
    setSearchParams,
  ]);

  // ---------------------------------------------------------
  // SYNC STATE FROM URL
  // ---------------------------------------------------------

  useEffect(() => {
    const currentSearch = searchParams.toString();

    if (currentSearch === locallySyncedSearchRef.current) {
      return;
    }

    // A different URL came from browser navigation or an external link.
    // Adopt it as the new source before updating local controls.
    locallySyncedSearchRef.current = currentSearch;

    const spStatus =
      searchParams.get("status")
        ? searchParams
            .get("status")
            .split(",")
            .filter(Boolean)
        : [];

    const spTime =
      searchParams.get("time")
        ? searchParams
            .get("time")
            .split(",")
            .filter(Boolean)
        : [];

    const spQuery =
      searchParams.get("q") || "";

    const spLimit = toPositiveInteger(searchParams.get("limit"), 10);

    const spPage = toPositiveInteger(searchParams.get("page"), 1);

    const sameStatus =
      spStatus.length ===
        statusFilters.length &&
      spStatus.every(
        (v, i) =>
          v === statusFilters[i]
      );

    const sameTime =
      spTime.length ===
        timeFilters.length &&
      spTime.every(
        (v, i) =>
          v === timeFilters[i]
      );

    if (!sameStatus) {
      setStatusFilters(spStatus);
    }

    if (!sameTime) {
      setTimeFilters(spTime);
    }

    if (spQuery !== query) {
      setQuery(spQuery);
    }

    if (spLimit !== pageSize) {
      setPageSize(spLimit);
    }

    if (spPage !== currentPage) {
      setCurrentPage(spPage);
    }
  }, [searchParams]);

  // ---------------------------------------------------------
  // PROTECT AGAINST INVALID CURRENT PAGE
  // ---------------------------------------------------------

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ---------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------

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
