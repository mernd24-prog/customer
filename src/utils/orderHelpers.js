/**
 * orderHelpers.js
 * Shared helper functions for reading order, item, address, and delivery data
 * from the API response (handles both camelCase and snake_case shapes).
 */

import { getImageUrlFromValue } from "./ecommerce";

// ---------------------------------------------------------------------------
// Generic
// ---------------------------------------------------------------------------

export const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const displayLabel = (value = "") =>
  String(value || "N/A").replace(/_/g, " ");

export const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const idsMatch = (left, right) =>
  String(left || "") === String(right || "");

// ---------------------------------------------------------------------------
// Order identity
// ---------------------------------------------------------------------------

export const getOrderId = (order) =>
  order?.id || order?._id || order?.orderId || order?.order_id;

export const getOrderNumber = (order) =>
  order?.order_number || order?.orderNumber || getOrderId(order);

// ---------------------------------------------------------------------------
// Order items
// ---------------------------------------------------------------------------

export const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.lineItems ||
    order?.line_items ||
    order?.products;
  return Array.isArray(items) ? items : [];
};

export const getItemProduct = (item) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product;

export const getItemImage = (item) => {
  const product = getItemProduct(item);
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
    product?.image,
    product?.images,
    product?.imageUrl,
    product?.thumbnail,
    product?.thumbnailUrl,
  ];

  for (const candidate of candidateImages) {
    const url = getImageUrlFromValue(candidate);
    if (url) return url;
  }
  return "";
};

export const getItemUnitPrice = (item) =>
  item?.unit_price ??
  item?.unitPrice ??
  item?.sale_price ??
  item?.salePrice ??
  item?.price ??
  item?.variant?.price ??
  getItemProduct(item)?.salePrice ??
  getItemProduct(item)?.sale_price ??
  getItemProduct(item)?.price ??
  0;

export const getItemLineTotal = (item) =>
  item?.line_total ??
  item?.lineTotal ??
  item?.total_price ??
  item?.totalPrice ??
  asNumber(getItemUnitPrice(item)) * asNumber(item?.quantity || 1);

export const getOrderProductTitle = (item) =>
  getItemProduct(item)?.title ||
  getItemProduct(item)?.name ||
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  "Product";

export const getOrderItemColor = (item) => {
  const attributes =
    item?.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {};
  const found = Object.entries(attributes).find(([key]) =>
    String(key).toLowerCase().includes("color"),
  );
  return found?.[1] || item?.color || item?.selectedColor || "N/A";
};

export const getOrderItemLineTotal = (item) => {
  const unitPrice =
    item?.unit_price ??
    item?.unitPrice ??
    item?.sale_price ??
    item?.salePrice ??
    item?.price ??
    item?.variant?.price ??
    getItemProduct(item)?.salePrice ??
    getItemProduct(item)?.sale_price ??
    getItemProduct(item)?.price ??
    0;
  const quantity = asNumber(item?.quantity || 1);
  return (
    item?.line_total ??
    item?.lineTotal ??
    item?.total_price ??
    item?.totalPrice ??
    asNumber(unitPrice) * quantity
  );
};

// ---------------------------------------------------------------------------
// Order currency
// ---------------------------------------------------------------------------

export const getOrderCurrency = (order) => {
  const firstItem = getOrderItems(order)[0];
  const firstProduct = getItemProduct(firstItem);
  return order?.currency || firstProduct?.currency || "INR";
};

// ---------------------------------------------------------------------------
// Address helpers
// ---------------------------------------------------------------------------

export const getAddressValue = (address, camelKey, snakeKey = camelKey) =>
  address?.[camelKey] || address?.[snakeKey];

export const getOrderAddressValue = getAddressValue;

export const getOrderAddressName = (address) => {
  const source = address?.user || address?.customer || address?.data || address;
  if (source && source !== address) return getOrderAddressName(source);

  const firstName = address?.firstName || address?.first_name;
  const lastName = address?.lastName || address?.last_name;
  const joinedName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    getOrderAddressValue(address, "fullName", "full_name") ||
    address?.name ||
    address?.displayName ||
    address?.display_name ||
    address?.userName ||
    address?.user_name ||
    address?.username ||
    address?.customerName ||
    address?.customer_name ||
    address?.recipientName ||
    address?.recipient_name ||
    address?.receiverName ||
    address?.receiver_name ||
    address?.contactName ||
    address?.contact_name ||
    joinedName
  );
};

export const getOrderPhone = (address) => {
  const source = address?.user || address?.customer || address?.data || address;
  if (source && source !== address) return getOrderPhone(source);

  return (
    address?.phone ||
    address?.phoneNumber ||
    address?.phone_number ||
    address?.mobile ||
    address?.mobileNo ||
    address?.mobile_no ||
    address?.contact ||
    address?.contactNumber ||
    address?.contact_number ||
    address?.telephone ||
    address?.telephoneNumber ||
    address?.telephone_number ||
    address?.mobileNumber ||
    address?.mobile_number
  );
};

export const hasOrderShippingAddress = (address) =>
  Boolean(
    getOrderAddressName(address) ||
      getOrderPhone(address) ||
      address?.line1 ||
      address?.address_line1 ||
      address?.line2 ||
      address?.address_line2 ||
      address?.city ||
      address?.state ||
      getOrderAddressValue(address, "postalCode", "postal_code") ||
      address?.pincode ||
      address?.zip ||
      address?.country,
  );

// ---------------------------------------------------------------------------
// Order amounts
// ---------------------------------------------------------------------------

