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

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
};

/**
 * All statuses that belong to the return/refund flow.
 */
const RETURN_STATUSES = new Set([
  "returned",
  "return_requested",
  "requested",
  "return_approved",
  "approved",
  "return_completed",
  "partially_returned",
  "return_qc_passed",
  "qc_passed",
  "qc_failed",
  "qc_completed",
  "qc_failure_upheld",
  "reverse_pickup_scheduled",
  "pickup_failed",
  "manual_ship_back",
  "shipped_back",
  "in_reverse_transit",
  "received",
  "refund_pending",
  "refund_failed",
  "partially_refunded",
  "refunded",
]);

const normalizeId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value?._id ||
        value?.id ||
        value?.orderItemId ||
        value?.itemId ||
        value?.productId ||
        "",
    );
  }

  return String(value);
};

/**
 * Get return records from the order.
 */
const getOrderReturns = (order) => {
  if (!order) {
    return [];
  }

  const possibleCollections = [
    order?.relations?.returns,
    order?.relations?.returnRequests,
    order?.relations?.return_requests,

    order?.returns,
    order?.returnRequests,
    order?.return_requests,

    order?.returnItems,
    order?.return_items,

    order?.relations?.returnItems,
    order?.relations?.return_items,
  ];

  const returns = [];

  possibleCollections.forEach((collection) => {
    if (Array.isArray(collection)) {
      returns.push(...collection);
    } else if (collection && typeof collection === "object") {
      returns.push(collection);
    }
  });

  return returns;
};

const getReturnStatus = (returnRecord) => {
  if (!returnRecord) {
    return "";
  }

  return String(
    returnRecord?.status ||
      returnRecord?.returnStatus ||
      returnRecord?.return_status ||
      returnRecord?.state ||
      "",
  )
    .trim()
    .toLowerCase();
};

/**
 * Collect all possible order-item IDs from a return record.
 */
const getReturnItemIds = (returnRecord) => {
  if (!returnRecord) {
    return [];
  }

  const ids = new Set();

  const addId = (value) => {
    const id = normalizeId(value);

    if (id) {
      ids.add(id);
    }
  };

  addId(returnRecord?.orderItemId);
  addId(returnRecord?.order_item_id);
  addId(returnRecord?.itemId);
  addId(returnRecord?.item_id);

  addId(returnRecord?.orderLineItemId);
  addId(returnRecord?.order_line_item_id);

  addId(returnRecord?.lineItemId);
  addId(returnRecord?.line_item_id);

  addId(returnRecord?.item?._id);
  addId(returnRecord?.item?.id);
  addId(returnRecord?.item?.orderItemId);
  addId(returnRecord?.item?.order_item_id);

  addId(returnRecord?.orderItem?._id);
  addId(returnRecord?.orderItem?.id);
  addId(returnRecord?.orderItem?.orderItemId);
  addId(returnRecord?.orderItem?.order_item_id);

  if (Array.isArray(returnRecord?.items)) {
    returnRecord.items.forEach((item) => {
      addId(item);
      addId(item?._id);
      addId(item?.id);
      addId(item?.orderItemId);
      addId(item?.order_item_id);
      addId(item?.itemId);
      addId(item?.item_id);
    });
  }

  if (Array.isArray(returnRecord?.returnItems)) {
    returnRecord.returnItems.forEach((item) => {
      addId(item);
      addId(item?._id);
      addId(item?.id);
      addId(item?.orderItemId);
      addId(item?.order_item_id);
      addId(item?.itemId);
      addId(item?.item_id);
    });
  }

  return Array.from(ids);
};

/**
 * Check whether the specific item has an actual return.
 *
 * IMPORTANT:
 * A confirmed/in-transit/delivered item is NOT returned
 * unless it has a matching return record.
 */
