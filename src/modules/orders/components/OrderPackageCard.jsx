import {
  Truck,
  Package,
  ExternalLink,
  Check,
  X,
  Download,
  FileText,
} from "lucide-react";
import Button from "../../../components/ui/buttons/Button";
import { OrderItemCard } from "./OrderItemCard";
import { OrderItemReviewAction, ExistingReviewCard } from "./OrderItemReview";
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
import {
  dateTime,
  TIMELINE_STEPS,
  STATUS_RANK,
  getCancellationSteps,
  getReturnSteps,
} from "../utils/orderTimelineUtils";

export function OrderPackageCard({
  group,
  groupIndex,
  totalGroups,
  itemFulfillment,
  isSingleItemView,
  reviewByItem,
  checkedReviewKeys,
  setReviewTarget,
  orderId,
  orderStatus,
  returns = [],
  cancellations = [],
  ...itemProps
}) {
  const shipment = group.shipments[0] || {};
  const expectedDelivery = group.expectedDeliveryAt;
  const groupItemTimelineEvents = group.items.flatMap((i) => i.timeline || []);
  const parentTimelineEvents =
    itemProps.orderTimeline || itemProps.timeline || [];
  const shipmentEvents = shipment.trackingEvents || [];
  const events = [
    ...shipmentEvents,
    ...groupItemTimelineEvents,
    ...parentTimelineEvents,
  ].sort(
    (left, right) =>
      new Date(right.event_time || right.created_at || 0) -
      new Date(left.event_time || left.created_at || 0),
  );

  const allStatuses = [
    group.status,
    shipment.status,
    ...group.items.flatMap((i) => [
      i.status,
      i.effective_status,
      i.delivery_status,
      i.deliveryStatus,
      i.cancellation_status,
    ]),
    ...events.flatMap((e) => [e.status, e.to_status, e.toStatus, e.reason]),
  ].filter(Boolean);

  const currentRank = Math.max(
    1,
    ...allStatuses.map((s) => STATUS_RANK[s] || 0),
  );
  const isDelivered = currentRank >= 5;
  const activeColor = "bg-[#26A541]";
  const activeText = "text-[#26A541]";

  const groupCancellation = cancellations.find((c) =>
    c.items?.some((ci) =>
      group.items.some((gi) => (gi.id || gi._id) === ci.orderItemId),
    ),
  );
  const groupReturn = returns.find((r) =>
    r.items?.some((ri) =>
      group.items.some(
        (gi) =>
          (gi.id || gi._id) ===
          (ri.orderItemId || ri.order_item_id || ri.itemId || ri.item_id),
      ),
    ),
  );

  const orderedGroupQuantity = group.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const cancelledGroupQuantity = group.items.reduce(
    (sum, item) =>
      sum + Number(item.cancelled_quantity || item.cancelledQuantity || 0),
    0,
  );
  const isFullyCancelled =
    orderedGroupQuantity > 0 && cancelledGroupQuantity >= orderedGroupQuantity;

  const hasCancellationEvent = group.items.some(
    (gi) =>
      gi.cancellation_status ||
      gi.cancellationStatus ||
      gi.cancellation_lifecycle ||
      gi.timeline?.some(
        (t) =>
          t.source === "cancellation" ||
          t.status?.includes("cancellation") ||
          t.to_status?.includes("cancellation"),
      ),
  );

  const isCancelled =
    group.status === "cancelled" ||
    group.status === "cancellation_requested" ||
    group.status === "cancellation_approved" ||
    Boolean(groupCancellation) ||
    hasCancellationEvent ||
    isFullyCancelled;

  const isPartiallyCancelled = cancelledGroupQuantity > 0 && !isFullyCancelled;
  const returnedGroupQuantity = group.items.reduce(
    (sum, item) => sum + getReturnedQuantityForItem(returns, item),
    0,
  );
  const nonCancelledGroupQuantity = Math.max(
    orderedGroupQuantity - cancelledGroupQuantity,
    0,
  );
  const isFullyReturned =
    nonCancelledGroupQuantity > 0 &&
    returnedGroupQuantity >= nonCancelledGroupQuantity;
  const resolvedGroupReturn =
    groupReturn ||
    group.items
      .map(
        (i) =>
          group.returnByItem?.get(getItemId(i)) ||
          resolveReturnForItem(returns, i),
      )
      .find(Boolean);

  const hasReturnRequest =
    Boolean(resolvedGroupReturn) ||
    group.status === "returned" ||
    Boolean(group.status?.includes("return")) ||
    group.items.some((item) => {
      const returnReq =
        group.returnByItem?.get(getItemId(item)) ||
        resolveReturnForItem(returns, item);
      return (
        Boolean(returnReq) ||
        Boolean(item.return_lifecycle) ||
        Boolean(item.return_status)
      );
    });

  const isReturned = hasReturnRequest || isFullyReturned;
  const isPartiallyReturned = returnedGroupQuantity > 0 && !isFullyReturned;

  const packageItemIds = group.items.map((i) => String(getItemId(i)));

  const packageDocuments = (itemProps.downloadableDocuments || []).filter(
    (doc) => {
      if (totalGroups === 1) {
        return true;
      }
      if (doc.type === "platform_fee" || doc.type === "order_receipt") {
        return false;
      }
      if (doc.type === "tax_invoice") {
        const coveredItemIds = (
          doc.invoice?.metadata?.items ||
          doc.invoice?.metadata?.lineItems ||
          []
        ).map((i) => String(i.orderItemId || i.order_item_id || i.id || i._id));
        if (coveredItemIds.length > 0) {
          return packageItemIds.some((id) => coveredItemIds.includes(id));
        } else {
          const docSellerName =
            doc.invoice?.sellerName ||
            doc.invoice?.metadata?.seller?.businessName ||
            doc.invoice?.metadata?.seller?.displayName;
          return docSellerName === group.sellerName;
        }
      }
      if (doc.type === "return_reverse") {
        const returnItemIds = (doc.returnRequest?.items || []).map((i) =>
          String(i.orderItemId || i.order_item_id || i.itemId || i.item_id),
        );
        return packageItemIds.some((id) => returnItemIds.includes(id));
      }
      if (doc.type === "cancellation_reverse") {
        const cancelItemIds = (doc.cancellation?.items || []).map((i) =>
          String(i.orderItemId || i.order_item_id),
        );
        return packageItemIds.some((id) => cancelItemIds.includes(id));
      }
      return false;
    },
  );

  const hasPackageReview = group.items.some(
    (item) =>
      isSingleItemView &&
      Boolean(reviewByItem[reviewKeyForItem(orderId, item)]),
  );

  return (
    <div
      key={group.key}
      className="grid rounded-xl border border-[#E7D9B8] bg-[#FFFDF8] w-full min-w-0 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1.2fr)_380px] overflow-hidden"
    >
      {/* Left Column: Items and Courier */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 min-w-0 w-full">
        <div className="-mx-4 lg:-ml-5 lg:-mr-6 flex items-center justify-between gap-4 border-b border-[#ede4cf] px-4 lg:pl-5 lg:pr-6 pb-4">
          <h3 className="font-bold text-[#1B1D60] text-base md:text-lg truncate flex-1 min-w-0">
            Package:{" "}
            {group.items
              .map((i) => itemProps.getProductTitle(i).split(" - ")[0])
              .join(", ")}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isCancelled ||
              group.status === "cancelled" ||
              group.status === "cancellation_requested" ||
              group.status === "cancellation_approved"
                ? "bg-[#FCE8E8] text-[#991B1B]"
                : isReturned ||
                  group.status === "returned"
                ? "bg-[#FFF9EA] text-[#B88200]"
                : group.status === "delivered" || group.status === "fulfilled"
                ? "bg-[#E6F4EA] text-[#0D652D]"
                : "bg-[#F0F1FF] text-[#201B78]"
            }`}
          >
            {label(
              isCancelled
                ? groupCancellation?.status ||
                    group.items.find((i) => i.cancellation_status)
                      ?.cancellation_status ||
                    group.items
                      .flatMap((i) => i.timeline || [])
                      .find(
                        (t) =>
                          t.source === "cancellation" ||
                          t.status?.includes("cancellation"),
                      )?.status ||
                    "cancellation_approved"
                : group.status || "confirmed",
            )}
          </span>
        </div>

        <div className="grid gap-4">
          {group.items.map((item, index) => {
            const policy = getItemReturnPolicy(item);
            const itemId = getItemId(item);
            const fulfillment = itemFulfillment.get(itemId) || {};
            const returnRequest =
              group.returnByItem.get(itemId) ||
              resolveReturnForItem(returns, item);
            const returnedQuantity = getReturnedQuantityForItem(returns, item);
            const returnableQuantity = getReturnableQuantityForItem(
              returns,
              item,
            );

            return (
              <div key={item.id || item._id || index} className="grid gap-3">
                <OrderItemCard
                  item={item}
                  {...itemProps}
                  compact={true}
                  cancelledQuantity={Number(
                    item.cancelled_quantity || item.cancelledQuantity || 0,
                  )}
                  returnedQuantity={returnedQuantity}
                  delivered={Boolean(fulfillment.delivered)}
                  effectiveStatus={fulfillment.status}
                />
                <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                  <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#2E2E2E]">
                    <span className="flex items-center h-6">
                      {policy.returnable
                        ? `Returnable${policy.days ? ` for ${policy.days} days` : ""}`
                        : "Non-returnable"}
                    </span>
                    {returnRequest && (
                      <span className="flex items-center h-6 rounded-full bg-blue-50 px-3 text-blue-700">
                        {label(fulfillment.status)}
                      </span>
                    )}
                  </div>
                  {isSingleItemView &&
                    fulfillment.delivered &&
                    returnedQuantity === 0 &&
                    Boolean(getReviewProductId(item)) &&
                    !reviewByItem[reviewKeyForItem(orderId, item)] && (
                      <OrderItemReviewAction
                        item={item}
                        orderId={orderId}
                        canReview
                        existingReview={null}
                        reviewChecked={Boolean(
                          checkedReviewKeys[reviewKeyForItem(orderId, item)],
                        )}
                        onReviewClick={setReviewTarget}
                      />
                    )}
                </div>
                {isSingleItemView &&
                  fulfillment.delivered &&
                  returnedQuantity === 0 &&
                  Boolean(getReviewProductId(item)) &&
                  reviewByItem[reviewKeyForItem(orderId, item)] && (
                    <div className="w-full mt-1">
                      <ExistingReviewCard
                        review={reviewByItem[reviewKeyForItem(orderId, item)]}
                      />
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Courier Info */}
        {!isCancelled && (
          <div className="mt-2">
            <div className="grid grid-cols-2 items-center gap-4 sm:gap-6 rounded-lg bg-white p-3 border border-[#E7D9B8]">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-[#6F7480] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[#6F7480]">Courier</p>
                  <p className="text-sm font-semibold text-[#1B1D60] truncate">
                    {shipment.courier_name || "Seller Delivery"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package size={20} className="text-[#6F7480] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[#6F7480]">Tracking ID</p>
                  <p className="text-sm font-semibold text-[#1B1D60] truncate">
                    {shipment.tracking_number ||
                      shipment.awb_number ||
                      "Will be added after dispatch"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(isCancelled || isReturned) && (groupCancellation || groupReturn) && (
          <div className="mt-3">
            <div className="grid grid-cols-2 items-center gap-4 sm:gap-6 rounded-lg bg-[#FFF9EA] p-3 border border-[#CE9F2D] border-opacity-30">
              <div className="min-w-0">
                <p className="text-xs text-[#8A5A00]">
                  {isReturned ? "Return ID" : "Cancellation ID"}
                </p>
                <p className="text-sm font-semibold text-[#1B1D60] truncate">
                  {isReturned
                    ? groupReturn?.returnNumber ||
                      groupReturn?.return_number ||
                      groupReturn?.id ||
                      groupReturn?._id ||
                      "N/A"
                    : groupCancellation?.cancellationNumber ||
                      groupCancellation?.cancellation_number ||
                      groupCancellation?.id ||
                      groupCancellation?._id ||
                      "N/A"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#8A5A00]">Refund Amount</p>
                <p className="text-sm font-bold text-[#1B1D60] truncate">
                  {itemProps.formatMoney
                    ? itemProps.formatMoney(
                        isReturned
                          ? groupReturn?.refundAmount ||
                              groupReturn?.refund?.requestedAmount ||
                              groupReturn?.refund?.amount ||
                              groupReturn?.refund_amount ||
                              groupReturn?.refundBreakup?.totalRefundAmount ||
                              groupReturn?.refund_breakup
                                ?.total_refund_amount ||
                              group.items[0]?.return_lifecycle?.refundAmount ||
                              group.items[0]?.return_lifecycle?.refund_amount ||
                              group.items[0]?.returnLifecycle?.refundAmount ||
                              0
                          : groupCancellation?.refundAmount ||
                              groupCancellation?.refund_amount ||
                              groupCancellation?.refund?.requestedAmount ||
                              groupCancellation?.refund?.amount ||
                              groupCancellation?.refundBreakup
                                ?.totalRefundAmount ||
                              groupCancellation?.refund_breakup
                                ?.total_refund_amount ||
                              group.items[0]?.cancellation_lifecycle
                                ?.refundAmount ||
                              0,
                        itemProps.currency,
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Tracking Timeline */}
      <div className="flex flex-col gap-4 border-t border-[#E7D9B8] xl:border-t-0 xl:border-l p-4 sm:p-5 min-w-0 w-full">
        <div className="-mx-4 sm:-mx-5 flex items-center justify-between gap-3 border-b border-[#ede4cf] px-4 sm:px-5 pb-4">
          <h3 className="font-bold text-[#1B1D60] text-base md:text-lg whitespace-nowrap">
            Tracking Timeline
          </h3>
          {shipment.tracking_url && (
            <a
              href={shipment.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#1B1D60] font-medium hover:underline shrink-0"
            >
              <span className="truncate max-w-[120px] sm:max-w-none">
                Track on courier site
              </span>{" "}
              <ExternalLink size={16} className="shrink-0" />
            </a>
          )}
        </div>

        <div>
          {(() => {
            if (isCancelled || isReturned) {
              let steps = [];
              if (isCancelled) {
                steps = getCancellationSteps(
                  groupCancellation,
                  group,
                  itemProps.currency,
                  itemProps.formatMoney,
                  itemProps.isCodOrder,
                );
              } else if (isReturned) {
                steps = getReturnSteps(
                  resolvedGroupReturn,
                  group,
                  itemProps.currency,
                  itemProps.formatMoney,
                  itemProps.isCodOrder,
                );
              }
              return steps.map((step, stepIndex) => {
                const isCompleted = step.completed;
                const isCancelledStep =
                  step.status === "cancelled" ||
                  step.status === "cancellation_requested";
                const isLast = stepIndex === steps.length - 1;
                const lineDelay = `${stepIndex * 0.35}s`;
                const ballDelay = `${stepIndex * 0.35}s`;
                const displayTime = step.time ? dateTime(step.time) : null;

                const isNextStepCompleted =
                  stepIndex < steps.length - 1 &&
                  steps[stepIndex + 1].completed;

                const nextIsCancelled =
                  stepIndex < steps.length - 1 &&
                  (steps[stepIndex + 1].status === "cancelled" ||
                    steps[stepIndex + 1].status === "cancellation_requested");

                const lineColor = nextIsCancelled
                  ? "bg-[#E53935]"
                  : "bg-[#26A541]";

                return (
                  <div
                    key={step.status}
                    className="relative pb-6 pl-7 last:pb-0"
                  >
                    {!isLast && (
                      <span className="absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] bg-[#E0E0E0] z-0" />
                    )}
                    {!isLast && isCompleted && isNextStepCompleted && (
                      <span
                        className={`absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] ${lineColor} origin-top animate-timeline-line z-0`}
                        style={{ animationDelay: lineDelay }}
                      />
                    )}

                    {isCompleted ? (
                      <span
                        className={`absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full flex items-center justify-center ${
                          isCancelledStep
                            ? "animate-ball-fill-red"
                            : "animate-ball-fill-green"
                        } ${
                          isLast || !isNextStepCompleted
                            ? "animate-timeline-pulse"
                            : ""
                        }`}
                        style={{ animationDelay: ballDelay }}
                      >
                        {isCancelledStep ? (
                          <X className="h-2.5 w-2.5 stroke-[3] text-current" />
                        ) : (
                          <Check className="h-2.5 w-2.5 stroke-[3] text-current" />
                        )}
                      </span>
                    ) : (
                      <span className="absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full border border-[#D7D7D7] bg-[#F5F5F5] flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 stroke-[2] text-[#B0B0B0]" />
                      </span>
                    )}

                    {/* Timeline step text content - Always fully visible */}
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? isCancelledStep
                              ? "text-[#E53935]"
                              : "text-[#2E2E2E]"
                            : "text-[#6F7480]"
                        }`}
                      >
                        {step.label}
                      </p>

                      {step.note && (
                        <ShowMoreText
                          text={
                            typeof step.note === "string"
                              ? step.note.replace(/_/g, " ")
                              : step.note
                          }
                          mode="lines"
                          limit={1}
                          className="mt-1 block"
                          textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                          buttonClassName="text-[11px] font-semibold text-[#26A541] hover:underline ml-1"
                          moreLabel="Show more"
                          lessLabel="Show less"
                        />
                      )}

                      {isCompleted && displayTime && (
                        <p className="mt-1 text-xs font-medium text-[#6F7480]">
                          {displayTime}
                        </p>
                      )}
                    </div>
                  </div>
                );
              });
            }

            return TIMELINE_STEPS.map((step, stepIndex) => {
              const stepRank = STATUS_RANK[step.status];
              const isCompleted = currentRank >= stepRank;

              // Find matching event from API if completed
              const matchingEvent = isCompleted
                ? events.find(
                    (e) =>
                      e.status === step.status ||
                      e.to_status === step.status ||
                      e.toStatus === step.status ||
                      (step.status === "delivered" &&
                        (e.status === "delivered" ||
                          e.to_status === "delivered" ||
                          e.toStatus === "delivered" ||
                          e.status === "fulfilled" ||
                          e.to_status === "fulfilled" ||
                          e.reason === "seller_marked_delivered" ||
                          e.status === "completed" ||
                          e.to_status === "completed")) ||
                      (step.status === "in_transit" &&
                        (e.status === "shipped" ||
                          e.to_status === "shipped" ||
                          e.status === "in_transit" ||
                          e.to_status === "in_transit" ||
                          e.status === "out_for_delivery" ||
                          e.to_status === "out_for_delivery" ||
                          e.status === "ready_to_ship" ||
                          e.status === "packed")) ||
                      (step.status === "confirmed" &&
                        (e.status === "initiated" ||
                          e.to_status === "initiated" ||
                          e.status === "pending_payment" ||
                          e.to_status === "pending_payment" ||
                          e.status === "confirmed" ||
                          e.to_status === "confirmed")),
                  )
                : null;
              const displayTime = matchingEvent
                ? dateTime(matchingEvent.event_time || matchingEvent.created_at)
                : null;

              // Expected logic
              const isExpectedDelivery =
                step.status === "delivered" ||
                step.status === "out_for_delivery";
              const showExpected =
                !isCompleted && isExpectedDelivery && expectedDelivery;

              const isNextStepCompleted =
                stepIndex < TIMELINE_STEPS.length - 1 &&
                currentRank >=
                  STATUS_RANK[TIMELINE_STEPS[stepIndex + 1].status];
              const isLast = stepIndex === TIMELINE_STEPS.length - 1;
              const lineDelay = `${stepIndex * 0.35}s`;
              const ballDelay = `${stepIndex * 0.35}s`;
              const isCurrentActive =
                isCompleted && (!isNextStepCompleted || isLast);

              let fallbackTime =
                shipment.updated_at || group.expectedDeliveryAt;
              if (step.status === "confirmed")
                fallbackTime = group.items[0]?.created_at || fallbackTime;

              return (
                <div key={step.status} className="relative pb-6 pl-7 last:pb-0">
                  {!isLast && (
                    <span className="absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] bg-[#E0E0E0] z-0" />
                  )}
                  {!isLast && isCompleted && isNextStepCompleted && (
                    <span
                      className="absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] bg-[#26A541] origin-top animate-timeline-line z-0"
                      style={{ animationDelay: lineDelay }}
                    />
                  )}

                  {isCompleted ? (
                    <span
                      className={`absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full flex items-center justify-center animate-ball-fill-green ${
                        isCurrentActive ? "animate-timeline-pulse" : ""
                      }`}
                      style={{ animationDelay: ballDelay }}
                    >
                      <Check className="h-2.5 w-2.5 stroke-[3] text-current" />
                    </span>
                  ) : (
                    <span className="absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full border border-[#D7D7D7] bg-[#F5F5F5] flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 stroke-[2] text-[#B0B0B0]" />
                    </span>
                  )}

                  {/* Timeline step text content - Always fully visible */}
                  <div>
                    <p
                      className={`text-sm font-semibold ${isCompleted ? "text-[#2E2E2E]" : "text-[#6F7480]"}`}
                    >
                      {step.label}
                    </p>

                    {matchingEvent?.note ? (
                      <ShowMoreText
                        text={
                          typeof matchingEvent.note === "string"
                            ? matchingEvent.note.replace(/_/g, " ")
                            : matchingEvent.note
                        }
                        mode="lines"
                        limit={1}
                        className="mt-1 block"
                        textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                        buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                        moreLabel="Show more"
                        lessLabel="Show less"
                      />
                    ) : isCompleted && step.status === "confirmed" ? (
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
                    ) : isCompleted && step.status === "in_transit" ? (
                      <ShowMoreText
                        text="Your package is on the way to the delivery address."
                        mode="lines"
                        limit={1}
                        className="mt-1 block"
                        textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                        buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                        moreLabel="Show more"
                        lessLabel="Show less"
                      />
                    ) : !isCompleted && step.status === "in_transit" ? (
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
                </div>
              );
            });
          })()}
        </div>

        {hasPackageReview && packageDocuments.length > 0 && (
          <div className="mt-4 border-t border-[#ede4cf] pt-4 flex flex-col gap-3">
            <h4 className="font-bold text-[#1B1D60] flex items-center gap-2 text-sm">
              <FileText size={16} className="text-[#3E4093]" /> Package
              Documents
            </h4>
            <div className="flex flex-col gap-2">
              {packageDocuments.map((document) => (
                <div
                  key={`${document.title}-${document.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 text-sm transition-all hover:border-[#CE9F2D80]"
                >
                  <div className="min-w-0 flex items-center gap-1.5">
                    <FileText size={15} className="text-[#3E4093] shrink-0" />
                    <span className="font-semibold text-[13px] text-[#2E2E2E] truncate">
                      {document.title}
                    </span>
                  </div>
                  {document.pending ? (
                    <span className="rounded-full bg-[#CE9F2D1A] px-2.5 py-0.5 text-[11px] font-bold text-[#CE9F2D] shrink-0">
                      Pending
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={
                        itemProps.downloadingId === document.downloadPath
                      }
                      onClick={() =>
                        itemProps.handleDownload(
                          document.downloadPath,
                          document.filename,
                        )
                      }
                      className="border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA] h-7 text-xs px-3 shrink-0"
                    >
                      <Download size={12} /> Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!hasPackageReview && packageDocuments.length > 0 && (
        <div className="col-span-full border-t border-[#E7D9B8] p-3 sm:p-4 bg-[#FFFDF8] rounded-b-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
            {packageDocuments.map((document) => (
              <div
                key={`${document.title}-${document.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 transition-all hover:border-[#CE9F2D80]"
              >
                <div className="min-w-0 flex items-center gap-2 flex-1">
                  <FileText size={15} className="text-[#3E4093] shrink-0" />
                  <span
                    title={document.title}
                    className="font-semibold text-[13px] text-[#2E2E2E] truncate"
                  >
                    {document.title}
                  </span>
                </div>
                {document.pending ? (
                  <span className="rounded-full bg-[#CE9F2D1A] px-2.5 py-0.5 text-[11px] font-bold text-[#CE9F2D] shrink-0">
                    Pending
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={itemProps.downloadingId === document.downloadPath}
                    onClick={() =>
                      itemProps.handleDownload(
                        document.downloadPath,
                        document.filename,
                      )
                    }
                    className="border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA] h-7 text-xs px-3 shrink-0 gap-1.5"
                  >
                    <Download size={12} /> Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
