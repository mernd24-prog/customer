import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdContentCopy } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
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
import vectorImage from "/image/png/SuccessVector .png";
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
import {
  COMPACT_STATUS_BADGE,
  INFO_TILE_TONES,
  items,
  ORDER_BREADCRUMBS,
  ORDER_FILTERS,
  ORDER_STEPS,
  RETURN_STEPS,
  TRACKING_LABELS,
} from "../../data/orderPage";

const normalizeProgressStatus = (status) => {
  if (status === "out_for_delivery" || status === "partially_delivered") {
    return "delivered";
  }
  if (status === "order_closed") {
    return "fulfilled";
  }
  return status;
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

function InfoTile({ icon, label, value, tone = "yellow" }) {
  return (
    <div className="relative min-h-[127px] rounded-[15px] border border-[#CE9F2D66] bg-[#FFFDF8] px-[20px] py-[25px]">
      <div
        className={`absolute  right-0 top-0 flex h-[60px] w-[60px] items-center justify-center rounded-tr-[15px] rounded-bl-[15px] p-[12px] ${INFO_TILE_TONES[tone] || INFO_TILE_TONES.yellow}`}
      >
        {icon}
      </div>
      {/* <div className="pr-8"> */}
      <p className="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]">
        {label}
      </p>
      <p className="mt-3 break-words font-bold text-[#1B1D60] capitalize leading-[100%] text-[18px] sm:text-[22px] lg:text-[26px]">
        {value || "N/A"}
      </p>
      {/* </div> */}
    </div>
  );
}

function StepBar({ steps, activeStatus, colorClass = "border-gold bg-gold" }) {
  const activeIndex = Math.max(
    0,
    steps.indexOf(normalizeProgressStatus(activeStatus)),
  );
  const progressWidth =
    steps.length <= 1 ? 0 : (activeIndex / (steps.length - 1)) * 100;
  return (
    <div
      className="relative grid min-w-[720px] gap-2 px-1 py-3 lg:min-w-0"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      <span
        className="absolute top-[3rem] h-0.5 overflow-hidden bg-border"
        style={{
          left: `calc(100% / ${steps.length} / 2)`,
          right: `calc(100% / ${steps.length} / 2)`,
        }}
      >
        <span
          className={`block h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${progressWidth}%` }}
        />
      </span>
      {steps.map((step, index) => {
        const done = activeIndex >= index;
        const current = activeIndex === index;
        return (
          <div
            key={step}
            className="relative min-w-0 flex flex-col items-center"
          >
            {/* STEP NODE */}
            <div className="relative flex items-center justify-center">
              {/* OUTER CIRCLE */}
              <div
                className={`h-[70px] w-[70px] rounded-full ${done ? "bg-[#B88200]" : "bg-[#83858C]"} flex items-center justify-center`}
              >
                {/* INNER CIRCLE */}
                <div
                  className={`h-[50px] w-[50px] rounded-full flex items-center justify-center ${
                    done ? "bg-[#CE9F2D]" : "bg-[#8A8C92]"
                  }`}
                >
                  <img src={vectorImage} alt="done" className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* LABEL */}
            <p
              className={`mt-3 flex h-[26px] w-[92px] items-center justify-center font-sans text-[20px] font-semibold leading-[26px] text-center ${
                current || done ? "text-[#CE9F2D]" : "text-muted"
              }`}
            >
              {step === "pending_payment" ? "Payment" : TRACKING_LABELS[step]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderProgress({ status, order }) {
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
    <div className="space-y-4">
      <StepBar
        steps={ORDER_STEPS}
        activeStatus={inReturnFlow ? "fulfilled" : status}
        colorClass="border-gold bg-gold"
      />
      {inReturnFlow && (
        <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Return &amp; refund progress
          </p>
          <StepBar
            steps={RETURN_STEPS}
            activeStatus={status}
            colorClass="border-amber-500 bg-amber-500"
          />
        </div>
      )}
      {(isCancelled || isFailed) && (
        <div className="rounded-[8px]  border border-border bg-white px-4 py-3 text-sm">
          <p className="font-semibold capitalize text-ink">
            {currentStep?.label || "Status update"}
          </p>
          <p className="mt-1 text-xs text-muted">{currentStep?.note}</p>
        </div>
      )}
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
  const customerAmount = getCustomerOrderAmount(order);
  const taxIncluded = getTaxIncludedAmount(order, taxBreakup);
  const taxPayable = getTaxPayableAmount(order, taxBreakup);
  const status = getOrderStatus(order);
  const invoiceDownloadAvailable = ["delivered", "fulfilled"].includes(status);
  const paymentStatus = getPaymentStatus(order);
  const deliveryStatus = getDeliveryStatus(order);
  const paymentMethod = getPaymentMethod(order);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Order", href: "/orders" },
    { label: `#${formatOrderId(getOrderNumber(order))}` },
  ];

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId || !invoiceDownloadAvailable) {
      setInvoices(null);
      return;
    }
    setInvoicesLoading(true);
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  }, [dispatch, invoiceDownloadAvailable, orderId]);

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
      <div className="mx-auto w-full max-w-[1740px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
        >
          <div className="grid gap-5 sm:gap-6 lg:gap-9">
            <section className="grid gap-4 sm:gap-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 mb-7">
                  <Breadcrumbs
                    items={breadcrumbItems}
                    className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
                    linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
                    currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
                    separatorClassName="text-[#2E2E2E]"
                  />
                  <h1 className="break-words font-bold text-[#3E4093] leading-[100%] tracking-[0px] text-[28px] sm:text-[32px] lg:text-[38px]">
                    #{formatOrderId(getOrderNumber(order))}
                  </h1>
                </div>

                <div className="flex w-full  flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto md:justify-end">
                  {!track && (
                    <Link
                      to={`/returns/request/${orderId}`}
                      className="block w-full sm:w-auto"
                    >
                      <Button className="flex h-[54px] w-full sm:w-[196px] items-center justify-center gap-[10px] rounded-[10px] bg-[#CE9F2D] px-[24px] py-[15px] text-white hover:bg-[#B88200]">
                        <RotateCcw size={18} />
                        <span className="text-center text-[14px] sm:text-[16px] font-semibold leading-[20px] sm:leading-[24px] text-white">
                          Request Return
                        </span>
                      </Button>
                    </Link>
                  )}
                  {(invoices?.orderInvoice || getInvoiceUrl(order)) && (
                    <Button
                      variant="secondary"
                      loading={
                        invoices?.orderInvoice &&
                        downloadingId ===
                          endpoints.tax.invoiceDownload(
                            invoices.orderInvoice.id ||
                              invoices.orderInvoice._id,
                          )
                      }
                      onClick={() =>
                        invoices?.orderInvoice
                          ? handleDownload(
                              endpoints.tax.invoiceDownload(
                                invoices.orderInvoice.id ||
                                  invoices.orderInvoice._id,
                              ),
                              `invoice-${getOrderNumber(order)}.pdf`,
                            )
                          : window.open(
                              getInvoiceUrl(order),
                              "_blank",
                              "noopener,noreferrer",
                            )
                      }
                      className="flex h-[54px] w-full sm:w-[196px] items-center justify-center gap-[10px] rounded-[10px] border border-[#3E409380] bg-white px-[24px] py-[15px] text-[#3E4093] hover:border-[#3E4093] hover:bg-white"
                    >
                      <Download size={18} />
                      <span className="text-center text-[14px] sm:text-[16px] font-semibold leading-[20px] sm:leading-[24px] text-[#3E4093]">
                        Download Invoice
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4 2xl:gap-[36px]">
                <InfoTile
                  icon={<CalendarDays size={14} />}
                  label="Placed on"
                  value={formatOrderDate(order?.created_at || order?.createdAt)}
                  tone="blue"
                />
                <InfoTile
                  icon={<CreditCard size={14} />}
                  label="Payment"
                  value={`${humanize(paymentMethod)} · ${humanize(paymentStatus)}`}
                  tone="green"
                />
                <InfoTile
                  icon={<Truck size={14} />}
                  label="Delivery"
                  value={humanize(deliveryStatus || status)}
                  tone="purple"
                />
                <InfoTile
                  icon={<ReceiptText size={14} />}
                  label="Order amount"
                  value={formatMoney(customerAmount, currency)}
                  tone="yellow"
                />
              </div>

              {hasKnownStatus(order) && (
                <div className="overflow-hidden rounded-[15px] border border-[#CE9F2D80] bg-white">
                  <div className="flex justify-between px-[20px] py-[25px] rounded-t-[15px] bg-[#CE9F2D33]">
                    <h2 className="font-bold text-[24px] leading-[100%] text-[#2E2E2E]">
                      Order Progress
                    </h2>
                  </div>
                  <div className="overflow-x-auto px-4 py-5 sm:px-8">
                    <OrderProgress status={status} />
                  </div>
                </div>
              )}
            </section>

            {!track && (
              //  <section className="grid gap-5 lg:grid-cols-[1161px_565px]">
              <section className="grid xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-7">
                <div className="w-full rounded-[15px] border border-[#CE9F2D66] bg-white">
                  {/* HEADER */}
                  <div className="flex h-[81px] items-center justify-between rounded-t-[15px] bg-[#CE9F2D33] px-[20px] py-[25px]">
                    <h2 className="font-sans text-[24px] font-bold leading-none text-[#2E2E2E]">
                      Item
                    </h2>
                  </div>

                  {/* BODY */}
                  <div className="grid gap-4 p-4 sm:p-5 lg:p-6">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="flex w-full flex-col gap-4 sm:flex-row sm:gap-5 lg:gap-[36px]"
                      >
                        {/* PRODUCT IMAGE */}
                        <div className="flex aspect-[252/210] w-full shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#CE9F2D33] bg-white sm:w-[180px] lg:w-[220px] 2xl:w-[252px]">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={getProductTitle(item)}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Package size={28} />
                          )}
                        </div>

                        {/* DETAILS */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          {/* TITLE */}
                          <p className="line-clamp-2 break-words font-semibold text-[18px] leading-[26px] text-[#2E2E2E] sm:text-[22px] sm:leading-[32px] md:text-[26px] md:leading-[38px]">
                            {getProductTitle(item)}
                          </p>

                          {/* COLOR + QTY */}
                          <div className="my-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink sm:my-6">
                            <span className="text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
                              Color:{" "}
                              <span className="text-[#1B1D60] font-semibold">
                                {/* {getVariantTitle(item)} */}
                                Hello
                              </span>
                            </span>

                            <span className="text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
                              Quantity:{" "}
                              <span className="text-[#1B1D60] font-semibold">
                                {String(item.quantity || 1).padStart(2, "0")}
                              </span>
                            </span>
                          </div>

                          {/* PRICE (Figma: BELOW details) */}
                          <div className="mt-2 gap-[5px] sm:mt-4">
                            <p className="text-[20px] sm:text-[26px] md:text-[34px] font-extrabold leading-[28px] sm:leading-[38px] md:leading-[46px] text-[#1B1D60]">
                              {formatMoney(getItemLineTotal(item), currency)}
                            </p>
                            <p className="text-[14px] sm:text-[16px] md:text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
                              Inclusive of all taxes
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="grid gap-4 self-start">
                  {(subtotal !== undefined || items.length > 0) && (
                    <div className="h-full w-full overflow-hidden rounded-[15px] border border-[#CE9F2D66] bg-white gap">
                      <div className="flex h-[81px] items-center justify-between rounded-t-[15px] bg-[#CE9F2D33] px-[20px] py-[25px]">
                        <h2 className="font-sans text-[24px] font-bold leading-none text-[#2E2E2E]">
                          Payment Summary
                        </h2>
                      </div>
                      <div className="grid gap-3 px-4 py-4 text-sm">
                        {subtotal !== undefined && (
                          <div className="flex w-full max-w-[515px] h-[58px] items-center justify-between border-b border-[#04258626]">
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                              Subtotal
                            </span>
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-bold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#1B1D60]">
                              {formatMoney(subtotal, currency)}
                            </span>
                          </div>
                        )}
                        {asNumber(discount) > 0 && (
                          <div className="flex w-full max-w-[515px] h-[58px] items-center justify-between border-b border-[#04258626]">
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                              Discount
                            </span>
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-bold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#1B1D60]">
                              {formatMoney(discount, currency)}
                            </span>
                          </div>
                        )}
                        {asNumber(walletDiscount) > 0 && (
                          <div className="flex w-full max-w-[515px] h-[58px] items-center justify-between border-b border-[#04258626]">
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                              Wallet discount
                            </span>
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-bold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#1B1D60]">
                              {formatMoney(walletDiscount, currency)}
                            </span>
                          </div>
                        )}
                        {asNumber(shipping) > 0 && (
                          <div className="flex w-full max-w-[515px] h-[58px] items-center justify-between border-b border-[#04258626]">
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                              Shipping
                            </span>
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-bold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#1B1D60]">
                              {formatMoney(shipping, currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex w-full max-w-[515px] h-[58px] items-center justify-between border-b border-[#04258626]">
                          <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                            Order amount
                          </span>
                          <span className="text-[14px] sm:text-[16px] md:text-[18px] font-bold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#1B1D60]">
                            {formatMoney(customerAmount, currency)}
                          </span>
                        </div>
                        {(taxBreakup || tax !== undefined) && (
                          <div className="flex w-full max-w-[515px] flex-col items-start border-b border-[#04258626] py-3">
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                              GST invoice breakup
                            </span>
                            <div className="mt-2 grid gap-1 text-[14px] font-medium leading-[20px] text-[#1B1D60] sm:text-[16px] sm:leading-[26px] md:text-[18px] md:leading-[30px]">
                              {taxBreakup && (
                                <p>
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
                                  <p>
                                    GST breakup: {formatMoney(tax, currency)}
                                  </p>
                                )}
                            </div>
                          </div>
                        )}
                        {hasShippingAddress(shippingAddress) && (
                          <div className="flex w-full max-w-[515px] flex-col items-start py-3">
                            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#2E2E2E]">
                              Shipping Address
                            </span>
                            <div className="mt-2 w-full break-words text-[14px] font-medium  leading-[20px] text-[#1B1D60] sm:text-[16px] sm:leading-[26px] md:text-[18px] md:leading-[30px]">
                              {getAddressValue(
                                shippingAddress,
                                "fullName",
                                "full_name",
                              ) && (
                                <p className="font-semibold">
                                  {getAddressValue(
                                    shippingAddress,
                                    "fullName",
                                    "full_name",
                                  )}
                                </p>
                              )}
                              {[
                                shippingAddress.line1,
                                shippingAddress.line2,
                              ].filter(Boolean).length > 0 && (
                                <p>
                                  {[
                                    shippingAddress.line1,
                                    shippingAddress.line2,
                                  ]
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
                                shippingAddress.country,
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
                                    shippingAddress.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </aside>
              </section>
            )}

            {(invoices?.sellerInvoices?.length > 0 ||
              invoices?.orderInvoice) && (
              <section className="overflow-hidden rounded-[15px] border border-[#CE9F2D66] bg-white">
                <div className="flex min-h-[72px] items-center justify-between rounded-t-[15px] bg-[#CE9F2D33] px-[20px] py-[20px]">
                  <h2 className="flex items-center gap-2 font-sans text-[20px] font-bold leading-none text-[#2E2E2E] sm:text-[22px] lg:text-[24px]">
                    <FileText size={18} className="text-[#1B1D60]" /> Invoices
                    &amp; documents
                  </h2>
                </div>
                <div className="grid gap-3 p-4 sm:p-5">
                  {invoices.orderInvoice && (
                    <div className="flex flex-col gap-3 rounded-[10px] border border-[#CE9F2D33] bg-[#FFFDF8] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#CE9F2D1A] text-[#1B1D60]">
                          <FileText size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-sans text-[16px] font-semibold leading-[24px] text-[#2E2E2E]">
                            Order invoice
                          </p>
                          <p className="break-all text-[13px] font-medium leading-[20px] text-[#1B1D60]">
                            #{formatOrderId(getOrderNumber(order))}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
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
                        className="flex flex-col gap-3 rounded-[10px] border border-[#CE9F2D33] bg-[#FFFDF8] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#CE9F2D1A] text-[#1B1D60]">
                            <FileText size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-sans text-[16px] font-semibold leading-[24px] text-[#2E2E2E]">
                              {sellerName}
                            </p>
                            <p className="text-[13px] font-medium leading-[20px] text-[#1B1D60]">
                              Seller invoice
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
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

            {hasKnownStatus(order) && (
              <section className="rounded-[15px] border border-[#CE9F2D66] bg-white px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {(status === "pending_payment" ||
                    status === "payment_failed") && (
                    <Button
                      className="min-h-[38px] w-full sm:w-auto"
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
                      <XCircle size={15} /> Cancel order
                    </Button>
                  )}
                  {!track && (
                    <Link
                      to={`/orders/${orderId}/track`}
                      className="block sm:inline-flex"
                    >
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      >
                        <Truck size={15} /> Track order
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
    navigator.clipboard
      .writeText(formattedId)
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
          className="flex h-56 md:h-auto items-center justify-center overflow-hidden rounded-md border border-[#EFE5D2]  bg-white"
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
      const formattedId = String(
        formatOrderId(orderNumber || id),
      ).toLowerCase();
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
        <div>
          <Breadcrumbs
            items={ORDER_BREADCRUMBS}
            className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
            heading="My Order"
          />
          <div className="grid  mt-4  gap-8 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_413px]">
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
