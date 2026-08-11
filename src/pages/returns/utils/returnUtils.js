import { getImageUrlFromValue } from "../../../utils/ecommerce";

export const RETURN_REASONS = [
  { value: "defective", label: "Defective / damaged" },
  { value: "damaged_in_transit", label: "Damaged in transit" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "missing_parts", label: "Parts or accessories missing" },
  { value: "size_issue", label: "Size or fit issue" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other reason" },
];

export const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.lineItems ||
    order?.line_items;
  return Array.isArray(items) ? items : [];
};
export const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
export const getItemProduct = (item) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product;
export const getItemProductId = (item) =>
  item?.product_id ||
  (typeof item?.productId === "object"
    ? item.productId?._id
    : item?.productId) ||
  "";
export const getItemTitle = (item) =>
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  (typeof item?.productId === "object"
    ? item.productId?.title || item.productId?.name
    : null) ||
  "Product";
export const getItemQuantity = (item) => Math.max(1, asNumber(item?.quantity || 1));
export const getItemLineTotal = (item) =>
  item?.line_total ??
  item?.lineTotal ??
  item?.total_price ??
  item?.totalPrice ??
  item?.amount ??
  item?.total ??
  null;
export const getItemUnitPrice = (item) => {
  const product = getItemProduct(item);
  const unitPrice =
    item?.unit_price ??
    item?.unitPrice ??
    item?.sale_price ??
    item?.salePrice ??
    item?.price ??
    item?.variant?.price ??
    product?.salePrice ??
    product?.sale_price ??
    product?.price;

  if (unitPrice !== undefined && unitPrice !== null && unitPrice !== "") {
    return asNumber(unitPrice);
  }

  const lineTotal = getItemLineTotal(item);
  if (lineTotal !== undefined && lineTotal !== null && lineTotal !== "") {
    return asNumber(lineTotal) / getItemQuantity(item);
  }

  return 0;
};
export const getDisplayItemPrice = (item) => {
  const lineTotal = getItemLineTotal(item);
  if (lineTotal !== undefined && lineTotal !== null && lineTotal !== "") {
    return asNumber(lineTotal);
  }

  return getItemUnitPrice(item) * getItemQuantity(item);
};
export const getSnapshot = (value) => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? value : {};
};
export const getItemDiscountAmount = (item) =>
  asNumber(
    item?.discount_amount ??
      item?.discountAmount ??
      getSnapshot(item?.pricing_snapshot || item?.pricingSnapshot)
        ?.discountAmount ??
      0,
  );
