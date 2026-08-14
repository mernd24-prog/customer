import { getImageUrlFromValue } from "../../utils/ecommerce";
import {
  getOrderItemVariantSku as getItemVariantSku,
  getOrderItemVariantId as getItemVariantId,
  getOrderItemId as getItemId,
  getReturnItemProductId,
  getReturnItemVariantId,
  getReturnItemVariantSku,
  returnItemMatchesOrderItem,
  getItemReturnPolicy,
  getReturnForItem,
  getReturnItemQuantity,
  isReturnQuantityBlocking,
  getReturnedQuantityForItem,
  getCancelledQuantityForItem,
  getReturnableQuantityForItem,
} from "./orderUtils";

export {
  getItemVariantSku,
  getItemVariantId,
  getItemId,
  getReturnItemProductId,
  getReturnItemVariantId,
  getReturnItemVariantSku,
  returnItemMatchesOrderItem,
  getItemReturnPolicy,
  getReturnForItem,
  getReturnItemQuantity,
  isReturnQuantityBlocking,
  getReturnedQuantityForItem,
  getCancelledQuantityForItem,
  getReturnableQuantityForItem,
};

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
