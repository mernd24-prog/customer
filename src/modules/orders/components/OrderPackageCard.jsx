import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";
import { OrderTimeline } from "./OrderTimeline";
import { ReturnStatus } from "./ReturnStatus";
import { OrderItemCard } from "./OrderItemCard";
import { ExistingReviewCard } from "./OrderItemReview";
import {
  getReviewProductId,
  reviewKeyForItem,
  getItemId,
  resolveReturnForItem,
  getItemReturnPolicy,
  getReturnedQuantityForItem,
  getReturnableQuantityForItem,
  getCancellationDisplayStatus,
} from "../utils/orderItems";
import { STATUS_RANK } from "../utils/orderTimelineUtils";
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
      group?.status,
      shipment.status,
      ...items.flatMap((i) => [
        i?.status,
        i?.effective_status,
        i?.delivery_status,
        i?.deliveryStatus,
        i?.cancellation_status,
      ]),
      ...events.flatMap((e) => [
        e?.status,
        e?.to_status,
        e?.toStatus,
        e?.reason,
      ]),
    ].filter(Boolean);

    const currentRank = Math.max(
      0,
      ...allStatuses.map((status) => STATUS_RANK[status] || 0),
    );
    const isDelivered = currentRank >= 5;

    const groupCancellation = cancellations.find((cancellation) =>
      cancellation.items?.some((cancellationItem) =>
        items.some(
          (groupItem) =>
            (groupItem.id || groupItem._id) === cancellationItem.orderItemId,
        ),
      ),
    );

    const groupReturn = returns.find((returnItem) =>
      returnItem.items?.some((returnRequestItem) =>
        items.some(
          (groupItem) =>
            (groupItem.id || groupItem._id) ===
            (returnRequestItem.orderItemId ||
              returnRequestItem.order_item_id ||
              returnRequestItem.itemId ||
              returnRequestItem.item_id),
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
      orderedGroupQuantity > 0 &&
      cancelledGroupQuantity >= orderedGroupQuantity;

    const hasCancellationEvent = items.some(
      (groupItem) =>
        groupItem?.cancellation_status ||
        groupItem?.cancellationStatus ||
        groupItem?.cancellation_lifecycle ||
        groupItem?.timeline?.some(
          (timelineEvent) =>
            timelineEvent.source === "cancellation" ||
            timelineEvent.status?.includes("cancellation") ||
            timelineEvent.to_status?.includes("cancellation"),
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
      ? groupCancellation
        ? getCancellationDisplayStatus(groupCancellation, items[0])
        : items.find((item) => item?.effective_status)?.effective_status ||
          group?.status ||
          items.find((item) => item?.cancellation_status)
            ?.cancellation_status ||
          items
            .flatMap((item) => item?.timeline || [])
            .find(
              (timelineEvent) =>
                timelineEvent.source === "cancellation" ||
                timelineEvent.status?.includes("cancellation"),
            )?.status ||
          "cancelled"
      : group?.status || "confirmed";

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
          (item) =>
            group?.returnByItem?.get(getItemId(item)) ||
            resolveReturnForItem(returns, item),
        )
        .find(Boolean);

    const hasReturnRequest =
      Boolean(resolvedGroupReturn) ||
      group?.status === "returned" ||
      Boolean(group?.status?.includes("return")) ||
      items.some((item) => {
        const returnRequest =
          group?.returnByItem?.get(getItemId(item)) ||
          resolveReturnForItem(returns, item);

        return (
          Boolean(returnRequest) ||
          Boolean(item?.return_lifecycle) ||
          Boolean(item?.return_status)
        );
      });

    const isReturned = hasReturnRequest || isFullyReturned;

    const packageItemIds = items.map((item) => String(getItemId(item)));

    const packageDocuments = (itemProps.downloadableDocuments || []).filter(
      (document) => {
        const isTaxOrReceipt =
          document.type === "tax_invoice" || document.type === "order_receipt";

        if (isTaxOrReceipt && !isDelivered) {
          return false;
        }

        if (totalGroups === 1) {
          return true;
        }

        if (
          document.type === "platform_fee" ||
          document.type === "order_receipt"
        ) {
          return false;
        }

        if (document.type === "tax_invoice") {
          if (!isDelivered) {
            return false;
          }

          const coveredItemIds = (
            document.invoice?.metadata?.items ||
            document.invoice?.metadata?.lineItems ||
            []
          ).map((invoiceItem) =>
            String(
              invoiceItem.orderItemId ||
                invoiceItem.order_item_id ||
                invoiceItem.id ||
                invoiceItem._id,
            ),
          );

          if (coveredItemIds.length > 0) {
            return packageItemIds.some((id) => coveredItemIds.includes(id));
          }

          const docSellerName =
            document.invoice?.sellerName ||
            document.invoice?.metadata?.seller?.businessName ||
            document.invoice?.metadata?.seller?.displayName;

          return docSellerName === group?.sellerName;
        }

        if (document.type === "return_reverse") {
          const returnItemIds = (document.returnRequest?.items || []).map(
            (returnRequestItem) =>
              String(
                returnRequestItem.orderItemId ||
                  returnRequestItem.order_item_id ||
                  returnRequestItem.itemId ||
                  returnRequestItem.item_id,
              ),
          );

          return packageItemIds.some((id) => returnItemIds.includes(id));
        }

        if (document.type === "cancellation_reverse") {
          const cancelItemIds = (document.cancellation?.items || []).map(
            (cancelItem) =>
              String(cancelItem.orderItemId || cancelItem.order_item_id),
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
      className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E7D9B8] bg-[#FFFDF8]"
    >
      <div className="flex w-full min-w-0 flex-col gap-3 p-4 sm:p-5">
        <div className="grid gap-4">
          {group.items.map((item, index) => {
            const itemId = getItemId(item);
            const fulfillment = itemFulfillment.get(itemId) || {};

            const returnRequest =
              group.returnByItem.get(itemId) ||
              resolveReturnForItem(returns, item);

            const returnedQuantity = getReturnedQuantityForItem(returns, item);

            const policy = getItemReturnPolicy(item);
            const returnableQuantity = getReturnableQuantityForItem(
              returns,
              item,
            );

            const reviewKey = reviewKeyForItem(orderId, item);
            const reviewEntry = reviewByItem?.[reviewKey];

            const existingReview =
              reviewEntry?.review ||
              reviewEntry?.data?.review ||
              reviewEntry?.data ||
              reviewEntry;

            const hasExistingReview = Boolean(
              existingReview &&
              typeof existingReview === "object" &&
              !existingReview.alreadyReviewed,
            );

            const canShowExistingReview =
              Boolean(fulfillment.delivered) &&
              returnedQuantity === 0 &&
              Boolean(getReviewProductId(item)) &&
              hasExistingReview;

            return (
              <div
                key={item.id || item._id || index}
                className="grid min-w-0 gap-3"
              >
                <OrderItemCard
                  item={item}
                  {...itemProps}
                  compact={true}
                  shipment={shipment}
                  isCancelled={isCancelled}
                  isReturned={Boolean(returnRequest) || isReturned}
                  cancellationDetails={groupCancellation}
                  returnDetails={returnRequest || resolvedGroupReturn}
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
                  orderId={orderId}
                  reviewByItem={reviewByItem}
                  checkedReviewKeys={checkedReviewKeys}
                  onReviewClick={setReviewTarget}
                />

                <div className="min-w-0 rounded-lg border border-[#E7D9B8] bg-[#FAF6EE] p-3 sm:p-4 md:p-5">
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

                {canShowExistingReview && (
                  <div className="min-w-0">
                    <ExistingReviewCard review={existingReview} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* <ReturnStatus
          isCancelled={isCancelled}
          isReturned={isReturned}
          groupCancellation={groupCancellation}
          groupReturn={groupReturn}
          group={group}
          formatMoney={itemProps.formatMoney}
          currency={itemProps.currency}
        /> */}
      </div>

      {hasPackageReview &&
        (itemProps.invoicesLoading || packageDocuments.length > 0) && (
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#1B1D60]">
              <FileText size={16} className="text-[#3E4093]" />
              Package Documents
            </h4>

            <div className="flex flex-col gap-2">
              {itemProps.invoicesLoading
                ? [1, 2].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 animate-pulse"
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        <div className="h-4 w-4 shrink-0 rounded bg-[#E7D9B8]" />
                        <div className="h-4 w-24 rounded bg-[#E7D9B8]" />
                      </div>
                      <div className="h-7 w-20 shrink-0 rounded bg-[#E7D9B8]" />
                    </div>
                  ))
                : packageDocuments.map((document) => (
                    <div
                      key={`${document.title}-${document.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 transition-colors hover:border-[#CE9F2D80]"
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        <FileText
                          size={15}
                          className="shrink-0 text-[#3E4093]"
                        />
                        <span className="truncate text-[13px] font-semibold text-[#2E2E2E]">
                          {document.title}
                        </span>
                      </div>

                      {document.pending ? (
                        <span className="shrink-0 rounded-full bg-[#CE9F2D1A] px-2.5 py-0.5 text-[11px] font-bold text-[#CE9F2D]">
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
                          className="h-7 shrink-0 border-[#CE9F2D] px-3 text-xs font-semibold text-[#1B1D60] hover:bg-[#FFF9EA]"
                        >
                          <Download size={12} />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
            </div>
          </div>
        )}

      {!hasPackageReview &&
        (itemProps.invoicesLoading || packageDocuments.length > 0) && (
          <div className="col-span-full rounded-b-xl border-t border-[#E7D9B8] bg-[#FFFDF8] p-3 sm:p-4">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {itemProps.invoicesLoading
                ? [1, 2].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 animate-pulse"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="h-4 w-4 shrink-0 rounded bg-[#E7D9B8]" />
                        <div className="h-4 w-24 rounded bg-[#E7D9B8]" />
                      </div>
                      <div className="h-7 w-20 shrink-0 rounded bg-[#E7D9B8]" />
                    </div>
                  ))
                : packageDocuments.map((document) => (
                    <div
                      key={`${document.title}-${document.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 transition-colors hover:border-[#CE9F2D80]"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <FileText
                          size={15}
                          className="shrink-0 text-[#3E4093]"
                        />
                        <span
                          title={document.title}
                          className="truncate text-[13px] font-semibold text-[#2E2E2E]"
                        >
                          {document.title}
                        </span>
                      </div>

                      {document.pending ? (
                        <span className="shrink-0 rounded-full bg-[#CE9F2D1A] px-2.5 py-0.5 text-[11px] font-bold text-[#CE9F2D]">
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
                          className="h-7 shrink-0 gap-1.5 border-[#CE9F2D] px-3 text-xs font-semibold text-[#1B1D60] hover:bg-[#FFF9EA]"
                        >
                          <Download size={12} />
                          Download
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