export const getOrderSummary = (order = {}) => {
  const metadata = getSnapshot(order?.metadata);
  return order?.summary || metadata.pricingSummary || metadata.summary || {};
};
export const getOrderMoney = (order = {}, keys = []) => {
  const summary = getOrderSummary(order);
  const metadata = getSnapshot(order?.metadata);
  for (const key of keys) {
    const value = order?.[key] ?? summary?.[key] ?? metadata?.[key];
    if (value !== undefined && value !== null && value !== "")
      return asNumber(value);
  }
  return 0;
};
export const shouldRefundComponent = (policy = {}, fullReturn = false) => {
  if (!policy || typeof policy !== "object") return false;
  if (!fullReturn && policy.partialReturn) return true;
  return Boolean(policy.customerReturn);
};
export const getRefundPolicy = (order = {}) => {
  const metadata = getSnapshot(order?.metadata);
  return (
    order?.summary?.refundPolicySnapshot ||
    order?.summary?.refund_policy_snapshot ||
    metadata?.commerceSettings?.returns?.refundPolicy ||
    metadata?.settings?.returns?.refundPolicy ||
    order?.commerceSettings?.returns?.refundPolicy ||
    order?.settings?.returns?.refundPolicy ||
    {}
  );
};
export const getPaymentMethod = (order = {}) => {
  const relations = order?.relations || {};
  const payment = Array.isArray(relations.payments)
    ? relations.payments[0]
    : null;
  return String(
    payment?.provider ||
      payment?.method ||
      order?.payment_provider ||
      order?.paymentProvider ||
      order?.payment_method ||
      order?.paymentMethod ||
      "",
  ).toLowerCase();
};
export const isCodOrder = (order = {}) => getPaymentMethod(order) === "cod";
export const calculateEstimatedRefundBreakup = (
  order = {},
  item = null,
  quantity = 1,
) => {
  if (!item) {
    return { total: 0, rows: [], note: "" };
  }
  const qty = Math.max(1, asNumber(quantity) || 1);
  const itemQty = getItemQuantity(item);
  const ratio = Math.min(qty / itemQty, 1);
  const orderItems = getOrderItems(order);
  const itemGross =
    asNumber(getItemLineTotal(item) ?? getItemUnitPrice(item) * itemQty) *
    ratio;
  const itemDiscount = getItemDiscountAmount(item) * ratio;
  const productPaid = Math.max(0, itemGross - itemDiscount);
  const orderSubtotal =
    getOrderMoney(order, ["subtotal_amount", "subtotalAmount"]) ||
    orderItems.reduce(
      (sum, orderItem) => sum + asNumber(getItemLineTotal(orderItem)),
      0,
    );
  const proportion =
    orderSubtotal > 0 ? Math.min(itemGross / orderSubtotal, 1) : 0;
  const policy = getRefundPolicy(order);
  const fullReturn = orderItems.length === 1 && qty >= itemQty;
  const shippingTotal = getOrderMoney(order, [
    "shipping_fee_amount",
    "shippingFeeAmount",
    "deliveryChargeAmount",
    "delivery_charge_amount",
  ]);
  const platformFeeTotal = getOrderMoney(order, [
    "customer_platform_fee_amount",
    "customerPlatformFeeAmount",
    "customerPlatformFee",
  ]);
  const platformFeeTaxTotal = getOrderMoney(order, [
    "customer_platform_fee_tax_amount",
    "customerPlatformFeeTaxAmount",
    "customerPlatformFeeGST",
  ]);
  const shippingRefundable = shouldRefundComponent(policy.shipping, fullReturn);
  const platformFeeRefundable = shouldRefundComponent(
    policy.platformFee,
    fullReturn,
  );
  const shippingRefund = shippingRefundable ? shippingTotal * proportion : 0;
  const platformFeeRefund = platformFeeRefundable
    ? platformFeeTotal * proportion
    : 0;
  const platformFeeTaxRefund = platformFeeRefundable
    ? platformFeeTaxTotal * proportion
    : 0;
  const total = Math.max(
    0,
    productPaid + shippingRefund + platformFeeRefund + platformFeeTaxRefund,
  );

  const cod = isCodOrder(order);

  return {
    total,
    rows: [
      {
        label: "Product amount paid by you",
        value: productPaid,
        tone: "credit",
      },
      shippingTotal > 0
        ? {
            label: shippingRefundable
              ? "Shipping refunded"
              : "Shipping not refundable",
            value: shippingRefundable ? shippingRefund : 0,
            displayValue: shippingRefundable ? null : "Not refundable",
            tone: shippingRefundable ? "credit" : "muted",
          }
        : null,
      platformFeeTotal + platformFeeTaxTotal > 0
        ? {
            label: platformFeeRefundable
              ? "Platform fee refunded"
              : "Platform fee not refundable",
            value: platformFeeRefund + platformFeeTaxRefund,
            displayValue: platformFeeRefundable ? null : "Not refundable",
            tone: platformFeeRefundable ? "credit" : "muted",
          }
        : null,
    ].filter(Boolean),
    note: cod
      ? "Refund is based on the COD amount payable for the returned quantity. After approval and QC, refund will be completed by wallet/bank/manual process according to the marketplace COD policy."
      : "Refund is based on the amount you paid for the returned quantity. Shipping and platform fee are added only if refundable as per policy.",
    cod,
  };
};
export const getItemImage = (item) => {
  const product = getItemProduct(item);
  const snapshot = item?.product_snapshot || item?.productSnapshot || {};
  const candidateImages = [
    item?.image,
    item?.imageUrl,
    item?.images,
    item?.thumbnail,
    item?.thumbnailUrl,
    item?.product_image,
    item?.productImage,
    item?.product_image_url,
    item?.productImageUrl,
    item?.product_thumbnail,
    item?.productThumbnail,
    item?.variant?.image,
    item?.variant?.images,
    item?.variant?.imageUrl,
    item?.variant?.thumbnail,
    item?.variant?.thumbnailUrl,
    snapshot?.images,
    snapshot?.image,
    snapshot?.imageUrl,
    snapshot?.thumbnail,
    snapshot?.thumbnailUrl,
    product?.image,
    product?.images,
    product?.imageUrl,
    product?.thumbnail,
    product?.thumbnailUrl,
    product?.product_image,
    product?.productImage,
    product?.product_image_url,
    product?.productImageUrl,
  ];

  for (const candidate of candidateImages) {
    const url = getImageUrlFromValue(candidate);
    if (url) return url;
  }
  return "";
};
export const getItemVariantSku = (item) => item?.variant_sku || item?.variantSku || "";
export const getItemVariantId = (item) =>
  item?.variant_id ||
  item?.variantId ||
  item?.variant?._id ||
  item?.variant?.id ||
  "";
