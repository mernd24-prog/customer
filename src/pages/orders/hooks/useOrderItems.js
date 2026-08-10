export const DELIVERED_STATUSES = new Set(["delivered", "fulfilled", "completed"]);

export const reviewKeyForItem = (orderId, item) =>
  [
    orderId,
    item?.id || item?._id || item?.orderItemId || item?.order_item_id || "",
    item?.product_id ||
      item?.productId ||
      item?.product?.id ||
      item?.product?._id ||
      "",
  ].join(":");

export const getReviewProductId = (item) => {
  const productId = item?.product_id || item?.productId;
  if (productId && typeof productId === "object")
    return productId.id || productId._id;
  return productId || item?.product?.id || item?.product?._id || "";
};

export const getReviewOrderItemId = (item) =>
  item?.id || item?._id || item?.orderItemId || item?.order_item_id || "";

export const getOrderItemProductId = (item) => {
  const product =
    item?.productId && typeof item.productId === "object"
      ? item.productId
      : item?.product;

  return (
    product?._id ||
    product?.id ||
    (typeof product?.productId === "string" ? product.productId : "") ||
    (typeof item?.productId === "string" ? item.productId : "") ||
    item?.product_id ||
    item?.productId?._id ||
    item?.productId?.id ||
    ""
  );
};

export const getOrderItemProductPath = (item) => {
  const productId = getOrderItemProductId(item);
  return productId ? `/products/${productId}` : "";
};
export const STATUS_LABELS = {
  initiated: "Order Confirmed",
  pending_payment: "Pending Payment",
  payment_failed: "Payment Failed",
  confirmed: "Confirmed",
  in_transit: "In Transit",
  shipped: "Shipped",
  delivered: "Delivered",
  qc_passed: "Return QC Passed",
  return_qc_passed: "Return QC Passed",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  return_rejected: "Return Rejected",
  partially_returned: "Partially Returned",
  returned: "Returned",
  refunded: "Refunded",
  cancelled: "Cancelled",
  return_completed: "Return Completed",
};

