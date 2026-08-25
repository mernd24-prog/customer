import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { fetchReturnByOrder, requestReturn } from "../slices/returnsSlice";
import { fetchOrderById } from "../../../modules/orders/slices/orderSlice";
import { returnSchema } from "../../../validations/validationSchemas";
import { notify } from "../../../utils/notify";
import {
  getOrderItems,
  getItemId,
  getItemProductId,
  getItemVariantId,
  getItemVariantSku,
  getItemQuantity,
  getItemUnitPrice,
  getReturnableQuantityForItem,
  getReturnedQuantityForItem,
  getCancelledQuantityForItem,
  calculateEstimatedRefundBreakup,
  getItemReturnPolicy,
  isItemDelivered,
  getReturnForItem
} from "../../../utils/pages/returnUtils";

export default function useReturnRequest(orderId) {
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
      dispatch(fetchReturnByOrder({ orderId })).finally(() =>
        setReturnsChecked(true),
      );
    }
  }, [dispatch, orderId]);

  const orderItems = getOrderItems(order);
  const fetchedReturns = Array.isArray(returnList)
    ? returnList.filter(
        (returnRequest) =>
          String(returnRequest.orderId || returnRequest.order_id || "") ===
          String(orderId),
      )
    : [];
  const embeddedReturns = Array.isArray(order?.relations?.returns)
    ? order.relations.returns
    : Array.isArray(order?.returns)
      ? order.returns
      : [];
  const existingReturns = [...fetchedReturns, ...embeddedReturns].filter(
    (returnRequest, index, list) => {
      const id = String(
        returnRequest.id ||
          returnRequest._id ||
          returnRequest.returnId ||
          returnRequest.returnNumber ||
          returnRequest.return_number ||
          index,
      );
      return (
        list.findIndex(
          (candidate, candidateIndex) =>
            String(
              candidate.id ||
                candidate._id ||
                candidate.returnId ||
                candidate.returnNumber ||
                candidate.return_number ||
                candidateIndex,
            ) === id,
        ) === index
      );
    },
  );
  const selectedItem =
    orderItems.find(
      (item) => String(getItemId(item)) === String(selectedOrderItemId),
    ) || null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      productId: "",
      orderItemId: "",
      resolution: "refund",
      reason: "defective",
      quantity: 1,
    },
  });

  const watchedQty = watch("quantity");
  const estimatedRefund = calculateEstimatedRefundBreakup(
    order,
    selectedItem,
    watchedQty,
  );
  const selectedReturnableQuantity = selectedItem
    ? getReturnableQuantityForItem(existingReturns, selectedItem)
    : 0;
  const selectedReturnedQuantity = selectedItem
    ? getReturnedQuantityForItem(existingReturns, selectedItem)
    : 0;
  const selectedOrderedQuantity = selectedItem
    ? getItemQuantity(selectedItem)
    : 0;
  const watchedQuantityNumber = Number(watchedQty || 0);
  const quantityExceedsRemaining = Boolean(
    selectedItem &&
    selectedReturnableQuantity > 0 &&
    watchedQuantityNumber > selectedReturnableQuantity,
  );

  const handleItemSelect = (item) => {
    if (!returnsChecked) {
      notify.info(
        "Checking existing return requests for this item. Please wait a moment.",
      );
      return;
    }
    const policy = getItemReturnPolicy(item);
    const returnableQuantity = getReturnableQuantityForItem(
      existingReturns,
      item,
    );
    const expired =
      policy.eligibleUntil &&
      new Date(policy.eligibleUntil).getTime() < Date.now();
    if (
      !isItemDelivered(order, item) ||
      !policy.returnable ||
      expired ||
      returnableQuantity <= 0
    )
      return;
    const pid = getItemProductId(item);
    const orderItemId = getItemId(item);
    setSelectedOrderItemId(orderItemId);
    setValue("productId", pid, { shouldValidate: true });
    setValue("orderItemId", orderItemId, { shouldValidate: true });
    setValue("quantity", Math.min(1, returnableQuantity), {
      shouldValidate: true,
    });
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
      const requestedItem = orderItems.find(
        (item) => String(getItemId(item)) === String(requestedItemId),
      );
      if (requestedItem) handleItemSelect(requestedItem);
    }
    setDeepLinkApplied(true);
  }, [deepLinkApplied, orderItems, searchParams]);

  const submit = async (values) => {
    const item =
      selectedItem ||
      orderItems.find(
        (i) => String(getItemId(i)) === String(values.orderItemId),
      );
    const unitPrice = item ? getItemUnitPrice(item) : 0;
    const returnableQuantity = item
      ? getReturnableQuantityForItem(existingReturns, item)
      : 0;
    const requestedQuantity = Number(values.quantity);
    const alreadyQueuedQuantity = item
      ? getReturnedQuantityForItem(existingReturns, item)
      : 0;
    const cancelledQuantity = item ? getCancelledQuantityForItem(item) : 0;
    const orderedQuantity = item ? getItemQuantity(item) : 0;
    if (!item || !getItemId(item)) {
      notify.error("Please select the exact item/variant to return.");
      return;
    }
    if (!returnsChecked) {
      notify.error(
        "Please wait while we check existing return requests for this item.",
      );
      return;
    }
    if (requestedQuantity < 1 || requestedQuantity > returnableQuantity) {
      notify.error(
        cancelledQuantity >= orderedQuantity
          ? "This item has been cancelled and cannot be returned."
          : alreadyQueuedQuantity > 0
          ? `${alreadyQueuedQuantity} of ${orderedQuantity} unit${orderedQuantity === 1 ? "" : "s"} already in return/refund queue. You can return only ${returnableQuantity} more unit${returnableQuantity === 1 ? "" : "s"} now.`
          : `You can return up to ${returnableQuantity} unit${returnableQuantity === 1 ? "" : "s"} for this item.`,
      );
      setValue("quantity", Math.max(1, returnableQuantity), {
        shouldValidate: true,
      });
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

  return {
    dispatch,
    navigate,
    searchParams,
    run,
    loading,
    returnList,
    order,
    orderLoading,
    selectedOrderItemId,
    setSelectedOrderItemId,
    deepLinkApplied,
    setDeepLinkApplied,
    returnsChecked,
    setReturnsChecked,
    orderItems,
    fetchedReturns,
    embeddedReturns,
    existingReturns,
    selectedItem,
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    watchedQty,
    estimatedRefund,
    selectedReturnableQuantity,
    selectedReturnedQuantity,
    selectedOrderedQuantity,
    watchedQuantityNumber,
    quantityExceedsRemaining,
    handleItemSelect,
    submit
  };

}
