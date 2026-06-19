import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiBox } from "react-icons/fi";
import { MdContentCopy } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  CreditCard,
  Download,
  FileText,
  Headphones,
  MapPin,
  Package,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Truck,
  XCircle,
} from "lucide-react";

import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/common/overlay/ConfirmModal";
import { useToastThunk } from "../../hooks/useToastThunk";
import { notify } from "../../utils/notify";
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
import { fetchMarketplaceInvoices } from "../../features/tax/taxSlice";
import { formatMoney, getImageUrlFromValue } from "../../utils/ecommerce";
import { downloadAuthDocument } from "../../utils/downloadAuthDocument";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { endpoints } from "../../api/endpoints";

const STATUS_BADGE = {
  pending_payment: "bg-amber-100 text-amber-700",
  payment_failed: "bg-red-100 text-red-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  partially_delivered: "bg-teal-100 text-teal-700",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  return_requested: "bg-amber-100 text-amber-700",
  return_approved: "bg-blue-100 text-blue-700",
  return_rejected: "bg-red-100 text-red-700",
  pickup_scheduled: "bg-indigo-100 text-indigo-700",
  pickup_completed: "bg-violet-100 text-violet-700",
  refund_initiated: "bg-sky-100 text-sky-700",
  refund_completed: "bg-emerald-100 text-emerald-700",
  partially_returned: "bg-orange-100 text-orange-700",
  partially_refunded: "bg-sky-100 text-sky-700",
  order_closed: "bg-gray-100 text-gray-600",
};
const ORDER_STEPS = [
  "pending_payment",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "fulfilled",
];
const TRACKING_LABELS = {
  pending_payment: "Payment pending",
  payment_failed: "Payment failed",
  confirmed: "Order confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  fulfilled: "Completed",
  return_requested: "Return requested",
  partially_returned: "Partially returned",
  returned: "Returned",
  cancelled: "Cancelled",
};
const RETURN_STEPS = ["return_requested", "partially_returned", "returned"];

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
const getItemProduct = (item) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product;
const getItemProductId = (item) => {
  const product = getItemProduct(item);
  return (
    item?.product_id ||
    item?.productId?._id ||
    item?.productId ||
    product?.id ||
    product?._id ||
    "N/A"
  );
};

const getItemImage = (item) => {
  const product = getItemProduct(item);
  const images = item?.images || item?.variant?.images || product?.images;
  return Array.isArray(images) ? images[0] : images;
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
const getVariantTitle = (item) =>
  item?.variant_title || item?.variantTitle || item?.variant?.title || "";
const getItemSku = (item) =>
  item?.variant_sku ||
  item?.variantSku ||
  item?.sku ||
  getItemProduct(item)?.sku ||
  "";
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
    return getItemsTotal(order);
  }

  return undefined;
};
const getCustomerOrderAmount = (order) => {
  const subtotal = getAmount(order, "subtotal") ?? getItemsTotal(order);
  const discount = getAmount(order, "discount") ?? 0;
  const walletDiscount = getAmount(order, "walletDiscount") ?? 0;
  const shipping = getAmount(order, "shipping") ?? 0;
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

function OrderStatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || "bg-cream text-muted";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {(status || "unknown").replace(/_/g, " ")}
    </span>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="rounded-[8px] border border-border bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-gray">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold capitalize text-ink">
        {value || "N/A"}
      </p>
    </div>
  );
}

