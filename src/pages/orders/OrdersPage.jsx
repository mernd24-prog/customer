import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdContentCopy } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import {
  Download,
  IndianRupee,
  Package,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/common/overlay/ConfirmModal";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import StickySidebarLayout from "../../components/common/layouts/StickySidebarLayout";
import OrderDetailSectionCard from "./components/OrderDetailSectionCard";
import OrderItemsSection from "./components/OrderItemsSection";
import OrderPaymentSummary from "./components/OrderPaymentSummary";
import OrderProgress from "./components/OrderProgress";
import ShipmentTrackingPanel from "./components/ShipmentTrackingPanel";
import { useToastThunk } from "../../hooks/useToastThunk";
import { notify } from "../../utils/notify";

import NeedHelpPanel from "../../components/ecommerce/NeedHelpPanel";
import CustomDropdown from "../../components/ui/CustomDropdown";

import {
  fetchMyOrders,
  fetchOrderById,
  cancelOrder,
  retryOrderPayment,
} from "../../features/order/orderSlice";
import {
  initiatePayment,
  verifyPayment,
} from "../../features/payment/paymentSlice";
import { fetchReturnByOrder } from "../../features/returns/returnsSlice";
import { fetchMarketplaceInvoices } from "../../features/tax/taxSlice";
import { fetchNotifications } from "../../features/notification/notificationSlice";
import { formatMoney, getImageUrlFromValue } from "../../utils/ecommerce";
import { downloadAuthDocument, getDocumentId } from "../../utils/downloadAuthDocument";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { endpoints } from "../../api/endpoints";
import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
  ORDER_FILTERS,
} from "../../data/orderPage";
import OrderDetailInfoGrid from "../../components/orderDetailInfoGrid/orderDetailInfoGrid";

const getOrderId = (order) =>
  order?.id || order?._id || order?.orderId || order?.order_id;
const getOrderNumber = (order) =>
  order?.order_number || order?.orderNumber || getOrderId(order);
const getOrderStatus = (order) =>
  order?.status || order?.orderStatus || "unknown";
const getPaymentStatus = (order) =>
  order?.payment_status || order?.paymentStatus || "unknown";
const getDeliveryStatus = (order) =>
  order?.delivery_status || order?.deliveryStatus || null;
const getProgressStatus = (order) => {
  const status = getOrderStatus(order);
  const deliveryStatus = getDeliveryStatus(order);
  if (deliveryStatus === "delivered" && !["fulfilled", "cancelled"].includes(status)) {
    return "delivered";
  }
  if (deliveryStatus === "partially_delivered") return "out_for_delivery";
  if (deliveryStatus === "out_for_delivery" && ["confirmed", "packed", "shipped"].includes(status)) {
    return "out_for_delivery";
  }
  return status;
};
const hasKnownStatus = (order) => getOrderStatus(order) !== "unknown";
const canCancelOrder = (order) => {
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
const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.lineItems ||
    order?.line_items ||
    order?.products;
  return Array.isArray(items) ? items : [];
};
const isDeliveredOrderItem = (item = {}) => Boolean(item.delivered_at || item.deliveredAt) ||
  ["delivered", "fulfilled", "completed"].includes(
    String(item.delivery_status || item.deliveryStatus || item.status || "").toLowerCase(),
  );