export const label = (value = "") => {
  const text = String(value || "Not available");
  const normalized = text.toLowerCase();
  if (STATUS_LABELS[normalized]) return STATUS_LABELS[normalized];
  const formatted = text.replace(/_/g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const sellerGroupKey = (sellerId, organizationId = null) =>
  `${String(sellerId || "platform")}:${organizationId || "default"}`;

export const getItemSellerGroupKey = (item = {}) =>
  sellerGroupKey(
    item.seller_id ||
      item.sellerId ||
      item.seller?.id ||
      item.seller?._id ||
      "platform",
    item.organization_id ||
      item.organizationId ||
      item.organization?.id ||
      item.organization?._id ||
      null,
  );

export const getItemReturnPolicy = (item = {}) => {
  const snapshot = item.product_snapshot || item.productSnapshot || {};
  const policy =
    item.return_policy_snapshot ||
    item.returnPolicySnapshot ||
    snapshot.returnPolicy ||
    snapshot.return_policy ||
    snapshot.commercialPolicy?.returnPolicy ||
    {};
  return {
    returnable: item.returnable ?? policy.returnable ?? policy.eligible ?? true,
    days: Number(
      item.return_window_days ??
        policy.returnWindowDays ??
        policy.windowDays ??
        policy.days ??
        0,
    ),
    eligibleUntil:
      item.return_eligible_until ||
      item.returnEligibleUntil ||
      policy.eligibleUntil ||
      null,
  };
};

export const getItemId = (item = {}) =>
  String(item.id || item._id || item.orderItemId || item.order_item_id || "");

export const getItemQuantity = (item = {}) =>
  Math.max(1, Number(item.quantity || item.qty || 1) || 1);

export const getItemVariantId = (item = {}) =>
  item.variant_id ||
  item.variantId ||
  item.variant?._id ||
  item.variant?.id ||
  "";

export const getItemVariantSku = (item = {}) =>
  item.variant_sku ||
  item.variantSku ||
  item.sku ||
  item.productSku ||
  item.product_sku ||
  "";

export const getReturnItemProductId = (returnItem = {}) =>
  returnItem.productId ||
  returnItem.product_id ||
  returnItem.product?._id ||
  returnItem.product?.id ||
  "";

export const getReturnItemVariantId = (returnItem = {}) =>
  returnItem.variantId ||
  returnItem.variant_id ||
  returnItem.variant?._id ||
  returnItem.variant?.id ||
  "";

export const getReturnItemVariantSku = (returnItem = {}) =>
  returnItem.variantSku ||
  returnItem.variant_sku ||
  returnItem.sku ||
  returnItem.productSku ||
  returnItem.product_sku ||
  "";

export const returnItemMatchesOrderItem = (returnItem = {}, item = {}) => {
  const itemId = String(getItemId(item) || "");
  const returnOrderItemId = String(
    returnItem.orderItemId ||
      returnItem.order_item_id ||
      returnItem.itemId ||
      returnItem.item_id ||
      returnItem.orderLineItemId ||
      returnItem.order_line_item_id ||
      "",
  );
  if (itemId && returnOrderItemId) return returnOrderItemId === itemId;

  const productId = String(getOrderItemProductId(item) || "");
  const returnProductId = String(getReturnItemProductId(returnItem) || "");
  if (!productId || !returnProductId || productId !== returnProductId)
    return false;

  const variantId = String(getItemVariantId(item) || "");
  const returnVariantId = String(getReturnItemVariantId(returnItem) || "");
  if (variantId || returnVariantId) return variantId === returnVariantId;

  const variantSku = String(getItemVariantSku(item) || "");
  const returnVariantSku = String(getReturnItemVariantSku(returnItem) || "");
  if (variantSku || returnVariantSku) return variantSku === returnVariantSku;

  return true;
};

export const isDeliveredStatus = (status) =>
  DELIVERED_STATUSES.has(String(status || "").toLowerCase());

export const isClosedItemStatus = (status) =>
  ["cancelled", "returned", "refunded", "replaced", "closed"].includes(
    String(status || "").toLowerCase(),
  );

export const resolveReturnForItem = (returns = [], item = {}) => {
  for (const returnRequest of returns) {
    const match = (returnRequest.items || []).find((returnItem) =>
      returnItemMatchesOrderItem(returnItem, item),
    );
    if (match) return returnRequest;
  }
  return null;
};

export const getReturnItemQuantity = (returnItem = {}) =>
  Number(
    returnItem.receivedQuantity ??
      returnItem.received_quantity ??
      returnItem.approvedQuantity ??
      returnItem.approved_quantity ??
      returnItem.requestedQuantity ??
      returnItem.requested_quantity ??
      returnItem.quantity ??
      0,
  ) || 0;

export const isReturnQuantityBlocking = (returnRequest = {}) => {
  const status = String(returnRequest.status || "").toLowerCase();
  const refundStatus = String(
    returnRequest.refund?.status ||
      returnRequest.refundStatus ||
      returnRequest.refund_status ||
      "",
  ).toLowerCase();
  if (["rejected", "qc_failure_upheld"].includes(status)) return false;
  if (
    status === "closed" &&
    !["completed", "not_required"].includes(refundStatus)
  )
    return false;
  return true;
};

export const getReturnedQuantityForItem = (returns = [], item = {}) =>
  returns.reduce((sum, returnRequest) => {
    if (!isReturnQuantityBlocking(returnRequest)) return sum;
    const matchingItems = (returnRequest.items || []).filter((returnItem) =>
      returnItemMatchesOrderItem(returnItem, item),
    );
    return (
      sum +
      matchingItems.reduce(
        (itemSum, returnItem) => itemSum + getReturnItemQuantity(returnItem),
        0,
      )
    );
  }, 0);

export const getReturnableQuantityForItem = (returns = [], item = {}) =>
  Math.max(
    0,
    getItemQuantity(item) - getReturnedQuantityForItem(returns, item),
  );

export const resolveItemStatus = ({
  item = {},
  shipment = null,
  fulfillment = {},
  returnRequest = null,
  orderStatus = "",
}) => {
  const cancellationStatus =
    item.cancellation_status || item.cancellationStatus;
  const payoutStatus = String(
    item.payout_status || item.payoutStatus || "",
  ).toLowerCase();
  const orderStatusText = String(orderStatus || "").toLowerCase();
  if (cancellationStatus) return cancellationStatus;
  if (
    returnRequest?.refund?.status === "completed" ||
    returnRequest?.status === "refunded"
  ) {
    return "refunded";
  }
  if (returnRequest?.status) return `return_${returnRequest.status}`;
  if (payoutStatus === "refunded") return "refunded";
  if (payoutStatus === "held" && orderStatusText.includes("return"))
    return fulfillment?.returnLifecycle?.status || orderStatus;
  return (
    item.delivery_status ||
    item.deliveryStatus ||
    item.status ||
    item.item_status ||
    item.itemStatus ||
    shipment?.status ||
    fulfillment?.deliveryStatus ||
    fulfillment?.delivery_status ||
    fulfillment?.shipmentStatus ||
    fulfillment?.shipment_status ||
    orderStatus ||
    "preparing"
  );
};

export const resolveItemTracking = (shipment = {}) => ({
  courier:
    shipment.courier_name || shipment.courierName || shipment.provider || "",
  trackingNumber:
    shipment.tracking_number ||
    shipment.trackingNumber ||
    shipment.awb_number ||
    shipment.awbNumber ||
    "",
  trackingUrl: shipment.tracking_url || shipment.trackingUrl || "",
});

