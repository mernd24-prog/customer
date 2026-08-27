import { useState, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useToastThunk } from "../../../../hooks/useToastThunk";
import { fetchOrderById, cancelOrder } from "../../slices/orderSlice";
import { getOrderItemId } from "../../../../utils/pages/orderUtils";

export function useOrderCancel({ orderId, items, selectedOrderItem, cancellations, loading }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonCode, setCancelReasonCode] = useState("changed_mind");
  const [cancelReasonError, setCancelReasonError] = useState(false);
  const [cancelItems, setCancelItems] = useState({});
  const cancelRequestKey = useRef(null);

  const pendingCancellationQuantity = (itemId) => cancellations
    .filter((request) => !["completed", "failed", "rejected"].includes(String(request.status || "").toLowerCase()))
    .flatMap((request) => request.items || [])
    .filter((item) => String(item.orderItemId || item.order_item_id || "") === String(itemId))
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const hasCancellableQuantity = useMemo(() => {
    if (selectedOrderItem) {
      const itemId = String(getOrderItemId(selectedOrderItem));
      const quantity =
        Number(selectedOrderItem.quantity || 0) -
        Number(
          selectedOrderItem.cancelled_quantity ||
          selectedOrderItem.cancelledQuantity ||
          0,
        ) - pendingCancellationQuantity(itemId);
      return quantity > 0;
    }
    return items.some((item) => {
      const quantity =
        Number(item.quantity || 0) -
        Number(item.cancelled_quantity || 0) -
        pendingCancellationQuantity(item.id || item._id);
      return quantity > 0;
    });
  }, [selectedOrderItem, items, pendingCancellationQuantity]);

  const handleCancelOrder = async () => {
    if (loading) return;
    const selectedItems = Object.entries(cancelItems)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([orderItemId]) => ({ orderItemId }));
    if (cancelReason.trim().length < 10) {
      setCancelReasonError(true);
      return;
    }
    setCancelReasonError(false);
    if (!selectedItems.length) return;
    const result = await run(
      dispatch,
      cancelOrder({
        orderId,
        reason: cancelReason.trim(),
        reasonCode: cancelReasonCode,
        refundMethod: "auto",
        items: selectedItems,
        idempotencyKey: cancelRequestKey.current,
      }),
      "Product cancellation request submitted for seller/admin approval",
    );
    if (!result) return;
    setCancelModalOpen(false);
    setCancelReason("");
    setCancelReasonError(false);
    setCancelItems({});
    cancelRequestKey.current = null;
    dispatch(fetchOrderById({ orderId }));
  };

  const openCancellation = () => {
    setCancelReasonError(false);
    cancelRequestKey.current = `customer:${orderId}:${
      globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    }`;
    if (selectedOrderItem) {
      const itemId = String(getOrderItemId(selectedOrderItem));
      const quantity =
        Number(selectedOrderItem.quantity || 0) -
        Number(
          selectedOrderItem.cancelled_quantity ||
          selectedOrderItem.cancelledQuantity ||
          0,
        ) - pendingCancellationQuantity(itemId);
      setCancelItems(quantity > 0 ? { [itemId]: quantity } : {});
      setCancelModalOpen(true);
      return;
    }
    setCancelItems(
      Object.fromEntries(
        items
          .map((item) => [
            String(item.id || item._id),
            Number(item.quantity || 0) - Number(item.cancelled_quantity || 0) - pendingCancellationQuantity(item.id || item._id),
          ])
          .filter(([itemId, quantity]) => itemId && quantity > 0),
      ),
    );
    setCancelModalOpen(true);
  };

  return {
    cancelModalOpen,
    setCancelModalOpen,
    cancelReason,
    setCancelReason,
    cancelReasonError,
    setCancelReasonError,
    cancelReasonCode,
    setCancelReasonCode,
    cancelItems,
    setCancelItems,
    handleCancelOrder,
    openCancellation,
    hasCancellableQuantity,
  };
}