const hasDeliveredSellerPackage = (order = {}) => {
  if (getOrderStatus(order) === "fulfilled") return true;
  const fulfillmentGroups = order?.relations?.sellerFulfillmentGroups || [];
  if (fulfillmentGroups.some((group) =>
    ["delivered", "fulfilled", "completed"].includes(
      String(group.deliveryStatus || group.delivery_status || group.shipmentStatus || "").toLowerCase(),
    ),
  )) return true;

  const grouped = new Map();
  getOrderItems(order).forEach((item) => {
    const key = `${item.seller_id || item.sellerId || "platform"}:${item.organization_id || item.organizationId || "default"}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  return [...grouped.values()].some((sellerItems) =>
    sellerItems.length > 0 && sellerItems.every(isDeliveredOrderItem),
  );
};
const getItemProduct = (item) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product;

const getItemProductId = (item) => {
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

const getItemProductPath = (item) => {
  const productId = getItemProductId(item);
  return productId ? `/products/${productId}` : "";
};

const getItemImage = (item) => {
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

const getOrderCurrency = (order) => {
  const firstItem = getOrderItems(order)[0];
  const firstProduct = getItemProduct(firstItem);
  return order?.currency || firstProduct?.currency || "INR";
};
const getAddressValue = (address, camelKey, snakeKey = camelKey) =>
  address?.[camelKey] || address?.[snakeKey];

const hasShippingAddress = (address) =>
  Boolean(
    getAddressValue(address, "fullName", "full_name") ||
    address?.phone ||
    address?.line1 ||
    address?.line2 ||
    address?.city ||
    address?.state ||
    getAddressValue(address, "postalCode", "postal_code") ||
    address?.country,
  );
const getProductTitle = (item) =>
  getItemProduct(item)?.title ||
  getItemProduct(item)?.name ||
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  "Product";
const getItemAttributes = (item) => {
  const attributes =
    item?.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {};
  return Object.entries(attributes).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
};
const getItemUnitPrice = (item) =>
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
const getItemLineTotal = (item) =>
  item?.line_total ??
  item?.lineTotal ??
  item?.total_price ??
  item?.totalPrice ??
  asNumber(getItemUnitPrice(item)) * asNumber(item?.quantity || 1);

const idsMatch = (left, right) => String(left || "") === String(right || "");
const getOrderCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};
const unwrapOrder = (value) => {
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
const getMatchingOrder = ({ current, entities, orders, orderId }) => {
  const currentOrder = unwrapOrder(current);
  if (idsMatch(getOrderId(currentOrder), orderId)) return currentOrder;

  const entityOrder = unwrapOrder(entities?.[orderId]);
  if (idsMatch(getOrderId(entityOrder), orderId)) return entityOrder;

  return orders.find((item) => idsMatch(getOrderId(item), orderId)) || null;
};
const getItemsTotal = (order) =>
  getOrderItems(order).reduce(
    (total, item) => total + asNumber(getItemLineTotal(item)),
    0,
  );
const getAmount = (order, key) => {
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
const getCustomerOrderAmount = (order) => {
  const subtotal = getAmount(order, "subtotal") ?? getItemsTotal(order);
  const discount = getAmount(order, "discount") ?? 0;
  const walletDiscount = getAmount(order, "walletDiscount") ?? 0;
  const shipping = getAmount(order, "shipping") ?? 0;
  const platformFee = getAmount(order, "platformFee") ?? 0;
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
        asNumber(platformFee) +
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
const getTaxIncludedAmount = (order, taxBreakup = {}) =>
  asNumber(
    order?.summary?.taxIncludedAmount ??
      taxBreakup?.taxIncludedAmount ??
      taxBreakup?.tax_included_amount ??
      0,
  );
const getTaxPayableAmount = (order, taxBreakup = {}) =>
  asNumber(
    order?.summary?.taxPayableAmount ??
      taxBreakup?.taxPayableAmount ??
      taxBreakup?.tax_payable_amount ??
      0,
  );
const getCustomerPlatformFeeAmount = (order) => {
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
const getCustomerPlatformFeeTaxAmount = (order) =>
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
const getCustomerPlatformFeeTaxRate = (order) =>
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
const splitInclusivePlatformFee = (fee, taxAmount, taxRate = 18) => {
  const gross = asNumber(fee);
  const configuredTax = asNumber(taxAmount);
  const rate = asNumber(taxRate);
  if (gross <= 0) return { platformFeeBase: 0, platformFeeTax: 0 };
  if (configuredTax > 0) return { platformFeeBase: gross, platformFeeTax: configuredTax };
  if (rate <= 0) return { platformFeeBase: gross, platformFeeTax: 0 };
  const platformFeeBase = Number((gross / (1 + rate / 100)).toFixed(2));
  return {
    platformFeeBase,
    platformFeeTax: Number((gross - platformFeeBase).toFixed(2)),
  };
};
const formatOrderDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const formatOrderId = (id = "") => String(id).slice(0, 8).toUpperCase();
const getApiOrderId = (order) => String(getOrderNumber(order) || "").trim();
const normalizeOrderSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/order\s*id/g, "")
    .replace(/[^a-z0-9]+/g, "");
const getOrderRelations = (order) => order?.relations || {};
const getPaymentMethod = (order) => {
  const payment = getOrderRelations(order).payments?.[0];
  return (
    payment?.provider ||
    order?.payment_provider ||
    order?.paymentProvider ||
    "N/A"
  );
};
const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const humanize = (value, fallback = "N/A") =>
  value ? String(value).replace(/_/g, " ") : fallback;

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const run = useToastThunk();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonCode, setCancelReasonCode] = useState("changed_mind");
  const [cancelItems, setCancelItems] = useState({});
  const [invoices, setInvoices] = useState(null);
  const [, setInvoicesLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const state = useSelector((s) => s.order);
  const userState = useSelector((s) => s.user);
  const notificationState = useSelector((s) => s.notification);
  const returnsState = useSelector((s) => s.returns);

  const orders = getOrderCollection(state.current).length
    ? getOrderCollection(state.current)
    : state.list;

  const order = getMatchingOrder({
    current: state.current,
    entities: state.entities,
    orders,
    orderId,
  });

  const currency = getOrderCurrency(order);
  const items = getOrderItems(order);
  const cancellations = Array.isArray(order?.relations?.cancellations)
    ? order.relations.cancellations
    : [];
  const embeddedReturns = Array.isArray(order?.relations?.returns)
    ? order.relations.returns
    : Array.isArray(order?.returns)
      ? order.returns
      : Array.isArray(order?.returnRequests)
        ? order.returnRequests
        : [];
  const fetchedReturns = Array.isArray(returnsState.list)
    ? returnsState.list.filter((returnRequest) => String(returnRequest.orderId || returnRequest.order_id || "") === String(orderId))
    : [];
  const returns = [...fetchedReturns, ...embeddedReturns].filter((returnRequest, index, list) => {
    const id = String(
      returnRequest.id ||
      returnRequest._id ||
      returnRequest.returnId ||
      returnRequest.returnNumber ||
      returnRequest.return_number ||
      index,
    );
    return list.findIndex((candidate, candidateIndex) => String(
      candidate.id ||
      candidate._id ||
      candidate.returnId ||
      candidate.returnNumber ||
      candidate.return_number ||
      candidateIndex,
    ) === id) === index;
  });
  const shipments = Array.isArray(order?.relations?.shipments)
    ? order.relations.shipments
    : [];
  const selectedOrderItemId = searchParams.get("orderItemId") || "";
  const selectedOrderItem = selectedOrderItemId
    ? items.find((item) => getOrderItemId(item) === String(selectedOrderItemId))
    : null;
  const selectedItemReturn = selectedOrderItem
    ? returns.find((returnRequest) =>
      (returnRequest.items || []).some((returnItem) =>
        returnItemMatchesOrderItem(returnItem, selectedOrderItem),
      ),
    )
    : null;
  const selectedItemStatus = selectedOrderItem
    ? resolveOrderItemDisplayStatus(selectedOrderItem, getProgressStatus(order), shipments)
    : null;
  const selectedItemAmount = selectedOrderItem
    ? selectedOrderItem.line_total ?? selectedOrderItem.lineTotal ?? (Number(selectedOrderItem.unit_price || selectedOrderItem.unitPrice || 0) * Number(selectedOrderItem.quantity || 0))
    : null;
  const selectedItemShipment = selectedOrderItem
    ? findShipmentForOrderItem(shipments, selectedOrderItem)
    : null;
  const visibleShipments = selectedOrderItem
    ? [selectedItemShipment].filter(Boolean)
    : shipments;

  const getInvoiceUrl = (order) =>
    order?.invoice_url ||
    order?.invoiceUrl ||
    order?.relations?.invoice?.url ||
    null;

  const shippingAddress =
    order?.shipping_address || order?.shippingAddress || {};
  const taxBreakup = order?.tax_breakup || order?.taxBreakup;
  const subtotal = getAmount(order, "subtotal");
  const discount = getAmount(order, "discount");
  const tax = getAmount(order, "tax");
  const walletDiscount = getAmount(order, "walletDiscount");
  const shipping = getAmount(order, "shipping");
  const customerPlatformFee = getCustomerPlatformFeeAmount(order);
  const customerPlatformFeeTaxRate = getCustomerPlatformFeeTaxRate(order);
  const customerPlatformFeeSplit = splitInclusivePlatformFee(
    customerPlatformFee,
    getCustomerPlatformFeeTaxAmount(order),
    customerPlatformFeeTaxRate,
  );
  const customerPlatformFeeBase = customerPlatformFeeSplit.platformFeeBase;
  const customerPlatformFeeTax = customerPlatformFeeSplit.platformFeeTax;
  const pricingSummary =
    order?.metadata?.pricingSummary || order?.metadata?.pricing_summary || {};
  const customerAmount = getCustomerOrderAmount(order);
  const taxIncluded = getTaxIncludedAmount(order, taxBreakup);
  const taxPayable = getTaxPayableAmount(order, taxBreakup);
  const status = getOrderStatus(order);
  const progressStatus = getProgressStatus(order);
  const returnableItems = items.filter((item) => {
    const snapshot = item.return_policy_snapshot || item.returnPolicySnapshot || item.product_snapshot?.returnPolicy || {};
    return (item.returnable ?? snapshot.returnable ?? snapshot.eligible ?? true) === true;
  });
  const itemReturnDeadlines = returnableItems
    .map((item) => item.return_eligible_until || item.returnEligibleUntil || item.return_policy_snapshot?.eligibleUntil || item.returnPolicySnapshot?.eligibleUntil)
    .filter(Boolean);
  const returnEligibleUntil = itemReturnDeadlines.length
    ? itemReturnDeadlines.reduce((latest, value) => new Date(value).getTime() > new Date(latest).getTime() ? value : latest)
    : null;
  const returnWindowOpen = returnableItems.some((item) => {
    const deadline = item.return_eligible_until || item.returnEligibleUntil || item.return_policy_snapshot?.eligibleUntil || item.returnPolicySnapshot?.eligibleUntil;
    return !deadline || new Date(deadline).getTime() >= Date.now();
  });
  const canRequestReturn = [
    "delivered",
    "fulfilled",
    "partially_returned",
  ].includes(status) && returnWindowOpen && returnableItems.length > 0;
  const selectedItemReturnPolicy = selectedOrderItem
    ? selectedOrderItem.return_policy_snapshot ||
      selectedOrderItem.returnPolicySnapshot ||
      selectedOrderItem.product_snapshot?.returnPolicy ||
      {}
    : {};
  const selectedItemReturnDeadline = selectedOrderItem
    ? selectedOrderItem.return_eligible_until ||
      selectedOrderItem.returnEligibleUntil ||
      selectedItemReturnPolicy.eligibleUntil ||
      null
    : null;
  const selectedItemReturnWindowOpen = selectedOrderItem
    ? (!selectedItemReturnDeadline || new Date(selectedItemReturnDeadline).getTime() >= Date.now())
    : false;
  const selectedItemReturnedQuantity = selectedOrderItem
    ? returns.reduce((sum, returnRequest) => {
      const returnStatus = String(returnRequest.status || "").toLowerCase();
      const refundStatus = String(returnRequest.refund?.status || returnRequest.refundStatus || returnRequest.refund_status || "").toLowerCase();
      if (["rejected", "qc_failure_upheld"].includes(returnStatus)) return sum;
      if (returnStatus === "closed" && !["completed", "not_required"].includes(refundStatus)) return sum;
      return sum + (returnRequest.items || [])
        .filter((returnItem) =>
          returnItemMatchesOrderItem(returnItem, selectedOrderItem),
        )
        .reduce((itemSum, returnItem) => itemSum + Number(
          returnItem.receivedQuantity ??
          returnItem.received_quantity ??
          returnItem.approvedQuantity ??
          returnItem.approved_quantity ??
          returnItem.requestedQuantity ??
          returnItem.requested_quantity ??
          returnItem.quantity ??
          0,
        ), 0);
    }, 0)
    : 0;
  const selectedItemReturnableQuantity = selectedOrderItem
    ? Math.max(0, Number(selectedOrderItem.quantity || 0) - selectedItemReturnedQuantity)
    : 0;
  const selectedItemCanReturn = Boolean(
    selectedOrderItem &&
    selectedItemReturnableQuantity > 0 &&
    selectedItemReturnWindowOpen &&
    (selectedOrderItem.returnable ?? selectedItemReturnPolicy.returnable ?? selectedItemReturnPolicy.eligible ?? true) === true &&
    ["delivered", "fulfilled", "completed"].includes(
      String(selectedOrderItem.delivery_status || selectedOrderItem.deliveryStatus || selectedItemStatus || "").toLowerCase(),
    ),
  );
  const visibleOrderItems = selectedOrderItem ? [selectedOrderItem] : items;
  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const customerInvoices = Array.isArray(invoices?.sellerInvoices)
    ? invoices.sellerInvoices
    : [];
  const orderReceipt = invoices?.orderInvoice || null;
  const relationInvoices = Array.isArray(order?.relations?.invoices)
    ? order.relations.invoices
    : [];
  const getInvoiceType = (invoice = {}) =>
    String(invoice.invoiceType || invoice.invoice_type || invoice.type || "").toLowerCase();
  const customerFeeInvoice = invoices?.customerFeeInvoice ||
    relationInvoices.find((invoice) => getInvoiceType(invoice) === "platform_customer_fee") ||
    null;
  const pendingSellerDocuments = invoices?.pendingSellerDocuments || [];

  const invoiceSellerName = (invoice, index) => {
    const metadata = invoice?.metadata || {};
    const seller = metadata.seller || {};
    const organization = metadata.organization || invoice?.organizationSnapshot || {};
    return organization.legalBusinessName || organization.displayName ||
      seller.legalBusinessName || seller.businessName || seller.displayName ||
      `Seller ${index + 1}`;
  };
  const invoiceItemSummary = (invoice) => {
    const coveredItems = invoice?.metadata?.items || invoice?.metadata?.lineItems || [];
    const titles = coveredItems.map((item) => item.productTitle || item.description).filter(Boolean);
    if (!titles.length) return "Delivered seller items";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} + ${titles.length - 1} more`;
  };
  const documentCoversSelectedItem = (document = {}) => {
    if (!selectedOrderItem) return true;
    const selectedItemId = getOrderItemId(selectedOrderItem);
    if (!selectedItemId) return true;
    const metadata = document.metadata || {};
    const coveredItems = [
      ...(Array.isArray(metadata.items) ? metadata.items : []),
      ...(Array.isArray(metadata.lineItems) ? metadata.lineItems : []),
    ];
    const explicitIds = [
      ...(Array.isArray(metadata.orderItemIds) ? metadata.orderItemIds : []),
      ...(Array.isArray(metadata.order_item_ids) ? metadata.order_item_ids : []),
    ].map(String);
    if (explicitIds.includes(selectedItemId)) return true;
    if (!coveredItems.length) return true;
    return coveredItems.some((item) => String(
      item.orderItemId ||
      item.order_item_id ||
      item.id ||
      item._id ||
      "",
    ) === selectedItemId);
  };
  const returnCoversSelectedItem = (returnRequest = {}) => {
    if (!selectedOrderItem) return true;
    return (returnRequest.items || []).some((returnItem) =>
      returnItemMatchesOrderItem(returnItem, selectedOrderItem),
    );
  };
  const visibleReturns = selectedOrderItem
    ? returns.filter(returnCoversSelectedItem)
    : returns;
  const visibleCustomerInvoices = selectedOrderItem
    ? customerInvoices.filter(documentCoversSelectedItem)
    : customerInvoices;
  const visiblePendingSellerDocuments = selectedOrderItem
    ? pendingSellerDocuments.filter(documentCoversSelectedItem)
    : pendingSellerDocuments;

  const returnReverseInvoices = visibleReturns
    .map((returnRequest) => {
      const creditNoteId =
        returnRequest.creditNoteId ||
        returnRequest.credit_note_id ||
        returnRequest.refund?.creditNoteId ||
        returnRequest.refund?.credit_note_id ||
        returnRequest.refund?.metadata?.creditNoteId ||
        returnRequest.refund?.metadata?.credit_note_id;
      if (!creditNoteId) return null;
      const returnNumber = returnRequest.returnNumber || returnRequest.return_number || returnRequest.id || returnRequest._id;
      const downloadPath = endpoints.tax.creditNoteDownload(creditNoteId);
      return {
        id: creditNoteId,
        title: "Return reverse invoice",
        subtitle: `For return ${returnNumber}`,
        downloadPath,
        filename: `reverse-invoice-${returnNumber}.pdf`,
      };
    })
    .filter(Boolean);

  const cancellationReverseInvoices = cancellations
    .map((cancellation) => {
      const creditNoteId = cancellation.credit_note_id || cancellation.creditNoteId;
      if (!creditNoteId) return null;
      const cancellationNumber = cancellation.cancellation_number || cancellation.cancellationNumber || cancellation.id;
      const downloadPath = endpoints.tax.creditNoteDownload(creditNoteId);
      return {
        id: creditNoteId,
        title: "Cancellation reverse invoice",
        subtitle: `For cancellation ${cancellationNumber}`,
        downloadPath,
        filename: `reverse-invoice-${cancellationNumber}.pdf`,
      };
    })
    .filter(Boolean);

  const downloadableDocuments = [
    ...visibleCustomerInvoices.map((invoice, index) => {
      const invoiceId = getDocumentId(invoice);
      if (!invoiceId) return null;
      return {
        id: invoiceId,
        title: "Seller tax invoice",
        subtitle: `${invoiceSellerName(invoice, index)} · ${invoiceItemSummary(invoice)}`,
        downloadPath: endpoints.tax.invoiceDownload(invoiceId),
        filename: `${invoice.invoice_number || invoice.invoiceNumber || `invoice-${index + 1}`}.pdf`,
      };
    }),
    !selectedOrderItem && orderReceipt && getDocumentId(orderReceipt) ? {
      id: getDocumentId(orderReceipt),
      title: "Order receipt",
      subtitle: "Marketplace payment summary",
      downloadPath: endpoints.tax.invoiceDownload(getDocumentId(orderReceipt)),
      filename: `${orderReceipt.invoice_number || orderReceipt.invoiceNumber || `receipt-${orderId}`}.pdf`,
    } : null,
    customerFeeInvoice && getDocumentId(customerFeeInvoice) ? {
      id: getDocumentId(customerFeeInvoice),
      title: "Platform fee invoice",
      subtitle: "Marketplace tax invoice for platform fee",
      downloadPath: endpoints.tax.invoiceDownload(getDocumentId(customerFeeInvoice)),
      filename: `${customerFeeInvoice.invoice_number || customerFeeInvoice.invoiceNumber || `platform-fee-${orderId}`}.pdf`,
    } : null,
    !customerFeeInvoice && customerPlatformFee > 0 ? {
      id: `pending-platform-fee-${orderId}`,
      title: "Platform fee invoice",
      subtitle: "Will be available after payment document is generated.",
      pending: true,
    } : null,
    ...(selectedOrderItem ? [] : cancellationReverseInvoices),
    ...returnReverseInvoices,
  ].filter(Boolean);

  const getReturnNumber = (returnRequest = {}) =>
    returnRequest.returnNumber ||
    returnRequest.return_number ||
    returnRequest.id ||
    returnRequest._id ||
    "Return request";
  const getReturnRefundAmount = (returnRequest = {}) =>
    returnRequest.refundAmount ||
    returnRequest.refund?.requestedAmount ||
    returnRequest.refund?.amount ||
    returnRequest.refund_amount ||
    returnRequest.refundBreakup?.totalRefundAmount ||
    returnRequest.refund_breakup?.total_refund_amount ||
    0;
  const getReturnRefundStatus = (returnRequest = {}) =>
    returnRequest.refund?.status ||
    returnRequest.refundStatus ||
    returnRequest.refund_status ||
    "pending";
  const getReturnItemTitle = (item = {}) =>
    item.productTitle ||
    item.productName ||
    item.title ||
    item.name ||
    item.productId ||
    "Returned item";
  const getReturnItemQuantity = (item = {}) =>
    item.approvedQuantity ||
    item.approved_quantity ||
    item.requestedQuantity ||
    item.requested_quantity ||
    item.quantity ||
    1;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Order", href: "/orders" },
    { label: `#${orderId}` },
  ];

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
    dispatch(fetchReturnByOrder({ orderId }));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (
      track ||
      shipments.some((shipment) => shipment.status === "out_for_delivery")
    ) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, shipments, track]);

  useEffect(() => {
    if (!orderId) {
      setInvoices(null);
      return;
    }
    setInvoicesLoading(true);
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  }, [dispatch, orderId]);

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      await run(dispatch, retryOrderPayment({ orderId }), null);
      const paymentResult = await run(
        dispatch,
        initiatePayment({
          orderId,
          provider: "razorpay",
          currency: "INR",
          notes: { source: "web_retry" },
        }),
        null,
      );
      const payment = paymentResult?.data || paymentResult;
      await openRazorpayCheckout({
        dispatch,
        run,
        order,
        orderId,
        payment,
        user: userState.current,
        verifyPayment,
      });
      navigate(`/payment/success?orderId=${orderId}`);
    } catch {
    } finally {
      setRetrying(false);
      dispatch(fetchOrderById({ orderId }));
    }
  };

  const handleDownload = async (apiPath, filename) => {
    setDownloadingId(apiPath);
    try {
      await downloadAuthDocument(apiPath, filename);
    } catch (error) {
      notify.error(error?.message || "Document download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelOrder = async () => {
    const selectedItems = Object.entries(cancelItems)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([orderItemId, quantity]) => ({
        orderItemId,
        quantity: Number(quantity),
      }));
    if (cancelReason.trim().length < 3) return;
    if (!selectedItems.length) return;
    await run(
      dispatch,
      cancelOrder({
        orderId,
        reason: cancelReason.trim(),
        reasonCode: cancelReasonCode,
        refundMethod: "auto",
        items: selectedItems,
        idempotencyKey: `customer:${orderId}:${Date.now()}`,
      }),
      "Cancellation processed",
    );
    setCancelModalOpen(false);
    setCancelReason("");
    setCancelItems({});
    dispatch(fetchOrderById({ orderId }));
  };

  const openCancellation = () => {
    if (selectedOrderItem) {
      const itemId = String(getOrderItemId(selectedOrderItem));
      const quantity = Number(selectedOrderItem.quantity || 0) - Number(selectedOrderItem.cancelled_quantity || selectedOrderItem.cancelledQuantity || 0);
      setCancelItems(quantity > 0 ? { [itemId]: quantity } : {});
      setCancelModalOpen(true);
      return;
    }
    setCancelItems(
      Object.fromEntries(
        items
          .map((item) => [
            String(item.id || item._id),
            Number(item.quantity || 0) - Number(item.cancelled_quantity || 0),
          ])
          .filter(([itemId, quantity]) => itemId && quantity > 0),
      ),
    );
    setCancelModalOpen(true);
  };

  return (
    <>
      <Seo title={`Order ${getOrderNumber(order) || "Details"} | Sam Global`} />
      <div className="mx-auto w-full max-w-[1740px]">
        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
        >
          <div className="grid gap-5 sm:gap-6 lg:gap-9">
            <section className="grid gap-4 sm:gap-8">
              <div className="flex flex-col gap-4  items-center mt-8 md:flex-row  justify-between">
                <div>
                  <Breadcrumbs
                    items={breadcrumbItems}
                    className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
                    linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
                    currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
                    separatorClassName="text-[#2E2E2E]"
                  />
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap items-center md:w-auto md:justify-end">
                  {!track && (selectedOrderItem ? selectedItemCanReturn : canRequestReturn) && (
                    <Link
                      to={`/returns/request/${orderId}${selectedOrderItem ? `?orderItemId=${encodeURIComponent(getOrderItemId(selectedOrderItem))}` : ""}`}
                      className="block w-full sm:w-auto"
                    >
                      <Button className="flex h-[54px] w-full sm:w-[196px] items-center justify-center gap-[10px] rounded-[10px] bg-[#CE9F2D] px-[24px] py-[15px] text-white hover:bg-[#B88200]">
                        <RotateCcw size={18} />
                        <span className="text-center text-[14px] sm:text-[15px] font-semibold leading-[20px] sm:leading-[24px] text-white">
                          Request Return
                        </span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <OrderDetailInfoGrid
                items={[
                  {
                    icon: <MdOutlineShoppingCart size={20} />,
                    label: "Placed on",
                    value: formatOrderDate(
                      order?.created_at || order?.createdAt,
                    ),
                    tone: "blue",
                  },

                  {
                    icon: <IndianRupee size={20} />,
                    label: selectedOrderItem ? "Selected item amount" : "Order amount",
                    value: formatMoney(selectedOrderItem ? selectedItemAmount : customerAmount, currency),
                    tone: "yellow",
                  },
                  ...((selectedOrderItem ? selectedItemReturnDeadline : returnEligibleUntil) ? [{
                    icon: <RotateCcw size={20} />,
                    label: selectedOrderItem
                      ? selectedItemReturnWindowOpen ? "Selected item return deadline" : "Selected item return closed"
                      : returnWindowOpen ? "Latest item return deadline" : "All return windows closed",
                    value: formatOrderDate(selectedOrderItem ? selectedItemReturnDeadline : returnEligibleUntil),
                    tone: (selectedOrderItem ? selectedItemReturnWindowOpen : returnWindowOpen) ? "blue" : "yellow",
                  }] : []),
                ]}
              />

              {!track && ["delivered", "fulfilled", "partially_returned"].includes(status) && !returnWindowOpen && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">All eligible item return windows closed by {formatOrderDate(returnEligibleUntil)}.</p>
              )}

              {getDeliveryStatus(order) === "partially_delivered" && (
                <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Part of your order has been delivered. Remaining seller packages are still being prepared or shipped.</p>
              )}

              {hasKnownStatus(order) && (
                <OrderDetailSectionCard
                  title={selectedOrderItem ? "Selected Item Progress" : "Order Progress"}
                  headerClassName="!min-h-[56px] !py-4"
                  bodyClassName="overflow-hidden px-4"
                  titleClassName="text-lg font-bold leading-none"
                >
                  {selectedOrderItem && (
                    <div className="mb-3 rounded-lg bg-[#FFF8E7] px-3 py-2 text-sm text-[#1B1D60]">
                      <strong>{getProductTitle(selectedOrderItem)}</strong>
                      <span className="ml-2 text-xs font-semibold text-[#6F7480]">
                        Showing progress/actions for this item only.
                      </span>
                      {selectedItemReturnedQuantity > 0 && (
                        <div className="mt-1 text-xs font-semibold text-[#7A5A00]">
                          Returned/requested {selectedItemReturnedQuantity} of {Number(selectedOrderItem.quantity || 0)} · Returnable now {selectedItemReturnableQuantity}
                        </div>
                      )}
                    </div>
                  )}
                  <OrderProgress
                    status={selectedItemStatus || progressStatus}
                    cancellations={cancellations}
                    returns={selectedItemReturn ? [selectedItemReturn] : selectedOrderItem ? [] : returns}
                  />
                </OrderDetailSectionCard>
              )}

              {(track || visibleShipments.length > 0) && (
                <ShipmentTrackingPanel
                  shipments={visibleShipments}
                  orderDeliveryStatus={getDeliveryStatus(order)}
                  notifications={
                    Array.isArray(notificationState.list)
                      ? notificationState.list
                      : []
                  }
                />
              )}

              {!track && (
                <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">
                        {selectedOrderItem ? "Selected item documents" : "Order documents"}
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        {selectedOrderItem
                          ? "Only documents related to this item are shown here."
                          : "Invoices appear after seller delivery. Reverse invoices appear after cancellation or return refund."}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                      {downloadableDocuments.length} document{downloadableDocuments.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {downloadableDocuments.map((document) => (
                      <div
                        key={`${document.title}-${document.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <strong>{document.title}</strong>
                          <div className="mt-1 truncate text-xs text-muted">{document.subtitle}</div>
                        </div>
                        {document.pending ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                            Pending
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={downloadingId === document.downloadPath}
                            onClick={() => handleDownload(document.downloadPath, document.filename)}
                          >
                            <Download size={12} /> Download
                          </Button>
                        )}
                      </div>
                    ))}

                    {visiblePendingSellerDocuments.map((document, index) => (
                      <div
                        key={`${document.sellerName}-${index}`}
                        className="rounded-[6px] border border-dashed border-border bg-surface px-3 py-3 text-sm"
                        title={(document.productTitles || []).join(", ")}
                      >
                        <strong>{document.sellerName} seller invoice</strong>
                        <div className="mt-1 text-xs text-muted">Available after delivery</div>
                      </div>
                    ))}

                    {!downloadableDocuments.length && !visiblePendingSellerDocuments.length && (
                      <div className="rounded-[6px] border border-dashed border-border bg-surface px-3 py-3 text-sm text-muted">
                        No documents are available yet.
                      </div>
                    )}

                    {invoiceDownloadAvailable && !customerInvoices.length && getInvoiceUrl(order) && (
                      <Button
                        variant="secondary"
                        onClick={() => window.open(getInvoiceUrl(order), "_blank", "noopener,noreferrer")}
                        className="flex min-h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#3E409380] bg-white px-4 text-[#3E4093]"
                      >
                        <Download size={16} /> Download invoice
                      </Button>
                    )}
                  </div>
                </section>
              )}
            </section>

            {!track && (
              <StickySidebarLayout
                sidebarPosition="right"
                containerClass="flex flex-col xl:flex-row gap-4 md:gap-6 xl:gap-8"
                sidebarClass="w-full xl:w-[320px] 2xl:w-[380px]"
                mainContent={
                  <OrderItemsSection
                    items={visibleOrderItems}
                  orderId={orderId}
                  orderStatus={status}
                  shipments={shipments}
                  sellerFulfillmentGroups={order?.relations?.sellerFulfillmentGroups || []}
                  returns={visibleReturns}
                  currency={currency}
                  getItemImage={getItemImage}
                    getProductTitle={getProductTitle}
                    getItemProductPath={getItemProductPath}
                    getOrderItemColor={getOrderItemColor}
                    getItemLineTotal={getItemLineTotal}
                    formatMoney={formatMoney}
                  />
                }
                sidebarContent={
                  (subtotal !== undefined || items.length > 0) && (
                    <OrderPaymentSummary
                      variant="order"
                      subtotal={subtotal}
                      discount={discount}
                      discountFundingType={pricingSummary.discountFundingType}
                      sellerFundedDiscount={pricingSummary.sellerFundedDiscountAmount}
                      marketplaceFundedDiscount={pricingSummary.marketplaceFundedDiscountAmount}
                      paymentPartnerFundedDiscount={pricingSummary.paymentPartnerFundedDiscountAmount}
                      walletDiscount={walletDiscount}
                      shipping={shipping}
                      customerPlatformFee={customerPlatformFeeBase}
                      customerPlatformFeeTax={customerPlatformFeeTax}
                      customerAmount={customerAmount}
                      currency={currency}
                      formatMoney={formatMoney}
                      asNumber={asNumber}
                    />
                  )
                }
              />
            )}

            {cancellations.length > 0 && (
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-ink">
                  Cancellation and refund status
                </h2>
                <div className="mt-3 grid gap-3">
                  {cancellations.map((cancellation) => {
                    return (
                      <div
                        key={cancellation.id}
                        className="rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong>{cancellation.cancellation_number}</strong>
                          <span className="capitalize text-muted">
                            {String(
                              cancellation.status || "processing",
                            ).replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-muted">{cancellation.reason}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                          <span>
                            Refund:{" "}
                            {formatMoney(cancellation.refund_amount, currency)}
                          </span>
                          <span>
                            Refund status:{" "}
                            {String(
                              cancellation.refund_status || "pending",
                            ).replace(/_/g, " ")}
                          </span>
                          {(cancellation.credit_note_id || cancellation.creditNoteId) && (
                            <span>Reverse invoice: available in Order documents</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {visibleReturns.length > 0 && (
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {selectedOrderItem ? "Selected item return and refund" : "Return and refund status"}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Return and payout changes are shown item-wise. Only returned items affect refund and settlement.
                    </p>
                  </div>
                  <Link
                    to="/returns"
                    className="text-xs font-semibold text-[#3E4093] underline-offset-2 hover:underline"
                  >
                    View all returns
                  </Link>
                </div>

                <div className="mt-3 grid gap-3">
                  {visibleReturns.map((returnRequest) => {
                    const creditNoteId =
                      returnRequest.creditNoteId ||
                      returnRequest.credit_note_id ||
                      returnRequest.refund?.creditNoteId ||
                      returnRequest.refund?.credit_note_id ||
                      returnRequest.refund?.metadata?.creditNoteId ||
                      returnRequest.refund?.metadata?.credit_note_id;
                    const returnItems = Array.isArray(returnRequest.items)
                      ? selectedOrderItem
                        ? returnRequest.items.filter((returnItem) =>
                          returnItemMatchesOrderItem(returnItem, selectedOrderItem),
                        )
                        : returnRequest.items
                      : [];

                    return (
                      <div
                        key={returnRequest.id || returnRequest._id || getReturnNumber(returnRequest)}
                        className="rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong>{getReturnNumber(returnRequest)}</strong>
                          <span className="capitalize text-muted">
                            {humanize(returnRequest.status, "processing")}
                          </span>
                        </div>

                        {returnRequest.reason && (
                          <p className="mt-1 text-muted">{returnRequest.reason}</p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                          <span>
                            Refund:{" "}
                            {formatMoney(getReturnRefundAmount(returnRequest), currency)}
                          </span>
                          <span className="capitalize">
                            Refund status: {humanize(getReturnRefundStatus(returnRequest), "pending")}
                          </span>
                          {returnRequest.refund?.method || returnRequest.refundMethod ? (
                            <span className="capitalize">
                              Method: {humanize(returnRequest.refund?.method || returnRequest.refundMethod)}
                            </span>
                          ) : null}
                          {returnRequest.refund?.providerRefundId || returnRequest.providerRefundId ? (
                            <span>
                              Gateway refund: {returnRequest.refund?.providerRefundId || returnRequest.providerRefundId}
                            </span>
                          ) : null}
                          <span>
                            Reverse invoice: {creditNoteId ? "available in Order documents" : "pending"}
                          </span>
                        </div>

                        {returnItems.length > 0 && (
                          <div className="mt-3 grid gap-2">
                            {returnItems.map((item, index) => (
                              <div
                                key={item.orderItemId || item.order_item_id || item.id || item._id || index}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] bg-white px-3 py-2 text-xs"
                              >
                                <span className="min-w-0 font-medium text-ink">
                                  {getReturnItemTitle(item)}
                                </span>
                                <span className="shrink-0 text-muted">
                                  Qty {getReturnItemQuantity(item)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {hasKnownStatus(order) && (
              <section className="rounded-[15px] lg:border lg:border-[#CE9F2D66] bg-white py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {(status === "pending_payment" ||
                    status === "payment_failed") && (
                    <Button
                      className="min-h-[38px] w-full sm:w-auto text-white"
                      loading={retrying}
                      onClick={handleRetryPayment}
                    >
                      <RefreshCw size={15} /> Retry payment
                    </Button>
                  )}
                  {canCancelOrder(order) && (
                    <Button
                      variant="secondary"
                      className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      onClick={openCancellation}
                    >
                      <XCircle size={15} /> {selectedOrderItem ? "Cancel selected item" : "Cancel order"}
                    </Button>
                  )}
                  {!track && (
                    <Link
                      to={`/orders/${orderId}/track${selectedOrderItem ? `?orderItemId=${encodeURIComponent(getOrderItemId(selectedOrderItem))}` : ""}`}
                      className="block sm:inline-flex"
                    >
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      >
                        <Truck size={15} /> {selectedOrderItem ? "Track selected item" : "Track order"}
                      </Button>
                    </Link>
                  )}
                  {track && (
                    <Link
                      to={`/orders/${orderId}`}
                      className="block sm:inline-flex"
                    >
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      >
                        <ReceiptText size={15} /> View order
                      </Button>
                    </Link>
                  )}
                </div>
              </section>
            )}
          </div>
        </ApiState>
      </div>
      <ConfirmModal
        open={cancelModalOpen}
        title="Cancel this order?"
        description="Your order will be cancelled and any reserved items will be released. If payment was already captured, the refund will be handled according to the payment method."
        confirmLabel={state.loading ? "Cancelling..." : "Cancel order"}
        cancelLabel="Keep order"
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
      >
        <div className="grid gap-3">
          <label className="text-sm font-medium text-ink">
            Reason
            <select
              className="mt-1 w-full focus:outline-none  rounded-[6px] border border-border bg-white px-3 py-2 "
              value={cancelReasonCode}
              onChange={(event) => setCancelReasonCode(event.target.value)}
            >
              <option value="changed_mind">Changed my mind</option>
              <option value="ordered_by_mistake">Ordered by mistake</option>
              <option value="address_issue">Address issue</option>
              <option value="payment_issue">Payment issue</option>
              <option value="delivery_delay">Delivery delay</option>
              <option value="other">Other</option>
            </select>
          </label>
          <textarea
            className="min-h-20 focus:outline-none  w-full rounded-[6px]  px-3 py-2 text-sm"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            maxLength={500}
            placeholder="Tell us why you are cancelling"
          />

          {cancelReason.trim().length > 0 && cancelReason.trim().length < 3 && (
            <p className="text-xs text-red-600">
              Please enter at least 3 characters.
            </p>
          )}
        </div>
      </ConfirmModal>
    </>
  );
}

// ─── Order List ────────────────────────────────────────────────────────────────

function OrderListStatusBadge({ status }) {
  const cls = COMPACT_STATUS_BADGE[status] || "bg-[#D7A522] text-white";
  return (
    <span
      className={`mt-2 md:mt-0  inline-flex min-w-[74px] small justify-center rounded-full px-3 py-2   font-bold capitalize ${cls}`}
    >
      {humanize(status, "Processing")}
    </span>
  );
}

function OrderListItemStatusSummary({ statuses = [] }) {
  const normalized = [...new Set(statuses.filter(Boolean).map((itemStatus) => String(itemStatus)))];
  if (!normalized.length) return <OrderListStatusBadge status="processing" />;
  if (normalized.length === 1) return <OrderListStatusBadge status={normalized[0]} />;
  return (
    <span className="mt-2 inline-flex min-w-[110px] justify-center rounded-full bg-[#1B1D60] px-3 py-2 text-xs font-bold capitalize text-white md:mt-0">
      Mixed item status
    </span>
  );
}

function getOrderCardImage(item) {
  return (
    getImageUrlFromValue(getItemImage(item)) ||
    getImageUrlFromValue(getItemProduct(item)?.image) ||
    getImageUrlFromValue(getItemProduct(item)?.imageUrl) ||
    getImageUrlFromValue(getItemProduct(item)?.thumbnail)
  );
}

function getOrderItemColor(item) {
  const found = getItemAttributes(item).find(([key]) =>
    String(key).toLowerCase().includes("color"),
  );
  return found?.[1] || item?.color || item?.selectedColor || "N/A";
}

const getOrderItemId = (item = {}) =>
  String(item.id || item._id || item.orderItemId || item.order_item_id || "");

const getOrderItemVariantId = (item = {}) =>
  item.variant_id || item.variantId || item.variant?._id || item.variant?.id || "";

const getOrderItemVariantSku = (item = {}) =>
  item.variant_sku || item.variantSku || item.sku || item.productSku || item.product_sku || "";

const getReturnItemProductId = (returnItem = {}) =>
  returnItem.productId ||
  returnItem.product_id ||
  returnItem.product?._id ||
  returnItem.product?.id ||
  "";

const getReturnItemVariantId = (returnItem = {}) =>
  returnItem.variantId ||
  returnItem.variant_id ||
  returnItem.variant?._id ||
  returnItem.variant?.id ||
  "";

const getReturnItemVariantSku = (returnItem = {}) =>
  returnItem.variantSku ||
  returnItem.variant_sku ||
  returnItem.sku ||
  returnItem.productSku ||
  returnItem.product_sku ||
  "";

const returnItemMatchesOrderItem = (returnItem = {}, item = {}) => {
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
  if (!productId || !returnProductId || productId !== returnProductId) return false;

  const variantId = String(getOrderItemVariantId(item) || "");
  const returnVariantId = String(getReturnItemVariantId(returnItem) || "");
  if (variantId || returnVariantId) return variantId === returnVariantId;

  const variantSku = String(getOrderItemVariantSku(item) || "");
  const returnVariantSku = String(getReturnItemVariantSku(returnItem) || "");
  if (variantSku || returnVariantSku) return variantSku === returnVariantSku;

  return true;
};

const getSellerGroupKey = (sellerId, organizationId = null) =>
  `${String(sellerId || "platform")}:${organizationId || "default"}`;

const getOrderItemSellerGroupKey = (item = {}) =>
  getSellerGroupKey(
    item.seller_id || item.sellerId || item.seller?.id || item.seller?._id || "platform",
    item.organization_id || item.organizationId || item.organization?.id || item.organization?._id || null,
  );

const findShipmentForOrderItem = (shipments = [], item = {}) => {
  const itemId = getOrderItemId(item);
  const groupKey = getOrderItemSellerGroupKey(item);
  return shipments.find((shipment) => {
    if (String(shipment.direction || "forward") === "reverse") return false;
    const ids = shipment.orderItemIds || shipment.order_item_ids || shipment.metadata?.orderItemIds || [];
    if (ids.length) return ids.map(String).includes(itemId);
    return getSellerGroupKey(
      shipment.seller_id || shipment.sellerId,
      shipment.organization_id || shipment.organizationId || shipment.metadata?.organizationId,
    ) === groupKey;
  });
};

const resolveOrderItemDisplayStatus = (item = {}, fallbackStatus = "", shipments = []) => {
  const shipment = findShipmentForOrderItem(shipments, item);
  const payoutStatus = String(item.payout_status || item.payoutStatus || "").toLowerCase();
  const fallback = String(fallbackStatus || "").toLowerCase();
  return item.cancellation_status || item.cancellationStatus ||
    item.return_status || item.returnStatus ||
    (payoutStatus === "refunded" ? "refunded" : "") ||
    (payoutStatus === "held" && fallback.includes("return") ? "return_requested" : "") ||
    item.delivery_status || item.deliveryStatus ||
    item.status || item.item_status || item.itemStatus ||
    shipment?.status ||
    fallbackStatus ||
    "processing";
};

function OrderSummaryCard({ order }) {
  const navigate = useNavigate();
  const id = getOrderId(order);
  const apiOrderId = getOrderId(order);
  const status = getOrderStatus(order);
  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const createdAt = order.created_at || order.createdAt;
  const orderItems = getOrderItems(order);
  const shipments = Array.isArray(order?.relations?.shipments) ? order.relations.shipments : [];
  const fulfillmentGroups = order?.relations?.sellerFulfillmentGroups || [];
  const sellerPackages = (() => {
    const grouped = new Map();
    orderItems.forEach((item) => {
      const sellerId = item.seller_id || item.sellerId || "platform";
      const organizationId = item.organization_id || item.organizationId || "default";
      const key = getSellerGroupKey(sellerId, organizationId);
      if (!grouped.has(key)) {
        const fulfillment = fulfillmentGroups.find((group) =>
          getSellerGroupKey(group.sellerId || group.seller_id || "platform", group.organizationId || group.organization_id || "default") === key,
        ) || {};
        const sellerSnapshot = item.seller_snapshot || item.sellerSnapshot || {};
        const organization = item.organization_snapshot || item.organizationSnapshot || {};
        grouped.set(key, {
          key,
          sellerName: fulfillment.sellerName || organization.displayName || organization.legalBusinessName ||
            sellerSnapshot.displayName || sellerSnapshot.businessName || "Marketplace seller",
          status: fulfillment.deliveryStatus || fulfillment.delivery_status || fulfillment.shipmentStatus || null,
          items: [],
        });
      }
      grouped.get(key).items.push(item);
    });
    return [...grouped.values()].map((sellerPackage) => {
      const itemStatuses = sellerPackage.items.map((item) =>
        resolveOrderItemDisplayStatus(item, sellerPackage.status || status, shipments),
      );
      const uniqueStatuses = [...new Set(itemStatuses.filter(Boolean))];
      return {
        ...sellerPackage,
        itemStatuses,
        status: uniqueStatuses.length === 1
          ? uniqueStatuses[0]
          : sellerPackage.status || (sellerPackage.items.every(isDeliveredOrderItem) ? "delivered" : status),
      };
    });
  })();
  const orderItemStatuses = orderItems.map((item) => resolveOrderItemDisplayStatus(item, status, shipments));
  const previewItems = orderItems.slice(0, 4);
  const currency = getOrderCurrency(order);
  const amount = getCustomerOrderAmount(order);
  const quantity = orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const paymentMethod = humanize(getPaymentMethod(order), "N/A");

  const handleCopyOrderId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      .writeText(apiOrderId)
      .then(() => {
        notify.success(`Order ID #${apiOrderId} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy order ID:", err);
      });
  };

  const handleOpenOrder = () => {
    navigate(`/orders/${id}`);
  };

  const handleOpenOrderKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenOrder();
    }
  };

  return (
    <article className="overflow-hidden rounded-xl  border border-[#E7D9B8]  bg-[#FFFCF6]">
      <div className="flex  flex-col gap-3 border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-4 md:flex-row md:items-center  md:justify-between md:gap-4 md:px-4 md:py-6  text-sm md:text-base 2xl:text-[20px]  font-semibold text-ink">
        <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between md:contents">
          <span className="flex min-w-0 items-center gap-1.5">
            <FaShoppingCart className="shrink-0 text-sm text-[#2564EB] lg:text-xl" />
            <span className="shrink-0">#</span>
            <span className="min-w-0 break-all small">{apiOrderId}</span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="flex shrink-0 items-center justify-center rounded-full p-1 transition-colors duration-200 hover:bg-[#CE9F2D33]"
              title="Copy Order ID"
            >
              <MdContentCopy className="text-[#2E2E2E] text-sm lg:text-xl cursor-pointer" />
            </button>
          </span>
          <span className="self-start sm:hidden">
            <OrderListItemStatusSummary statuses={orderItemStatuses} />
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between w-full md:contents">
          <span className="lg:inline-flex  small  items-center gap-1.5  hidden">
            <MdDateRange className="text-[#2564EB] text-sm lg:text-xl" />
            {formatOrderDate(createdAt)}
          </span>
          <span className="lg:inline-flex items-center small  gap-1.5  hidden ">
            <BsCreditCardFill className="text-[#2564EB] text-sm lg:text-xl" />
            {paymentMethod}
          </span>
        </div>
        <span className="hidden md:inline-block">
          <OrderListItemStatusSummary statuses={orderItemStatuses} />
        </span>
      </div>

      <div className="p-3 sm:p-5 lg:p-6">
        <div className="grid gap-5 rounded-xl border border-[#EFE5D2] bg-white p-4 md:grid-cols-[220px_minmax(0,1fr)] md:p-5">
          <Link
            to={`/orders/${id}`}
            className={`grid min-h-44 gap-2 overflow-hidden rounded-lg bg-[#FFFAEF] p-2 ${previewItems.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {previewItems.length ? previewItems.map((previewItem, index) => {
              const image = getOrderCardImage(previewItem);
              return (
                <div key={previewItem.id || previewItem._id || index} className="relative flex min-h-20 items-center justify-center overflow-hidden rounded-md border border-[#EFE5D2] bg-white">
                  {image ? <img src={image} alt={getProductTitle(previewItem)} className={`w-full object-contain p-2 ${previewItems.length === 1 ? "h-52" : "h-24"}`} /> : <Package size={30} className="text-[#D9CBAE]" />}
                  {index === 3 && orderItems.length > 4 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-[#1B1D60D9] text-lg font-bold text-white">+{orderItems.length - 3}</span>
                  )}
                </div>
              );
            }) : <Package size={42} className="m-auto text-[#D9CBAE]" />}
          </Link>

          <div className="flex min-w-0 flex-col justify-between gap-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7A27]">Order overview</p>
                <h3 className="mt-1 text-xl font-extrabold text-[#1B1D60]">
                  {orderItems.length} product{orderItems.length === 1 ? "" : "s"} in {sellerPackages.length} package{sellerPackages.length === 1 ? "" : "s"}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#5E6472]">
                  <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">{quantity} total unit{quantity === 1 ? "" : "s"}</span>
                  <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">{sellerPackages.length} seller shipment{sellerPackages.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6F7480]">Complete order total</p>
                <p className="mt-1 text-2xl font-extrabold text-[#1B1D60]">{formatMoney(amount, currency)}</p>
                <p className="mt-0.5 text-xs font-medium text-[#6F7480]">Inclusive of all taxes</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/orders/${id}/track`}
              className="inline-flex h-11 w-full min-w-[160px] items-center justify-center gap-2 rounded-lg bg-gold px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
            >
              <Truck size={18} />
              Track packages
            </Link>
            {invoiceDownloadAvailable && (
              <Link
                to={`/orders/${id}`}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D6B45B] bg-white px-5 text-sm font-bold text-gold-dark transition hover:bg-gold-soft sm:w-auto"
              >
                <Download size={16} />
                Seller invoices
              </Link>
            )}
          </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {sellerPackages.map((sellerPackage, packageIndex) => (
            <section key={sellerPackage.key} className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white shadow-[0_3px_14px_rgba(53,45,20,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE5D2] bg-[#FFF8E7] px-4 py-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9A7A27]">Package {packageIndex + 1}</p>
                  <h4 className="mt-0.5 text-sm font-bold text-[#1B1D60]">{sellerPackage.sellerName}</h4>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#6F7480]">Item-wise status shown below</p>
                </div>
                <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#6F7480]">
                  {sellerPackage.items.length} item{sellerPackage.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="divide-y divide-[#F1E8D5]">
                {sellerPackage.items.map((packageItem, index) => {
                  const itemStatus = resolveOrderItemDisplayStatus(packageItem, sellerPackage.status, shipments);
                  const shipment = findShipmentForOrderItem(shipments, packageItem);
                  const trackingNumber = shipment?.tracking_number || shipment?.trackingNumber || shipment?.awb_number || shipment?.awbNumber;
                  const courierName = shipment?.courier_name || shipment?.courierName || shipment?.provider;
                  const itemImage = getOrderCardImage(packageItem);
                  const itemTotal = packageItem.line_total ?? packageItem.lineTotal ?? (Number(packageItem.unit_price || packageItem.unitPrice || 0) * Number(packageItem.quantity || 0));
                  return (
                    <Link key={packageItem.id || packageItem._id || index} to={`/orders/${id}?orderItemId=${encodeURIComponent(getOrderItemId(packageItem))}`} className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 px-4 py-3 transition hover:bg-[#FFFCF6] sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-[#EFE5D2] bg-white">
                        {itemImage ? <img src={itemImage} alt="" className="h-full w-full object-contain p-1" /> : <Package size={20} className="text-[#D9CBAE]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#2E2E2E]">{getProductTitle(packageItem)}</span>
                        <span className="mt-1 block text-xs font-medium text-[#6F7480]">Qty {Number(packageItem.quantity || 0)} · {formatMoney(itemTotal, currency)}</span>
                        {(courierName || trackingNumber) && (
                          <span className="mt-1 block truncate text-[11px] font-semibold text-[#3E4093]">
                            {courierName ? humanize(courierName, "Courier") : "Tracking"}{trackingNumber ? ` · ${trackingNumber}` : ""}
                          </span>
                        )}
                      </span>
                      <span className="col-span-2 flex flex-wrap items-center justify-between gap-2 sm:col-span-1 sm:justify-end">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${COMPACT_STATUS_BADGE[itemStatus] || "bg-[#EEF2FF] text-[#1B1D60]"}`}>
                          {humanize(itemStatus, "Processing")}
                        </span>
                        <span className="text-xs font-bold text-[#3E4093]">View item details</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

function OrderItemSummaryCard({ order, item }) {
  const id = getOrderId(order);
  const apiOrderId = getOrderId(order);
  const createdAt = order.created_at || order.createdAt;
  const currency = getOrderCurrency(order);
  const paymentMethod = humanize(getPaymentMethod(order), "N/A");
  const shipments = Array.isArray(order?.relations?.shipments) ? order.relations.shipments : [];
  const itemId = getOrderItemId(item);
  const itemStatus = resolveOrderItemDisplayStatus(item, getOrderStatus(order), shipments);
  const shipment = findShipmentForOrderItem(shipments, item);
  const trackingNumber = shipment?.tracking_number || shipment?.trackingNumber || shipment?.awb_number || shipment?.awbNumber;
  const courierName = shipment?.courier_name || shipment?.courierName || shipment?.provider;
  const itemImage = getOrderCardImage(item);
  const itemTotal = item.line_total ?? item.lineTotal ?? (Number(item.unit_price || item.unitPrice || 0) * Number(item.quantity || 0));
  const itemDetailPath = `/orders/${id}?orderItemId=${encodeURIComponent(itemId)}`;

  const handleCopyOrderId = (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard
      .writeText(apiOrderId)
      .then(() => notify.success(`Order ID #${apiOrderId} copied to clipboard!`))
      .catch((err) => console.error("Failed to copy Order ID:", err));
  };

  return (
    <article className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-[#FFFCF6]">
      <div className="flex flex-col gap-2 border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-3 text-sm font-semibold text-ink md:flex-row md:items-center md:justify-between md:px-4">
        <span className="flex min-w-0 items-center gap-1.5">
          <FaShoppingCart className="shrink-0 text-sm text-[#2564EB]" />
          <span className="shrink-0">Order ID :</span>
          <span className="min-w-0 break-all text-xs md:text-sm">#{apiOrderId}</span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="flex shrink-0 items-center justify-center rounded-full p-1 hover:bg-[#CE9F2D33]"
            title="Copy Order ID"
          >
            <MdContentCopy className="text-[#2E2E2E] text-sm cursor-pointer" />
          </button>
        </span>
        <span className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <MdDateRange className="text-[#2564EB]" />
            {formatOrderDate(createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BsCreditCardFill className="text-[#2564EB]" />
            {paymentMethod}
          </span>
          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${COMPACT_STATUS_BADGE[itemStatus] || "bg-[#2564EB] text-white"}`}>
            {humanize(itemStatus, "Processing")}
          </span>
        </span>
      </div>

      <Link to={itemDetailPath} className="grid gap-4 px-4 py-5 transition hover:bg-[#FFFCF6] sm:grid-cols-[150px_minmax(0,1fr)] md:px-5">
        <span className="flex aspect-square w-full max-w-[150px] items-center justify-center overflow-hidden rounded-xl border border-[#EFE5D2] bg-white p-2">
          {itemImage ? (
            <img src={itemImage} alt={getProductTitle(item)} className="h-full w-full object-contain" />
          ) : (
            <Package size={34} className="text-[#D9CBAE]" />
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-base font-extrabold text-[#1B1D60] md:text-lg">
            {getProductTitle(item)}
          </span>
          <span className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#5E6472]">
            <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">Qty {Number(item.quantity || 0)}</span>
            {getOrderItemColor(item) !== "N/A" && (
              <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">Color: {getOrderItemColor(item)}</span>
            )}
            <span className={`rounded-full px-3 py-1.5 capitalize ${COMPACT_STATUS_BADGE[itemStatus] || "bg-[#EEF2FF] text-[#1B1D60]"}`}>
              {humanize(itemStatus, "Processing")}
            </span>
          </span>
          <span className="mt-4 block text-2xl font-extrabold text-[#1B1D60]">
            {formatMoney(itemTotal, currency)}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-[#6F7480]">Inclusive of all taxes</span>
          {(courierName || trackingNumber) && (
            <span className="mt-3 block text-xs font-semibold text-[#3E4093]">
              {courierName ? humanize(courierName, "Courier") : "Tracking"}{trackingNumber ? ` · ${trackingNumber}` : ""}
            </span>
          )}
          <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-gold px-4 text-sm font-bold text-white">
            <Truck size={15} />
            Track / item details
          </span>
        </span>
      </Link>
    </article>
  );
}

const orderHelpItems = items.map((item) => ({
  icon: item.icon,
  title: item.title,
  description: "Get help with your orders",
  path: "#",
}));

function OrderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s.order);
  const [activeFilter, setActiveFilter] = useState("");
  const [query, setQuery] = useState("");

  const allOrders = state.list.length
    ? state.list
    : getOrderCollection(state.current);

  const orderItemsList = useMemo(() => {
    let term = query.trim().toLowerCase();
    const normalizedTerm = normalizeOrderSearchText(query);

    // Strip leading '#' if present since it's only a visual prefix
    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    return allOrders.flatMap((order) => {
      const id = String(getOrderId(order) || "").toLowerCase();
      const apiOrderId = getApiOrderId(order);
      const orderNumber = String(apiOrderId || "").toLowerCase();
      const formattedId = String(
        formatOrderId(orderNumber || id),
      ).toLowerCase();
      const visibleOrderIdText = `order id #${apiOrderId}`.toLowerCase();
      const shipments = Array.isArray(order?.relations?.shipments) ? order.relations.shipments : [];

      return getOrderItems(order)
        .map((item) => {
          const itemStatus = resolveOrderItemDisplayStatus(item, getOrderStatus(order), shipments);
          return { order, item, itemStatus };
        })
        .filter(({ item, itemStatus }) => {
          if (activeFilter) {
            if (activeFilter === "return_requested") {
              const normalizedStatus = String(itemStatus || "");
              if (!["return_requested", "return_approved", "partially_returned", "returned", "refunded"].includes(normalizedStatus)) {
                return false;
              }
            } else if (itemStatus !== activeFilter && getOrderStatus(order) !== activeFilter) {
              return false;
            }
          }

          if (!term) return true;
          const itemText = getProductTitle(item).toLowerCase();
          const normalizedOrderText = normalizeOrderSearchText(
            [id, apiOrderId, formattedId, visibleOrderIdText, itemText, itemStatus].join(" "),
          );

          return (
            id.includes(term) ||
            orderNumber.includes(term) ||
            formattedId.includes(term) ||
            itemText.includes(term) ||
            visibleOrderIdText.includes(term) ||
            String(itemStatus || "").toLowerCase().includes(term) ||
            (Boolean(normalizedTerm) &&
              normalizedOrderText.includes(normalizedTerm))
          );
        });
    });
  }, [activeFilter, allOrders, query]);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Orders | Sam Global" />

      <section className="min-h-screen bg-white  py-5 sm:py-8 lg:py-10">
        <div>
          <Breadcrumbs
            items={ORDER_BREADCRUMBS}
            className="mb-2 flex flex-wrap  items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
            heading="My Order"
          />
          <StickySidebarLayout
            sidebarPosition="right"
            containerClass="flex flex-col xl:flex-row gap-6 sm:gap-8 lg:gap-9 lg:mt-4"
            sidebarClass="w-full xl:w-[400px] 2xl:w-[413px] transition-[top] duration-300 ease-in-out"
            mainContent={
              <div className="min-w-0 rounded-xl bg-white sm:p-4">
                <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="relative block w-full sm:max-w-[450px]">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search by  product name or Order ID..."
                      className="h-12 w-full  rounded-[10px] border border-[#1B1D604D] bg-[#FAF8FFB2] pl-9 pr-3  text-base font-medium text-ink outline-none focus:outline-none"
                    />
                  </label>

                  <CustomDropdown
                    className="w-full lg:w-[220px]"
                    buttonClassName="h-12 rounded-[10px] border-[#1B1D604D] font-semibold text-ink"
                    options={ORDER_FILTERS.map((f) => ({
                      value: f.value,
                      label: f.label === "All" ? "All Status" : f.label,
                    }))}
                    value={activeFilter}
                    onChange={(val) => {
                      setActiveFilter(val);
                    }}
                    placeholder="All Status"
                  />
                </div>

                <ApiState
                  loading={state.loading && !allOrders.length}
                  error={state.error}
                  empty={!orderItemsList.length && !state.loading}
                  emptyTitle={activeFilter ? "No orders found" : "No orders yet"}
                  emptyText={
                    activeFilter || query
                      ? "Try a different filter."
                      : "Once you place an order, it will appear here."
                  }
                  emptyActionLabel="Continue Shopping"
                  onEmptyAction={() => navigate("/products")}
                >
                  <div className="flex flex-col gap-4  ">
                    {orderItemsList.map(({ order, item }) => (
                      <OrderItemSummaryCard
                        key={`${getOrderId(order)}:${getOrderItemId(item)}`}
                        order={order}
                        item={item}
                      />
                    ))}
                  </div>
                </ApiState>
              </div>
            }
            sidebarContent={
              <div className="min-w-0 self-start xl:h-fit">
                <NeedHelpPanel
                  title="Need Help ?"
                  items={orderHelpItems}
                  headerStyle="plain"
                  sticky={false}
                />
              </div>
            }
          />
        </div>
      </section>
    </>
  );
}

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  if (detail || track) return <OrderDetail orderId={orderId} track={track} />;
  return <OrderList />;
}