export const hasReturnedItem = (order, item) => {
  if (!order || !item) {
    return false;
  }

  const returns = getOrderReturns(order);

  if (!returns.length) {
    return false;
  }

  const itemIds = new Set();

  const addItemId = (value) => {
    const id = normalizeId(value);

    if (id) {
      itemIds.add(id);
    }
  };

  addItemId(item?._id);
  addItemId(item?.id);
  addItemId(item?.orderItemId);
  addItemId(item?.order_item_id);
  addItemId(item?.itemId);
  addItemId(item?.item_id);

  const itemVariantId = normalizeId(item?.variantId);
  const itemProductId = normalizeId(item?.productId);

  return returns.some((returnRecord) => {
    const returnStatus = getReturnStatus(returnRecord);

    if (!RETURN_STATUSES.has(returnStatus)) {
      return false;
    }

    const returnItemIds = getReturnItemIds(returnRecord);

    /**
     * Prefer exact order-item matching.
     */
    if (returnItemIds.length > 0) {
      return returnItemIds.some((returnItemId) =>
        itemIds.has(returnItemId),
      );
    }

    /**
     * Fallback to variant/product matching.
     */
    const returnVariantId = normalizeId(
      returnRecord?.variantId ||
        returnRecord?.variant_id ||
        returnRecord?.item?.variantId ||
        returnRecord?.item?.variant_id ||
        returnRecord?.orderItem?.variantId ||
        returnRecord?.orderItem?.variant_id,
    );

    const returnProductId = normalizeId(
      returnRecord?.productId ||
        returnRecord?.product_id ||
        returnRecord?.item?.productId ||
        returnRecord?.item?.product_id ||
        returnRecord?.orderItem?.productId ||
        returnRecord?.orderItem?.product_id,
    );

    if (
      returnVariantId &&
      itemVariantId &&
      returnVariantId === itemVariantId
    ) {
      return true;
    }

    if (
      returnProductId &&
      itemProductId &&
      returnProductId === itemProductId
    ) {
      return true;
    }

    return false;
  });
};

/**
 * Convert an item/order status into the Orders page filter category.
 *
 * Returned is based on the actual return record.
 * An order-level "returned" status does not automatically make
 * every item in that order returned.
 */
export const resolveOrderFilterCategory = (
  itemStatus,
  orderStatus,
  isReturned = false,
) => {
  const normItem = String(itemStatus || "").toLowerCase();
  const normOrder = String(orderStatus || "").toLowerCase();

  const deliveredSet = new Set([
    "delivered",
    "fulfilled",
    "completed",
    "partially_delivered",
  ]);

  const returnedSet = new Set([
    "returned",
    "return_requested",
    "return_approved",
    "return_completed",
    "return_qc_passed",
    "qc_passed",
    "partially_returned",
    "refunded",
    "refund_pending",
    "partially_refunded",
  ]);

  const cancelledSet = new Set([
    "cancelled",
    "cancellation_requested",
    "cancellation_approved",
    "cancellation_pending",
  ]);

  const paymentFailedSet = new Set([
    "payment_failed",
    "failed",
    "pending_payment",
  ]);

  /**
   * Actual return record gets highest priority.
   */
  if (isReturned) {
    return "returned";
  }

  /**
   * Explicit item-level return status is also returned.
   */
  if (returnedSet.has(normItem)) {
    return "returned";
  }

  /**
   * Do NOT use order-level returned status here.
   *
   * One order can contain:
   * Item A -> returned
   * Item B -> delivered
   *
   * Therefore the order status cannot mark all items as returned.
   */

  if (deliveredSet.has(normItem)) {
    return "delivered";
  }

  if (cancelledSet.has(normItem)) {
    return "cancelled";
  }

  if (paymentFailedSet.has(normItem)) {
    return "payment_failed";
  }

  if (deliveredSet.has(normOrder)) {
    return "delivered";
  }

  if (cancelledSet.has(normOrder)) {
    return "cancelled";
  }

  if (paymentFailedSet.has(normOrder)) {
    return "payment_failed";
  }

  return "on_the_way";
};

const getOrderItemDate = (order) => {
  return (
    order?.createdAt ||
    order?.orderDate ||
    order?.orderedAt ||
    order?.created_at ||
    0
  );
};

const getTimeFilter = (dateValue) => {
  if (!dateValue) {
    return "older";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "older";
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const thirtyDaysAgo = new Date(startOfToday);

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30,
  );

  if (date >= thirtyDaysAgo) {
    return "last_30_days";
  }

  if (date.getFullYear() === now.getFullYear()) {
    return "current_year";
  }

  if (
    date.getFullYear() ===
    now.getFullYear() - 1
  ) {
    return "previous_year";
  }

  if (
    date.getFullYear() ===
    now.getFullYear() - 2
  ) {
    return "two_years_ago";
  }

  return "older";
};

