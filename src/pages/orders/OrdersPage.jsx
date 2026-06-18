import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/common/overlay/ConfirmModal";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchMyOrders,
  fetchOrderById,
  cancelOrder,
} from "../../features/order/orderSlice";
import { formatMoney } from "../../utils/ecommerce";

const STATUS_BADGE = {
  pending_payment: "bg-amber-100 text-amber-700",
  payment_failed: "bg-red-100 text-red-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
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
  cancelled: "Cancelled",
};

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

const getItemTitle = (item) =>
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  (typeof item?.productId === "object"
    ? item.productId?.title || item.productId?.name
    : null) ||
  "Product";

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
  if (order?.summary?.customerPayableAmount !== undefined) {
    return asNumber(order.summary.customerPayableAmount);
  }
  if (order?.summary?.customerTotalAmount !== undefined) {
    return Math.max(
      0,
      asNumber(order.summary.customerTotalAmount) -
        asNumber(order.summary.walletDiscountAmount),
    );
  }
  const subtotal = getAmount(order, "subtotal") ?? getItemsTotal(order);
  const discount = getAmount(order, "discount") ?? 0;
  const walletDiscount = getAmount(order, "walletDiscount") ?? 0;
  const shipping = getAmount(order, "shipping") ?? 0;
  return Number(
    Math.max(
      0,
      asNumber(subtotal) -
        asNumber(discount) +
        asNumber(shipping) -
        asNumber(walletDiscount),
    ).toFixed(2),
  );
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
const getOrderListSummary = (order) => {
  const items = getOrderItems(order);
  const city = order?.shipping_address?.city || order?.shippingAddress?.city;
  const stateName =
    order?.shipping_address?.state || order?.shippingAddress?.state;
  const itemText = items.length
    ? `${getProductTitle(items[0])}${items.length > 1 ? ` +${items.length - 1} more` : ""}`
    : "";
  const locationText = city
    ? `${city}${stateName ? `, ${stateName}` : ""}`
    : "";

  return [itemText, locationText].filter(Boolean).join(" · ");
};
const getOrderRelations = (order) => order?.relations || {};
const getOrderShipments = (order) => {
  const shipments =
    getOrderRelations(order).shipments || order?.shipments || [];
  return Array.isArray(shipments) ? shipments : [];
};
const getTrackingEvents = (order) =>
  getOrderShipments(order)
    .flatMap(
      (shipment) => shipment?.trackingEvents || shipment?.tracking_events || [],
    )
    .sort(
      (a, b) =>
        new Date(a.event_time || a.eventTime || a.created_at || 0) -
        new Date(b.event_time || b.eventTime || b.created_at || 0),
    );
const getLatestShipment = (order) => getOrderShipments(order)[0] || null;
const getTrackingNumber = (order) => {
  const shipment = getLatestShipment(order);
  return (
    shipment?.tracking_number ||
    shipment?.trackingNumber ||
    shipment?.awb_number ||
    shipment?.awbNumber ||
    null
  );
};
const getCourierName = (order) => {
  const shipment = getLatestShipment(order);
  return (
    shipment?.courier_name ||
    shipment?.courierName ||
    shipment?.provider ||
    null
  );
};
const getTrackingUrl = (order) => {
  const shipment = getLatestShipment(order);
  return shipment?.tracking_url || shipment?.trackingUrl || null;
};
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
  const activeIndex = ORDER_STEPS.indexOf(status);
  const isCancelled = status === "cancelled";
  const isFailed = status === "payment_failed";
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

// function TrackingEvents({ order }) {
//   const events = getTrackingEvents(order);
//   const timeline = events.length
//     ? events
//     : (order?.timeline || []).map((event) => ({
//         status: event.to_status || event.status,
//         note: event.note || event.reason,
//         event_time: event.created_at,
//       }));

//   if (!timeline.length) {
//     return (
//       <div className="rounded-[8px] border border-border bg-cream px-4 py-4 text-sm text-muted">
//         Tracking events will appear after the order moves forward.
//       </div>
//     );
//   }