export const getOrderAmount = (order, key) => {
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
        "shippingFee",
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
    return getOrderItems(order).reduce(
      (total, item) => total + asNumber(getOrderItemLineTotal(item)),
      0,
    );
  }

  return undefined;
};

export const getCustomerOrderAmount = (order) => {
  const subtotal =
    getOrderAmount(order, "subtotal") ??
    getOrderItems(order).reduce(
      (sum, item) => sum + asNumber(getOrderItemLineTotal(item)),
      0,
    );
  const discount = getOrderAmount(order, "discount") ?? 0;
  const walletDiscount = getOrderAmount(order, "walletDiscount") ?? 0;
  const shipping = getOrderAmount(order, "shipping") ?? 0;
  const taxPayable =
    order?.summary?.taxPayableAmount ??
    order?.summary?.tax_payable_amount ??
    order?.taxBreakup?.taxPayableAmount ??
    order?.tax_breakup?.tax_payable_amount ??
    0;
  const codCharge =
    order?.summary?.codChargeAmount ??
    order?.summary?.cod_charge_amount ??
    order?.amounts?.codChargeAmount ??
    order?.amounts?.cod_charge_amount ??
    0;
  const calculatedAmount = Number(
    Math.max(
      0,
      asNumber(subtotal) -
        asNumber(discount) +
        asNumber(shipping) +
        asNumber(taxPayable) +
        asNumber(codCharge) -
        asNumber(walletDiscount),
    ).toFixed(2),
  );

  if (order?.summary?.customerPayableAmount !== undefined) {
    const payableAmount = asNumber(order.summary.customerPayableAmount);
    return payableAmount > 0 || calculatedAmount <= 0
      ? payableAmount
      : calculatedAmount;
  }
  if (order?.summary?.customerTotalAmount !== undefined) {
    const payableAmount = Math.max(
      0,
      asNumber(order.summary.customerTotalAmount) -
        asNumber(order.summary.walletDiscountAmount),
    );
    return payableAmount > 0 || calculatedAmount <= 0
      ? payableAmount
      : calculatedAmount;
  }
  return calculatedAmount;
};

// ---------------------------------------------------------------------------
// Date / formatting
// ---------------------------------------------------------------------------

export const formatOrderDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export const formatOrderId = (id = "") => String(id);

// ---------------------------------------------------------------------------
// Delivery ETA
// ---------------------------------------------------------------------------

export const getDeliveryEtaDays = (order = {}) => {
  const metadata =
    order.metadata && typeof order.metadata === "object" ? order.metadata : {};
  const sellers = Array.isArray(metadata.deliveryCharge?.sellers)
    ? metadata.deliveryCharge.sellers
    : [];
  const etas = sellers.map((s) => s.estimatedDeliveryDays).filter(Boolean);
  if (!etas.length) return null;
  const minDays = Math.min(...etas.map((e) => Number(e.minDays ?? e.maxDays ?? 0)));
  const maxDays = Math.max(...etas.map((e) => Number(e.maxDays ?? e.minDays ?? 0)));
  if (!maxDays) return null;
  return { minDays: minDays > 0 ? minDays : null, maxDays };
};

export const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

export const getExpectedDeliveryDate = (order) =>
  order?.expected_delivery ||
  order?.expectedDelivery ||
  order?.delivery_date ||
  order?.deliveryDate ||
  order?.shipping?.expectedDelivery ||
  order?.shipmentDate ||
  order?.relations?.shipments?.[0]?.expected_delivery_at ||
  order?.relations?.shipments?.[0]?.expectedDeliveryAt ||
  null;

export const getDeliveryDateRange = (order = {}) => {
  const explicit = getExpectedDeliveryDate(order);
  if (explicit) return { minDate: null, maxDate: new Date(explicit) };
  const eta = getDeliveryEtaDays(order);
  if (!eta) return null;
  const base = order.created_at || order.createdAt || new Date();
  return {
    minDate: eta.minDays ? addDays(base, eta.minDays) : null,
    maxDate: addDays(base, eta.maxDays),
  };
};

// ---------------------------------------------------------------------------
// Order unwrapping / lookup
// ---------------------------------------------------------------------------

export const unwrapOrder = (value) => {
  const wrapper = value?.data?.order ? value.data : value;
  const order = wrapper?.order || wrapper;

  if (wrapper?.order && typeof wrapper.order === "object") {
    return {
      ...wrapper.order,
      items: getOrderItems(wrapper.order).length
        ? getOrderItems(wrapper.order)
        : getOrderItems(wrapper),
      amounts: wrapper.order.amounts || wrapper.amounts,
      shipping_address:
        wrapper.order.shipping_address || wrapper.shipping_address,
      shippingAddress: wrapper.order.shippingAddress || wrapper.shippingAddress,
      tax_breakup: wrapper.order.tax_breakup || wrapper.tax_breakup,
      taxBreakup: wrapper.order.taxBreakup || wrapper.taxBreakup,
    };
  }

  return order;
};

export const findFetchedOrder = (orderState, orderId) => {
  if (!orderId) return null;
  const currentOrder = unwrapOrder(orderState.current);
  if (idsMatch(getOrderId(currentOrder), orderId)) return currentOrder;

  const entityOrder = unwrapOrder(orderState.entities?.[orderId]);
  if (idsMatch(getOrderId(entityOrder), orderId)) return entityOrder;

  const listOrder = Array.isArray(orderState.list)
    ? orderState.list.find((item) => idsMatch(getOrderId(item), orderId))
    : null;
  return listOrder ? unwrapOrder(listOrder) : null;
};
