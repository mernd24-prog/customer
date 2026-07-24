import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
import { downloadAuthDocument } from "../../utils/downloadAuthDocument";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { endpoints } from "../../api/endpoints";
import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
  ORDER_FILTERS,
} from "../../data/orderPage";

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
const isDeliveredOrderItem = (item = {}) =>
  Boolean(item.delivered_at || item.deliveredAt) ||
  ["delivered", "fulfilled", "completed"].includes(
    String(
      item.delivery_status || item.deliveryStatus || item.status || "",
    ).toLowerCase(),
  );
const hasDeliveredSellerPackage = (order = {}) => {
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
      order?.customer_platform_fee_amount,
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
      order?.customer_platform_fee_tax_amount,
  );
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
  const targetItemId = searchParams.get("itemId");
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
  const allItems = getOrderItems(order);
  const items = targetItemId
    ? allItems.filter(
        (item) => String(item.id || item._id) === String(targetItemId),
      )
    : allItems;
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
    ? returnsState.list.filter(
        (returnRequest) =>
          String(returnRequest.orderId || returnRequest.order_id || "") ===
          String(orderId),
      )
    : [];
  const returns = fetchedReturns.length ? fetchedReturns : embeddedReturns;
  const allShipments = Array.isArray(order?.relations?.shipments)
    ? order.relations.shipments
    : [];
  const shipments =
    targetItemId && items.length === 1
      ? allShipments.filter((shipment) => {
          const ids =
            shipment.orderItemIds ||
            shipment.order_item_ids ||
            shipment.metadata?.orderItemIds ||
            [];
          if (ids.length) return ids.map(String).includes(String(targetItemId));
          const shipmentSellerKey =
            String(shipment.seller_id || shipment.sellerId) +
            "-" +
            String(shipment.organization_id || shipment.organizationId);
          const itemSellerKey =
            String(
              items[0].seller_id || items[0].sellerId || items[0].seller?.id,
            ) +
            "-" +
            String(items[0].organization_id || items[0].organizationId);
          return shipmentSellerKey === itemSellerKey;
        })
      : allShipments;

  const getInvoiceUrl = (order) =>
    order?.invoice_url ||
    order?.invoiceUrl ||
    order?.relations?.invoice?.url ||
    null;

  const shippingAddress =
    order?.shipping_address ||
    order?.shippingAddress ||
    order?.delivery_address ||
    order?.deliveryAddress ||
    order?.relations?.shippingAddress ||
    {};
  const billingAddress = 
    order?.billing_address || 
    order?.billingAddress || 
    order?.relations?.invoice?.metadata?.seller?.billingAddress || 
    order?.relations?.sellerFulfillmentGroups?.[0]?.organizationSnapshot?.billingAddress ||
    order?.relations?.invoices?.[0]?.metadata?.seller?.billingAddress ||
    {};
  const taxBreakup = order?.tax_breakup || order?.taxBreakup;
  let subtotal = getAmount(order, "subtotal");
  let discount = getAmount(order, "discount");
  let tax = getAmount(order, "tax");
  let walletDiscount = getAmount(order, "walletDiscount");
  let shipping = getAmount(order, "shipping");
  let customerPlatformFee = getCustomerPlatformFeeAmount(order);
  let customerPlatformFeeTax = getCustomerPlatformFeeTaxAmount(order);
  let customerAmount = getCustomerOrderAmount(order);

  if (targetItemId && items.length === 1) {
    const item = items[0];
    subtotal = asNumber(
      item.line_total ??
        item.lineTotal ??
        Number(item.unit_price || item.unitPrice || 0) *
          Number(item.quantity || 0),
    );
    discount = 0;
    walletDiscount = 0;
    shipping = 0;
    customerPlatformFee = 0;
    customerPlatformFeeTax = 0;
    customerAmount = subtotal;
  }
  const taxIncluded = getTaxIncludedAmount(order, taxBreakup);
  const taxPayable = getTaxPayableAmount(order, taxBreakup);
  const status = getOrderStatus(order);
  const progressStatus = getProgressStatus(order);
  const returnableItems = items.filter((item) => {
    const snapshot =
      item.return_policy_snapshot ||
      item.returnPolicySnapshot ||
      item.product_snapshot?.returnPolicy ||
      {};
    return (
      (item.returnable ?? snapshot.returnable ?? snapshot.eligible ?? true) ===
      true
    );
  });
  const itemReturnDeadlines = returnableItems
    .map(
      (item) =>
        item.return_eligible_until ||
        item.returnEligibleUntil ||
        item.return_policy_snapshot?.eligibleUntil ||
        item.returnPolicySnapshot?.eligibleUntil,
    )
    .filter(Boolean);
  const returnEligibleUntil = itemReturnDeadlines.length
    ? itemReturnDeadlines.reduce((latest, value) =>
        new Date(value).getTime() > new Date(latest).getTime() ? value : latest,
      )
    : null;
  const returnWindowOpen = returnableItems.some((item) => {
    const deadline =
      item.return_eligible_until ||
      item.returnEligibleUntil ||
      item.return_policy_snapshot?.eligibleUntil ||
      item.returnPolicySnapshot?.eligibleUntil;
    return !deadline || new Date(deadline).getTime() >= Date.now();
  });
  const canRequestReturn =
    ["delivered", "fulfilled", "partially_returned"].includes(status) &&
    returnWindowOpen &&
    returnableItems.length > 0;
  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const rawCustomerInvoices = Array.isArray(invoices?.sellerInvoices)
    ? invoices.sellerInvoices
    : [];
  const customerInvoices = targetItemId
    ? rawCustomerInvoices.filter((inv) => {
        const covered = inv?.metadata?.items || inv?.metadata?.lineItems || [];
        if (!covered.length) {
          const itemSellerKey =
            String(
              items[0]?.seller_id ||
                items[0]?.sellerId ||
                items[0]?.seller?.id ||
                "",
            ) +
            "-" +
            String(items[0]?.organization_id || items[0]?.organizationId || "");
          const invSellerKey =
            String(
              inv?.metadata?.seller?.id || inv?.metadata?.seller?._id || "",
            ) +
            "-" +
            String(
              inv?.metadata?.organization?.id ||
                inv?.metadata?.organization?._id ||
                inv?.organizationSnapshot?.id ||
                "",
            );
          return itemSellerKey === invSellerKey;
        }
        return covered.some(
          (i) =>
            String(i.orderItemId || i.id || i._id) === String(targetItemId),
        );
      })
    : rawCustomerInvoices;
  const orderReceipt = invoices?.orderInvoice || null;
  const customerFeeInvoice = invoices?.customerFeeInvoice || null;
  const rawPendingSellerDocuments = invoices?.pendingSellerDocuments || [];
  const pendingSellerDocuments = targetItemId
    ? rawPendingSellerDocuments.filter((doc) => {
        const currentTitle = getProductTitle(items[0]);
        return (doc.productTitles || []).includes(currentTitle);
      })
    : rawPendingSellerDocuments;

  const invoiceSellerName = (invoice, index) => {
    const metadata = invoice?.metadata || {};
    const seller = metadata.seller || {};
    const organization =
      metadata.organization || invoice?.organizationSnapshot || {};
    return (
      organization.legalBusinessName ||
      organization.displayName ||
      seller.legalBusinessName ||
      seller.businessName ||
      seller.displayName ||
      `Seller ${index + 1}`
    );
  };
  const invoiceItemSummary = (invoice) => {
    const coveredItems =
      invoice?.metadata?.items || invoice?.metadata?.lineItems || [];
    const titles = coveredItems
      .map((item) => item.productTitle || item.description)
      .filter(Boolean);
    if (!titles.length) return "Delivered seller items";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} + ${titles.length - 1} more`;
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Order", href: "/orders" },
    { label: `#${orderId}` },
  ];

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
    dispatch(fetchReturnByOrder({ orderId }));
  }, [dispatch, orderId]);

  // Guard ref – fetch notifications at most once per mount to avoid
  // an infinite loop caused by shipments being a new array reference on every render.
  const notificationFetchedRef = useRef(false);
  useEffect(() => {
    if (notificationFetchedRef.current) return;
    const hasOutForDelivery = shipments.some(
      (shipment) => shipment.status === "out_for_delivery",
    );
    if (track || hasOutForDelivery) {
      notificationFetchedRef.current = true;
      dispatch(fetchNotifications());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, shipments.length, track]);

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
    } catch {
      // silent — browser will show nothing; user can retry
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
                  {!track && canRequestReturn && (
                    <Link
                      to={`/returns/request/${orderId}`}
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
              {/* <OrderDetailInfoGrid
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
                    label: "Order amount",
                    value: formatMoney(customerAmount, currency),
                    tone: "yellow",
                  },
                  ...(returnEligibleUntil ? [{
                    icon: <RotateCcw size={20} />,
                    label: returnWindowOpen ? "Latest item return deadline" : "All return windows closed",
                    value: formatOrderDate(returnEligibleUntil),
                    tone: returnWindowOpen ? "blue" : "yellow",
                  }] : []),
                ]}
              /> */}

              {!track &&
                ["delivered", "fulfilled", "partially_returned"].includes(
                  status,
                ) &&
                !returnWindowOpen && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    All Eligible Item Return Windows Closed by{" "}
                    {formatOrderDate(returnEligibleUntil)}.
                  </p>
                )}

              {/* {getDeliveryStatus(order) === "partially_delivered" && (
                <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Part of Your Order Has Been Delivered. Remaining Seller Packages Are Still Being Prepared or Shipped.</p>
              )} */}
            </section>

            {!track && (
              <div className="flex flex-col xl:flex-row items-stretch gap-4 md:gap-6 xl:gap-8">
                <div className="flex min-w-0 flex-1 flex-col h-full">
                  <OrderItemsSection
                    items={items}
                    orderId={orderId}
                    orderStatus={status}
                    shipments={shipments}
                    sellerFulfillmentGroups={
                      order?.relations?.sellerFulfillmentGroups || []
                    }
                    returns={returns}
                    currency={currency}
                    getItemImage={getItemImage}
                    getProductTitle={getProductTitle}
                    getItemProductPath={getItemProductPath}
                    getOrderItemColor={getOrderItemColor}
                    getItemLineTotal={getItemLineTotal}
                    formatMoney={formatMoney}
                  />
                </div>

                <div className="w-full xl:w-[320px] 2xl:w-[380px] h-full">
                  {(subtotal !== undefined || items.length > 0) && (
                    <OrderPaymentSummary
                      variant="order"
                      subtotal={subtotal}
                      discount={discount}
                      walletDiscount={walletDiscount}
                      shipping={shipping}
                      customerPlatformFee={customerPlatformFee}
                      customerAmount={customerAmount}
                      currency={currency}
                      formatMoney={formatMoney}
                      asNumber={asNumber}
                    />
                  )}
                </div>
              </div>
            )}

            {(track || shipments.length > 0) && (
              <ShipmentTrackingPanel
                shipments={shipments}
                orderDeliveryStatus={getDeliveryStatus(order)}
                notifications={
                  Array.isArray(notificationState.list)
                    ? notificationState.list
                    : []
                }
              />
            )}

            {hasKnownStatus(order) && (
              <OrderDetailSectionCard
                title="Order Progress"
                headerClassName="!min-h-[56px] !py-4"
                bodyClassName="overflow-hidden px-4"
                titleClassName="text-lg font-bold leading-none"
              >
                <OrderProgress
                  status={progressStatus}
                  cancellations={cancellations}
                  returns={returns}
                />
              </OrderDetailSectionCard>
            )}

            {hasShippingAddress(shippingAddress) && (
              <OrderDetailSectionCard
                title="Shipping Address"
                headerClassName="!min-h-[56px] !py-4"
                bodyClassName="px-4 py-4"
                titleClassName="text-lg font-bold leading-none"
              >
                <div className="text-[14px] sm:text-[15px] font-medium text-[#2E2E2E] leading-[1.6]">
                  {shippingAddress.fullName && <p className="font-semibold">{shippingAddress.fullName}</p>}
                  {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
                  {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                  <p>
                    {shippingAddress.city}{shippingAddress.city && (shippingAddress.state || shippingAddress.postalCode) ? ", " : ""}
                    {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                  {shippingAddress.phone && <p className="mt-1">Phone: {shippingAddress.phone}</p>}
                </div>
              </OrderDetailSectionCard>
            )}

            {cancellations.length > 0 && (
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-ink">
                  Cancellation and Refund Status
                </h2>
                <div className="mt-3 grid gap-3">
                  {cancellations.map((cancellation) => {
                    const creditNoteId =
                      cancellation.credit_note_id || cancellation.creditNoteId;
                    const cnPath = creditNoteId
                      ? endpoints.tax.creditNoteDownload(creditNoteId)
                      : null;
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
                            Refund Status:{" "}
                            {String(
                              cancellation.refund_status || "pending",
                            ).replace(/_/g, " ")}
                          </span>
                          {cnPath && (
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={downloadingId === cnPath}
                              onClick={() =>
                                handleDownload(
                                  cnPath,
                                  `credit-note-${cancellation.cancellation_number || cancellation.id}.pdf`,
                                )
                              }
                            >
                              <Download size={12} /> Credit Note
                            </Button>
                          )}
                        </div>
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
                      <RefreshCw size={15} /> Retry Payment
                    </Button>
                  )}
                  {canCancelOrder(order) && (
                    <Button
                      variant="secondary"
                      className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      onClick={openCancellation}
                    >
                      <XCircle size={15} /> Cancel Order
                    </Button>
                  )}
                  {!track && (
                    <Link
                      to={`/orders/${orderId}/track`}
                      className="block sm:inline-flex hidden"
                    >
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      >
                        <Truck size={15} /> Track Order
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
                        <ReceiptText size={15} /> View Order
                      </Button>
                    </Link>
                  )}

                  {orderReceipt &&
                    (() => {
                      const receiptId = orderReceipt.id || orderReceipt._id;
                      const receiptPath =
                        endpoints.tax.invoiceDownload(receiptId);
                      return (
                        <Button
                          variant="secondary"
                          loading={downloadingId === receiptPath}
                          onClick={() =>
                            handleDownload(
                              receiptPath,
                              `${orderReceipt.invoice_number || orderReceipt.invoiceNumber || `receipt-${orderId}`}.pdf`,
                            )
                          }
                          title="Marketplace Payment Summary for the Complete Order"
                          className="min-h-[38px] w-full sm:w-auto border-[#CE9F2D66] text-[#1B1D60]"
                        >
                          <Download size={15} /> Order Receipt
                        </Button>
                      );
                    })()}
                  {customerFeeInvoice &&
                    (() => {
                      const feeInvoiceId =
                        customerFeeInvoice.id || customerFeeInvoice._id;
                      const feeInvoicePath =
                        endpoints.tax.invoiceDownload(feeInvoiceId);
                      return (
                        <Button
                          variant="secondary"
                          loading={downloadingId === feeInvoicePath}
                          onClick={() =>
                            handleDownload(
                              feeInvoicePath,
                              `${customerFeeInvoice.invoice_number || customerFeeInvoice.invoiceNumber || `platform-fee-${orderId}`}.pdf`,
                            )
                          }
                          title="Marketplace Tax Invoice for the Customer Platform Fee"
                          className="min-h-[38px] w-full sm:w-auto border-[#CE9F2D66] text-[#1B1D60]"
                        >
                          <Download size={15} /> Platform Fee Invoice
                        </Button>
                      );
                    })()}
                  {invoiceDownloadAvailable &&
                    customerInvoices.map((invoice, index) => {
                      const invoiceId = invoice.id || invoice._id;
                      const downloadPath =
                        endpoints.tax.invoiceDownload(invoiceId);
                      return (
                        <Button
                          key={invoiceId}
                          variant="secondary"
                          loading={downloadingId === downloadPath}
                          onClick={() =>
                            handleDownload(
                              downloadPath,
                              `${invoice.invoice_number || invoice.invoiceNumber || `invoice-${index + 1}`}.pdf`,
                            )
                          }
                          title={`Covers: ${invoiceItemSummary(invoice)}`}
                          className="min-h-[38px] w-full sm:w-auto border-[#CE9F2D66] text-[#1B1D60]"
                        >
                          <Download size={15} />
                          <span className="max-w-[220px] truncate text-center font-semibold text-[#1B1D60]">
                            {invoiceSellerName(invoice, index)} Invoice
                          </span>
                        </Button>
                      );
                    })}
                  {pendingSellerDocuments.map((document, index) => (
                    <div
                      key={`${document.sellerName}-${index}`}
                      className="flex min-h-[38px] w-full items-center justify-center rounded-[8px] border border-dashed border-[#CE9F2D66] px-4 text-sm font-semibold text-[#1B1D60] sm:w-auto bg-white"
                      title={(document.productTitles || []).join(", ")}
                    >
                      {document.sellerName} Invoice ··· Available After Delivery
                    </div>
                  ))}
                  {invoiceDownloadAvailable &&
                    !customerInvoices.length &&
                    getInvoiceUrl(order) && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            getInvoiceUrl(order),
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="min-h-[38px] w-full sm:w-auto border-[#CE9F2D66] text-[#1B1D60]"
                      >
                        <Download size={15} /> Invoice
                      </Button>
                    )}
                </div>
              </section>
            )}
          </div>
        </ApiState>
      </div>
      <ConfirmModal
        open={cancelModalOpen}
        title="Cancel This Order?"
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
              <option value="changed_mind">Changed My Mind</option>
              <option value="ordered_by_mistake">Ordered by Mistake</option>
              <option value="address_issue">Address Issue</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="delivery_delay">Delivery Delay</option>
              <option value="other">Other</option>
            </select>
          </label>
          <textarea
            className="min-h-20 focus:outline-none  w-full rounded-[6px]  px-3 py-2 text-sm"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            maxLength={500}
            placeholder="Tell Us Why You Are Cancelling"
          />

          {cancelReason.trim().length > 0 && cancelReason.trim().length < 3 && (
            <p className="text-xs text-red-600">
              Please Enter at Least 3 Characters.
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

function OrderItemSummaryCard({ order, item }) {
  const navigate = useNavigate();
  const id = getOrderId(order);
  const apiOrderId = getOrderId(order);
  const createdAt = order.created_at || order.createdAt;
  const currency = getOrderCurrency(order);
  const status = getOrderStatus(order);
  const paymentMethod = humanize(getPaymentMethod(order), "N/A");

  const itemImage = getOrderCardImage(item);
  const itemTotal =
    item.line_total ??
    item.lineTotal ??
    Number(item.unit_price || item.unitPrice || 0) * Number(item.quantity || 0);
  const itemStatus =
    item.cancellation_status ||
    item.delivery_status ||
    item.deliveryStatus ||
    status;
  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);

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

  return (
    <article
      className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-[#FFFCF6]"
      onClick={handleOpenOrder}
    >
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 border-b border-[#E7D9B8] bg-[#F5EAD4] px-4 py-3 sm:px-6 sm:py-4 text-[14px] md:text-[15px] font-medium text-[#2E2E2E] hover:bg-[#EFE2C9] transition-colors rounded-t-xl cursor-pointer">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 flex-1">
          <span className="flex items-center gap-2 font-semibold">
            <FaShoppingCart className="text-[#2564EB] text-[18px]" />
            <span>Order ID : #{apiOrderId}</span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="flex items-center justify-center p-1 rounded hover:bg-black/5 transition-colors"
              title="Copy Order ID"
            >
              <MdContentCopy className="text-[#2E2E2E] text-[18px] cursor-pointer" />
            </button>
          </span>
          <span className="flex items-center gap-2 font-semibold">
            <MdDateRange className="text-[#2564EB] text-[18px]" />
            <span>{formatOrderDate(createdAt)}</span>
          </span>
          <span className="flex items-center gap-2 font-semibold">
            <BsCreditCardFill className="text-[#2564EB] text-[18px]" />
            <span>{paymentMethod}</span>
          </span>
        </div>
        <span className="shrink-0">
          <span
            className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-4 py-1.5 text-[13px] font-bold capitalize ${status === "delivered" ? "bg-[#008A27] text-white" : COMPACT_STATUS_BADGE[status] || "bg-[#D7A522] text-white"}`}
          >
            {humanize(status, "Processing")}
          </span>
        </span>
      </div>

      <div
        className="p-4 sm:p-5 lg:p-6 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row gap-5 md:gap-8 bg-white">
          <Link
            to={`/orders/${id}?itemId=${item.id || item._id}`}
            className="shrink-0"
          >
            <div className="relative flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-xl border border-[#EFE5D2] bg-white p-2">
              {itemImage ? (
                <img
                  src={itemImage}
                  alt={getProductTitle(item)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Package size={42} className="text-[#D9CBAE]" />
              )}
            </div>
          </Link>

          <div className="flex min-w-0 flex-col flex-1 py-1">
            <h3 className="text-lg md:text-[20px] font-semibold text-[#1B1D60] line-clamp-2">
              {getProductTitle(item)}
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#5E6472]">
              <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5 text-[#1B1D60]">
                Qty {Number(item.quantity || 0)}
              </span>
              {getItemAttributes(item).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full bg-[#F4F6FA] px-3 py-1.5 text-[#1B1D60] capitalize"
                >
                  {humanize(key, key)}: {value}
                </span>
              ))}
              {getOrderItemColor(item) !== "N/A" &&
                !getItemAttributes(item).some(
                  ([k]) => k.toLowerCase() === "color",
                ) && (
                  <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5 text-[#1B1D60]">
                    Color: {getOrderItemColor(item)}
                  </span>
                )}
            </div>

            <div className="mt-5">
              <p className="text-[22px] font-bold text-[#1B1D60]">
                {formatMoney(itemTotal, currency)}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#5E6472]">
                Inclusive of all taxes
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to={`/orders/${id}/track?itemId=${item.id || item._id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#DCA938] px-5 text-[14px] font-bold text-[#1B1D60] shadow-sm transition hover:bg-[#C59732]"
              >
                <Truck size={18} />
                Track Order
              </Link>
              {invoiceDownloadAvailable && (
                <Link
                  to={`/orders/${id}?itemId=${item.id || item._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-10 items-center justify-center gap-2 px-4 text-[14px] font-bold text-[#DCA938] transition hover:text-[#C59732]"
                >
                  <Download size={18} />
                  Download Invoice
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
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
  const state = useSelector((s) => s.order);
  const [activeFilter, setActiveFilter] = useState("");
  const [query, setQuery] = useState("");

  const allOrders = state.list.length
    ? state.list
    : getOrderCollection(state.current);

  const statusOrders = activeFilter
    ? allOrders.filter((o) => {
        const s = getOrderStatus(o);
        if (activeFilter === "return_requested") {
          return (
            s === "return_requested" ||
            s === "return_approved" ||
            s === "partially_returned" ||
            s === "returned"
          );
        }
        return s === activeFilter;
      })
    : allOrders;

  const orders = useMemo(() => {
    let term = query.trim().toLowerCase();
    const normalizedTerm = normalizeOrderSearchText(query);
    if (!term) return statusOrders;

    // Strip leading '#' if present since it's only a visual prefix
    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    return statusOrders.filter((order) => {
      const id = String(getOrderId(order) || "").toLowerCase();
      const apiOrderId = getApiOrderId(order);
      const orderNumber = String(apiOrderId || "").toLowerCase();
      const formattedId = String(
        formatOrderId(orderNumber || id),
      ).toLowerCase();
      const itemText = getOrderItems(order)
        .map((item) => getProductTitle(item))
        .join(" ")
        .toLowerCase();
      const visibleOrderIdText = `order id #${apiOrderId}`.toLowerCase();
      const normalizedOrderText = normalizeOrderSearchText(
        [id, apiOrderId, formattedId, visibleOrderIdText, itemText].join(" "),
      );

      return (
        id.includes(term) ||
        orderNumber.includes(term) ||
        formattedId.includes(term) ||
        itemText.includes(term) ||
        visibleOrderIdText.includes(term) ||
        (Boolean(normalizedTerm) &&
          normalizedOrderText.includes(normalizedTerm))
      );
    });
  }, [query, statusOrders]);

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
                  empty={!orders.length && !state.loading}
                  emptyTitle={
                    activeFilter ? "No orders found" : "No orders yet"
                  }
                  emptyText={
                    activeFilter || query
                      ? "Try a different filter."
                      : "Once you place an order, it will appear here."
                  }
                >
                  <div className="flex flex-col gap-4  ">
                    {orders.flatMap((order) => {
                      const items = getOrderItems(order);
                      return items.map((item, index) => (
                        <OrderItemSummaryCard
                          key={`${getOrderId(order)}-${item.id || item._id || index}`}
                          order={order}
                          item={item}
                        />
                      ));
                    })}
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