//   return (
//     <ol className="space-y-4">
//       {timeline.map((event, index) => (
//         <li
//           key={event.id || `${event.status}-${index}`}
//           className="grid grid-cols-[28px_1fr] gap-3"
//         >
//           <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-cream text-gold">
//             <Clock3 size={14} />
//           </span>
//           <div className="min-w-0 border-b border-border pb-4 last:border-b-0 last:pb-0">
//             <p className="text-sm font-semibold capitalize text-ink">
//               {humanize(event.status || event.to_status || "Updated")}
//             </p>
//             {event.note && (
//               <p className="mt-1 text-sm text-muted">{event.note}</p>
//             )}
//             {(event.location || event.source) && (
//               <p className="mt-1 text-xs capitalize text-gray">
//                 {[event.location, event.source].filter(Boolean).join(" · ")}
//               </p>
//             )}
//             <p className="mt-1 text-xs text-gray">
//               {formatOrderDate(
//                 event.event_time || event.eventTime || event.created_at,
//               )}
//             </p>
//           </div>
//         </li>
//       ))}
//     </ol>
//   );
// }

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonCode, setCancelReasonCode] = useState("changed_mind");
  const [cancelItems, setCancelItems] = useState({});
  const state = useSelector((s) => s.order);
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
  const trackingNumber = getTrackingNumber(order);
  const courierName = getCourierName(order);
  const trackingUrl = getTrackingUrl(order);
  const paymentMethod = getPaymentMethod(order);

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

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
      <div className="w-container py-6 sm:py-10">
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

            {/* {track && (
              <section className="grid gap-5  lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[8px] border border-border bg-white p-4 sm:p-6">
                  <div className="mb-5  flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-ink">
                        Tracking activity
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {trackingNumber ? (
                          trackingUrl ? (
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-gold underline underline-offset-2 hover:text-gold-dark"
                            >
                              {trackingNumber}
                            </a>
                          ) : (
                            <span className="font-mono">{trackingNumber}</span>
                          )
                        ) : (
                          "Shipment tracking will update here."
                        )}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-gold">
                      <Truck size={18} />
                    </span>
                  </div>
                  <TrackingEvents order={order} />
                </div>

                <aside className="grid gap-4 d">
                  <div className="rounded-[8px] border border-border bg-white p-4">
                    <h2 className="text-sm font-bold text-ink">Shipment</h2>
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted">Courier</span>
                        <span className="text-right font-semibold capitalize text-ink">
                          {humanize(courierName)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted">Tracking no.</span>
                        <span className="break-all text-right font-mono text-xs font-semibold text-ink">
                          {trackingNumber || "N/A"}
                        </span>
                      </div>
                      {trackingUrl && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted">Track package</span>
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-right text-xs font-semibold text-gold underline underline-offset-2 hover:text-gold-dark"
                          >
                            Track on courier site
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between gap-4">
                        <span className="text-muted">Status</span>
                        <span className="text-right font-semibold capitalize text-ink">
                          {humanize(deliveryStatus || status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hasShippingAddress(shippingAddress) && (
                    <div className="rounded-[8px] border border-border bg-white p-4">
                      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <MapPin size={15} /> Delivery address
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
            )} */}

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

            {cancellations.length > 0 && (
              <section className="rounded-[8px] border border-border bg-white px-4 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-ink">
                  Cancellation and refund status
                </h2>
                <div className="mt-3 grid gap-3">
                  {cancellations.map((cancellation) => (
                    <div
                      key={cancellation.id}
                      className="rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>{cancellation.cancellation_number}</strong>
                        <span className="capitalize text-muted">
                          {String(cancellation.status || "processing").replace(
                            /_/g,
                            " ",
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-muted">{cancellation.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
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
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasKnownStatus(order) && (
              <section className="grid gap-3 rounded-[8px] border border-border bg-white px-4 py-4 sm:flex sm:flex-wrap sm:px-6">
                {canCancelOrder(order) && (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={openCancellation}
                  >
                    <XCircle size={15} /> Cancel order
                  </Button>
                )}
                {["delivered", "fulfilled"].includes(status) && (
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
          {/* <div className="grid gap-2 ">
            {items.map((item) => {
              const itemId = String(item.id || item._id);
              const remaining =
                Number(item.quantity || 0) -
                Number(item.cancelled_quantity || 0);
              const selected = Object.prototype.hasOwnProperty.call(
                cancelItems,
                itemId,
              );
              return (
                <div
                  key={itemId}
                  className="flex items-center gap-2 rounded-[6px] border border-border p-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={remaining <= 0}
                    onChange={(event) =>
                      setCancelItems((previous) => {
                        const next = { ...previous };
                        if (event.target.checked) next[itemId] = remaining;
                        else delete next[itemId];
                        return next;
                      })
                    }
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {getItemTitle(item)}
                  </span>
                  <input
                    type="number"
                    className="w-16 rounded border border-border px-2 py-1"
                    min="1"
                    max={remaining}
                    disabled={!selected}
                    value={selected ? cancelItems[itemId] : ""}
                    onChange={(event) =>
                      setCancelItems((previous) => ({
                        ...previous,
                        [itemId]: Math.min(
                          Math.max(Number(event.target.value || 1), 1),
                          remaining,
                        ),
                      }))
                    }
                  />
                  <span className="text-xs text-muted">of {remaining}</span>
                </div>
              );
            })}
          </div> */}
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

function OrderList() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.order);

  const orders = state.list.length
    ? state.list
    : getOrderCollection(state.current);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Orders | Sam Global" />

      <section className="min-h-screen py-5 sm:py-8 lg:py-10">
        <div className="w-container">
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl font-bold text-ink sm:text-2xl lg:text-3xl">
              My Orders
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Track and review your recent purchases
            </p>
          </div>

          <ApiState
            loading={state.loading && !orders.length}
            error={state.error}
            empty={!orders.length}
            emptyTitle="No orders yet"
            emptyText="Once you place an order, it will appear here."
          >
            <div className="grid gap-3 sm:gap-4">
              {orders.map((order) => {
                const id = getOrderId(order);
                const summary = getOrderListSummary(order);
                const createdAt = order.created_at || order.createdAt;
                const payableAmount = getCustomerOrderAmount(order);

                return (
                  <Link
                    key={id}
                    to={`/orders/${id}`}
                    className="group relative block overflow-hidden rounded-xl border border-border bg-white p-3 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-0 sm:rounded-2xl sm:p-4 lg:p-5"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent opacity-70 transition-all duration-300 group-hover:w-1.5" />

                    <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                      <div className="flex min-w-0 gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                          <Package size={18} className="sm:hidden" />
                          <Package size={20} className="hidden sm:block" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#FAF6EE] px-2.5 py-1 text-[11px] font-semibold text-ink sm:px-3 sm:text-xs">
                              #{formatOrderId(id)}
                            </span>

                            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted sm:px-3 sm:text-xs">
                              {formatOrderDate(createdAt)}
                            </span>
                          </div>

                          <p className="mt-2 max-w-full break-all font-mono text-[11px] leading-relaxed text-gray sm:text-xs md:max-w-[420px] lg:max-w-[560px] lg:truncate">
                            Order ID: {id}
                          </p>

                          {summary && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:line-clamp-1 sm:text-sm">
                              {summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:min-w-[150px] sm:shrink-0 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                        {hasKnownStatus(order) && (
                          <OrderStatusBadge status={getOrderStatus(order)} />
                        )}

                        {payableAmount !== undefined && (
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] text-muted sm:text-xs">
                              Payable Amount
                            </p>
                            <span className="text-sm font-bold text-ink sm:text-base">
                              {formatMoney(
                                payableAmount,
                                getOrderCurrency(order),
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ApiState>
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
