import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Package, RotateCcw } from "lucide-react";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import { fetchReturnByOrder, requestReturn } from "../../features/returns/returnsSlice";
import { fetchOrderById } from "../../features/order/orderSlice";
import { returnSchema } from "../../validations/validationSchemas";

const RETURN_REASONS = [
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

const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.lineItems ||
    order?.line_items;
  return Array.isArray(items) ? items : [];
};
const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const getItemProduct = (item) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product;
const getItemProductId = (item) =>
  item?.product_id ||
  (typeof item?.productId === "object"
    ? item.productId?._id
    : item?.productId) ||
  "";
const getItemTitle = (item) =>
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  (typeof item?.productId === "object"
    ? item.productId?.title || item.productId?.name
    : null) ||
  "Product";
const getItemQuantity = (item) => Math.max(1, asNumber(item?.quantity || 1));
const getItemLineTotal = (item) =>
  item?.line_total ??
  item?.lineTotal ??
  item?.total_price ??
  item?.totalPrice ??
  item?.amount ??
  item?.total ??
  null;
const getItemUnitPrice = (item) => {
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
const getDisplayItemPrice = (item) => {
  const lineTotal = getItemLineTotal(item);
  if (lineTotal !== undefined && lineTotal !== null && lineTotal !== "") {
    return asNumber(lineTotal);
  }

  return getItemUnitPrice(item) * getItemQuantity(item);
};
const getSnapshot = (value) => {
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
const getItemDiscountAmount = (item) =>
  asNumber(
    item?.discount_amount ??
      item?.discountAmount ??
      getSnapshot(item?.pricing_snapshot || item?.pricingSnapshot)?.discountAmount ??
      0,
  );
const getOrderSummary = (order = {}) => {
  const metadata = getSnapshot(order?.metadata);
  return order?.summary || metadata.pricingSummary || metadata.summary || {};
};
const getOrderMoney = (order = {}, keys = []) => {
  const summary = getOrderSummary(order);
  const metadata = getSnapshot(order?.metadata);
  for (const key of keys) {
    const value = order?.[key] ?? summary?.[key] ?? metadata?.[key];
    if (value !== undefined && value !== null && value !== "") return asNumber(value);
  }
  return 0;
};
const shouldRefundComponent = (policy = {}, fullReturn = false) => {
  if (!policy || typeof policy !== "object") return false;
  if (!fullReturn && policy.partialReturn) return true;
  return Boolean(policy.customerReturn);
};
const getRefundPolicy = (order = {}) => {
  const metadata = getSnapshot(order?.metadata);
  return metadata?.commerceSettings?.returns?.refundPolicy || order?.commerceSettings?.returns?.refundPolicy || {};
};
const calculateEstimatedRefundBreakup = (order = {}, item = null, quantity = 1) => {
  if (!item) {
    return { total: 0, rows: [], note: "" };
  }
  const qty = Math.max(1, asNumber(quantity) || 1);
  const itemQty = getItemQuantity(item);
  const ratio = Math.min(qty / itemQty, 1);
  const orderItems = getOrderItems(order);
  const itemGross = asNumber(getItemLineTotal(item) ?? getItemUnitPrice(item) * itemQty) * ratio;
  const itemDiscount = getItemDiscountAmount(item) * ratio;
  const productPaid = Math.max(0, itemGross - itemDiscount);
  const orderSubtotal = getOrderMoney(order, ["subtotal_amount", "subtotalAmount"]) ||
    orderItems.reduce((sum, orderItem) => sum + asNumber(getItemLineTotal(orderItem)), 0);
  const proportion = orderSubtotal > 0 ? Math.min(itemGross / orderSubtotal, 1) : 0;
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
  const platformFeeRefundable = shouldRefundComponent(policy.platformFee, fullReturn);
  const shippingRefund = shippingRefundable ? shippingTotal * proportion : 0;
  const platformFeeRefund = platformFeeRefundable ? platformFeeTotal * proportion : 0;
  const platformFeeTaxRefund = platformFeeRefundable ? platformFeeTaxTotal * proportion : 0;
  const total = Math.max(0, productPaid + shippingRefund + platformFeeRefund + platformFeeTaxRefund);

  return {
    total,
    rows: [
      { label: "Product amount paid", value: productPaid, tone: "credit" },
      itemDiscount > 0 ? { label: "Discount not refunded as cash", value: -itemDiscount, tone: "muted" } : null,
      shippingTotal > 0
        ? {
          label: shippingRefundable ? "Shipping refunded" : "Shipping not refundable",
          value: shippingRefundable ? shippingRefund : 0,
          tone: shippingRefundable ? "credit" : "muted",
        }
        : null,
      platformFeeTotal + platformFeeTaxTotal > 0
        ? {
          label: platformFeeRefundable ? "Platform fee refunded" : "Platform fee not refundable",
          value: platformFeeRefund + platformFeeTaxRefund,
          tone: platformFeeRefundable ? "credit" : "muted",
        }
        : null,
    ].filter(Boolean),
    note: "Seller commission is not deducted from the customer refund. Seller payout is adjusted separately.",
  };
};
const getItemImage = (item) => {
  const product = getItemProduct(item);
  const images =
    item?.images ||
    item?.image ||
    item?.imageUrl ||
    product?.images ||
    product?.image ||
    product?.imageUrl;
  return Array.isArray(images) ? images[0] : images || null;
};
const getItemVariantSku = (item) => item?.variant_sku || item?.variantSku || "";
const getItemId = (item) => item?.id || item?._id || item?.orderItemId || "";
const getItemReturnPolicy = (item = {}) => {
  const snapshot = item.product_snapshot || item.productSnapshot || {};
  const storedPolicy = item.return_policy_snapshot || item.returnPolicySnapshot || {};
  const policy = snapshot.returnPolicy || snapshot.return_policy || snapshot.commercialPolicy?.returnPolicy || storedPolicy;
  return {
    returnable: policy.returnable ?? policy.eligible ?? true,
    days: Number(policy.returnWindowDays || policy.windowDays || policy.days || 0),
    requiresImages: Boolean(policy.requiresImages || policy.requires_images),
    inspectionRequired: policy.inspectionRequired ?? policy.requiresQc ?? true,
    eligibleUntil: item.return_eligible_until || item.returnEligibleUntil || policy.eligibleUntil || null,
  };
};
const getReturnForItem = (returns = [], item = {}) => {
  const itemId = String(getItemId(item) || "");
  return returns.find((returnRequest) =>
    (returnRequest.items || []).some((returnItem) => String(returnItem.orderItemId || "") === itemId),
  );
};
const isDeliveredStatus = (status) =>
  ["delivered", "fulfilled", "completed"].includes(String(status || "").toLowerCase());
const isItemDelivered = (order = {}, item = {}) => {
  if (item.delivered_at || item.deliveredAt || isDeliveredStatus(item.delivery_status || item.deliveryStatus)) return true;
  const itemId = String(getItemId(item));
  const shipments = order?.relations?.shipments || [];
  const shipment = shipments.find((entry) => {
    const ids = entry.orderItemIds || entry.order_item_ids || [];
    return ids.map(String).includes(itemId);
  });
  if (shipment) return isDeliveredStatus(shipment.status);
  const groups = order?.relations?.sellerFulfillmentGroups || [];
  const group = groups.find((entry) => (entry.orderItemIds || entry.itemIds || []).map(String).includes(itemId));
  if (group) return isDeliveredStatus(group.deliveryStatus || group.shipmentStatus);
  return isDeliveredStatus(order?.status);
};

function ReturnRequestPage({ orderId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const run = useToastThunk();
  const { loading, list: returnList = [] } = useSelector((s) => s.returns);
  const { current: order, loading: orderLoading } = useSelector((s) => s.order);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId }));
      dispatch(fetchReturnByOrder({ orderId }));
    }
  }, [dispatch, orderId]);

  const orderItems = getOrderItems(order);
  const fetchedReturns = Array.isArray(returnList)
    ? returnList.filter((returnRequest) => String(returnRequest.orderId || returnRequest.order_id || "") === String(orderId))
    : [];
  const embeddedReturns = Array.isArray(order?.relations?.returns)
    ? order.relations.returns
    : Array.isArray(order?.returns)
      ? order.returns
      : [];
  const existingReturns = fetchedReturns.length ? fetchedReturns : embeddedReturns;
  const selectedItem =
    orderItems.find((item) => getItemId(item) === selectedProductId) || null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: { productId: "", resolution: "refund", reason: "defective", quantity: 1 },
  });

  const watchedQty = watch("quantity");
  const estimatedRefund = calculateEstimatedRefundBreakup(order, selectedItem, watchedQty);

  const handleItemSelect = (item) => {
    const policy = getItemReturnPolicy(item);
    const existingReturn = getReturnForItem(existingReturns, item);
    const expired = policy.eligibleUntil && new Date(policy.eligibleUntil).getTime() < Date.now();
    if (!isItemDelivered(order, item) || !policy.returnable || expired || existingReturn) return;
    const pid = getItemProductId(item);
    setSelectedProductId(
      getItemId(item) || `${pid}:${getItemVariantSku(item)}`,
    );
    setValue("productId", pid, { shouldValidate: true });
    setValue("quantity", 1, { shouldValidate: true });
  };

  useEffect(() => {
    if (deepLinkApplied || !orderItems.length) return;
    const requestedItemId = searchParams.get("orderItemId");
    if (requestedItemId) {
      const requestedItem = orderItems.find((item) => String(getItemId(item)) === String(requestedItemId));
      if (requestedItem) handleItemSelect(requestedItem);
    }
    setDeepLinkApplied(true);
  }, [deepLinkApplied, orderItems, searchParams]);

  const submit = async (values) => {
    const item =
      selectedItem ||
      orderItems.find((i) => getItemProductId(i) === values.productId);
    const unitPrice = item ? getItemUnitPrice(item) : 0;
    try {
      await run(
        dispatch,
        requestReturn({
          orderId,
          items: [
            {
              orderItemId: getItemId(item),
              productId: values.productId,
              variantSku: getItemVariantSku(item),
              quantity: Number(values.quantity),
              unitPrice,
            },
          ],
          reason: values.reason,
          resolution: values.resolution,
          description: values.description,
        }),
        "Return request submitted",
      );
      navigate("/returns-refunds");
    } catch (e) {
      // silent
    }
  };

  return (
    <>
      <Seo title="Request Return | Sam Global" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-all duration-300 ease-in-out"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <div className="overflow-hidden rounded-xl  border border-border bg-white p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-xl  font-bold text-ink">Request a Return</h1>
            <p className="mt-1 text-sm  text-muted">
              Select the Item You Want to Return From This Order.
            </p>
          </div>

          {orderLoading && !order ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted">
              Loading Order…
            </div>
          ) : !orderItems.length ? (
            <div className="rounded-[10px] border border-dashed border-border-strong bg-cream p-8 text-center text-sm text-muted">
              No Items Found for This Order.
            </div>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={handleSubmit(submit)}
              noValidate
            >
              {/* Hidden productId field */}
              <input type="hidden" {...register("productId")} />

              {/* Item selector */}
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-ink">
                  Select Item to Return
                </span>
                <div className="grid gap-3">
                  {orderItems.map((item) => {
                    const pid = getItemProductId(item);
                    const title = getItemTitle(item);
                    const img = getItemImage(item);
                    const price = getDisplayItemPrice(item);
                    const lineKey =
                      getItemId(item) || `${pid}:${getItemVariantSku(item)}`;
                    const isSelected = selectedProductId === lineKey;
                    const policy = getItemReturnPolicy(item);
                    const existingReturn = getReturnForItem(existingReturns, item);
                    const delivered = isItemDelivered(order, item);
                    const expired = policy.eligibleUntil && new Date(policy.eligibleUntil).getTime() < Date.now();
                    const disabled = !delivered || !policy.returnable || Boolean(expired) || Boolean(existingReturn);
                    return (
                      <button
                        key={lineKey || title}
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        disabled={disabled}
                        className={`flex w-full min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-gold bg-cream outline-none"
                            : disabled
                              ? "cursor-not-allowed border-border bg-stone-50 opacity-70"
                            : "border-border bg-white hover:border-gold/40"
                        }`}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={title}
                            className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-cream text-muted">
                            <Package size={18} />
                          </span>
                        )}

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p
                            className="break-words text-sm font-medium text-ink sm:text-base"
                            title={title}
                          >
                            {title}
                          </p>

                          {price > 0 && (
                            <p className="mt-1 text-xs text-muted sm:text-sm">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </p>
                          )}
                          <p className={`mt-1 text-xs font-semibold ${!disabled ? "text-emerald-700" : "text-red-700"}`}>
                            {existingReturn
                              ? `Return already ${String(existingReturn.status || "requested").replace(/_/g, " ")}`
                              : !delivered
                                ? "Return available after this item is delivered"
                              : expired
                                ? "Return window has closed"
                              : policy.returnable
                                ? `Returnable${policy.days ? ` for ${policy.days} days` : ""}${policy.inspectionRequired ? " · QC required" : ""}`
                                : "This item is not returnable"}
                          </p>
                        </div>

                        <span
                          className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                            isSelected ? "border-gold bg-gold" : "border-border"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                {errors.productId && (
                  <span className="text-xs text-red-700">
                    {errors.productId.message}
                  </span>
                )}
              </div>

              {selectedItem && (
                <>
                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Preferred Resolution</span>
                    <select
                      {...register("resolution")}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none"
                    >
                      <option value="refund">Return for Refund</option>
                      <option value="replacement">Replace This Item</option>
                    </select>
                  </label>
                  <div className="grid gap-1.5 ">
                    <label
                      htmlFor="quantity"
                      className="text-sm font-medium text-ink"
                    >
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem?.quantity || 99}
                      {...register("quantity", { valueAsNumber: true })}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out  focus:outline-none"
                    />
                    {errors.quantity && (
                      <span className="text-xs text-red-700">
                        {errors.quantity.message}
                      </span>
                    )}
                  </div>

                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Reason for Return</span>
                    <select
                      {...register("reason")}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out focus:outline-none"
                    >
                      {RETURN_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    {errors.reason && (
                      <span className="text-xs text-red-700">
                        {errors.reason.message}
                      </span>
                    )}
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Description</span>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the Issue in Detail…"
                      className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out placeholder:text-stone-400 focus:outline-none resize-none"
                    />
                    {errors.description && (
                      <span className="text-xs text-red-700">
                        {errors.description.message}
                      </span>
                    )}
                  </label>

                  {estimatedRefund.total > 0 && (
                    <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-700">
                        Estimated Refund
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        ₹
                        {estimatedRefund.total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <div className="mt-3 space-y-1 rounded-md bg-white/70 px-3 py-2 text-xs">
                        {estimatedRefund.rows.map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-3">
                            <span className={row.tone === "muted" ? "text-stone-500" : "text-emerald-700"}>
                              {row.label}
                            </span>
                            <span className={row.tone === "muted" ? "font-semibold text-stone-500" : "font-semibold text-emerald-700"}>
                              {row.value > 0 ? "+" : row.value < 0 ? "-" : ""}
                              ₹{Math.abs(row.value).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-emerald-700">
                        {estimatedRefund.note}
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Final refund is subject to review and QC.
                      </p>
                    </div>
                  )}

                  <Button type="submit" loading={loading} className="w-full">
                    <RotateCcw size={16} /> Submit Return Request
                  </Button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function ReturnsPage({ request = false }) {
  const { orderId } = useParams();
  if (request) return <ReturnRequestPage orderId={orderId} />;
}
