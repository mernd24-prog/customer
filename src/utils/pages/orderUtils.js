import { getImageUrlFromValue } from "../../utils/ecommerce";
import {
  getOrderId,
  getOrderNumber,
  getOrderItems,
  getItemProduct,
  getItemImage,
  getOrderCurrency,
  getAddressValue,
  getItemUnitPrice,
  getItemLineTotal,
  idsMatch,
  unwrapOrder,
  getCustomerOrderAmount,
  asNumber,
  formatOrderDate,
  formatOrderId,
  getOrderProductTitle as getProductTitle,
  getItemReturnPolicy,
  getReturnForItem,
  getReturnItemQuantity,
  isReturnQuantityBlocking,
  getReturnedQuantityForItem,
  getReturnableQuantityForItem,
  getCancelledQuantityForItem,
} from "../../utils/orderHelpers";

export {
  getOrderId,
  getOrderNumber,
  getOrderItems,
  getItemProduct,
  getItemImage,
  getOrderCurrency,
  getAddressValue,
  getItemUnitPrice,
  getItemLineTotal,
  idsMatch,
  unwrapOrder,
  getCustomerOrderAmount,
  asNumber,
  formatOrderDate,
  formatOrderId,
  getProductTitle,
  getItemReturnPolicy,
  getReturnForItem,
  getReturnItemQuantity,
  isReturnQuantityBlocking,
  getReturnedQuantityForItem,
  getReturnableQuantityForItem,
  getCancelledQuantityForItem,
};
export const getOrderStatus = (order) =>
  order?.status || order?.orderStatus || "unknown";
export const getDeliveryStatus = (order) =>
  order?.delivery_status || order?.deliveryStatus || null;
export const getProgressStatus = (order) => {
  const status = getOrderStatus(order);
  const deliveryStatus = getDeliveryStatus(order);
  if (
    deliveryStatus === "delivered" &&
    !["fulfilled", "cancelled"].includes(status)
  ) {
    return "delivered";
  }
  if (deliveryStatus === "partially_delivered") return "out_for_delivery";
  if (
    deliveryStatus === "out_for_delivery" &&
    ["confirmed", "packed", "shipped"].includes(status)
  ) {
    return "out_for_delivery";
  }
  return status;
};
export const hasKnownStatus = (order) => getOrderStatus(order) !== "unknown";
export const canCancelOrder = (order) => {
  const status = getOrderStatus(order);
  const deliveryStatus = order?.delivery_status || order?.deliveryStatus;
  const cancellableStatuses = [
    "pending_payment",
    "payment_failed",
    "confirmed",
    "packed",
  ];
  const preHandoverDeliveryStatuses = [
    undefined,
    null,
    "",
    "initiated",
    "cancelled",
    "failed",
  ];
  return (
    cancellableStatuses.includes(status) &&
    preHandoverDeliveryStatuses.includes(deliveryStatus)
  );
};

export const isDeliveredOrderItem = (item = {}) =>
  Boolean(item.delivered_at || item.deliveredAt) ||
  ["delivered", "fulfilled", "completed"].includes(
    String(
      item.delivery_status || item.deliveryStatus || item.status || "",
    ).toLowerCase(),
  );
