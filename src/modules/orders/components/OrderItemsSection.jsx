import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Truck, Package, ExternalLink } from "lucide-react";
import { fetchMyProductReview } from "../../../features/review/reviewSlice";
import { OrderItemCard } from "./OrderItemCard";
import { OrderItemReviewAction, ReviewModal } from "./OrderItemReview";
import { ShowMoreText } from "../../../utils/showMore";
import {
  getReviewProductId,
  getReviewOrderItemId,
  reviewKeyForItem,
  getItemId,
  getItemSellerGroupKey,
  resolveReturnForItem,
  resolveItemStatus,
  isDeliveredStatus,
  resolveItemTracking,
  sellerGroupKey,
  label,
  formatDate,
  getItemReturnPolicy,
  getReturnedQuantityForItem,
  getReturnableQuantityForItem,
  getItemQuantity,
  getCancellationForItem,
} from "../utils/orderItems";

const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const TIMELINE_STEPS = [
  { status: "confirmed", label: "Order Confirmed" },
  { status: "in_transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_RANK = {
  initiated: 1,
  pending_payment: 1,
  confirmed: 1,
  processing: 1,
  packed: 1,
  ready_to_ship: 1,
  shipped: 2,
  in_transit: 3,
  out_for_delivery: 4,
  delivered: 5,
  fulfilled: 5,
};

const getCancellationSteps = (cancellation, group, currency, formatMoney, isCodOrder) => {
  if (!cancellation) {
     return [
       { label: "Cancellation requested", completed: true, status: "requested" },
       { label: "Cancellation approved", completed: true, status: "approved" },
       { label: "Refund pending", completed: true, status: "refund_pending" }
     ];
  }
  
  const steps = [];
  
  const reasonText = cancellation.reason || "";
  const isMockData = reasonText.includes("Request item cancellation?");
  
  steps.push({ 
    label: "Cancellation requested", 
    completed: true, 
    status: "requested", 
    time: null, 
    note: isMockData ? "User requested cancellation" : (cancellation.reason || "Not specified")
  });
  
  const refundAmountText = Number(cancellation.refund_amount) > 0 && formatMoney ? ` of ${formatMoney(cancellation.refund_amount, currency)}` : "";
  const codNote = isCodOrder && cancellation.refund_status !== "not_required" ? " COD refund: after approval, the refund is completed through the marketplace COD refund process." : "";

  if (cancellation.status === "failed" || cancellation.status === "rejected") {
      steps.push({ label: "Cancellation failed", completed: true, status: "rejected", time: null, note: cancellation.rejection_reason || cancellation.metadata?.rejectionReason });
  } else {
      const isApproved = cancellation.metadata?.approvedAt || cancellation.status === "approved" || cancellation.status === "completed" || cancellation.status === "cancellation_approved";
      steps.push({ label: "Cancellation approved", completed: !!isApproved, status: "approved", time: null, note: isApproved ? "Cancellation request has been approved." : null });
      
      const isRefunded = cancellation.refund_status === "completed" || cancellation.refund_status === "processed";
      const refundFailed = cancellation.refund_status === "failed";
      
      if (refundFailed) {
          steps.push({ label: "Refund failed", completed: true, status: "refund_failed", time: null, note: `Refund${refundAmountText} could not be processed.` });
      } else if (isRefunded) {
          steps.push({ label: "Refund completed", completed: true, status: "refunded", time: null, note: `Refund${refundAmountText} has been successfully processed.${codNote}` });
      } else {
          steps.push({ label: "Refund pending", completed: false, status: "refund_pending", time: null, note: isApproved ? `Refund${refundAmountText} will be processed shortly.${codNote}` : null });
      }
  }
  return steps;
};

const getReturnSteps = (returnRequest, group, currency, formatMoney, isCodOrder) => {
  if (!returnRequest) {
    return [
      { label: "Return requested", completed: true, status: "requested" },
      { label: "Return approved", completed: false, status: "approved" },
      { label: "Pickup scheduled", completed: false, status: "pickup_scheduled" },
      { label: "Picked up", completed: false, status: "picked_up" },
      { label: "Returned", completed: false, status: "returned" }
    ];
  }

  const steps = [];
  
  steps.push({ 
    label: "Return requested", 
    completed: true, 
    status: "requested", 
    time: null, 
    note: returnRequest.reason || "Not specified" 
  });

  if (returnRequest.status === "rejected" || returnRequest.status === "cancelled") {
    steps.push({ 
      label: `Return ${returnRequest.status}`, 
      completed: true, 
      status: returnRequest.status, 
      time: null,
      note: returnRequest.rejection_reason || returnRequest.metadata?.rejectionReason || "Return request was not approved."
    });
    return steps;
  }

  const isApproved = ["approved", "reverse_pickup_scheduled", "pickup_scheduled", "in_reverse_transit", "picked_up", "received", "qc_completed", "qc_passed", "qc_failed", "completed", "refund_processed", "partially_returned", "returned"].includes(returnRequest.status);
  const pickupDate = returnRequest.reverseShipment?.pickupScheduledAt || returnRequest.metadata?.pickupScheduledAt;
  
  steps.push({
    label: "Return approved",
    completed: isApproved,
    status: "approved",
    time: null,
    note: null
  });

  const isPickupScheduled = ["reverse_pickup_scheduled", "pickup_scheduled", "in_reverse_transit", "picked_up", "received", "qc_completed", "qc_passed", "qc_failed", "completed", "refund_processed", "partially_returned", "returned"].includes(returnRequest.status);
  
  steps.push({
    label: "Pickup scheduled",
    completed: isPickupScheduled,
    status: "pickup_scheduled",
    time: isPickupScheduled ? (pickupDate || returnRequest.updated_at) : null,
    note: null
  });

  const isPickedUp = ["in_reverse_transit", "picked_up", "received", "qc_completed", "qc_passed", "qc_failed", "completed", "refund_processed", "partially_returned", "returned"].includes(returnRequest.status);
  
  steps.push({
    label: "Picked up",
    completed: isPickedUp,
    status: "picked_up",
    time: isPickedUp ? (returnRequest.metadata?.pickedUpAt || returnRequest.reverseShipment?.pickedUpAt || returnRequest.updated_at) : null,
    note: null
  });

  const isReturned = ["received", "qc_completed", "qc_passed", "qc_failed", "completed", "refund_processed", "partially_returned", "returned"].includes(returnRequest.status);
  
  steps.push({
    label: "Returned",
    completed: isReturned,
    status: "returned",
    time: null,
    note: null
  });

  const isQcCompleted = ["qc_completed", "qc_passed", "qc_failed", "completed", "refund_processed", "partially_returned", "returned"].includes(returnRequest.status);
  let qcLabel = "QC Pending";
  if (isQcCompleted) {
    if (returnRequest.status === "qc_failed") qcLabel = "QC Failed";
    else qcLabel = "QC Passed";
  }

  steps.push({
    label: isQcCompleted ? qcLabel : "QC Pending",
    completed: isQcCompleted,
    status: "qc",
    time: null,
    note: null
  });

  const isRefundProcessed = ["refund_processed", "completed"].includes(returnRequest.status) || returnRequest.refund?.status === "processed" || returnRequest.refund?.status === "completed";
  
  steps.push({
    label: "Refund processed",
    completed: isRefundProcessed,
    status: "refund_processed",
    time: null,
    note: null
  });

  return steps;
};

function OrderItemsSection({
  items = [],
  order,
  selectedOrderItem,
  orderId,
  orderStatus,
  shipments = [],
  sellerFulfillmentGroups = [],
  returns = [],
  cancellations = [],
  ...itemProps
}) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSingleItemView = Boolean(selectedOrderItem || searchParams.get("orderItemId"));
  const [reviewTarget, setReviewTarget] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState("");
  const [reviewByItem, setReviewByItem] = useState({});
  const [checkedReviewKeys, setCheckedReviewKeys] = useState({});

  const itemFulfillment = useMemo(() => {
    const result = new Map();
    const forwardShipments = shipments.filter(
      (shipment) => String(shipment.direction || "forward") !== "reverse",
    );

    items.forEach((item) => {
      const itemId = getItemId(item);
      const groupKey = getItemSellerGroupKey(item);
      const fulfillment = sellerFulfillmentGroups.find(
        (group) =>
          sellerGroupKey(
            group.sellerId || group.seller_id,
            group.organizationId || group.organization_id,
          ) === groupKey,
      );
      const shipment = forwardShipments.find((candidate) => {
        const ids =
          candidate.orderItemIds ||
          candidate.order_item_ids ||
          candidate.metadata?.orderItemIds ||
          [];
        if (ids.length) return ids.map(String).includes(itemId);
        return (
          sellerGroupKey(
            candidate.seller_id || candidate.sellerId,
            candidate.organization_id ||
              candidate.organizationId ||
              candidate.metadata?.organizationId,
          ) === groupKey
        );
      });
      const returnRequest = resolveReturnForItem(returns, item);
      const cancellationRequest = getCancellationForItem(cancellations, item);
      const status = resolveItemStatus({
        item,
        shipment,
        fulfillment,
        returnRequest,
        cancellationRequest,
        orderStatus,
      });
      result.set(itemId, {
        status,
        delivered: isDeliveredStatus(
          item.delivery_status ||
            item.deliveryStatus ||
            shipment?.status ||
            fulfillment?.deliveryStatus ||
            fulfillment?.shipmentStatus ||
            status,
        ),
        deliveredAt:
          item.delivered_at ||
          item.deliveredAt ||
          shipment?.delivered_at ||
          shipment?.deliveredAt ||
          null,
        shipment,
        tracking: resolveItemTracking(shipment),
      });
    });
    return result;
  }, [
    items,
    orderStatus,
    returns,
    cancellations,
    sellerFulfillmentGroups,
    shipments,
  ]);

  const reviewableItems = useMemo(
    () =>
      orderId
        ? items.filter(
            (item) =>
              itemFulfillment.get(getItemId(item))?.delivered &&
              getReviewProductId(item),
          )
        : [],
    [itemFulfillment, items, orderId],
  );

  useEffect(() => {
    const requestedItemId = searchParams.get("orderItemId");
    if (requestedItemId) {
      const nextId = String(requestedItemId);
      setExpandedItemId(nextId);
      window.requestAnimationFrame(() => {
        document.getElementById(`order-item-${nextId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!orderId || !reviewableItems.length) return;

    reviewableItems.forEach((item) => {
      const key = reviewKeyForItem(orderId, item);
      if (checkedReviewKeys[key]) return;

      dispatch(
        fetchMyProductReview({
          productId: getReviewProductId(item),
          orderId,
          orderItemId: getReviewOrderItemId(item),
        }),
      )
        .unwrap()
        .then((response) => {
          setReviewByItem((current) => ({
            ...current,
            [key]: response?.data || null,
          }));
        })
        .catch(() => {
          setReviewByItem((current) => ({ ...current, [key]: null }));
        })
        .finally(() => {
          setCheckedReviewKeys((current) => ({ ...current, [key]: true }));
        });
    });
  }, [checkedReviewKeys, dispatch, orderId, reviewableItems]);

  const packageGroups = useMemo(() => {
    const shipmentByGroup = new Map();
    shipments
      .filter(
        (shipment) => String(shipment.direction || "forward") !== "reverse",
      )
      .forEach((shipment) => {
        const metadata = shipment.metadata || {};
        const key = sellerGroupKey(
          shipment.seller_id || shipment.sellerId,
          shipment.organization_id ||
            shipment.organizationId ||
            metadata.organizationId ||
            null,
        );
        if (!shipmentByGroup.has(key)) shipmentByGroup.set(key, []);
        shipmentByGroup.get(key).push(shipment);
      });

    const fulfillmentByGroup = new Map();
    sellerFulfillmentGroups.forEach((group) => {
      fulfillmentByGroup.set(
        sellerGroupKey(
          group.sellerId || group.seller_id,
          group.organizationId || group.organization_id,
        ),
        group,
      );
    });

    const returnByItem = new Map();
    returns.forEach((returnRequest) => {
      (returnRequest.items || []).forEach((returnItem) => {
        const orderItemId =
          returnItem.orderItemId ||
          returnItem.order_item_id ||
          returnItem.itemId ||
          returnItem.item_id;
        if (orderItemId) returnByItem.set(String(orderItemId), returnRequest);
      });
    });

    const grouped = new Map();
    items.forEach((item) => {
      const key = getItemId(item);
      if (!grouped.has(key)) {
        const sellerKey = getItemSellerGroupKey(item);
        const fulfillment = fulfillmentByGroup.get(sellerKey) || {};
        const itemFulfill = itemFulfillment.get(key) || {};
        const shipment = itemFulfill.shipment;
        const itemShipments = shipment ? [shipment] : (shipmentByGroup.get(sellerKey) || []);
        
        grouped.set(key, {
          key,
          sellerName:
            fulfillment.sellerName ||
            item.sellerName ||
            item.seller?.displayName ||
            item.seller?.businessName ||
            "Marketplace seller",
          status:
            itemFulfill.status ||
            fulfillment.returnLifecycle?.status ||
            fulfillment.deliveryStatus ||
            fulfillment.shipmentStatus ||
            itemShipments[0]?.status ||
            "preparing",
          expectedDeliveryAt:
            fulfillment.expectedDeliveryAt ||
            itemShipments[0]?.expected_delivery_at ||
            itemShipments[0]?.expectedDeliveryAt,
          shipments: itemShipments,
          items: [],
          returnByItem,
        });
      }
      grouped.get(key).items.push(item);
    });
    return Array.from(grouped.values()).map((group) => {
      const itemStatuses = group.items
        .map((item) => itemFulfillment.get(getItemId(item))?.status)
        .filter(Boolean);
      const uniqueStatuses = [...new Set(itemStatuses)];
      return {
        ...group,
        status: uniqueStatuses.length === 1 ? uniqueStatuses[0] : group.status,
      };
    });
  }, [itemFulfillment, items, returns, sellerFulfillmentGroups, shipments]);

  const handleSubmitted = (review) => {
    if (!reviewTarget) return;
    const key = reviewKeyForItem(orderId, reviewTarget);
    setReviewByItem((current) => ({ ...current, [key]: review || true }));
    setCheckedReviewKeys((current) => ({ ...current, [key]: true }));
    setReviewTarget(null);
  };

  return (
    <section className="grid gap-5">

      {packageGroups.map((group, groupIndex) => {
        const shipment = group.shipments[0] || {};
        const expectedDelivery = group.expectedDeliveryAt;
        const groupRank = STATUS_RANK[group.status] !== undefined ? STATUS_RANK[group.status] : 1;
        const orderRank = STATUS_RANK[orderStatus] !== undefined ? STATUS_RANK[orderStatus] : 1;
        const currentRank = Math.max(groupRank, orderRank);
        const isDelivered = currentRank >= 5;
        const activeColor = "bg-[#CE9F2D]";
        const activeText = "text-[#CE9F2D]";
        const events = [...(shipment.trackingEvents || [])].sort(
          (left, right) => new Date(right.event_time || right.created_at || 0) - new Date(left.event_time || left.created_at || 0)
        );

        const groupCancellation = cancellations.find(c => 
          c.items?.some(ci => group.items.some(gi => (gi.id || gi._id) === ci.orderItemId))
        );
        const groupReturn = returns.find(r => 
          r.items?.some(ri => group.items.some(gi => (gi.id || gi._id) === (ri.orderItemId || ri.order_item_id || ri.itemId || ri.item_id)))
        );
        
        const orderedGroupQuantity = group.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const cancelledGroupQuantity = group.items.reduce(
          (sum, item) => sum + Number(item.cancelled_quantity || item.cancelledQuantity || 0),
          0,
        );
        const isFullyCancelled = orderedGroupQuantity > 0 && cancelledGroupQuantity >= orderedGroupQuantity;
        const isCancelled = group.status === "cancelled" || isFullyCancelled;
        const isPartiallyCancelled = cancelledGroupQuantity > 0 && !isFullyCancelled;
        const returnedGroupQuantity = group.items.reduce(
          (sum, item) => sum + getReturnedQuantityForItem(returns, item),
          0,
        );
        const nonCancelledGroupQuantity = Math.max(orderedGroupQuantity - cancelledGroupQuantity, 0);
        const isFullyReturned = nonCancelledGroupQuantity > 0 && returnedGroupQuantity >= nonCancelledGroupQuantity;
        const isReturned = group.status === "returned" || isFullyReturned;
        const isPartiallyReturned = returnedGroupQuantity > 0 && !isFullyReturned;

        return (
          <div
            key={group.key}
            className="grid rounded-xl border border-[#E7D9B8] bg-[#FFFDF8] lg:grid-cols-[minmax(0,1fr)_minmax(360px,auto)] xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,1fr)]"
          >
            {/* Left Column: Items and Courier */}
            <div className="flex flex-col gap-3 p-4 lg:p-5 lg:pr-6 min-w-0">
              <div className="-mx-4 lg:-ml-5 lg:-mr-6 flex items-center justify-between gap-4 border-b border-[#ede4cf] px-4 lg:pl-5 lg:pr-6 pb-4">
                <h3 className="font-bold text-[#1B1D60] text-base md:text-lg truncate flex-1 min-w-0">
                  Package: {group.items.map(i => itemProps.getProductTitle(i).split(" - ")[0]).join(", ")}
                </h3>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  (group.status === 'delivered' || group.status === 'fulfilled')
                    ? 'bg-[#E6F4EA] text-[#0D652D]'
                    : (group.status === 'cancelled' || group.status === 'returned' || group.status === 'cancellation_requested')
                    ? 'bg-[#FCE8E8] text-[#991B1B]'
                    : 'bg-[#F0F1FF] text-[#201B78]'
                }`}>
                  {label(group.status || "confirmed")}
                </span>
              </div>
              
              
              <div className="grid gap-4">
                {group.items.map((item, index) => {
                  const policy = getItemReturnPolicy(item);
                  const itemId = getItemId(item);
                  const fulfillment = itemFulfillment.get(itemId) || {};
                  const returnRequest = group.returnByItem.get(itemId) || resolveReturnForItem(returns, item);
                  const returnedQuantity = getReturnedQuantityForItem(returns, item);
                  const returnableQuantity = getReturnableQuantityForItem(returns, item);

                  return (
                    <div key={item.id || item._id || index} className="grid gap-3">
                      <OrderItemCard
                        item={item}
                        {...itemProps}
                        compact={true}
                        cancelledQuantity={Number(item.cancelled_quantity || item.cancelledQuantity || 0)}
                        returnedQuantity={returnedQuantity}
                        delivered={Boolean(fulfillment.delivered)}
                        effectiveStatus={fulfillment.status}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                        <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#2E2E2E]">
                          <span className="flex items-center h-6">
                            {policy.returnable ? `Returnable${policy.days ? ` for ${policy.days} days` : ""}` : "Non-returnable"}
                          </span>
                          {returnRequest && (
                            <span className="flex items-center h-6 rounded-full bg-blue-50 px-3 text-blue-700">
                              {label(fulfillment.status)}
                            </span>
                          )}
                        </div>
                        {isSingleItemView && fulfillment.delivered && returnedQuantity === 0 && Boolean(getReviewProductId(item)) && (
                          <OrderItemReviewAction
                            item={item}
                            orderId={orderId}
                            canReview
                            existingReview={reviewByItem[reviewKeyForItem(orderId, item)]}
                            reviewChecked={Boolean(checkedReviewKeys[reviewKeyForItem(orderId, item)])}
                            onReviewClick={setReviewTarget}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isPartiallyCancelled && groupCancellation && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  {cancelledGroupQuantity} of {orderedGroupQuantity} unit(s) cancelled. The remaining {orderedGroupQuantity - cancelledGroupQuantity} unit(s) continue through delivery normally.
                </div>
              )}

              {isPartiallyReturned && groupReturn && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-800">
                  {returnedGroupQuantity} of {nonCancelledGroupQuantity} non-cancelled unit(s) are in the return flow. Other units keep their own delivery status.
                </div>
              )}

              {/* Courier Info */}
              {!isCancelled && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 items-center gap-4 sm:gap-6 rounded-lg bg-white p-3 border border-[#E7D9B8]">
                    <div className="flex items-center gap-3">
                      <Truck size={20} className="text-[#6F7480] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[#6F7480]">Courier</p>
                        <p className="text-sm font-semibold text-[#1B1D60] truncate">{shipment.courier_name || "Seller Delivery"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-[#6F7480] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[#6F7480]">Tracking ID</p>
                        <p className="text-sm font-semibold text-[#1B1D60] truncate">{shipment.tracking_number || shipment.awb_number || "Will be added after dispatch"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(isCancelled || isReturned) && (groupCancellation || groupReturn) && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 items-center gap-4 sm:gap-6 rounded-lg bg-[#FFF9EA] p-3 border border-[#CE9F2D] border-opacity-30">
                    <div className="min-w-0">
                      <p className="text-xs text-[#8A5A00]">{isReturned ? "Return ID" : "Cancellation ID"}</p>
                      <p className="text-sm font-semibold text-[#1B1D60] truncate">
                        {isReturned 
                          ? (groupReturn?.returnNumber || groupReturn?.return_number || groupReturn?.id || groupReturn?._id || "N/A")
                          : (groupCancellation?.cancellationNumber || groupCancellation?.cancellation_number || groupCancellation?.id || groupCancellation?._id || "N/A")}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#8A5A00]">Refund Amount</p>
                      <p className="text-sm font-bold text-[#1B1D60] truncate">
                        {itemProps.formatMoney ? itemProps.formatMoney(
                          isReturned 
                            ? (groupReturn?.refundAmount || groupReturn?.refund?.requestedAmount || groupReturn?.refund?.amount || groupReturn?.refund_amount || groupReturn?.refundBreakup?.totalRefundAmount || groupReturn?.refund_breakup?.total_refund_amount || group.items[0]?.return_lifecycle?.refundAmount || group.items[0]?.return_lifecycle?.refund_amount || group.items[0]?.returnLifecycle?.refundAmount || 0)
                            : (groupCancellation?.refundAmount || groupCancellation?.refund_amount || groupCancellation?.refund?.requestedAmount || groupCancellation?.refund?.amount || groupCancellation?.refundBreakup?.totalRefundAmount || groupCancellation?.refund_breakup?.total_refund_amount || group.items[0]?.cancellation_lifecycle?.refundAmount || 0), 
                          itemProps.currency
                        ) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Tracking Timeline */}
            <div className="flex flex-col gap-4 border-t border-[#E7D9B8] p-4 lg:border-t-0 lg:border-l lg:p-5 lg:pl-6 min-w-0">
              <div className="-mx-4 lg:-ml-6 lg:-mr-5 flex items-center justify-between gap-3 border-b border-[#ede4cf] px-4 lg:pl-6 lg:pr-5 pb-4">
                <h3 className="font-bold text-[#1B1D60] text-base md:text-lg whitespace-nowrap">Tracking Timeline</h3>
                {shipment.tracking_url && (
                  <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#1B1D60] font-medium hover:underline shrink-0">
                    <span className="truncate max-w-[120px] sm:max-w-none">Track on courier site</span> <ExternalLink size={16} className="shrink-0" />
                  </a>
                )}
              </div>
              
              <div >
                {(() => {
                  if (isCancelled || isReturned) {
                    let steps = [];
                    if (isCancelled) {
                      steps = getCancellationSteps(groupCancellation, group, itemProps.currency, itemProps.formatMoney, itemProps.isCodOrder);
                    } else if (isReturned) {
                      steps = getReturnSteps(groupReturn, group, itemProps.currency, itemProps.formatMoney, itemProps.isCodOrder);
                    }
                    return steps.map((step, stepIndex) => {
                      const isCompleted = step.completed;
                      const dotColor = isCompleted ? activeColor : "bg-[#E7D9B8]";
                      const labelColor = isCompleted ? activeText : "text-[#6F7480]";
                      const isNextStepCompleted = stepIndex < steps.length - 1 && steps[stepIndex + 1].completed;
                      const lineColor = isCompleted && isNextStepCompleted ? activeColor : "bg-[#E7D9B8]";
                      const displayTime = step.time ? dateTime(step.time) : null;
                      
                      return (
                        <div key={step.status} className="relative pb-5 pl-6 last:pb-0">
                          {stepIndex !== steps.length - 1 && (
                            <span className={`absolute left-[5px] top-[14px] h-full w-[2px] ${lineColor}`} />
                          )}
                          <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${dotColor}`} />
                          
                          <p className={`text-sm font-semibold ${labelColor}`}>
                            {step.label}
                          </p>
                          
                          {step.note && (
                            <ShowMoreText
                              text={step.note}
                              mode="lines"
                              limit={1}
                              className="mt-1 block"
                              textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                              buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                              moreLabel="Show more"
                              lessLabel="Show less"
                            />
                          )}
                          
                          {isCompleted && displayTime && (
                            <p className="mt-1 text-xs font-medium text-[#1B1D60]">
                              {displayTime}
                            </p>
                          )}
                        </div>
                      );
                    });
                  }

                  return TIMELINE_STEPS.map((step, stepIndex) => {
                    const stepRank = STATUS_RANK[step.status];
                    const isCompleted = currentRank >= stepRank;
                    
                    // Find matching event from API if completed
                    const matchingEvent = isCompleted ? events.find(e => 
                      e.status === step.status || 
                      (step.status === 'confirmed' && (e.status === 'initiated' || e.status === 'pending_payment'))
                    ) : null;
                    const displayTime = matchingEvent ? dateTime(matchingEvent.event_time || matchingEvent.created_at) : null;
                    
                    // Expected logic
                    const isExpectedDelivery = step.status === "delivered" || step.status === "out_for_delivery";
                    const showExpected = !isCompleted && isExpectedDelivery && expectedDelivery;
                    
                    const dotColor = isCompleted ? activeColor : "bg-[#E7D9B8]";
                    const labelColor = isCompleted ? activeText : "text-[#6F7480]";
                    const isNextStepCompleted = stepIndex < TIMELINE_STEPS.length - 1 && currentRank >= STATUS_RANK[TIMELINE_STEPS[stepIndex + 1].status];
                    const lineColor = isCompleted && isNextStepCompleted ? activeColor : "bg-[#E7D9B8]";
                    
                    let fallbackTime = shipment.updated_at || group.expectedDeliveryAt;
                    if (step.status === 'confirmed') fallbackTime = group.items[0]?.created_at || fallbackTime;

                    return (
                      <div key={step.status} className="relative pb-5 pl-6 last:pb-0">
                        {stepIndex !== TIMELINE_STEPS.length - 1 && (
                          <span className={`absolute left-[5px] top-[14px] h-full w-[2px] ${lineColor}`} />
                        )}
                        <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${dotColor}`} />
                        
                        <p className={`text-sm font-semibold ${labelColor}`}>
                          {step.label}
                        </p>
                        
                        {matchingEvent?.note ? (
                          <ShowMoreText
                            text={matchingEvent.note}
                            mode="lines"
                            limit={1}
                            className="mt-1 block"
                            textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                            buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                            moreLabel="Show more"
                            lessLabel="Show less"
                          />
                        ) : isCompleted && step.status === 'confirmed' ? (
                          <ShowMoreText
                            text="Your order has been placed."
                            mode="lines"
                            limit={1}
                            className="mt-1 block"
                            textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                            buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                            moreLabel="Show more"
                            lessLabel="Show less"
                          />
                        ) : !isCompleted && step.status === 'in_transit' ? (
                          <ShowMoreText
                            text="Will be updated as soon as the item is shipped."
                            mode="lines"
                            limit={1}
                            className="mt-1 block"
                            textClassName="text-xs text-[#6F7480] whitespace-pre-wrap"
                            buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                            moreLabel="Show more"
                            lessLabel="Show less"
                          />
                        ) : null}
                        
                        {isCompleted ? (
                          <p className="mt-1 text-xs font-medium text-[#1B1D60]">
                            {displayTime || dateTime(fallbackTime)}
                          </p>
                        ) : showExpected ? (
                          <p className="mt-1 text-xs font-medium text-[#1B1D60]">
                            Expected by {expectedDelivery}
                          </p>
                        ) : null}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        );
      })}

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          orderId={orderId}
          getProductTitle={itemProps.getProductTitle}
          onClose={() => setReviewTarget(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </section>
  );
}

export default OrderItemsSection;
