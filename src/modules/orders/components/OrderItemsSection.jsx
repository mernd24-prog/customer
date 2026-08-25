import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchMyProductReview } from "../../../features/review/reviewSlice";
import { OrderItemCard } from "./OrderItemCard";
import { OrderItemReviewAction, ReviewModal } from "./OrderItemReview";
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
function OrderItemsSection({
  items = [],
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
      const key = getItemSellerGroupKey(item);
      if (!grouped.has(key)) {
        const fulfillment = fulfillmentByGroup.get(key) || {};
        const groupShipments = shipmentByGroup.get(key) || [];
        grouped.set(key, {
          key,
          sellerName:
            fulfillment.sellerName ||
            item.sellerName ||
            item.seller?.displayName ||
            item.seller?.businessName ||
            "Marketplace seller",
          status:
            fulfillment.returnLifecycle?.status ||
            fulfillment.deliveryStatus ||
            fulfillment.shipmentStatus ||
            groupShipments[0]?.status ||
            "preparing",
          expectedDeliveryAt:
            fulfillment.expectedDeliveryAt ||
            groupShipments[0]?.expected_delivery_at ||
            groupShipments[0]?.expectedDeliveryAt,
          shipments: groupShipments,
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
      {packageGroups.map((group) => (
        <div
          key={group.key}
          className="grid gap-5 rounded-xl border border-[#E7D9B8] bg-[#FFFDF8] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#1B1D60]">Order</h3>
              <p className="mt-0.5 text-sm text-[#6F7480]">
                {group.sellerName}
              </p>
            </div>
            {group.expectedDeliveryAt && (
              <div className="text-right text-sm">
                <p className="text-xs text-[#6F7480]">
                  Expected {formatDate(group.expectedDeliveryAt)}
                </p>
              </div>
            )}
          </div>
          {group.items.map((item, index) => {
            const policy = getItemReturnPolicy(item);
            const itemId = getItemId(item);
            const fulfillment = itemFulfillment.get(itemId) || {};
            const returnRequest =
              group.returnByItem.get(itemId) ||
              resolveReturnForItem(returns, item);
            const tracking = fulfillment.tracking || {};
            const expanded = expandedItemId === itemId;
            const returnedQuantity = getReturnedQuantityForItem(returns, item);
            const returnableQuantity = getReturnableQuantityForItem(
              returns,
              item,
            );
            return (
              <div
                id={`order-item-${itemId}`}
                key={item.id || item._id || index}
                className={`grid gap-3 border-t border-[#E7D9B8] pt-5 first:border-t-0 first:pt-0 ${expanded ? "rounded-xl bg-[#FFF8E7] p-3" : ""}`}
              >
                <div
                  className={`rounded-xl text-left transition ${expanded ? "bg-white shadow-sm ring-1 ring-[#CE9F2D66]" : ""}`}
                >
                  <div className="p-2">
                    <OrderItemCard item={item} {...itemProps} />
                  </div>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-4 w-full">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold mt-2">
                    <span
                      className={`rounded-full px-3 py-1 ${policy.returnable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                    >
                      {policy.returnable
                        ? `Returnable${policy.days ? ` for ${policy.days} days` : ""}`
                        : "Non-returnable"}
                    </span>
                    {policy.returnable && policy.eligibleUntil && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        Return until {formatDate(policy.eligibleUntil)}
                      </span>
                    )}
                    {returnRequest && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        {label(fulfillment.status)}
                      </span>
                    )}
                    {returnedQuantity > 0 && (
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                        Returned/requested {returnedQuantity} of{" "}
                        {getItemQuantity(item)}
                      </span>
                    )}
                    {policy.returnable && returnableQuantity > 0 && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        Returnable Item: {returnableQuantity}
                      </span>
                    )}
                  </div>

                  {isSingleItemView &&
                    fulfillment.delivered &&
                    returnedQuantity === 0 &&
                    Boolean(getReviewProductId(item)) && (
                      <OrderItemReviewAction
                        item={item}
                        orderId={orderId}
                        canReview
                        existingReview={
                          reviewByItem[reviewKeyForItem(orderId, item)]
                        }
                        reviewChecked={Boolean(
                          checkedReviewKeys[reviewKeyForItem(orderId, item)],
                        )}
                        onReviewClick={setReviewTarget}
                      />
                    )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

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