export const hasDeliveredSellerPackage = (order = {}) => {
  if (getOrderStatus(order) === "fulfilled") return true;
  const fulfillmentGroups = order?.relations?.sellerFulfillmentGroups || [];
  if (
    fulfillmentGroups.some((group) =>
      ["delivered", "fulfilled", "completed"].includes(
        String(
          group.deliveryStatus ||
            group.delivery_status ||
            group.shipmentStatus ||
            "",
        ).toLowerCase(),
      ),
    )
  )
    return true;

  const grouped = new Map();
  getOrderItems(order).forEach((item) => {
    const key = `${item.seller_id || item.sellerId || "platform"}:${item.organization_id || item.organizationId || "default"}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  return [...grouped.values()].some(
    (sellerItems) =>
      sellerItems.length > 0 && sellerItems.every(isDeliveredOrderItem),
  );
};


export const getItemProductId = (item) => {
  const product = getItemProduct(item);
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

export const getItemProductPath = (item) => {
  const productId = getItemProductId(item);
  return productId ? `/products/${productId}` : "";
};




export const getItemAttributes = (item) => {
  const attributes =
    item?.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {};
  return Object.entries(attributes).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
};

export const getOrderCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const getMatchingOrder = ({ current, entities, orders, orderId }) => {
  const currentOrder = unwrapOrder(current);
  if (idsMatch(getOrderId(currentOrder), orderId)) return currentOrder;

  const entityOrder = unwrapOrder(entities?.[orderId]);
  if (idsMatch(getOrderId(entityOrder), orderId)) return entityOrder;

  return orders.find((item) => idsMatch(getOrderId(item), orderId)) || null;
};
export const getItemsTotal = (order) =>
  getOrderItems(order).reduce(
    (total, item) => total + asNumber(getItemLineTotal(item)),
    0,
  );
export const getAmount = (order, key) => {
  const snakeKey = {
    subtotal: "subtotal_amount",
    discount: "discount_amount",
    tax: "tax_amount",
    total: "total_amount",
    walletDiscount: "wallet_discount_amount",
    payable: "payable_amount",
    platformFee: "platform_fee_amount",
    shipping: "shipping_fee_amount",
  }[key];

  const aliases =
    {
      subtotal: ["subtotalAmount", "subTotal", "subtotal"],
      discount: ["discountAmount", "discount"],
      tax: ["taxAmount", "totalTaxAmount", "tax"],
      total: ["totalAmount", "orderTotal", "grandTotal", "total"],
      walletDiscount: ["walletDiscountAmount", "walletDiscount"],
      payable: ["payableAmount", "payable", "amountPayable", "totalAmount"],
      platformFee: ["platformFeeAmount", "platformFee"],
      shipping: [
        "shippingFeeAmount",
        "deliveryChargeAmount",
        "delivery_charge_amount",
        "shippingFee",
        "deliveryCharge",
        "delivery_charge",
        "shippingAmount",
        "shipping",
      ],
    }[key] || [];

  for (const field of [key, snakeKey, ...aliases]) {
    if (field && order?.summary?.[field] !== undefined)
      return order.summary[field];
    if (field && order?.amounts?.[field] !== undefined)
      return order.amounts[field];
    if (field && order?.[field] !== undefined) return order[field];
  }

  if (
    ["subtotal", "total", "payable"].includes(key) &&
    getOrderItems(order).length
  ) {
    return getItemsTotal(order);
  }

  return undefined;
};

export const getTaxIncludedAmount = (order, taxBreakup = {}) =>
  asNumber(
    order?.summary?.taxIncludedAmount ??
      taxBreakup?.taxIncludedAmount ??
      taxBreakup?.tax_included_amount ??
      0,
  );
export const getTaxPayableAmount = (order, taxBreakup = {}) =>
  asNumber(
    order?.summary?.taxPayableAmount ??
      taxBreakup?.taxPayableAmount ??
      taxBreakup?.tax_payable_amount ??
      0,
  );
export const getCustomerPlatformFeeAmount = (order) => {
  const customerSpecificFee = asNumber(
    order?.summary?.customerPlatformFeeAmount ??
      order?.summary?.customer_platform_fee_amount ??
      order?.amounts?.customerPlatformFeeAmount ??
      order?.amounts?.customer_platform_fee_amount ??
      order?.customerPlatformFeeAmount ??
      order?.customer_platform_fee_amount ??
      order?.metadata?.pricingSummary?.customerPlatformFeeAmount ??
      order?.metadata?.pricing_summary?.customer_platform_fee_amount,
  );
  const platformFee = asNumber(getAmount(order, "platformFee"));
  return customerSpecificFee > 0 ? customerSpecificFee : platformFee;
};
export const getCustomerPlatformFeeTaxAmount = (order) =>
  asNumber(
    order?.summary?.customerPlatformFeeTaxAmount ??
      order?.summary?.customer_platform_fee_tax_amount ??
      order?.amounts?.customerPlatformFeeTaxAmount ??
      order?.amounts?.customer_platform_fee_tax_amount ??
      order?.customerPlatformFeeTaxAmount ??
      order?.customer_platform_fee_tax_amount ??
      order?.metadata?.pricingSummary?.customerPlatformFeeTaxAmount ??
      order?.metadata?.pricingSummary?.customerPlatformFeeGST ??
      order?.metadata?.pricing_summary?.customer_platform_fee_tax_amount,
  );
export const getCustomerPlatformFeeTaxRate = (order) =>
  asNumber(
    order?.summary?.platformFeeTaxRate ??
      order?.summary?.platform_fee_tax_rate ??
      order?.amounts?.platformFeeTaxRate ??
      order?.amounts?.platform_fee_tax_rate ??
      order?.metadata?.pricingSummary?.platformFeeTaxRate ??
      order?.metadata?.pricingSummary?.customerPlatformFeeTaxRate ??
      order?.metadata?.pricing_summary?.platform_fee_tax_rate ??
      18,
  );
export const splitInclusivePlatformFee = (fee, taxAmount, taxRate = 18) => {
  const gross = asNumber(fee);
  const configuredTax = asNumber(taxAmount);
  const rate = asNumber(taxRate);
  if (gross <= 0) return { platformFeeBase: 0, platformFeeTax: 0 };
  if (configuredTax > 0)
    return { platformFeeBase: gross, platformFeeTax: configuredTax };
  if (rate <= 0) return { platformFeeBase: gross, platformFeeTax: 0 };
  const platformFeeBase = Number((gross / (1 + rate / 100)).toFixed(2));
  return {
    platformFeeBase,
    platformFeeTax: Number((gross - platformFeeBase).toFixed(2)),
  };
};

export const getApiOrderId = (order) => String(getOrderNumber(order) || "").trim();
export const normalizeOrderSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/order\s*id/g, "")
    .replace(/[^a-z0-9]+/g, "");
export const getOrderRelations = (order) => order?.relations || {};
export const getPaymentMethod = (order) => {
  const payment = getOrderRelations(order).payments?.[0];
  return (
    payment?.provider ||
    order?.payment_provider ||
    order?.paymentProvider ||
    "N/A"
  );
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
  return_completed: "Return Completed",
};

export const humanize = (value, fallback = "N/A") => {
  if (!value) return fallback;
  const normalized = String(value).toLowerCase();
  if (STATUS_LABELS[normalized]) return STATUS_LABELS[normalized];
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};


export function getOrderItemColor(item) {
  const found = getItemAttributes(item).find(([key]) =>
    String(key).toLowerCase().includes("color"),
  );
  return found?.[1] || item?.color || item?.selectedColor || "N/A";
}

export const getOrderItemId = (item = {}) =>
  String(item.id || item._id || item.orderItemId || item.order_item_id || "");

export const getOrderItemVariantId = (item = {}) =>
  item.variant_id ||
  item.variantId ||
  item.variant?._id ||
  item.variant?.id ||
  "";

export const getOrderItemVariantSku = (item = {}) =>
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
  const itemId = String(getOrderItemId(item) || "");
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

  const productId = String(getItemProductId(item) || "");
  const returnProductId = String(getReturnItemProductId(returnItem) || "");
  if (!productId || !returnProductId || productId !== returnProductId)
    return false;

  const variantId = String(getOrderItemVariantId(item) || "");
  const returnVariantId = String(getReturnItemVariantId(returnItem) || "");
  if (variantId || returnVariantId) return variantId === returnVariantId;

  const variantSku = String(getOrderItemVariantSku(item) || "");
  const returnVariantSku = String(getReturnItemVariantSku(returnItem) || "");
  if (variantSku || returnVariantSku) return variantSku === returnVariantSku;

  return true;
};

export const getSellerGroupKey = (sellerId, organizationId = null) =>
  `${String(sellerId || "platform")}:${organizationId || "default"}`;

export const getOrderItemSellerGroupKey = (item = {}) =>
  getSellerGroupKey(
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

export const findShipmentForOrderItem = (shipments = [], item = {}) => {
  const itemId = getOrderItemId(item);
  const groupKey = getOrderItemSellerGroupKey(item);
  return shipments.find((shipment) => {
    if (String(shipment.direction || "forward") === "reverse") return false;
    const ids =
      shipment.orderItemIds ||
      shipment.order_item_ids ||
      shipment.metadata?.orderItemIds ||
      [];
    if (ids.length) return ids.map(String).includes(itemId);
    return (
      getSellerGroupKey(
        shipment.seller_id || shipment.sellerId,
        shipment.organization_id ||
          shipment.organizationId ||
          shipment.metadata?.organizationId,
      ) === groupKey
    );
  });
};

export const resolveOrderItemDisplayStatus = (
  item = {},
  fallbackStatus = "",
  shipments = [],
  fulfillmentGroups = [],
) => {
  const shipment = findShipmentForOrderItem(shipments, item);
  const payoutStatus = String(
    item.payout_status || item.payoutStatus || "",
  ).toLowerCase();
  const fallback = String(fallbackStatus || "").toLowerCase();

  let fulfillmentReturnStatus = "";
  if (fulfillmentGroups && fulfillmentGroups.length > 0) {
    const itemSellerKey = getSellerGroupKey(
      item.seller_id || item.sellerId || "platform",
      item.organization_id || item.organizationId || "default",
    );
    const fulfillment = fulfillmentGroups.find(
      (group) =>
        getSellerGroupKey(
          group.sellerId || group.seller_id || "platform",
          group.organizationId || group.organization_id || "default",
        ) === itemSellerKey,
    );
    if (fulfillment?.returnLifecycle?.status) {
      fulfillmentReturnStatus = fulfillment.returnLifecycle.status;
    }
  }

  return (
    item.cancellation_status ||
    item.cancellationStatus ||
    item.return_status ||
    item.returnStatus ||
    fulfillmentReturnStatus ||
    (payoutStatus === "refunded" ? "refunded" : "") ||
    (payoutStatus === "held" && fallback.includes("return") ? fallback : "") ||
    item.delivery_status ||
    item.deliveryStatus ||
    item.status ||
    item.item_status ||
    item.itemStatus ||
    shipment?.status ||
    fallbackStatus ||
    "processing"
  );
};

export const getOrderCardImage = (item) => {
  return (
    getImageUrlFromValue(getItemImage(item)) ||
    getImageUrlFromValue(getItemProduct(item)?.image) ||
    getImageUrlFromValue(getItemProduct(item)?.imageUrl) ||
    getImageUrlFromValue(getItemProduct(item)?.thumbnail)
  );
};
