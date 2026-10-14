
import { useMemo } from "react";
import OrderActions from "./OrderActions";
import OrderDocuments from "./OrderDocuments";
import { OrderTimeline } from "./OrderTimeline";
import { OrderItemCard } from "./OrderItemCard";
import { ExistingReviewCard } from "./OrderItemReview";
import {
  getReviewProductId,
  reviewKeyForItem,
  getItemId,
  resolveReturnForItem,
  getReturnedQuantityForItem,
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
  order,
  status,
  canCancelOrder,
  retrying,
  handleRetryPayment,
  openCancellation,
  hasCancellableQuantity,
  canRequestReturn,
  selectedItemCanReturn,
  selectedOrderItem,
  getOrderItemId,
  ...itemProps
}) {
  const {
    shipment,
    expectedDelivery,
    events,
    currentRank,
    isDelivered,
    isCancelled,
    resolvedGroupReturn,
    groupCancellation,
    packageDocuments,
  } = useMemo(() => {
    const shipment = group?.shipments?.[0] || {};
    const expectedDelivery = group?.expectedDeliveryAt;
    const items = group?.items || [];

    const groupItemTimelineEvents = items.flatMap(
      (item) => item?.timeline || [],
    );
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
      ...items.flatMap((item) => [
        item?.status,
        item?.effective_status,
        item?.delivery_status,
        item?.deliveryStatus,
        item?.cancellation_status,
      ]),
      ...events.flatMap((event) => [
        event?.status,
        event?.to_status,
        event?.toStatus,
        event?.reason,
      ]),
    ].filter(Boolean);

    const currentRank = Math.max(
      0,
      ...allStatuses.map((itemStatus) => STATUS_RANK[itemStatus] || 0),
    );

    const isDelivered = currentRank >= 5;

    const groupCancellation = cancellations.find((cancellation) =>
      cancellation.items?.some((cancellationItem) =>
        items.some(
          (groupItem) =>
            String(groupItem.id || groupItem._id) ===
            String(
              cancellationItem.orderItemId ||
                cancellationItem.order_item_id,
            ),
        ),
      ),
    );

    const groupReturn = returns.find((returnRequest) =>
      returnRequest.items?.some((returnRequestItem) =>
        items.some(
          (groupItem) =>
            String(groupItem.id || groupItem._id) ===
            String(
              returnRequestItem.orderItemId ||
                returnRequestItem.order_item_id ||
                returnRequestItem.itemId ||
                returnRequestItem.item_id,
            ),
        ),
      ),
    );

    const orderedGroupQuantity = items.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0,
    );

    const cancelledGroupQuantity = items.reduce(
      (sum, item) =>
        sum +
        Number(item?.cancelled_quantity || item?.cancelledQuantity || 0),
      0,
    );

    const isFullyCancelled =
      orderedGroupQuantity > 0 &&
      cancelledGroupQuantity >= orderedGroupQuantity;

    const hasCancellationEvent = items.some(
      (item) =>
        item?.cancellation_status ||
        item?.cancellationStatus ||
        item?.cancellation_lifecycle ||
        item?.timeline?.some(
          (event) =>
            event.source === "cancellation" ||
            event.status?.includes("cancellation") ||
            event.to_status?.includes("cancellation"),
        ),
    );

    const isCancelled =
      group?.status === "cancelled" ||
      group?.status === "cancellation_requested" ||
      group?.status === "cancellation_approved" ||
      Boolean(groupCancellation) ||
      hasCancellationEvent ||
      isFullyCancelled;

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

    const packageItemIds = items.map((item) => String(getItemId(item)));

    const packageDocuments = (itemProps.downloadableDocuments || []).filter(
      (document) => {
        const isTaxOrReceipt =
          document.type === "tax_invoice" ||
          document.type === "order_receipt";

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

          const documentSellerName =
            document.invoice?.sellerName ||
            document.invoice?.metadata?.seller?.businessName ||
            document.invoice?.metadata?.seller?.displayName;

          return documentSellerName === group?.sellerName;
        }

        if (document.type === "return_reverse") {
          const returnItemIds = (document.returnRequest?.items || []).map(
            (item) =>
              String(
                item.orderItemId ||
                  item.order_item_id ||
                  item.itemId ||
                  item.item_id,
              ),
          );

          return packageItemIds.some((id) => returnItemIds.includes(id));
        }

        if (document.type === "cancellation_reverse") {
          const cancellationItemIds = (
            document.cancellation?.items || []
          ).map((item) =>
            String(item.orderItemId || item.order_item_id),
          );

          return packageItemIds.some((id) =>
            cancellationItemIds.includes(id),
          );
        }

        return false;
      },
    );

    return {
      shipment,
      expectedDelivery,
      events,
      currentRank,
      isDelivered,
      isCancelled,
      resolvedGroupReturn,
      groupCancellation,
      packageDocuments,
      isFullyReturned,
      hasReturnRequest,
    };
  }, [
    group,
    itemProps.orderTimeline,
    itemProps.timeline,
    itemProps.downloadableDocuments,
    returns,
    cancellations,
    totalGroups,
    reviewByItem,
    orderId,
    isSingleItemView,
  ]);

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E7D9B8] bg-[#FFFDF8]">
      <div className="flex w-full min-w-0 flex-col gap-3 p-2 sm:p-3 md:p-4 lg:p-5">
        <div className="grid gap-4">
          {(group.items || []).map((item, index) => {
            const itemId = getItemId(item);
            const fulfillment = itemFulfillment.get(itemId) || {};

            const returnRequest =
              group.returnByItem?.get(itemId) ||
              resolveReturnForItem(returns, item);

            const returnedQuantity = getReturnedQuantityForItem(returns, item);
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
                  compact
                  shipment={shipment}
                  isCancelled={isCancelled}
                  isReturned={Boolean(returnRequest)}
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
                    isReturned={Boolean(resolvedGroupReturn)}
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
      </div>

    <div className="flex min-w-0 flex-col gap-3 border-t border-[#E7D9B8] p-3 sm:p-4">
      {(itemProps.invoicesLoading || packageDocuments.length > 0) && (
        <div className="w-full min-w-0">
          <OrderDocuments
            documents={packageDocuments}
            loading={itemProps.invoicesLoading}
            downloadingId={itemProps.downloadingId}
            handleDownload={itemProps.handleDownload}
          />
        </div>
      )}

      <OrderActions
        order={order}
        orderId={orderId}
        status={status || orderStatus}
        canCancelOrder={canCancelOrder}
        retrying={retrying}
        handleRetryPayment={handleRetryPayment}
        openCancellation={openCancellation}
        selectedOrderItem={selectedOrderItem}
        hasCancellableQuantity={hasCancellableQuantity}
        canRequestReturn={canRequestReturn}
        selectedItemCanReturn={selectedItemCanReturn}
        getOrderItemId={getOrderItemId}
      />
    </div>

    </div>
  );
}