function OrderProgress({ status }) {
  const isCancelled = status === "cancelled";
  const isFailed = status === "payment_failed";
  const inReturnFlow = RETURN_STEPS.includes(status);
  const activeIndex = ORDER_STEPS.indexOf(inReturnFlow ? "fulfilled" : status);
  const visibleSteps =
    isCancelled || isFailed
      ? [
          {
            status: "confirmed",
            label: TRACKING_LABELS.confirmed,
            note: "Your order update has been recorded.",
            done: true,
          },
          {
            status,
            label: TRACKING_LABELS[status],
            note: isCancelled
              ? "Your cancellation request is being processed."
              : "Payment could not be completed for this order.",
            done: true,
            danger: isCancelled,
            warning: isFailed,
          },
        ]
      : ORDER_STEPS.map((step, index) => ({
          status: step,
          label: TRACKING_LABELS[step],
          done: activeIndex >= index,
          current: activeIndex === index,
        }));

  const currentStep =
    visibleSteps.find((step) => step.current) ||
    visibleSteps[visibleSteps.length - 1];

  return (
    <div className="overflow-hidden rounded-[12px] border border-border bg-white shadow-[0_14px_40px_rgba(31,36,48,0.06)]">
      <div className="border-b border-border bg-gradient-to-r from-cream via-white to-gold-soft/50 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-normal text-gold-dark">
          Order progress
        </p>
        <p className="mt-1 text-sm font-semibold capitalize text-ink">
          {currentStep?.label || "Status update"}
        </p>
      </div>

      <ol className="px-3 py-3 sm:px-4 sm:py-4">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;
          const isAlert = step.danger || step.warning;
          const dotClass = step.danger
            ? "border-danger bg-danger text-white ring-danger/10"
            : step.warning
              ? "border-warning bg-warning text-white ring-warning/10"
              : step.done
                ? "border-gold bg-gold text-white ring-gold-soft"
                : "border-border-strong bg-white text-gray ring-cream";
          const lineClass = isAlert
            ? step.danger
              ? "bg-danger/35"
              : "bg-warning/35"
            : step.done
              ? "bg-gold/55"
              : "bg-border";
          const rowClass = step.current
            ? "border-gold/50 bg-gold-soft/45 shadow-sm"
            : step.done
              ? "border-transparent bg-white"
              : "border-transparent bg-white/60";

          return (
            <li
              key={step.status}
              className={`relative grid grid-cols-[34px_1fr] gap-3 rounded-[10px] border px-2.5 py-3 transition-all duration-300 ease-in-out sm:grid-cols-[42px_1fr] sm:px-3 ${rowClass}`}
            >
              <div className="relative flex justify-center">
                {!isLast && (
                  <span
                    className={`absolute left-1/2 top-7 h-[calc(100%+20px)] w-px -translate-x-1/2 ${lineClass}`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] shadow-sm ring-4 sm:h-6 sm:w-6 ${dotClass}`}
                >
                  {step.done ? (
                    isAlert ? (
                      <XCircle size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )
                  ) : (
                    <Circle size={11} />
                  )}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`break-words text-sm font-semibold capitalize ${
                      step.done || step.current ? "text-ink" : "text-muted"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.current && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-gold-dark shadow-sm ring-1 ring-gold/15">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-1 break-words text-xs leading-5 text-muted">
                  {step.note ||
                    (step.done
                      ? "This step has been completed."
                      : "Updates will appear as your order moves forward.")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const shippingAddress =
    order?.shipping_address || order?.shippingAddress || {};
  const taxBreakup = order?.tax_breakup || order?.taxBreakup;
  const subtotal = getAmount(order, "subtotal");
  const discount = getAmount(order, "discount");
  const tax = getAmount(order, "tax");
  const walletDiscount = getAmount(order, "walletDiscount");
  const shipping = getAmount(order, "shipping");
  const customerAmount = getCustomerOrderAmount(order);
  const taxIncluded = getTaxIncludedAmount(order, taxBreakup);
  const taxPayable = getTaxPayableAmount(order, taxBreakup);
  const status = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);
  const deliveryStatus = getDeliveryStatus(order);
  const paymentMethod = getPaymentMethod(order);

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) return;
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
      // openRazorpayCheckout throws on dismiss/failure; order stays pending
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
      <Seo title={`Order ${orderId} | Sam Global`} />
      <div className="w-container py-4 xl:py-10">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-all duration-300 ease-in-out"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
        >
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-[8px] border border-border bg-white">
              <div className="bg-cream px-4 py-4 sm:px-6 ">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-normal text-gold-dark">
                      {track ? "Track order" : "Order details"}
                    </p>
                    <h1 className="mt-1 break-words text-xl font-bold text-ink sm:text-2xl">
                      #{formatOrderId(getOrderNumber(order))}
                    </h1>
                    <p className="mt-1 break-all font-mono text-xs text-muted">
                      {getOrderId(order) || orderId}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {hasKnownStatus(order) && (
                      <OrderStatusBadge status={status} />
                    )}
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-muted">
                      Payment: {humanize(paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3  border-t border-border bg-white p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                <InfoTile
                  icon={<CalendarDays size={14} />}
                  label="Placed on"
                  value={formatOrderDate(order?.created_at || order?.createdAt)}
                />
                <InfoTile
                  icon={<CreditCard size={14} />}
                  label="Payment"
                  value={`${humanize(paymentMethod)} · ${humanize(paymentStatus)}`}
                />
                <InfoTile
                  icon={<Truck size={14} />}
                  label="Delivery"
                  value={humanize(deliveryStatus || status)}
                />
                <InfoTile
                  icon={<ReceiptText size={14} />}
                  label="Order amount"
                  value={formatMoney(customerAmount, currency)}
                />
              </div>

              {hasKnownStatus(order) && (
                <div className="border-t  border-border px-4 py-5 sm:px-6">
                  <OrderProgress status={status} />
                </div>
              )}
            </section>

            {!track && (
              <section className="grid    gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[8px]  border border-border bg-white">
                  <div className="border-b  border-border px-4 py-4 sm:px-6">
                    <h2 className="text-base font-bold text-ink">Items</h2>
                    <p className="mt-1 text-sm text-muted">
                      {items.length} item{items.length === 1 ? "" : "s"} in this
                      order
                    </p>
                  </div>
                  <div className="grid gap-3  p-3 sm:gap-4 sm:p-4 lg:p-6">
                    {items.map((item, i) => {
                      const unitPrice = getItemUnitPrice(item);
                      const lineTotal = getItemLineTotal(item);

                      return (
                        <div
                          key={
                            item.id ||
                            item._id ||
                            item.product_id ||
                            getItemProductId(item) ||
                            i
                          }
                          className="group relative overflow-hidden rounded-xl border border-border bg-white p-3 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-primary  sm:rounded-2xl sm:p-4 lg:p-5"
                        >
                          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent opacity-70 transition-all duration-300 group-hover:w-1.5" />

                          <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                            <div className="flex min-w-0 gap-3 sm:gap-4">
                              <div className="flex w-10 h-10  md:h-14 md:w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary sm:h-16 sm:w-16 sm:rounded-xl ">
                                {getItemImage(item) ? (
                                  <img
                                    src={getItemImage(item)}
                                    alt={getProductTitle(item)}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Package size={22} className="sm:hidden" />
                                )}

                                {!getItemImage(item) && (
                                  <Package
                                    size={24}
                                    className="hidden sm:block"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1 text-sm">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink sm:text-base">
                                  {getProductTitle(item)}
                                </p>

                                {getVariantTitle(item) && (
                                  <p className="mt-1 text-xs font-medium text-muted sm:text-sm">
                                    {getVariantTitle(item)}
                                  </p>
                                )}

                                {getItemSku(item) ? (
                                  <p className="mt-2 max-w-full break-all rounded-full bg-[#FAF6EE] px-2.5 py-1 text-[11px] text-gray sm:inline-block sm:px-3 sm:text-xs">
                                    SKU: {getItemSku(item)}
                                  </p>
                                ) : (
                                  <p className="mt-2 max-w-full break-all rounded-full bg-[#FAF6EE] px-2.5 py-1 font-mono text-[11px] text-gray sm:inline-block sm:px-3 sm:text-xs">
                                    #
                                    {String(getItemProductId(item)).slice(
                                      0,
                                      12,
                                    )}
                                  </p>
                                )}

                                <p className="mt-2 text-xs text-muted sm:mt-3">
                                  Qty{" "}
                                  <span className="font-semibold text-ink">
                                    {item.quantity}
                                  </span>{" "}
                                  × {formatMoney(unitPrice, currency)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:min-w-[130px] sm:shrink-0 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                              <p className="text-xs text-muted sm:mb-1">
                                Line Total
                              </p>

                              <p className="text-sm font-bold text-ink sm:text-base">
                                {formatMoney(lineTotal, currency)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <aside className="grid gap-4 self-start">
                  {(subtotal !== undefined || items.length > 0) && (
                    <div className="rounded-[8px] border border-border bg-white p-4">
                      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <CreditCard size={15} /> Payment summary
                      </h2>
                      <div className="mt-4 grid gap-2 text-sm">
                        {subtotal !== undefined && (
                          <div className="flex justify-between gap-4 text-muted">
                            <span>Subtotal</span>
                            <span>{formatMoney(subtotal, currency)}</span>
                          </div>
                        )}
                        {asNumber(discount) > 0 && (
                          <div className="flex justify-between gap-4 text-emerald-700">
                            <span>Discount</span>
                            <span>-{formatMoney(discount, currency)}</span>
                          </div>
                        )}
                        {asNumber(walletDiscount) > 0 && (
                          <div className="flex justify-between gap-4 text-emerald-700">
                            <span>Wallet discount</span>
                            <span>
                              -{formatMoney(walletDiscount, currency)}
                            </span>
                          </div>
                        )}
                        {asNumber(shipping) > 0 && (
                          <div className="flex justify-between gap-4 text-muted">
                            <span>Shipping</span>
                            <span>{formatMoney(shipping, currency)}</span>
                          </div>
                        )}
                        <div className="mt-1 flex justify-between gap-4 border-t border-border pt-3 font-bold text-ink">
                          <span>Order amount</span>
                          <span>{formatMoney(customerAmount, currency)}</span>
                        </div>
                      </div>
                      {(taxBreakup || tax !== undefined) && (
                        <div className="mt-4 rounded-[8px] bg-cream p-3 text-xs text-muted">
                          <p className="font-semibold text-ink">
                            GST invoice breakup
                          </p>
                          {taxBreakup && (
                            <p className="mt-1">
                              Tax mode:{" "}
                              {(
                                taxBreakup.taxMode ||
                                taxBreakup.tax_mode ||
                                "N/A"
                              )
                                .toString()
                                .toUpperCase()}
                            </p>
                          )}
                          {taxPayable > 0 && (
                            <p>
                              GST added to payable:{" "}
                              {formatMoney(taxPayable, currency)}
                            </p>
                          )}
                          {taxIncluded > 0 && (
                            <p>
                              GST included in item price:{" "}
                              {formatMoney(taxIncluded, currency)}
                            </p>
                          )}
                          {tax !== undefined &&
                            taxPayable === 0 &&
                            taxIncluded === 0 && (
                              <p>GST breakup: {formatMoney(tax, currency)}</p>
                            )}
                        </div>
                      )}
                    </div>
                  )}

                  {hasShippingAddress(shippingAddress) && (
                    <div className="rounded-[8px] border border-border bg-white p-4">
                      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <MapPin size={15} /> Shipping address
                      </h2>
                      <div className="mt-3 break-words text-sm leading-6 text-muted">
                        {getAddressValue(
                          shippingAddress,
                          "fullName",
                          "full_name",
                        ) && (
                          <p className="font-medium text-ink">
                            {getAddressValue(
                              shippingAddress,
                              "fullName",
                              "full_name",
                            )}
                          </p>
                        )}
                        {shippingAddress.phone && (
                          <p>{shippingAddress.phone}</p>
                        )}
                        {[shippingAddress.line1, shippingAddress.line2].filter(
                          Boolean,
                        ).length > 0 && (
                          <p>
                            {[shippingAddress.line1, shippingAddress.line2]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        {[
                          shippingAddress.city,
                          shippingAddress.state,
                          getAddressValue(
                            shippingAddress,
                            "postalCode",
                            "postal_code",
                          ),
                        ].filter(Boolean).length > 0 && (
                          <p>
                            {[
                              shippingAddress.city,
                              shippingAddress.state,
                              getAddressValue(
                                shippingAddress,
                                "postalCode",
                                "postal_code",
                              ),
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        {shippingAddress.country && (
                          <p>{shippingAddress.country}</p>
                        )}
                      </div>
                    </div>
                  )}
                </aside>
              </section>
            )}

            {(invoices?.sellerInvoices?.length > 0 ||
              invoices?.orderInvoice) && (
              <section className="rounded-[8px] border border-border bg-white px-4 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <FileText size={15} /> Invoices &amp; documents
                </h2>
                <div className="mt-3 grid gap-2">
                  {invoices.orderInvoice && (
                    <div className="flex items-center justify-between gap-3 rounded-[6px] border border-border bg-surface px-3 py-2.5 text-sm">
                      <span className="text-muted">Order invoice</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={
                          downloadingId ===
                          endpoints.tax.invoiceDownload(
                            invoices.orderInvoice.id ||
                              invoices.orderInvoice._id,
                          )
                        }
                        onClick={() =>
                          handleDownload(
                            endpoints.tax.invoiceDownload(
                              invoices.orderInvoice.id ||
                                invoices.orderInvoice._id,
                            ),
                            `invoice-${getOrderNumber(order)}.pdf`,
                          )
                        }
                      >
                        <Download size={13} /> Download
                      </Button>
                    </div>
                  )}
                  {(invoices.sellerInvoices || []).map((inv) => {
                    const invId = inv.id || inv._id;
                    const sellerName =
                      inv.sellerName ||
                      inv.seller_name ||
                      `Seller ${String(invId).slice(0, 6)}`;
                    const dlPath = endpoints.tax.invoiceDownload(invId);
                    return (
                      <div
                        key={invId}
                        className="flex items-center justify-between gap-3 rounded-[6px] border border-border bg-surface px-3 py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-ink">{sellerName}</p>
                          <p className="text-xs text-muted">Seller invoice</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={downloadingId === dlPath}
                          onClick={() =>
                            handleDownload(
                              dlPath,
                              `invoice-${sellerName}-${getOrderNumber(order)}.pdf`,
                            )
                          }
                        >
                          <Download size={13} /> Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {cancellations.length > 0 && (
              <section className="rounded-[8px] border border-border bg-white px-4 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-ink">
                  Cancellation and refund status
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
                            Refund status:{" "}
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
                              <Download size={12} /> Credit note
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {["delivered", "fulfilled", "partially_delivered"].includes(
              status,
            ) &&
              items.length > 0 && (
                <section className="rounded-[8px] border border-border bg-white px-4 py-4 sm:px-6">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Star size={15} className="text-gold" /> Rate your purchases
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Share your experience to help other buyers.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {items.map((item, i) => {
                      const pid = getItemProductId(item);
                      const title = getProductTitle(item);
                      const img = getItemImage(item);
                      return (
                        <Link
                          key={pid || i}
                          to={
                            pid && pid !== "N/A"
                              ? `/products/${pid}#reviews`
                              : "#"
                          }
                          className="flex items-center gap-3 rounded-[8px] border border-border px-3 py-2.5 text-sm transition hover:border-gold/50 hover:bg-cream"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={title}
                              className="h-10 w-10 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cream text-muted">
                              <Package size={16} />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate font-medium text-ink">
                            {title}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-gold-dark">
                            Rate →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

            {hasKnownStatus(order) && (
              <section className="grid gap-3 rounded-[8px] border border-border bg-white px-4 py-4 sm:flex sm:flex-wrap sm:px-6">
                {(status === "pending_payment" ||
                  status === "payment_failed") && (
                  <Button
                    className="w-full sm:w-auto"
                    loading={retrying}
                    onClick={handleRetryPayment}
                  >
                    <RefreshCw size={15} /> Retry payment
                  </Button>
                )}
                {canCancelOrder(order) && (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={openCancellation}
                  >
                    <XCircle size={15} /> Cancel order
                  </Button>
                )}
                {["delivered", "fulfilled", "partially_delivered"].includes(
                  status,
                ) && (
                  <Link
                    to={`/returns/request/${orderId}`}
                    className="block sm:inline-flex"
                  >
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <RotateCcw size={15} /> Request return
                    </Button>
                  </Link>
                )}
                {!track && (
                  <Link
                    to={`/orders/${orderId}/track`}
                    className="block sm:inline-flex"
                  >
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <Truck size={15} /> Track order
                    </Button>
                  </Link>
                )}
                {track && (
                  <Link
                    to={`/orders/${orderId}`}
                    className="block sm:inline-flex"
                  >
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <ReceiptText size={15} /> View order
                    </Button>
                  </Link>
                )}
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

const ORDER_FILTERS = [
  { label: "All", value: "" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Return", value: "return_requested" },
  { label: "Payment failed", value: "payment_failed" },
];

const COMPACT_STATUS_BADGE = {
  delivered: "bg-[#0C9F45] text-white",
  fulfilled: "bg-[#0C9F45] text-white",
  partially_delivered: "bg-[#0C9F45] text-white",
  shipped: "bg-[#25247B] text-white",
  packed: "bg-[#25247B] text-white",
  out_for_delivery: "bg-[#25247B] text-white",
  confirmed: "bg-[#2F64E5] text-white",
  processing: "bg-[#D7A522] text-white",
  pending_payment: "bg-[#D7A522] text-white",
  payment_failed: "bg-[#D93636] text-white",
  cancelled: "bg-[#D93636] text-white",
};

function OrderListStatusBadge({ status }) {
  const cls = COMPACT_STATUS_BADGE[status] || "bg-[#D7A522] text-white";
  return (
    <span
      className={`inline-flex min-w-[74px] justify-center rounded-full px-3 py-2 text-xs  md:text-base  2xl:text-[18px] font-bold capitalize ${cls}`}
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

function OrderSummaryCard({ order }) {
  const id = getOrderId(order);
  const orderNumber = getOrderNumber(order);
  const status = getOrderStatus(order);
  const createdAt = order.created_at || order.createdAt;
  const item = getOrderItems(order)[0] || {};
  const title = getProductTitle(item);
  const image = getOrderCardImage(item);
  const currency = getOrderCurrency(order);
  const amount = getCustomerOrderAmount(order);
  const quantity = item?.quantity || 1;
  const paymentMethod = humanize(getPaymentMethod(order), "N/A");

  const handleCopyOrderId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const formattedId = formatOrderId(orderNumber || id);
    navigator.clipboard.writeText(formattedId)
      .then(() => {
        notify.success(`Order ID #${formattedId} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy order ID:", err);
      });
  };

  return (
    <article className="overflow-hidden rounded-xl mt-6 border border-[#E7D9B8]  bg-[#FFFCF6]">
      <div className="flex flex-col gap-3 border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-4 md:py-6  text-sm md:text-base 2xl:text-[20px] font-semibold text-ink">
        <div className="flex items-center justify-between w-full md:contents">
          <span className="inline-flex items-center gap-1.5">
            <FaShoppingCart className="text-[#2564EB] text-sm lg:text-xl" />
            Order ID : #{formatOrderId(orderNumber || id)}
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="p-1 hover:bg-[#CE9F2D33] rounded-full transition-colors duration-200 flex items-center justify-center"
              title="Copy Order ID"
            >
              <MdContentCopy className="text-[#2E2E2E] text-sm lg:text-xl cursor-pointer" />
            </button>
          </span>
          <span className="md:hidden">
            <OrderListStatusBadge status={status} />
          </span>
        </div>
        <div className="flex items-center justify-between w-full md:contents">
          <span className="inline-flex items-center gap-1.5">
            <MdDateRange className="text-[#2564EB] text-sm lg:text-xl" />
            {formatOrderDate(createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BsCreditCardFill className="text-[#2564EB] text-sm lg:text-xl" />
            {paymentMethod}
          </span>
        </div>
        <span className="hidden md:inline-block">
          <OrderListStatusBadge status={status} />
        </span>
      </div>

      <div className="grid   gap-6 p-3 grid-cols-1 md:grid-cols-[40%_70%] 2xl:grid-cols-[399px_1fr] sm:p-6">
        <Link
          to={`/orders/${id}`}
          className="flex h-56 md:h-auto items-center justify-center overflow-hidden rounded-md border border-[#EFE5D2] bg-white"
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-contain p-3"
            />
          ) : (
            <Package size={42} className="text-[#D9CBAE]" />
          )}
        </Link>

        <div className="min-w-0 ">
          <Link
            to={`/orders/${id}`}
            className="line-clamp-2 text-xl lg:text-[26px] font-semibold text-[#2E2E2E] "
          >
            {title}
          </Link>

          <div className="my-6  flex flex-wrap gap-x-5 gap-y-1 text-lg font-semibold text-ink">
            <span>
              Color :{" "}
              <strong className="font-bold text-[#25247B]">
                {getOrderItemColor(item)}
              </strong>
            </span>
            <span>
              Quantity : <strong className="font-bold">{quantity}</strong>
            </span>
          </div>

          <p className="mt-3  text-xl lg:text-[34px] font-extrabold text-[#1B1D60]">
            {formatMoney(amount, currency)}
          </p>
          <p className="text-lg my-2 font-medium text-ink">
            Inclusive of all taxes
          </p>

          <div className="my-4 flex flex-wrap items-center gap-3">
            <Link
              to={`/orders/${id}/track`}
              className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-[10px] bg-gold px-20  text-sm lg:text-[15px] font-bold text-white transition-colors"
            >
              <Truck size={18} />
              Track Order
            </Link>
            <Link
              to={`/orders/${id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-2 text-sm lg:text-[15px] font-bold text-gold-dark transition-colors hover:bg-gold-soft"
            >
              <Download size={13} />
              Download Invoice
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderHelpPanel() {
  const items = [
    { icon: Headphones, title: "Contact Support" },
    { icon: FiBox, title: "Contact Support" },
    { icon: Truck, title: "Contact Support" },
  ];

  return (
    <aside className="h-fit rounded-xl border border-[#E7D9B8] bg-white p-6 lg:sticky lg:top-28">
      <h2 className="text-2xl font-bold text-ink py-2">Need Help ?</h2>
      <div className="mt-3 divide-y divide-[#EFE5D2]">
        {items.map(({ icon: Icon, title }, index) => (
          <Link
            key={`${title}-${index}`}
            to="/contact"
            className="flex items-center gap-3 py-7 first:pt-2"
          >
            <span className="flex w-10 h-10 lg:h-14  lg:w-14 shrink-0 items-center justify-center rounded-full border border-[#1B1D6099] bg-[#F3F3F7] text-[#25247B]">
              <Icon size={20} className="text-[#25247B]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg  lg:text-2xl font-semibold text-[#1B1D60]">
                {title}
              </span>
              <span className="block text-base md:text-lg font-medium text-[#2E2E2E]">
                Get help with your orders
              </span>
            </span>
            <ChevronRight size={18} className="text-[#25247B]" />
          </Link>
        ))}
      </div>
    </aside>
  );
}

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
    if (!term) return statusOrders;

    // Strip leading '#' if present since it's only a visual prefix
    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    return statusOrders.filter((order) => {
      const id = String(getOrderId(order) || "").toLowerCase();
      const orderNumber = String(getOrderNumber(order) || "").toLowerCase();
      const formattedId = String(formatOrderId(orderNumber || id)).toLowerCase();
      const itemText = getOrderItems(order)
        .map((item) => getProductTitle(item))
        .join(" ")
        .toLowerCase();

      return (
        id.includes(term) ||
        orderNumber.includes(term) ||
        formattedId.includes(term) ||
        itemText.includes(term)
      );
    });
  }, [query, statusOrders]);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Orders | Sam Global" />

      <section className="min-h-screen bg-white py-5 sm:py-8 lg:py-10">
        <div className="">
          <div className="mb-4 text-sm lg:text-lg font-medium text-muted">
            <Link to="/">Home</Link>
            <span className="mx-2">{">"}</span>
            <span className="text-gold">My Order</span>
          </div>

          <div className="mb-5 sm:my-4">
            <h1 className="text-xl lg:text-[38px] font-bold text-[#25247B] ">
              My Order
            </h1>
          </div>

          <div className="grid  mt-8 xl:mt-14  gap-8 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_413px]">
            <div className="min-w-0 rounded-[8px] border border-[#E7D9B8] bg-white p-3  sm:p-4">
              <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-[450px]">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by product name or Order ID..."
                    className="h-12 w-full rounded-[10px] border border-[#1B1D604D] bg-[#FAF8FFB2] pl-9 pr-3  text-base font-medium text-ink outline-none focus:outline-none"
                  />
                </label>

                <select
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                  className="h-12 lg:w-fit w-full appearance-none rounded-[10px] border border-[#2564EB] bg-white pl-3 pr-10 text-base font-semibold text-[#2564EB] focus:outline-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%232564EB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  }}
                >
                  {ORDER_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label === "All" ? "All Status" : filter.label}
                    </option>
                  ))}
                </select>
              </div>

              <ApiState
                loading={state.loading && !allOrders.length}
                error={state.error}
                empty={!orders.length && !state.loading}
                emptyTitle={activeFilter ? "No orders found" : "No orders yet"}
                emptyText={
                  activeFilter || query
                    ? "Try a different filter."
                    : "Once you place an order, it will appear here."
                }
              >
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <OrderSummaryCard key={getOrderId(order)} order={order} />
                  ))}
                </div>
              </ApiState>
            </div>

            <OrderHelpPanel />
          </div>
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
