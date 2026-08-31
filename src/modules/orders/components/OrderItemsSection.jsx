import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FileText, Download } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";
import { fetchMyProductReview } from "../../../features/review/reviewSlice";
import { ReviewModal } from "./OrderItemReview";
import { OrderPackageCard } from "./OrderPackageCard";
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
  const isSingleItemView = Boolean(
    selectedOrderItem || searchParams.get("orderItemId"),
  );
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
        const itemShipments = shipment
          ? [shipment]
          : shipmentByGroup.get(sellerKey) || [];

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
    <section className="grid gap-5 w-full">
      {packageGroups.map((group, groupIndex) => (
        <OrderPackageCard
          key={group.key}
          group={group}
          groupIndex={groupIndex}
          totalGroups={packageGroups.length}
          itemFulfillment={itemFulfillment}
          isSingleItemView={isSingleItemView}
          reviewByItem={reviewByItem}
          checkedReviewKeys={checkedReviewKeys}
          setReviewTarget={setReviewTarget}
          orderId={orderId}
          orderStatus={orderStatus}
          returns={returns}
          cancellations={cancellations}
          {...itemProps}
        />
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
