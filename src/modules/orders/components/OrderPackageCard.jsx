import { useMemo } from "react";
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
import { OrderTimeline } from "./OrderTimeline";
import { ReturnStatus } from "./ReturnStatus";
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
  const {
    shipment,
    expectedDelivery,
    events,
    currentRank,
    isDelivered,
    resolvedCancellationStatus,
    isCancelled,
    isReturned,
    resolvedGroupReturn,
    groupCancellation,
    groupReturn,
    packageDocuments,
    hasPackageReview,
  } = useMemo(() => {
    const shipment = group?.shipments?.[0] || {};
    const expectedDelivery = group?.expectedDeliveryAt;
    const items = group?.items || [];
    
    const groupItemTimelineEvents = items.flatMap((i) => i?.timeline || []);
    const parentTimelineEvents = itemProps.orderTimeline || itemProps.timeline || [];
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
      group?.status,
      shipment.status,
      ...items.flatMap((i) => [
        i?.status,
        i?.effective_status,
        i?.delivery_status,
        i?.deliveryStatus,
        i?.cancellation_status,
      ]),
      ...events.flatMap((e) => [e?.status, e?.to_status, e?.toStatus, e?.reason]),
    ].filter(Boolean);

    const currentRank = Math.max(
      0,
      ...allStatuses.map((s) => STATUS_RANK[s] || 0),
    );
    const isDelivered = currentRank >= 5;

    const groupCancellation = cancellations.find((c) =>
      c.items?.some((ci) =>
        items.some((gi) => (gi.id || gi._id) === ci.orderItemId),
      ),
    );
    const groupReturn = returns.find((r) =>
      r.items?.some((ri) =>
        items.some(
          (gi) =>
            (gi.id || gi._id) ===
            (ri.orderItemId || ri.order_item_id || ri.itemId || ri.item_id),
        ),
      ),
    );

    const orderedGroupQuantity = items.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0,
    );
    const cancelledGroupQuantity = items.reduce(
      (sum, item) =>
        sum + Number(item?.cancelled_quantity || item?.cancelledQuantity || 0),
      0,
    );
    const isFullyCancelled =
      orderedGroupQuantity > 0 && cancelledGroupQuantity >= orderedGroupQuantity;

    const hasCancellationEvent = items.some(
      (gi) =>
        gi?.cancellation_status ||
        gi?.cancellationStatus ||
        gi?.cancellation_lifecycle ||
        gi?.timeline?.some(
          (t) =>
            t.source === "cancellation" ||
            t.status?.includes("cancellation") ||
            t.to_status?.includes("cancellation"),
        ),
    );

    const isCancelled =
      group?.status === "cancelled" ||
      group?.status === "cancellation_requested" ||
      group?.status === "cancellation_approved" ||
      Boolean(groupCancellation) ||
      hasCancellationEvent ||
      isFullyCancelled;

    const resolvedCancellationStatus = isCancelled
      ? groupCancellation?.metadata?.approvedAt ||
        groupCancellation?.status === "approved" ||
        groupCancellation?.status === "completed" ||
        groupCancellation?.status === "cancellation_approved" ||
        items.some((i) => i?.effective_status === "cancellation_approved")
        ? "cancellation_approved"
        : groupCancellation?.status === "manual_review" ||
          groupCancellation?.status === "requested"
          ? "cancellation_requested"
          : groupCancellation?.status ||
            items.find((i) => i?.cancellation_status)?.cancellation_status ||
            items
              .flatMap((i) => i?.timeline || [])
              .find(
                (t) =>
                  t.source === "cancellation" ||
                  t.status?.includes("cancellation"),
              )?.status ||
            "cancellation_approved"
      : group?.status || "confirmed";

    const isPartiallyCancelled = cancelledGroupQuantity > 0 && !isFullyCancelled;
    const returnedGroupQuantity = items.reduce(
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
      items
        .map(
          (i) =>
            group?.returnByItem?.get(getItemId(i)) ||
            resolveReturnForItem(returns, i),
        )
        .find(Boolean);

    const hasReturnRequest =
      Boolean(resolvedGroupReturn) ||
      group?.status === "returned" ||
      Boolean(group?.status?.includes("return")) ||
      items.some((item) => {
        const returnReq =
          group?.returnByItem?.get(getItemId(item)) ||
          resolveReturnForItem(returns, item);
        return (
          Boolean(returnReq) ||
          Boolean(item?.return_lifecycle) ||
          Boolean(item?.return_status)
        );
      });

    const isReturned = hasReturnRequest || isFullyReturned;

    const packageItemIds = items.map((i) => String(getItemId(i)));

    const packageDocuments = (itemProps.downloadableDocuments || []).filter(
      (doc) => {
        const isTaxOrReceipt = doc.type === "tax_invoice" || doc.type === "order_receipt";
        if (isTaxOrReceipt && !isDelivered) {
          return false;
        }

        if (totalGroups === 1) {
          return true;
        }
        if (doc.type === "platform_fee" || doc.type === "order_receipt") {
          return false;
        }
        if (doc.type === "tax_invoice") {
          if (!isDelivered) {
            return false;
          }
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
            return docSellerName === group?.sellerName;
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

    const hasPackageReview = items.some(
      (item) =>
        isSingleItemView &&
        Boolean(reviewByItem?.[reviewKeyForItem(orderId, item)]),
    );

    return {
      shipment,
      expectedDelivery,
      events,
      currentRank,
      isDelivered,
      resolvedCancellationStatus,
      isCancelled,
      isReturned,
      resolvedGroupReturn,
      groupCancellation,
      groupReturn,
      packageDocuments,
      hasPackageReview,
    };
  }, [
    group,
    itemProps.orderTimeline,
    itemProps.timeline,
    returns,
    cancellations,
    itemProps.downloadableDocuments,
    totalGroups,
    reviewByItem,
    orderId,
    isSingleItemView,
  ]);

  return (
    <div
      key={group.key}
      className="grid rounded-xl border border-[#E7D9B8] bg-[#FFFDF8] w-full min-w-0  xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1.2fr)_360px] overflow-hidden"
    >
      {/* Left Column: Items and Courier */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 min-w-0 w-full">
        <div className="-mx-4 lg:-ml-5 lg:-mr-6 flex items-center justify-between gap-4 border-b border-[#ede4cf] px-4 lg:pl-5 lg:pr-6 pb-4">
          <h3 className="font-bold text-[#1B1D60] text-base md:text-lg truncate flex-1 min-w-0">
            {group.items
              .map((i) => itemProps.getProductTitle(i).split(" - ")[0])
              .join(", ")}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              resolvedCancellationStatus === "cancellation_approved"
                ? "bg-[#E6F4EA] text-[#0D652D]"
                : isCancelled ||
                  group.status === "cancelled" ||
                  group.status === "cancellation_requested"
                  ? "bg-[#FCE8E8] text-[#991B1B]"
                  : isReturned || group.status === "returned"
                    ? "bg-[#FFF9EA] text-[#B88200]"
                    : group.status === "delivered" || group.status === "fulfilled"
                      ? "bg-[#E6F4EA] text-[#0D652D]"
                      : "bg-[#F0F1FF] text-[#201B78]"
            }`}
          >
            {label(resolvedCancellationStatus)}
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
                  expectedDeliveryAt={
                    group.expectedDeliveryAt ||
                    shipment.expected_delivery_at ||
                    shipment.expectedDeliveryAt
                  }
                  cancelledQuantity={Number(
                    item.cancelled_quantity || item.cancelledQuantity || 0,
                  )}
                  returnedQuantity={returnedQuantity}
                  delivered={Boolean(fulfillment.delivered)}
                  effectiveStatus={fulfillment.status}
                />
                {fulfillment.delivered &&
                  returnedQuantity === 0 &&
                  Boolean(getReviewProductId(item)) &&
                  !reviewByItem[reviewKeyForItem(orderId, item)] && (
                    <div className="flex flex-wrap items-center justify-end gap-4 w-full">
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
                    </div>
                  )}
                {fulfillment.delivered &&
                  returnedQuantity === 0 &&
                  Boolean(getReviewProductId(item)) &&
                  reviewByItem[reviewKeyForItem(orderId, item)] && (
                    <div className="w-full">
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

        <ReturnStatus
          isCancelled={isCancelled}
          isReturned={isReturned}
          groupCancellation={groupCancellation}
          groupReturn={groupReturn}
          group={group}
          formatMoney={itemProps.formatMoney}
          currency={itemProps.currency}
        />
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
          <OrderTimeline
            isCancelled={isCancelled}
            isReturned={isReturned}
            groupCancellation={groupCancellation}
            resolvedGroupReturn={resolvedGroupReturn}
            group={group}
            events={events}
            currentRank={currentRank}
            shipment={shipment}
            expectedDelivery={expectedDelivery}
            {...itemProps}
          />
        </div>

        {hasPackageReview && (itemProps.invoicesLoading || packageDocuments.length > 0) && (
          <div className="mt-4 border-t border-[#ede4cf] pt-4 flex flex-col gap-3">
            <h4 className="font-bold text-[#1B1D60] flex items-center gap-2 text-sm">
              <FileText size={16} className="text-[#3E4093]" /> Package
              Documents
            </h4>
            <div className="flex flex-col gap-2">
              {itemProps.invoicesLoading ? (
                [1, 2].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 animate-pulse"
                  >
                    <div className="min-w-0 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#E7D9B8] shrink-0" />
                      <div className="h-4 bg-[#E7D9B8] rounded w-24" />
                    </div>
                    <div className="h-7 w-20 bg-[#E7D9B8] rounded shrink-0" />
                  </div>
                ))
              ) : (
                packageDocuments.map((document) => (
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
              )))}
            </div>
          </div>
        )}
      </div>

      {!hasPackageReview && (itemProps.invoicesLoading || packageDocuments.length > 0) && (
        <div className="col-span-full border-t border-[#E7D9B8] p-3 sm:p-4 bg-[#FFFDF8] rounded-b-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
            {itemProps.invoicesLoading ? (
              [1, 2].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 animate-pulse"
                >
                  <div className="min-w-0 flex items-center gap-2 flex-1">
                    <div className="w-4 h-4 rounded bg-[#E7D9B8] shrink-0" />
                    <div className="h-4 bg-[#E7D9B8] rounded w-24" />
                  </div>
                  <div className="h-7 w-20 bg-[#E7D9B8] rounded shrink-0" />
                </div>
              ))
            ) : (
              packageDocuments.map((document) => (
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
            )))}
          </div>
        </div>
      )}
    </div>
  );
}