const matchesTimeFilter = (dateValue, filter) => {
  if (!filter || filter === "all") {
    return true;
  }

  return getTimeFilter(dateValue) === filter;
};

const getItemSearchText = (item, order) => {
  const productTitle = getProductTitle(item);

  const orderId = formatOrderId(
    getOrderId(order) || getApiOrderId(order),
  );

  return normalizeOrderSearchText(
    [
      productTitle,
      orderId,
      item?.sku,
      item?.productSku,
      item?.variantSku,
      item?.color,
      item?.size,
      item?.sellerName,
      item?.seller?.name,
      item?.trackingNumber,
      item?.tracking_number,
    ]
      .filter(Boolean)
      .join(" "),
  );
};

export function useOrderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const state = useSelector((s) => s.order);

  const syncTimerRef = useRef(null);
  const locallySyncedSearchRef = useRef(
    searchParams.toString(),
  );

  const initialStatus =
    searchParams.get("status") || "all";

  const initialTime =
    searchParams.get("time") || "all";

  const initialQuery =
    searchParams.get("q") || "";

  const initialPageSize = toPositiveInteger(
    searchParams.get("limit"),
    10,
  );

  const initialPage = toPositiveInteger(
    searchParams.get("page"),
    1,
  );

  const [statusFilters, setStatusFilters] =
    useState(
      initialStatus === "all"
        ? []
        : [initialStatus],
    );

  const [timeFilters, setTimeFilters] =
    useState(
      initialTime === "all"
        ? []
        : [initialTime],
    );

  const [query, setQuery] =
    useState(initialQuery);

  const [pageSize, setPageSizeState] =
    useState(initialPageSize);

  const [currentPage, setCurrentPage] =
    useState(initialPage);

  /**
   * Get all orders from Redux.
   */
  const allOrders = useMemo(() => {
    if (
      Array.isArray(state?.list) &&
      state.list.length
    ) {
      return state.list;
    }

    const collection = getOrderCollection(
      state?.current,
    );

    return Array.isArray(collection)
      ? collection
      : [];
  }, [state?.list, state?.current]);

  /**
   * Flatten orders into individual items.
   *
   * Pagination is based on items, not packages/orders.
   */
  const orderItemsList = useMemo(() => {
    const flattened = [];

    allOrders.forEach((order) => {
      const items = getOrderItems(order);

      if (
        !Array.isArray(items) ||
        !items.length
      ) {
        return;
      }

      const orderStatus =
        getOrderStatus(order);

      const shipments =
        order?.relations?.shipments ||
        order?.shipments ||
        [];

      const cancellations =
        order?.relations?.cancellations ||
        order?.cancellations ||
        [];

      /**
       * Get actual return records.
       */
      const returns =
        getOrderReturns(order);

      items.forEach((item, itemIndex) => {
        /**
         * Check this specific product.
         */
        const isReturned =
          hasReturnedItem(order, item);

        /**
         * Resolve display status using actual
         * return records instead of [].
         */
        const itemStatus =
          resolveOrderItemDisplayStatus(
            item,
            orderStatus,
            shipments,
            returns,
            cancellations,
          );

        const filterCategory =
          resolveOrderFilterCategory(
            itemStatus,
            orderStatus,
            isReturned,
          );

        const orderDate =
          getOrderItemDate(order);

        /**
         * IMPORTANT:
         *
         * Keep BOTH `item` and `orderItem`.
         *
         * OrderListPage currently does:
         * orderItemsList.map(({ order, item }) => ...)
         *
         * So removing `item` causes:
         * Cannot read properties of undefined
         * (reading 'has_reviewed')
         */
        flattened.push({
          ...item,

          order,

          item,

          orderItem: item,

          itemIndex,

          itemStatus,

          filterCategory,

          isReturned,

          orderStatus,

          orderDate,

          returns,
        });
      });
    });

    return flattened;
  }, [allOrders]);

  /**
   * Count individual items by status.
   */
  const statusCounts = useMemo(() => {
    const counts = {
      all: orderItemsList.length,
      on_the_way: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      payment_failed: 0,
    };

    orderItemsList.forEach((item) => {
      const category =
        item?.filterCategory;

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          category,
        )
      ) {
        counts[category] += 1;
      }
    });

    return counts;
  }, [orderItemsList]);

  /**
   * Count individual items by date.
   */
  const timeCounts = useMemo(() => {
    const counts = {
      all: orderItemsList.length,
      last_30_days: 0,
      current_year: 0,
      previous_year: 0,
      two_years_ago: 0,
      older: 0,
    };

    orderItemsList.forEach((item) => {
      const timeCategory =
        getTimeFilter(
          item?.orderDate,
        );

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          timeCategory,
        )
      ) {
        counts[timeCategory] += 1;
      }
    });

    return counts;
  }, [orderItemsList]);

  const availableStatusFilters =
    useMemo(
      () => [
        {
          value: "on_the_way",
          label: "On the Way",
          count:
            statusCounts.on_the_way,
        },
        {
          value: "delivered",
          label: "Delivered",
          count:
            statusCounts.delivered,
        },
        {
          value: "cancelled",
          label: "Cancelled",
          count:
            statusCounts.cancelled,
        },
        {
          value: "returned",
          label: "Returned",
          count:
            statusCounts.returned,
        },
        {
          value: "payment_failed",
          label: "Payment Failed",
          count:
            statusCounts.payment_failed,
        },
      ],
      [statusCounts],
    );

  const availableTimeFilters =
    useMemo(
      () => [
        {
          value: "last_30_days",
          label: "Last 30 Days",
          count:
            timeCounts.last_30_days,
        },
        {
          value: "current_year",
          label: "This Year",
          count:
            timeCounts.current_year,
        },
        {
          value: "previous_year",
          label: "Last Year",
          count:
            timeCounts.previous_year,
        },
        {
          value: "two_years_ago",
          label: "2 Years Ago",
          count:
            timeCounts.two_years_ago,
        },
        {
          value: "older",
          label: "Older",
          count:
            timeCounts.older,
        },
      ],
      [timeCounts],
    );

  /**
   * Apply filters.
   */
  const filteredOrderItems = useMemo(() => {
    const normalizedQuery =
      normalizeOrderSearchText(query);

    return orderItemsList
      .filter((entry) => {
        /**
         * STATUS FILTER
         */
        if (statusFilters.length) {
          const selectedStatus =
            statusFilters[0];

          /**
           * Returned is STRICTLY item-level.
           *
           * This prevents normal confirmed,
           * in_transit and delivered products
           * from appearing in Returned.
           */
          if (
            selectedStatus === "returned"
          ) {
            if (!entry?.isReturned) {
              return false;
            }
          } else if (
            entry?.filterCategory !==
            selectedStatus
          ) {
            return false;
          }
        }

        /**
         * TIME FILTER
         */
        if (timeFilters.length) {
          if (
            !matchesTimeFilter(
              entry?.orderDate,
              timeFilters[0],
            )
          ) {
            return false;
          }
        }

        /**
         * SEARCH
         */
        if (normalizedQuery) {
          const searchableText =
            getItemSearchText(
              entry?.item || entry,
              entry?.order,
            );

          if (
            !searchableText.includes(
              normalizedQuery,
            )
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a?.orderDate || 0,
        ).getTime();

        const dateB = new Date(
          b?.orderDate || 0,
        ).getTime();

        return dateB - dateA;
      });
  }, [
    orderItemsList,
    statusFilters,
    timeFilters,
    query,
  ]);

  const totalOrders =
    filteredOrderItems.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalOrders / pageSize,
    ),
  );

  /**
   * Keep current page valid after filtering.
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /**
   * Current page items.
   */
  const paginatedOrderItems =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        pageSize;

      const endIndex =
        startIndex + pageSize;

      return filteredOrderItems.slice(
        startIndex,
        endIndex,
      );
    }, [
      filteredOrderItems,
      currentPage,
      pageSize,
    ]);

  /**
   * Fetch order history.
   */
  useEffect(() => {
    dispatch(
      fetchMyOrders({
        limit:
          ORDER_HISTORY_FETCH_LIMIT,
        offset: 0,
      }),
    );
  }, [dispatch]);

  /**
   * Reset page when filters/search/page size change.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilters,
    timeFilters,
    query,
    pageSize,
  ]);

  /**
   * Sync local filters with URL.
   */
  useEffect(() => {
    const params =
      new URLSearchParams();

    if (statusFilters.length) {
      params.set(
        "status",
        statusFilters[0],
      );
    }

    if (timeFilters.length) {
      params.set(
        "time",
        timeFilters[0],
      );
    }

    if (query.trim()) {
      params.set(
        "q",
        query.trim(),
      );
    }

    params.set(
      "limit",
      String(pageSize),
    );

    params.set(
      "page",
      String(currentPage),
    );

    const nextSearch =
      params.toString();

    if (
      locallySyncedSearchRef.current !==
      nextSearch
    ) {
      locallySyncedSearchRef.current =
        nextSearch;

      if (syncTimerRef.current) {
        clearTimeout(
          syncTimerRef.current,
        );
      }

      syncTimerRef.current =
        setTimeout(() => {
          setSearchParams(
            params,
            {
              replace: true,
            },
          );
        }, 0);
    }

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(
          syncTimerRef.current,
        );
      }
    };
  }, [
    statusFilters,
    timeFilters,
    query,
    pageSize,
    currentPage,
    setSearchParams,
  ]);

  /**
   * Sync URL changes back into state.
   */
  useEffect(() => {
    const currentSearch =
      searchParams.toString();

    if (
      currentSearch ===
      locallySyncedSearchRef.current
    ) {
      return;
    }

    locallySyncedSearchRef.current =
      currentSearch;

    const status =
      searchParams.get(
        "status",
      ) || "all";

    const time =
      searchParams.get(
        "time",
      ) || "all";

    const urlQuery =
      searchParams.get("q") || "";

    const urlPageSize =
      toPositiveInteger(
        searchParams.get(
          "limit",
        ),
        10,
      );

    const urlPage =
      toPositiveInteger(
        searchParams.get(
          "page",
        ),
        1,
      );

    setStatusFilters(
      status === "all"
        ? []
        : [status],
    );

    setTimeFilters(
      time === "all"
        ? []
        : [time],
    );

    setQuery(urlQuery);

    setPageSizeState(
      urlPageSize,
    );

    setCurrentPage(
      urlPage,
    );
  }, [searchParams]);

  const setPageSize = (value) => {
    const nextSize =
      toPositiveInteger(
        value,
        10,
      );

    setPageSizeState(
      nextSize,
    );

    setCurrentPage(1);
  };

  const handleStatusFiltersChange = (
    values,
  ) => {
    const nextValues =
      Array.isArray(values)
        ? values
        : values
          ? [values]
          : [];

    setStatusFilters(
      nextValues,
    );

    setCurrentPage(1);
  };

  const handleTimeFiltersChange = (
    values,
  ) => {
    const nextValues =
      Array.isArray(values)
        ? values
        : values
          ? [values]
          : [];

    setTimeFilters(
      nextValues,
    );

    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setTimeFilters([]);
    setQuery("");
    setCurrentPage(1);
  };

  const hasAnyOrders =
    allOrders.length > 0;

  return {
    state,

    navigate,

    allOrders,

    filteredOrderItems,

    /**
     * Current page items.
     *
     * Each entry contains:
     * {
     *   order,
     *   item,
     *   orderItem,
     *   isReturned,
     *   itemStatus,
     *   filterCategory,
     *   returns
     * }
     */
    orderItemsList:
      paginatedOrderItems,

    totalOrders,

    hasAnyOrders,

    statusFilters,

    setStatusFilters:
      handleStatusFiltersChange,

    timeFilters,

    setTimeFilters:
      handleTimeFiltersChange,

    query,

    setQuery: (value) => {
      setQuery(value);
      setCurrentPage(1);
    },

    availableStatusFilters,

    availableTimeFilters,

    statusCounts,

    timeCounts,

    pageSize,

    setPageSize,

    currentPage,

    setCurrentPage,

    totalPages,

    clearFilters,

    getOrderReturns,

    hasReturnedItem,
  };
}