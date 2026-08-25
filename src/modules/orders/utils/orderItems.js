import { getProductPublicPath } from "../../../utils/ecommerce";

export {
  getItemProductId,
  getOrderItemVariantId as getItemVariantId,
  getOrderItemVariantSku as getItemVariantSku,
  getOrderItemId as getItemId,
  returnItemMatchesOrderItem,
  getCancellationForItem,
  getItemReturnPolicy,
  getReturnForItem as resolveReturnForItem,
  getReturnItemQuantity,
  isReturnQuantityBlocking,
  getReturnedQuantityForItem,
  getReturnableQuantityForItem,
} from "../../../utils/pages/orderUtils";

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

export const getItemQuantity = (item = {}) =>
  Math.max(1, Number(item.quantity || item.qty || 1) || 1);

export const getOrderItemProductPath = (item) => {
  const productId = getItemProductId(item);
  return productId ? getProductPublicPath(item?.product || item?.productId || { id: productId }) : "";
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
  refund_pending: "Refund Pending",
  refund_failed: "Refund Failed",
  partially_refunded: "Partially Refunded",
  cancelled: "Cancelled",
  cancellation_requested: "Cancellation Requested",
  cancellation_approved: "Cancellation Approved",
  cancellation_rejected: "Cancellation Rejected",
  cancellation_failed: "Cancellation Failed",
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

export const isDeliveredStatus = (status) =>
  DELIVERED_STATUSES.has(String(status || "").toLowerCase());

export const isClosedItemStatus = (status) =>
  ["cancelled", "returned", "refunded", "replaced", "closed"].includes(
    String(status || "").toLowerCase(),
  );

export const resolveItemStatus = ({
  item = {},
  shipment = null,
  fulfillment = {},
  returnRequest = null,
  cancellationRequest = null,
  orderStatus = "",
}) => {
  if (cancellationRequest?.status) {
    if (cancellationRequest.status === "requested") return "cancellation_requested";
    if (cancellationRequest.status === "approved") return "cancellation_approved";
    if (cancellationRequest.status === "rejected") return "cancellation_rejected";
    if (cancellationRequest.status === "failed") return "cancellation_failed";
    return `cancellation_${cancellationRequest.status}`;
  }

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
  const refundStatus = String(
    returnRequest?.refund?.status ||
      item.return_lifecycle?.refundStatus ||
      item.returnLifecycle?.refundStatus ||
      "",
  ).toLowerCase();
  if (["pending", "provider_pending", "manual_review"].includes(refundStatus)) {
    return "refund_pending";
  }
  if (refundStatus === "failed") return "refund_failed";
  if (returnRequest?.status === "partially_refunded") return "partially_refunded";
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