export const getItemId = (item) =>
  item?.id || item?._id || item?.orderItemId || item?.order_item_id || "";
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

  const productId = String(getItemProductId(item) || "");
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
export const getItemReturnPolicy = (item = {}) => {
  const snapshot = item.product_snapshot || item.productSnapshot || {};
  const storedPolicy =
    item.return_policy_snapshot || item.returnPolicySnapshot || {};
  const policy =
    snapshot.returnPolicy ||
    snapshot.return_policy ||
    snapshot.commercialPolicy?.returnPolicy ||
    storedPolicy;
  return {
    returnable: policy.returnable ?? policy.eligible ?? true,
    days: Number(
      policy.returnWindowDays || policy.windowDays || policy.days || 0,
    ),
    requiresImages: Boolean(policy.requiresImages || policy.requires_images),
    inspectionRequired: policy.inspectionRequired ?? policy.requiresQc ?? true,
    eligibleUntil:
      item.return_eligible_until ||
      item.returnEligibleUntil ||
      policy.eligibleUntil ||
      null,
  };
};
export const getReturnForItem = (returns = [], item = {}) => {
  return returns.find((returnRequest) =>
    (returnRequest.items || []).some((returnItem) =>
      returnItemMatchesOrderItem(returnItem, item),
    ),
  );
};
export const getReturnItemQuantity = (returnItem = {}) =>
  asNumber(
    returnItem.receivedQuantity ??
      returnItem.received_quantity ??
      returnItem.approvedQuantity ??
      returnItem.approved_quantity ??
      returnItem.requestedQuantity ??
      returnItem.requested_quantity ??
      returnItem.quantity ??
      0,
  );
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
export const getReturnedQuantityForItem = (returns = [], item = {}) => {
  return returns.reduce((sum, returnRequest) => {
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
};
export const getCancelledQuantityForItem = (item = {}) =>
  Math.max(
    0,
    asNumber(
      item.cancelled_quantity ??
        item.cancelledQuantity ??
        item.cancellation_snapshot?.cancelledQuantity ??
        item.cancellationSnapshot?.cancelledQuantity ??
        0,
    ),
  );
export const getReturnableQuantityForItem = (returns = [], item = {}) => {
  const projectedQuantity = item.returnable_quantity ?? item.returnableQuantity;
  const cancellationAdjustedQuantity = projectedQuantity !== undefined && projectedQuantity !== null
    ? asNumber(projectedQuantity)
    : getItemQuantity(item) - getCancelledQuantityForItem(item);
  return Math.max(
    0,
    cancellationAdjustedQuantity - getReturnedQuantityForItem(returns, item),
  );
};
export const isDeliveredStatus = (status) =>
  ["delivered", "fulfilled", "completed"].includes(
    String(status || "").toLowerCase(),
  );
export const isItemDelivered = (order = {}, item = {}) => {
  if (
    item.delivered_at ||
    item.deliveredAt ||
    isDeliveredStatus(item.delivery_status || item.deliveryStatus)
  )
    return true;
  const itemId = String(getItemId(item));
  const shipments = order?.relations?.shipments || [];
  const shipment = shipments.find((entry) => {
    const ids = entry.orderItemIds || entry.order_item_ids || [];
    return ids.map(String).includes(itemId);
  });
  if (shipment) return isDeliveredStatus(shipment.status);
  const groups = order?.relations?.sellerFulfillmentGroups || [];
  const group = groups.find((entry) =>
    (entry.orderItemIds || entry.itemIds || []).map(String).includes(itemId),
  );
  if (group)
    return isDeliveredStatus(group.deliveryStatus || group.shipmentStatus);
  return isDeliveredStatus(order?.status);
};
