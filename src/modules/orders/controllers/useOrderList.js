import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchMyOrders } from "../slices/orderSlice";
import { fetchMyReturns } from "../../returns/slices/returnsSlice";
import {
  getOrderCollection,
  getOrderId,
  getApiOrderId,
  formatOrderId,
  getOrderItems,
  getOrderItemId,
  getOrderStatus,
  resolveOrderItemDisplayStatus,
  returnItemMatchesOrderItem,
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
  "partially_returned",
  "return_requested",
  "requested",
  "return_approved",
  "approved",
  "return_rejected",
  "rejected",
  "return_completed",
  "return_qc_passed",
  "qc_passed",
  "qc_failed",
  "qc_completed",
  "qc_failure_upheld",
  "reverse_pickup_scheduled",
  "pickup_scheduled",
  "pickup_failed",
  "manual_ship_back",
  "shipped_back",
  "in_reverse_transit",
  "received",
  "refund_pending",
  "refund_failed",
  "partially_refunded",
  "refunded",
  "replacement_requested",
  "replacement_pending",
  "replacement_created",
  "replacement_shipped",
  "replacement_delivered",
  "replaced",
  "closed",
  "return_closed",
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
 * Get return records embedded directly inside an order.
 */
const getEmbeddedOrderReturns = (order) => {
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

/**
 * Get all return records that belong to this order.
 *
 * Return requests can exist in two places:
 *
 * 1. Embedded inside the order response.
 * 2. Inside the returns Redux state after the return API call.
 *
 * We merge both sources and remove duplicates.
 */
export const getOrderReturns = (order, allReturnRecords = []) => {
  if (!order) {
    return [];
  }

  const orderId = normalizeId(
    getOrderId(order) ||
      order?.id ||
      order?._id ||
      order?.orderId ||
      order?.order_id,
  );

  const apiOrderId = normalizeId(getApiOrderId(order));

  const orderNumber = String(
    order?.orderNumber ||
      order?.order_number ||
      order?.order_token ||
      order?.orderToken ||
      "",
  )
    .trim()
    .toLowerCase();

  const embeddedReturns = getEmbeddedOrderReturns(order);

  // Collect item IDs belonging to this order
  const orderItems = getOrderItems(order);
  const orderItemIds = new Set();
  orderItems.forEach((it) => {
    const id = normalizeId(
      getOrderItemId(it) ||
        it?._id ||
        it?.id ||
        it?.orderItemId ||
        it?.order_item_id,
    );
    if (id) orderItemIds.add(id);
  });

  const fetchedReturns = Array.isArray(allReturnRecords)
    ? allReturnRecords.filter((returnRecord) => {
        const returnOrderId = normalizeId(
          returnRecord?.orderId ||
            returnRecord?.order_id ||
            (typeof returnRecord?.order === "string"
              ? returnRecord.order
              : returnRecord?.order?._id || returnRecord?.order?.id),
        );

        const returnOrderNumber = String(
          returnRecord?.orderNumber ||
            returnRecord?.order_number ||
            (typeof returnRecord?.order === "object"
              ? returnRecord?.order?.orderNumber ||
                returnRecord?.order?.order_number
              : "") ||
            "",
        )
          .trim()
          .toLowerCase();

        if (orderId && returnOrderId && returnOrderId === orderId) {
          return true;
        }

        if (apiOrderId && returnOrderId && returnOrderId === apiOrderId) {
          return true;
        }

        if (
          orderNumber &&
          returnOrderNumber &&
          returnOrderNumber === orderNumber
        ) {
          return true;
        }

        const returnItemIds = getReturnItemIds(returnRecord);
        if (returnItemIds.some((id) => orderItemIds.has(id))) {
          return true;
        }

        return false;
      })
    : [];

  const combined = [
    ...embeddedReturns,
    ...fetchedReturns,
  ];

  return combined.filter((returnRecord, index, list) => {
    const id = String(
      returnRecord?.id ||
        returnRecord?._id ||
        returnRecord?.returnId ||
        returnRecord?.returnNumber ||
        returnRecord?.return_number ||
        `${returnRecord?.orderId || ""}:${index}`,
    );

    return (
      list.findIndex((candidate) => {
        const candidateId = String(
          candidate?.id ||
            candidate?._id ||
            candidate?.returnId ||
            candidate?.returnNumber ||
            candidate?.return_number ||
            "",
        );

        return candidateId && candidateId === id;
      }) === index
    );
  });
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
 * Check whether the specific item has an actual return request.
 *
 * IMPORTANT:
 * A delivered/fulfilled item is not treated as returned
 * unless there is a matching return record.
 */
export const hasReturnedItem = (
  order,
  item,
  allReturnRecords = [],
) => {
  if (!order && !item) {
    return false;
  }

  // 1. Check direct item return flags
  if (item) {
    if (item.is_returned || item.isReturned) {
      return true;
    }

    const itemReturnStatus = String(
      item.return_status ||
        item.returnStatus ||
        item.returnLifecycle?.status ||
        item.return_lifecycle?.status ||
        "",
    )
      .trim()
      .toLowerCase();

    if (itemReturnStatus && RETURN_STATUSES.has(itemReturnStatus)) {
      return true;
    }

    const itemStatus = String(item.status || "")
      .trim()
      .toLowerCase();

    if (itemStatus && RETURN_STATUSES.has(itemStatus)) {
      return true;
    }

    if (Array.isArray(item.returns) && item.returns.length > 0) {
      return true;
    }

    if (Array.isArray(item.returnRequests) && item.returnRequests.length > 0) {
      return true;
    }
  }

  // 2. Check return records matching this order and item
  const returns = getOrderReturns(order, allReturnRecords);

  if (returns.length > 0) {
    const itemIds = new Set();
    const addItemId = (value) => {
      const id = normalizeId(value);
      if (id) {
        itemIds.add(id);
      }
    };

    if (item) {
      addItemId(item._id);
      addItemId(item.id);
      addItemId(item.orderItemId);
      addItemId(item.order_item_id);
      addItemId(item.itemId);
      addItemId(item.item_id);
      addItemId(getOrderItemId(item));
    }

    const itemVariantId = normalizeId(
      item?.variantId ||
        item?.variant_id ||
        item?.variant?._id ||
        item?.variant?.id,
    );

    const itemProductId = normalizeId(
      item?.productId ||
        item?.product_id ||
        item?.product?._id ||
        item?.product?.id,
    );

    const matchesAnyReturn = returns.some((returnRecord) => {
      const returnStatus = getReturnStatus(returnRecord);

      if (returnStatus && !RETURN_STATUSES.has(returnStatus)) {
        return false;
      }

      const returnItems = Array.isArray(returnRecord?.items)
        ? returnRecord.items
        : Array.isArray(returnRecord?.returnItems)
          ? returnRecord.returnItems
          : [];

      if (returnItems.length > 0 && item) {
        return returnItems.some((retItem) =>
          returnItemMatchesOrderItem(retItem, item),
        );
      }

      const returnItemIds = getReturnItemIds(returnRecord);

      if (returnItemIds.length > 0 && itemIds.size > 0) {
        return returnItemIds.some((returnItemId) =>
          itemIds.has(returnItemId),
        );
      }

      if (item && (returnRecord?.item || returnRecord?.orderItem)) {
        if (
          returnRecord.item &&
          returnItemMatchesOrderItem(returnRecord.item, item)
        ) {
          return true;
        }
        if (
          returnRecord.orderItem &&
          returnItemMatchesOrderItem(returnRecord.orderItem, item)
        ) {
          return true;
        }
      }

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

      if (
        !returnItemIds.length &&
        !returnVariantId &&
        !returnProductId &&
        !returnItems.length
      ) {
        return true;
      }

      return false;
    });

    if (matchesAnyReturn) {
      return true;
    }
  }

  // 3. Order-level status
  if (order) {
    const rawOrderStatus = String(
      getOrderStatus(order) || order?.status || order?.order_status || "",
    )
      .trim()
      .toLowerCase();

    if (rawOrderStatus === "returned") {
      return true;
    }
  }

  return false;
};

/**
 * Convert an item/order status into the Orders page filter category.
 *
 * Return requests are treated as "returned" for the existing
 * Returned filter because the current Orders UI uses "Returned"
 * as the return/refund category.
 */
export const resolveOrderFilterCategory = (
  itemStatus,
  orderStatus,
  isReturned = false,
) => {
  const normItem = String(
    itemStatus || "",
  ).toLowerCase();

  const normOrder = String(
    orderStatus || "",
  ).toLowerCase();

  const deliveredSet = new Set([
    "delivered",
    "fulfilled",
    "completed",
    "partially_delivered",
  ]);

  const returnedSet = new Set([
    "returned",
    "return_requested",
    "requested",
    "return_approved",
    "approved",
    "return_completed",
    "partially_returned",
    "return_qc_passed",
    "qc_passed",
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
   * Explicit item-level return status.
   */
  if (returnedSet.has(normItem)) {
    return "returned";
  }

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

  const thirtyDaysAgo = new Date(
    startOfToday,
  );

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30,
  );

  if (date >= thirtyDaysAgo) {
    return "last_30_days";
  }

  if (
    date.getFullYear() ===
    now.getFullYear()
  ) {
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

const matchesTimeFilter = (
  dateValue,
  filter,
) => {
  if (!filter || filter === "all") {
    return true;
  }

  return (
    getTimeFilter(dateValue) ===
    filter
  );
};

const getItemSearchText = (
  item,
  order,
) => {
  const productTitle =
    getProductTitle(item);

  const orderId = formatOrderId(
    getOrderId(order) ||
      getApiOrderId(order),
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

export function useOrderList({
  returnOnly = false,
} = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const orderState = useSelector(
    (s) => s.order,
  );

  /**
   * Return requests are maintained separately
   * from the normal order state.
   */
  const returnsState = useSelector(
    (s) => s.returns,
  );

  const syncTimerRef = useRef(null);

  const locallySyncedSearchRef =
    useRef(searchParams.toString());

  const initialStatus =
    searchParams.get("status") ||
    "all";

  const initialTime =
    searchParams.get("time") ||
    "all";

  const initialQuery =
    searchParams.get("q") || "";

  const initialPageSize =
    toPositiveInteger(
      searchParams.get("limit"),
      10,
    );

  const initialPage =
    toPositiveInteger(
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
      Array.isArray(orderState?.list) &&
      orderState.list.length
    ) {
      return orderState.list;
    }

    const collection =
      getOrderCollection(
        orderState?.current,
      );

    return Array.isArray(collection)
      ? collection
      : [];
  }, [
    orderState?.list,
    orderState?.current,
  ]);

  /**
   * All return records available in Redux.
   */
  const allReturnRecords = useMemo(() => {
    if (Array.isArray(returnsState?.list) && returnsState.list.length > 0) {
      return returnsState.list;
    }
    if (Array.isArray(returnsState?.current?.returns)) {
      return returnsState.current.returns;
    }
    if (Array.isArray(returnsState?.current?.returnRequests)) {
      return returnsState.current.returnRequests;
    }
    if (Array.isArray(returnsState?.current?.return_requests)) {
      return returnsState.current.return_requests;
    }
    if (Array.isArray(returnsState?.current?.items)) {
      return returnsState.current.items;
    }
    if (Array.isArray(returnsState?.current) && returnsState.current.length > 0) {
      return returnsState.current;
    }
    if (returnsState?.entities && typeof returnsState.entities === "object") {
      const entityValues = Object.values(returnsState.entities).filter(Boolean);
      if (entityValues.length > 0) return entityValues;
    }
    return [];
  }, [returnsState?.list, returnsState?.current, returnsState?.entities]);

  /**
   * Flatten orders into individual items.
   *
   * Pagination is based on items, not packages/orders.
   */
  const allOrderItemsList = useMemo(() => {
    const flattened = [];
    const processedReturnIds = new Set();

    allOrders.forEach((order) => {
      const items = getOrderItems(order);

      if (!Array.isArray(items) || !items.length) {
        return;
      }

      const orderStatus = getOrderStatus(order);

      const shipments =
        order?.relations?.shipments ||
        order?.shipments ||
        [];

      const cancellations =
        order?.relations?.cancellations ||
        order?.cancellations ||
        [];

      /**
       * Get return records from BOTH:
       *
       * - order.relations.returns
       * - returns Redux state
       *
       * and only use return records belonging
       * to this specific order.
       */
      const returns = getOrderReturns(order, allReturnRecords);

      items.forEach((item, itemIndex) => {
        /**
         * Check this specific product.
         */
        const isReturned = hasReturnedItem(
          order,
          item,
          allReturnRecords,
        );

        // Find matching returns specifically for this item
        const matchingReturns = returns.filter((ret) => {
          const retItems = Array.isArray(ret.items)
            ? ret.items
            : Array.isArray(ret.returnItems)
              ? ret.returnItems
              : [];
          if (retItems.length > 0) {
            return retItems.some((ri) => returnItemMatchesOrderItem(ri, item));
          }
          const retItemIds = getReturnItemIds(ret);
          if (retItemIds.length > 0) {
            const itemId = normalizeId(getOrderItemId(item) || item?._id || item?.id);
            return retItemIds.includes(itemId);
          }
          return true;
        });

        const effectiveReturns = matchingReturns.length > 0 ? matchingReturns : returns;

        if (isReturned) {
          effectiveReturns.forEach((r) => {
            const rId = normalizeId(r?._id || r?.id || r?.returnId || r?.returnNumber);
            if (rId) processedReturnIds.add(rId);
          });
        }

        /**
         * Resolve display status using
         * the actual return records.
         */
        const itemStatus = resolveOrderItemDisplayStatus(
          item,
          orderStatus,
          shipments,
          [],
          cancellations,
          effectiveReturns,
        );

        const filterCategory = resolveOrderFilterCategory(
          itemStatus,
          orderStatus,
          isReturned,
        );

        const orderDate = getOrderItemDate(order);

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
          returns: effectiveReturns,
        });
      });
    });

    // In returnOnly mode: if there are return records in allReturnRecords
    // that were not attached to any item in allOrders (e.g. order not in current orders list or API delay),
    // synthesize item entries so no return is ever missing!
    if (returnOnly && Array.isArray(allReturnRecords)) {
      allReturnRecords.forEach((retRecord, retIndex) => {
        const rId = normalizeId(retRecord?._id || retRecord?.id || retRecord?.returnId || retRecord?.returnNumber);
        if (rId && processedReturnIds.has(rId)) {
          return;
        }

        const retItems = Array.isArray(retRecord?.items) && retRecord.items.length > 0
          ? retRecord.items
          : Array.isArray(retRecord?.returnItems) && retRecord.returnItems.length > 0
            ? retRecord.returnItems
            : [retRecord?.item || retRecord?.orderItem || retRecord];

        const retStatus = getReturnStatus(retRecord) || "return_requested";
        const retDate = retRecord?.requestedAt || retRecord?.createdAt || retRecord?.updatedAt || Date.now();

        const synthOrder = retRecord?.order && typeof retRecord.order === "object"
          ? retRecord.order
          : {
              _id: retRecord?.orderId || retRecord?.order_id || `order-${retIndex}`,
              id: retRecord?.orderId || retRecord?.order_id || `order-${retIndex}`,
              orderNumber: retRecord?.orderNumber || retRecord?.order_number || retRecord?.orderId || "",
              createdAt: retDate,
              status: "returned",
            };

        retItems.forEach((retItem, itIdx) => {
          const synthItem = {
            _id: retItem?._id || retItem?.id || retItem?.orderItemId || `ret-item-${retIndex}-${itIdx}`,
            id: retItem?.id || retItem?._id || retItem?.orderItemId || `ret-item-${retIndex}-${itIdx}`,
            name: retItem?.productTitle || retItem?.title || retItem?.name || "Returned Item",
            productTitle: retItem?.productTitle || retItem?.title || retItem?.name || "Returned Item",
            productImage: retItem?.productImage || retItem?.image || retItem?.thumbnail,
            image: retItem?.productImage || retItem?.image || retItem?.thumbnail,
            quantity: retItem?.quantity || retItem?.requestedQuantity || 1,
            unitPrice: retItem?.unitPrice || retItem?.lineTotal || retItem?.price || 0,
            lineTotal: retItem?.lineTotal || retItem?.unitPrice || retItem?.price || 0,
            sellerName: retItem?.sellerName || retRecord?.sellerName || "",
            ...retItem,
          };

          const itemStatus = resolveOrderItemDisplayStatus(
            synthItem,
            "returned",
            [],
            [],
            [],
            [retRecord],
          );

          flattened.push({
            ...synthItem,
            order: synthOrder,
            item: synthItem,
            orderItem: synthItem,
            itemIndex: itIdx,
            itemStatus,
            filterCategory: "returned",
            isReturned: true,
            orderStatus: "returned",
            orderDate: retDate,
            returns: [retRecord],
          });
        });
      });
    }

    return flattened;
  }, [allOrders, allReturnRecords, returnOnly]);

  /**
   * Base items list to operate on.
   * In returnOnly mode, only items that have an actual return are included.
   */
  const baseItemsList = useMemo(() => {
    if (returnOnly) {
      return allOrderItemsList.filter((entry) => entry.isReturned);
    }
    return allOrderItemsList;
  }, [allOrderItemsList, returnOnly]);

  /**
   * Count individual items by status.
   */
  const statusCounts = useMemo(() => {
    if (returnOnly) {
      const counts = {
        all: baseItemsList.length,
        return_requested: 0,
        return_approved: 0,
        reverse_pickup_scheduled: 0,
        in_reverse_transit: 0,
        return_qc_passed: 0,
        qc_failed: 0,
        refund_pending: 0,
        refunded: 0,
        partially_refunded: 0,
        return_rejected: 0,
        returned: 0,
      };

      baseItemsList.forEach((entry) => {
        const s = String(entry.itemStatus || "").toLowerCase();
        if (s === "return_requested" || s === "requested") {
          counts.return_requested += 1;
        } else if (s === "return_approved" || s === "approved") {
          counts.return_approved += 1;
        } else if (s === "reverse_pickup_scheduled" || s === "pickup_scheduled") {
          counts.reverse_pickup_scheduled += 1;
        } else if (s === "in_reverse_transit" || s === "shipped_back" || s === "manual_ship_back") {
          counts.in_reverse_transit += 1;
        } else if (s === "return_qc_passed" || s === "qc_passed" || s === "qc_completed") {
          counts.return_qc_passed += 1;
        } else if (s === "qc_failed" || s === "qc_failure_upheld") {
          counts.qc_failed += 1;
        } else if (s === "refund_pending") {
          counts.refund_pending += 1;
        } else if (s === "refunded") {
          counts.refunded += 1;
        } else if (s === "partially_refunded") {
          counts.partially_refunded += 1;
        } else if (s === "return_rejected" || s === "rejected") {
          counts.return_rejected += 1;
        } else {
          counts.returned += 1;
        }
      });

      return counts;
    }

    const counts = {
      all: baseItemsList.length,
      on_the_way: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      payment_failed: 0,
    };

    baseItemsList.forEach((item) => {
      const category = item?.filterCategory;

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
  }, [baseItemsList, returnOnly]);

  /**
   * Count individual items by date.
   */
  const timeCounts = useMemo(() => {
    const counts = {
      all: baseItemsList.length,
      last_30_days: 0,
      current_year: 0,
      previous_year: 0,
      two_years_ago: 0,
      older: 0,
    };

    baseItemsList.forEach((item) => {
      const timeCategory = getTimeFilter(
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
  }, [baseItemsList]);

  const availableStatusFilters = useMemo(() => {
    if (returnOnly) {
      const returnFilterDefs = [
        {
          value: "return_requested",
          label: "Requested",
          count: statusCounts.return_requested,
        },
        {
          value: "return_approved",
          label: "Approved",
          count: statusCounts.return_approved,
        },
        {
          value: "reverse_pickup_scheduled",
          label: "Pickup Scheduled",
          count: statusCounts.reverse_pickup_scheduled,
        },
        {
          value: "in_reverse_transit",
          label: "In Transit",
          count: statusCounts.in_reverse_transit,
        },
        {
          value: "return_qc_passed",
          label: "QC Passed",
          count: statusCounts.return_qc_passed,
        },
        {
          value: "qc_failed",
          label: "QC Failed",
          count: statusCounts.qc_failed,
        },
        {
          value: "refund_pending",
          label: "Refund Pending",
          count: statusCounts.refund_pending,
        },
        {
          value: "refunded",
          label: "Refunded",
          count: statusCounts.refunded,
        },
        {
          value: "partially_refunded",
          label: "Partially Refunded",
          count: statusCounts.partially_refunded,
        },
        {
          value: "return_rejected",
          label: "Rejected",
          count: statusCounts.return_rejected,
        },
        {
          value: "returned",
          label: "Completed",
          count: statusCounts.returned,
        },
      ];

      const hasAnyStatusCounts = returnFilterDefs.some((f) => f.count > 0);
      if (hasAnyStatusCounts) {
        return returnFilterDefs.filter((f) => f.count > 0);
      }
      return returnFilterDefs;
    }

    return [
      {
        value: "on_the_way",
        label: "On the Way",
        count: statusCounts.on_the_way,
      },
      {
        value: "delivered",
        label: "Delivered",
        count: statusCounts.delivered,
      },
      {
        value: "cancelled",
        label: "Cancelled",
        count: statusCounts.cancelled,
      },
      {
        value: "returned",
        label: "Returned",
        count: statusCounts.returned,
      },
      {
        value: "payment_failed",
        label: "Payment Failed",
        count: statusCounts.payment_failed,
      },
    ];
  }, [statusCounts, returnOnly]);

  const availableTimeFilters = useMemo(
    () => [
      {
        value: "last_30_days",
        label: "Last 30 Days",
        count: timeCounts.last_30_days,
      },
      {
        value: "current_year",
        label: "This Year",
        count: timeCounts.current_year,
      },
      {
        value: "previous_year",
        label: "Last Year",
        count: timeCounts.previous_year,
      },
      {
        value: "two_years_ago",
        label: "2 Years Ago",
        count: timeCounts.two_years_ago,
      },
      {
        value: "older",
        label: "Older",
        count: timeCounts.older,
      },
    ],
    [timeCounts],
  );

  /**
   * Apply filters.
   */
  const filteredOrderItems = useMemo(() => {
    const normalizedQuery = normalizeOrderSearchText(query);

    return baseItemsList
      .filter((entry) => {
        /**
         * STATUS FILTER
         */
        if (statusFilters.length) {
          const selectedStatus = statusFilters[0];

          if (returnOnly) {
            const s = String(entry?.itemStatus || "").toLowerCase();
            const returnRecordStatuses = (entry?.returns || []).map((r) =>
              getReturnStatus(r),
            );

            const matchesStatus = (target) => {
              if (s === target) return true;
              return returnRecordStatuses.includes(target);
            };

            if (selectedStatus === "return_requested") {
              if (
                !matchesStatus("return_requested") &&
                !matchesStatus("requested")
              ) {
                return false;
              }
            } else if (selectedStatus === "return_approved") {
              if (
                !matchesStatus("return_approved") &&
                !matchesStatus("approved")
              ) {
                return false;
              }
            } else if (selectedStatus === "reverse_pickup_scheduled") {
              if (
                !matchesStatus("reverse_pickup_scheduled") &&
                !matchesStatus("pickup_scheduled")
              ) {
                return false;
              }
            } else if (selectedStatus === "in_reverse_transit") {
              if (
                !matchesStatus("in_reverse_transit") &&
                !matchesStatus("shipped_back") &&
                !matchesStatus("manual_ship_back")
              ) {
                return false;
              }
            } else if (selectedStatus === "return_qc_passed") {
              if (
                !matchesStatus("return_qc_passed") &&
                !matchesStatus("qc_passed") &&
                !matchesStatus("qc_completed")
              ) {
                return false;
              }
            } else if (selectedStatus === "qc_failed") {
              if (
                !matchesStatus("qc_failed") &&
                !matchesStatus("qc_failure_upheld")
              ) {
                return false;
              }
            } else if (selectedStatus === "refund_pending") {
              if (!matchesStatus("refund_pending")) {
                return false;
              }
            } else if (selectedStatus === "refunded") {
              if (!matchesStatus("refunded")) {
                return false;
              }
            } else if (selectedStatus === "partially_refunded") {
              if (!matchesStatus("partially_refunded")) {
                return false;
              }
            } else if (selectedStatus === "return_rejected") {
              if (
                !matchesStatus("return_rejected") &&
                !matchesStatus("rejected")
              ) {
                return false;
              }
            } else if (selectedStatus === "returned") {
              if (
                !matchesStatus("returned") &&
                !matchesStatus("return_completed") &&
                !matchesStatus("partially_returned") &&
                !matchesStatus("closed")
              ) {
                return false;
              }
            } else if (!matchesStatus(selectedStatus)) {
              return false;
            }
          } else {
            /**
             * Normal Orders page status filtering
             */
            if (selectedStatus === "returned") {
              if (
                !entry?.isReturned &&
                entry?.filterCategory !== "returned"
              ) {
                return false;
              }
            } else if (
              entry?.filterCategory !== selectedStatus
            ) {
              return false;
            }
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
          const searchableText = getItemSearchText(
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
    baseItemsList,
    statusFilters,
    timeFilters,
    query,
    returnOnly,
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
    if (
      currentPage > totalPages
    ) {
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
   * Fetch return records only for
   * the Returns & Refunds page.
   *
   * Normal Orders page does not
   * need the returns request.
   */
  useEffect(() => {
    if (!returnOnly) {
      return;
    }

    dispatch(fetchMyReturns());
  }, [
    dispatch,
    returnOnly,
  ]);

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

  const hasAnyOrders = useMemo(() => {
    if (returnOnly) {
      return baseItemsList.length > 0;
    }
    return allOrders.length > 0;
  }, [returnOnly, baseItemsList.length, allOrders.length]);

  const combinedState = useMemo(() => {
    if (returnOnly) {
      return {
        ...orderState,
        loading: Boolean(orderState?.loading || returnsState?.loading),
        error: returnsState?.error || orderState?.error || null,
        meta: returnsState?.meta || orderState?.meta || null,
      };
    }
    return orderState;
  }, [returnOnly, orderState, returnsState]);

  return {
    state: combinedState,

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