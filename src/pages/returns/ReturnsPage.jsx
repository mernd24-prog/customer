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
import { notify } from "../../utils/notify";

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
const getPaymentMethod = (order = {}) => {
  const relations = order?.relations || {};
  const payment = Array.isArray(relations.payments) ? relations.payments[0] : null;
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
const isCodOrder = (order = {}) => getPaymentMethod(order) === "cod";
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

  const cod = isCodOrder(order);

  return {
    total,
    rows: [
      { label: "Product amount paid by you", value: productPaid, tone: "credit" },
      shippingTotal > 0
        ? {
          label: shippingRefundable ? "Shipping refunded" : "Shipping not refundable",
          value: shippingRefundable ? shippingRefund : 0,
          displayValue: shippingRefundable ? null : "Not refundable",
          tone: shippingRefundable ? "credit" : "muted",
        }
        : null,
      platformFeeTotal + platformFeeTaxTotal > 0
        ? {
          label: platformFeeRefundable ? "Platform fee refunded" : "Platform fee not refundable",
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
const getItemVariantId = (item) => item?.variant_id || item?.variantId || item?.variant?._id || item?.variant?.id || "";
const getItemId = (item) => item?.id || item?._id || item?.orderItemId || item?.order_item_id || "";
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
  const itemId = String(getItemId(item) || "");
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

  const variantId = String(getItemVariantId(item) || "");
  const returnVariantId = String(getReturnItemVariantId(returnItem) || "");
  if (variantId || returnVariantId) return variantId === returnVariantId;

  const variantSku = String(getItemVariantSku(item) || "");
  const returnVariantSku = String(getReturnItemVariantSku(returnItem) || "");
  if (variantSku || returnVariantSku) return variantSku === returnVariantSku;

  return true;
};
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
  return returns.find((returnRequest) =>
    (returnRequest.items || []).some((returnItem) => returnItemMatchesOrderItem(returnItem, item)),
  );
};
const getReturnItemQuantity = (returnItem = {}) =>
  asNumber(
    returnItem.receivedQuantity ??
      returnItem.received_quantity ??
      returnItem.approvedQuantity ??
      returnItem.approved_quantity ??
      returnItem.requestedQuantity ??
      returnItem.requested_quantity ??
      returnItem.quantity ??
      0,
  );
const isReturnQuantityBlocking = (returnRequest = {}) => {
  const status = String(returnRequest.status || "").toLowerCase();
  const refundStatus = String(returnRequest.refund?.status || returnRequest.refundStatus || returnRequest.refund_status || "").toLowerCase();
  if (["rejected", "qc_failure_upheld"].includes(status)) return false;
  if (status === "closed" && !["completed", "not_required"].includes(refundStatus)) return false;
  return true;
};
const getReturnedQuantityForItem = (returns = [], item = {}) => {
  return returns.reduce((sum, returnRequest) => {
    if (!isReturnQuantityBlocking(returnRequest)) return sum;
    const matchingItems = (returnRequest.items || []).filter((returnItem) =>
      returnItemMatchesOrderItem(returnItem, item),
    );
    return sum + matchingItems.reduce((itemSum, returnItem) => itemSum + getReturnItemQuantity(returnItem), 0);
  }, 0);
};
const getReturnableQuantityForItem = (returns = [], item = {}) =>
  Math.max(0, getItemQuantity(item) - getReturnedQuantityForItem(returns, item));
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
  const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);
  const [returnsChecked, setReturnsChecked] = useState(false);

  useEffect(() => {
    if (orderId) {
      setReturnsChecked(false);
      dispatch(fetchOrderById({ orderId }));
      dispatch(fetchReturnByOrder({ orderId }))
        .finally(() => setReturnsChecked(true));
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
  const existingReturns = [...fetchedReturns, ...embeddedReturns].filter((returnRequest, index, list) => {
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
  const selectedItem =
    orderItems.find((item) => String(getItemId(item)) === String(selectedOrderItemId)) || null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: { productId: "", orderItemId: "", resolution: "refund", reason: "defective", quantity: 1 },
  });

  const watchedQty = watch("quantity");
  const estimatedRefund = calculateEstimatedRefundBreakup(order, selectedItem, watchedQty);
  const selectedReturnableQuantity = selectedItem
    ? getReturnableQuantityForItem(existingReturns, selectedItem)
    : 0;
  const selectedReturnedQuantity = selectedItem
    ? getReturnedQuantityForItem(existingReturns, selectedItem)
    : 0;
  const selectedOrderedQuantity = selectedItem ? getItemQuantity(selectedItem) : 0;
  const watchedQuantityNumber = Number(watchedQty || 0);
  const quantityExceedsRemaining = Boolean(
    selectedItem &&
    selectedReturnableQuantity > 0 &&
    watchedQuantityNumber > selectedReturnableQuantity,
  );

  const handleItemSelect = (item) => {
    if (!returnsChecked) {
      notify.info("Checking existing return requests for this item. Please wait a moment.");
      return;
    }
    const policy = getItemReturnPolicy(item);
    const returnableQuantity = getReturnableQuantityForItem(existingReturns, item);
    const expired = policy.eligibleUntil && new Date(policy.eligibleUntil).getTime() < Date.now();
    if (!isItemDelivered(order, item) || !policy.returnable || expired || returnableQuantity <= 0) return;
    const pid = getItemProductId(item);
    const orderItemId = getItemId(item);
    setSelectedOrderItemId(orderItemId);
    setValue("productId", pid, { shouldValidate: true });
    setValue("orderItemId", orderItemId, { shouldValidate: true });
    setValue("quantity", Math.min(1, returnableQuantity), { shouldValidate: true });
  };
  useEffect(() => {
    if (!selectedItem) return;
    const currentQuantity = Number(watchedQty || 0);
    if (currentQuantity > selectedOrderedQuantity) {
      setValue("quantity", selectedOrderedQuantity, { shouldValidate: true });
    }
  }, [selectedItem, selectedOrderedQuantity, setValue, watchedQty]);

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
      orderItems.find((i) => String(getItemId(i)) === String(values.orderItemId));
    const unitPrice = item ? getItemUnitPrice(item) : 0;
    const returnableQuantity = item ? getReturnableQuantityForItem(existingReturns, item) : 0;
    const requestedQuantity = Number(values.quantity);
    const alreadyQueuedQuantity = item ? getReturnedQuantityForItem(existingReturns, item) : 0;
    const orderedQuantity = item ? getItemQuantity(item) : 0;
    if (!item || !getItemId(item)) {
      notify.error("Please select the exact item/variant to return.");
      return;
    }
    if (!returnsChecked) {
      notify.error("Please wait while we check existing return requests for this item.");
      return;
    }
    if (requestedQuantity < 1 || requestedQuantity > returnableQuantity) {
      notify.error(
        alreadyQueuedQuantity > 0
          ? `${alreadyQueuedQuantity} of ${orderedQuantity} unit${orderedQuantity === 1 ? "" : "s"} already in return/refund queue. You can return only ${returnableQuantity} more unit${returnableQuantity === 1 ? "" : "s"} now.`
          : `You can return up to ${returnableQuantity} unit${returnableQuantity === 1 ? "" : "s"} for this item.`,
      );
      setValue("quantity", Math.max(1, returnableQuantity), { shouldValidate: true });
      return;
    }
    try {
      await run(
        dispatch,
        requestReturn({
          orderId,
          items: [
            {
              orderItemId: getItemId(item),
              productId: values.productId,
              variantId: getItemVariantId(item),
              variantSku: getItemVariantSku(item),
              quantity: requestedQuantity,
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
              <input type="hidden" {...register("orderItemId")} />

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
                    const isSelected = String(selectedOrderItemId) === String(lineKey);
                    const policy = getItemReturnPolicy(item);
                    const existingReturn = getReturnForItem(existingReturns, item);
                    const returnedQuantity = getReturnedQuantityForItem(existingReturns, item);
                    const returnableQuantity = getReturnableQuantityForItem(existingReturns, item);
                    const delivered = isItemDelivered(order, item);
                    const expired = policy.eligibleUntil && new Date(policy.eligibleUntil).getTime() < Date.now();
                    const disabled = !returnsChecked || !delivered || !policy.returnable || Boolean(expired) || returnableQuantity <= 0;
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
                          <p className="mt-1 text-xs text-muted">
                            Ordered: {getItemQuantity(item)}
                            {returnedQuantity > 0 ? ` · Already in return/refund queue: ${returnedQuantity}` : ""}
                            {returnsChecked ? ` · Returnable now: ${returnableQuantity}` : " · Checking return history…"}
                          </p>
                          <p className={`mt-1 text-xs font-semibold ${!disabled ? "text-emerald-700" : "text-red-700"}`}>
                            {!returnsChecked
                              ? "Checking existing return requests…"
                              : returnableQuantity <= 0 && existingReturn
                              ? `All units already ${String(existingReturn.status || "requested").replace(/_/g, " ")}`
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
                      max={selectedReturnableQuantity || selectedItem?.quantity || 99}
                      {...register("quantity", { valueAsNumber: true })}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out  focus:outline-none"
                    />
                    <p className="text-xs text-muted">
                      You can return up to {selectedReturnableQuantity} unit{selectedReturnableQuantity === 1 ? "" : "s"} for this exact order item/variant.
                    </p>
                    {selectedReturnedQuantity > 0 && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {selectedReturnedQuantity} of {selectedOrderedQuantity} unit{selectedOrderedQuantity === 1 ? "" : "s"} already in return/refund queue.
                        You can return only {selectedReturnableQuantity} more unit{selectedReturnableQuantity === 1 ? "" : "s"} now.
                      </div>
                    )}
                    {quantityExceedsRemaining && (
                      <span className="text-xs font-semibold text-red-700">
                        Quantity cannot be more than the remaining returnable quantity: {selectedReturnableQuantity}.
                      </span>
                    )}
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
                              {row.displayValue || (
                                <>
                                  {row.value > 0 ? "+" : row.value < 0 ? "-" : ""}
                                  ₹{Math.abs(row.value).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-emerald-700">
                        {estimatedRefund.note}
                      </p>
                      {estimatedRefund.cod && (
                        <p className="mt-1 rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                          COD order: no Razorpay gateway refund is created. Admin/seller will complete the approved refund through the configured COD refund process.
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Final refund is subject to review and QC.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!returnsChecked || quantityExceedsRemaining || selectedReturnableQuantity <= 0}
                    className="w-full"
                  >
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
