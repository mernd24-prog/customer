import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Package, RotateCcw, XCircle } from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import StatusTimeline from "../../components/common/StatusTimeline";
import { useToastThunk } from "../../hooks/useToastThunk";
import { fetchMyOrders, fetchOrderById, cancelOrder } from "../../features/order/orderSlice";
import { formatMoney } from "../../utils/ecommerce";

const STATUS_BADGE = {
  pending_payment: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const getOrderId = (order) => order?.id || order?._id || order?.orderId || order?.order_id;
const getOrderStatus = (order) => order?.status || order?.orderStatus || "unknown";
const hasKnownStatus = (order) => getOrderStatus(order) !== "unknown";
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
const getItemProduct = (item) => (item?.productId && typeof item.productId === "object" ? item.productId : item?.product);
const getItemProductId = (item) => {
  const product = getItemProduct(item);
  return item?.product_id || item?.productId?._id || item?.productId || product?.id || product?._id || "N/A";
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
const getAddressValue = (address, camelKey, snakeKey = camelKey) => address?.[camelKey] || address?.[snakeKey];
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
  item?.variant_title ||
  item?.variantTitle ||
  item?.variant?.title ||
  "";
const getItemSku = (item) => item?.variant_sku || item?.variantSku || item?.sku || getItemProduct(item)?.sku || "";
const getItemAttributes = (item) => {
  const attributes = item?.attributes && typeof item.attributes === "object" ? item.attributes : {};
  return Object.entries(attributes).filter(([, value]) => value !== null && value !== undefined && value !== "");
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
      items: getOrderItems(wrapper.order).length ? getOrderItems(wrapper.order) : getOrderItems(wrapper),
      amounts: wrapper.order.amounts || wrapper.amounts,
      shipping_address: wrapper.order.shipping_address || wrapper.shipping_address,
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
const getItemsTotal = (order) => getOrderItems(order).reduce((total, item) => total + asNumber(getItemLineTotal(item)), 0);
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

  const aliases = {
    subtotal: ["subtotalAmount", "subTotal", "subtotal"],
    discount: ["discountAmount", "discount"],
    tax: ["taxAmount", "totalTaxAmount", "tax"],
    total: ["totalAmount", "orderTotal", "grandTotal", "total"],
    walletDiscount: ["walletDiscountAmount", "walletDiscount"],
    payable: ["payableAmount", "payable", "amountPayable", "totalAmount"],
    platformFee: ["platformFeeAmount", "platformFee"],
    shipping: ["shippingFeeAmount", "shippingFee", "shippingAmount", "shipping"],
  }[key] || [];

  for (const field of [key, snakeKey, ...aliases]) {
    if (field && order?.amounts?.[field] !== undefined) return order.amounts[field];
    if (field && order?.[field] !== undefined) return order[field];
  }

  if (["subtotal", "total", "payable"].includes(key) && getOrderItems(order).length) {
    return getItemsTotal(order);
  }

  return undefined;
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
const getOrderListSummary = (order) => {
  const items = getOrderItems(order);
  const city = order?.shipping_address?.city || order?.shippingAddress?.city;
  const stateName = order?.shipping_address?.state || order?.shippingAddress?.state;
  const itemText = items.length
    ? `${getProductTitle(items[0])}${items.length > 1 ? ` +${items.length - 1} more` : ""}`
    : "";
  const locationText = city ? `${city}${stateName ? `, ${stateName}` : ""}` : "";

  return [itemText, locationText].filter(Boolean).join(" · ");
};
const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function OrderStatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || "bg-[#FAF6EE] text-[#787878]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {(status || "unknown").replace(/_/g, " ")}
    </span>
  );
}

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const state = useSelector((s) => s.order);
  const orders = getOrderCollection(state.current).length ? getOrderCollection(state.current) : state.list;
  const order = getMatchingOrder({
    current: state.current,
    entities: state.entities,
    orders,
    orderId,
  });
  const currency = getOrderCurrency(order);
  const items = getOrderItems(order);
  const shippingAddress = order?.shipping_address || order?.shippingAddress || {};
  const taxBreakup = order?.tax_breakup || order?.taxBreakup;
  const subtotal = getAmount(order, "subtotal");
  const discount = getAmount(order, "discount");
  const tax = getAmount(order, "tax");
  const total = getAmount(order, "total");
  const walletDiscount = getAmount(order, "walletDiscount");
  const payable = getAmount(order, "payable");
  const platformFee = getAmount(order, "platformFee");

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

  return (
    <>
      <Seo title={`Order ${orderId} | Sam Global`} />
      <div className="w-container py-6 sm:py-10">
        <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#787878] hover:text-[#2E2E2E] transition-all duration-300 ease-in-out">
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
          onRetry={() => dispatch(fetchOrderById({ orderId }))}
        >
          <div className="overflow-hidden rounded-[12px] border border-[#e7dfd1] bg-white">
            {/* Header */}
            <div className="border-b border-[#e7dfd1] px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-[#787878]">Order ID</p>
                  <p className="break-all font-mono text-sm font-medium text-[#2E2E2E]">{getOrderId(order) || orderId}</p>
                  <p className="mt-1 text-xs text-[#787878]">{formatOrderDate(order?.created_at || order?.createdAt)}</p>
                </div>
                {hasKnownStatus(order) && <OrderStatusBadge status={getOrderStatus(order)} />}
              </div>
            </div>

            {/* Timeline */}
            {track && hasKnownStatus(order) && (
              <div className="border-b border-[#e7dfd1] px-4 py-5 sm:px-6">
                <h2 className="mb-4 text-sm font-semibold text-[#2E2E2E]">Order tracking</h2>
                <StatusTimeline status={getOrderStatus(order)} />
              </div>
            )}

            {/* Items */}
            {items.length > 0 && (
              <div className="border-b border-[#e7dfd1] px-4 py-5 sm:px-6">
                <h2 className="mb-3 text-sm font-semibold text-[#2E2E2E]">Items</h2>
                <div className="grid gap-3">
                  {items.map((item, i) => {
                    const unitPrice = getItemUnitPrice(item);
                    const lineTotal = getItemLineTotal(item);

                    return (
                      <div key={item.id || item._id || item.product_id || getItemProductId(item) || i} className="rounded-[8px] border border-[#e7dfd1] bg-[#FAF6EE] px-3 py-3 sm:px-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="flex min-w-0 gap-3">
                            {getItemImage(item) && (
                              <img
                                src={getItemImage(item)}
                                alt={getProductTitle(item)}
                                className="h-16 w-16 shrink-0 rounded-[8px] bg-white object-cover sm:h-20 sm:w-20"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0 text-sm">
                              <p className="font-medium text-[#2E2E2E]">{getProductTitle(item)}</p>
                              {getVariantTitle(item) && (
                                <p className="mt-0.5 text-xs font-medium text-[#787878]">{getVariantTitle(item)}</p>
                              )}
                              <p className="mt-1 break-all text-xs text-[#787878]">Product ID: {getItemProductId(item)}</p>
                              {getItemSku(item) && (
                                <p className="mt-0.5 break-all text-xs text-[#787878]">SKU: {getItemSku(item)}</p>
                              )}
                              <p className="mt-1 text-xs text-[#787878]">
                                Qty: {item.quantity} x {formatMoney(unitPrice, currency)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-[#2E2E2E] sm:shrink-0">
                            {formatMoney(lineTotal, currency)}
                          </p>
                        </div>
                        {getItemAttributes(item).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {getItemAttributes(item).map(([key, value]) => (
                              <span key={key} className="rounded-full bg-white px-2.5 py-1 text-xs capitalize text-[#787878]">
                                {key.replace(/[_-]/g, " ")}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping */}
            {hasShippingAddress(shippingAddress) && (
              <div className="border-b border-[#e7dfd1] px-4 py-5 sm:px-6">
                <h2 className="mb-3 text-sm font-semibold text-[#2E2E2E]">Shipping address</h2>
                <div className="break-words text-sm leading-6 text-[#787878]">
                  {getAddressValue(shippingAddress, "fullName", "full_name") && <p className="font-medium text-[#2E2E2E]">{getAddressValue(shippingAddress, "fullName", "full_name")}</p>}
                  {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                  {[shippingAddress.line1, shippingAddress.line2].filter(Boolean).length > 0 && (
                    <p>
                      {[shippingAddress.line1, shippingAddress.line2].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {[shippingAddress.city, shippingAddress.state, getAddressValue(shippingAddress, "postalCode", "postal_code")].filter(Boolean).length > 0 && (
                    <p>
                      {[shippingAddress.city, shippingAddress.state, getAddressValue(shippingAddress, "postalCode", "postal_code")]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </div>
              </div>
            )}

            {/* Amounts */}
            {(subtotal !== undefined || payable !== undefined || total !== undefined) && (
              <div className="border-b border-[#e7dfd1] px-4 py-5 sm:px-6">
                <h2 className="mb-3 text-sm font-semibold text-[#2E2E2E]">Payment</h2>
                <div className="grid gap-2 text-sm">
                  {subtotal !== undefined && (
                    <div className="flex items-start justify-between gap-4 text-[#787878]">
                      <span>Subtotal</span>
                      <span className="text-right">{formatMoney(subtotal, currency)}</span>
                    </div>
                  )}
                  {asNumber(discount) > 0 && (
                    <div className="flex items-start justify-between gap-4 text-emerald-700">
                      <span>Discount</span>
                      <span className="text-right">-{formatMoney(discount, currency)}</span>
                    </div>
                  )}
                  {asNumber(walletDiscount) > 0 && (
                    <div className="flex items-start justify-between gap-4 text-emerald-700">
                      <span>Wallet discount</span>
                      <span className="text-right">-{formatMoney(walletDiscount, currency)}</span>
                    </div>
                  )}
                  {tax !== undefined && (
                    <div className="flex items-start justify-between gap-4 text-[#787878]">
                      <span>Tax</span>
                      <span className="text-right">{formatMoney(tax, currency)}</span>
                    </div>
                  )}
                  {asNumber(platformFee) > 0 && (
                    <div className="flex items-start justify-between gap-4 text-[#787878]">
                      <span>Platform fee</span>
                      <span className="text-right">{formatMoney(platformFee, currency)}</span>
                    </div>
                  )}
                  {total !== undefined && (
                    <div className="flex items-start justify-between gap-4 text-[#787878]">
                      <span>Total</span>
                      <span className="text-right">{formatMoney(total, currency)}</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 border-t border-[#e7dfd1] pt-2 font-semibold text-[#2E2E2E]">
                    <span>Payable</span>
                    <span className="text-right">{formatMoney(payable ?? total, currency)}</span>
                  </div>
                </div>
                {taxBreakup && (
                  <div className="mt-4 rounded-[8px] bg-[#FAF6EE] p-3 text-xs text-[#787878]">
                    <p>Tax mode: {(taxBreakup.taxMode || taxBreakup.tax_mode || "N/A").toString().toUpperCase()}</p>
                    <p>Total tax: {formatMoney(taxBreakup.totalTaxAmount || taxBreakup.total_tax_amount || tax, currency)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {hasKnownStatus(order) && (
              <div className="grid gap-3 px-4 py-4 sm:flex sm:flex-wrap sm:px-6">
                {!["delivered", "fulfilled", "cancelled"].includes(getOrderStatus(order)) && (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      run(dispatch, cancelOrder({ orderId, reason: "Requested by customer" }), "Order cancelled")
                    }
                  >
                    <XCircle size={15} /> Cancel order
                  </Button>
                )}
                {["delivered", "fulfilled"].includes(getOrderStatus(order)) && (
                  <Link to={`/returns/request/${orderId}`} className="block sm:inline-flex">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <RotateCcw size={15} /> Request return
                    </Button>
                  </Link>
                )}
                <Link to={`/orders/${orderId}/track`} className="block sm:inline-flex">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    <Package size={15} /> Track order
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </ApiState>
      </div>
    </>
  );
}

// ─── Order List ────────────────────────────────────────────────────────────────

function OrderList() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.order);
  const orders = state.list.length ? state.list : getOrderCollection(state.current);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Orders | Sam Global" />
      <div className="w-container py-6 sm:py-10">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <h1 className="font-montserrat text-2xl font-bold text-[#2E2E2E] sm:text-3xl">My Orders</h1>
        </div>

        <ApiState
          loading={state.loading && !orders.length}
          error={state.error}
          empty={!orders.length}
          emptyTitle="No orders yet"
          emptyText="Once you place an order, it will appear here."
          onRetry={() => dispatch(fetchMyOrders())}
        >
          <div className="grid gap-3">
            {orders.map((order) => {
              const id = getOrderId(order);
              const summary = getOrderListSummary(order);
              const createdAt = order.created_at || order.createdAt;
              const payableAmount = getAmount(order, "payable") ?? getAmount(order, "total");
              return (
                <Link
                  key={id}
                  to={`/orders/${id}`}
                  className="flex flex-col gap-4 rounded-[12px] border border-[#e7dfd1] bg-white px-4 py-4 hover:border-[#CE9F2D] transition-all duration-300 ease-in-out sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="flex min-w-0 items-start gap-2 text-sm sm:items-center">
                      <Package size={14} className="shrink-0 text-[#A6A6A6]" />
                      <span className="shrink-0 font-mono font-semibold text-[#2E2E2E]">#{formatOrderId(id)}</span>
                      <span className="min-w-0 break-all font-mono text-xs text-[#A6A6A6] sm:truncate">{id}</span>
                    </p>
                    <p className="mt-1 text-xs text-[#787878]">
                      {formatOrderDate(createdAt)}
                    </p>
                    {summary && <p className="mt-1 line-clamp-1 text-xs text-[#787878]">{summary}</p>}
                  </div>
                  <div className="flex flex-row items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
                    {hasKnownStatus(order) && <OrderStatusBadge status={getOrderStatus(order)} />}
                    {payableAmount !== undefined && (
                      <span className="text-right text-sm font-semibold text-[#2E2E2E]">
                        {formatMoney(payableAmount, getOrderCurrency(order))}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </ApiState>
      </div>
    </>
  );
}

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  if (detail || track) return <OrderDetail orderId={orderId} track={track} />;
  return <OrderList />;
}
