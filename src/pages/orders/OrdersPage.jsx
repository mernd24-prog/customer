import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdContentCopy } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import {
  ChevronRight,
  ChevronDown,
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
import OrderDetailInfoGrid from "./components/OrderDetailInfoGrid";
import OrderDetailLayout, {
  OrderDetailAside,
} from "./components/OrderDetailLayout";
import OrderDetailSectionCard from "./components/OrderDetailSectionCard";
import OrderItemsSection from "./components/OrderItemsSection";
import OrderPaymentSummary from "./components/OrderPaymentSummary";
import OrderProgress from "./components/OrderProgress";
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
  items,
  ORDER_BREADCRUMBS,
  ORDER_FILTERS,
} from "../../data/orderPage";
import { CANCEL_REASON_OPTIONS } from "../../data/constant";

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
  const returns = Array.isArray(order?.relations?.returns)
    ? order.relations.returns
    : Array.isArray(order?.returns)
      ? order.returns
      : Array.isArray(order?.returnRequests)
        ? order.returnRequests
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

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Order", href: "/orders" },
    { label: `#${getOrderId(order)}` },
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
                  {!track && (
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
                      <span className="text-center text-[14px] sm:text-[16px] font-semibold leading-[20px] sm:leading-[24px] text-nowrap text-[#3E4093]">
                        Invoice
                      </span>
                    </Button>
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
                    label: "Order amount",
                    value: formatMoney(customerAmount, currency),
                    tone: "yellow",
                  },
                ]}
              />

              {hasKnownStatus(order) && (
                <OrderDetailSectionCard
                  title="Order Progress"
                  bodyClassName="overflow-hidden px-4 sm:px-8"
                  titleClassName="font-bold leading-[100%]"
                >
                  <OrderProgress
                    status={status}
                    cancellations={cancellations}
                    returns={returns}
                  />
                </OrderDetailSectionCard>
              )}
            </section>

            {!track && (
              <OrderDetailLayout>
                <OrderItemsSection
                  items={items}
                  currency={currency}
                  getItemImage={getItemImage}
                  getProductTitle={getProductTitle}
                  getItemProductPath={getItemProductPath}
                  getOrderItemColor={getOrderItemColor}
                  getItemLineTotal={getItemLineTotal}
                  formatMoney={formatMoney}
                />

                <OrderDetailAside>
                  {(subtotal !== undefined || items.length > 0) && (
                    <OrderPaymentSummary
                      subtotal={subtotal}
                      discount={discount}
                      walletDiscount={walletDiscount}
                      shipping={shipping}
                      customerAmount={customerAmount}
                      tax={tax}
                      taxBreakup={taxBreakup}
                      taxIncluded={taxIncluded}
                      taxPayable={taxPayable}
                      shippingAddress={shippingAddress}
                      currency={currency}
                      formatMoney={formatMoney}
                      asNumber={asNumber}
                      hasShippingAddress={hasShippingAddress}
                      getAddressValue={getAddressValue}
                    />
                  )}
                </OrderDetailAside>
              </OrderDetailLayout>
            )}

            {cancellations.length > 0 && (
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
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
      className={`mt-2 md:mt-0 inline-flex min-w-[74px] justify-center rounded-full px-3 py-2  text-sm  2xl:text-[18px] font-bold capitalize ${cls}`}
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
  const navigate = useNavigate();
  const id = getOrderId(order);
  const apiOrderId = getOrderId(order);
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
      <div className="flex  flex-col gap-3 border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-4 md:py-6  text-sm md:text-base 2xl:text-[20px]  font-semibold text-ink">
        <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between md:contents">
          <span className="flex min-w-0 items-center gap-1.5">
            <FaShoppingCart className="shrink-0 text-sm text-[#2564EB] lg:text-xl" />
            <span className="shrink-0">#</span>
            <span className="min-w-0 break-all">{apiOrderId}</span>
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
            <OrderListStatusBadge status={status} />
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between w-full md:contents">
          <span className="lg:inline-flex items-center gap-1.5  hidden">
            <MdDateRange className="text-[#2564EB] text-sm lg:text-xl" />
            {formatOrderDate(createdAt)}
          </span>
          <span className="lg:inline-flex items-center gap-1.5  hidden ">
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
              className="aspect-[3/2]  w-full object-contain p-3"
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
              className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-[10px] bg-gold px-8 lg:px-20  text-sm lg:text-[15px] font-bold text-white transition-colors"
            >
              <Truck size={18} />
              Track Order
            </Link>
            <Link
              to={`/orders/${id}`}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-2 text-sm lg:text-[15px]  font-bold text-gold-dark transition-colors hover:bg-gold-soft"
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
  const selectedFilter = ORDER_FILTERS.find(
    (filter) => filter.value === activeFilter,
  );
  const selectedFilterLabel =
    selectedFilter?.label === "All" ? "All Status" : selectedFilter?.label;

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
            className="mb-2 flex flex-wrap  items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
            heading="My Order"
          />
          <div className="grid   gap-8 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_413px]">
            <div className="min-w-0 rounded-xl md:border md:border-[#E7D9B8] bg-white  sm:p-4">
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

                <div
                  className="relative w-full lg:w-[220px]"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setIsFilterOpen(false);
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((open) => !open)}
                    className="flex h-10 w-full items-center justify-between rounded-[10px] border border-[#2564EB] bg-white px-3 text-left text-sm font-semibold text-[#2564EB] focus:outline-none"
                    aria-expanded={isFilterOpen}
                    aria-haspopup="menu"
                  >
                    <span>{selectedFilterLabel || "All Status"}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isFilterOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+6px)] z-30 w-full min-w-[220px] overflow-hidden rounded-[15px] border border-[#E7D9B8] bg-white shadow-[0_12px_32px_rgba(31,36,48,0.14)]"
                    >
                      <div className="py-1">
                        {ORDER_FILTERS.map((filter) => {
                          const label =
                            filter.label === "All"
                              ? "All Status"
                              : filter.label;

                          return (
                            <button
                              key={filter.value}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setActiveFilter(filter.value);
                                setIsFilterOpen(false);
                              }}
                              className={`block w-full px-4 py-2 text-left text-[13px] font-semibold transition-colors hover:bg-[#F8F1E2] ${
                                activeFilter === filter.value
                                  ? "bg-[#F8F1E2] text-[#1B1D60]"
                                  : "text-[#2E2E2E]"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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
