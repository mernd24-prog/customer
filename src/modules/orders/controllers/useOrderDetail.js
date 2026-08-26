import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../slices/orderSlice";
import { fetchReturnByOrder } from "../../returns/slices/returnsSlice";
import { fetchNotifications } from "../../../features/notification/notificationSlice";
import { getProductTitle } from "../../../utils/ecommerce";

import { useOrderPayment } from "./actions/useOrderPayment";
import { useOrderCancel } from "./actions/useOrderCancel";
import { useOrderDocuments } from "./actions/useOrderDocuments";

import {
  getProgressStatus,
  getOrderStatus,
  getOrderItems,
  getOrderCurrency,
  getOrderCollection,
  getMatchingOrder,
  getAmount,
  getCustomerOrderAmount,
  getCustomerPlatformFeeAmount,
  getCustomerPlatformFeeTaxAmount,
  getCustomerPlatformFeeTaxRate,
  splitInclusivePlatformFee,
  getPaymentMethod,
  getOrderItemId,
  findShipmentForOrderItem,
  resolveOrderItemDisplayStatus,
  returnItemMatchesOrderItem,
} from "../../../utils/pages/orderUtils";

export function useOrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const state = useSelector((s) => s.order);
  const userState = useSelector((s) => s.user);
  const notificationState = useSelector((s) => s.notification);
  const returnsState = useSelector((s) => s.returns);

  const orders = getOrderCollection(state.current).length
    ? getOrderCollection(state.current)
    : state.list;

  const order = getMatchingOrder({
    current: state.current,
    entities: state.entities,
    orders,
    orderId,
  });

  const currency = getOrderCurrency(order);
  const items = getOrderItems(order);
  const isCodOrder = getPaymentMethod(order) === "cod";
  const cancellations = Array.isArray(order?.relations?.cancellations)
    ? order.relations.cancellations
    : [];

  const embeddedReturns = Array.isArray(order?.relations?.returns)
    ? order.relations.returns
    : Array.isArray(order?.returns)
      ? order.returns
      : Array.isArray(order?.returnRequests)
        ? order.returnRequests
        : [];
  const fetchedReturns = Array.isArray(returnsState.list)
    ? returnsState.list.filter(
        (returnRequest) =>
          String(returnRequest.orderId || returnRequest.order_id || "") ===
          String(orderId),
      )
    : [];
  const returns = [...fetchedReturns, ...embeddedReturns].filter(
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

  const shipments = Array.isArray(order?.relations?.shipments)
    ? order.relations.shipments
    : [];
  const selectedOrderItemId = searchParams.get("orderItemId") || "";
  const selectedOrderItem = selectedOrderItemId
    ? items.find((item) => getOrderItemId(item) === String(selectedOrderItemId))
    : null;
  const selectedItemReturn = selectedOrderItem
    ? returns.find((returnRequest) => {
        const items = Array.isArray(returnRequest.items)
          ? returnRequest.items
          : [];
        if (!items.length) return true;
        return items.some((returnItem) =>
          returnItemMatchesOrderItem(returnItem, selectedOrderItem),
        );
      })
    : null;

  const cancellationMatchesSelectedItem = (cancellation = {}) => {
    if (!selectedOrderItem) return true;
    const items = Array.isArray(cancellation.items) ? cancellation.items : [];
    if (!items.length) return true; // Assume order-level cancellation covers all items
    return items.some(
      (item) =>
        String(item.orderItemId || item.order_item_id || item.id || "") ===
        getOrderItemId(selectedOrderItem),
    );
  };
  const visibleCancellations = selectedOrderItem
    ? cancellations.filter(cancellationMatchesSelectedItem)
    : cancellations;

  const selectedItemStatus = selectedOrderItem
    ? resolveOrderItemDisplayStatus(
        selectedOrderItem,
        getProgressStatus(order),
        shipments,
        order?.relations?.sellerFulfillmentGroups || [],
        cancellations,
      )
    : null;
  const selectedItemAmount = selectedOrderItem
    ? (selectedOrderItem.line_total ??
      selectedOrderItem.lineTotal ??
      Number(selectedOrderItem.unit_price || selectedOrderItem.unitPrice || 0) *
        Number(selectedOrderItem.quantity || 0))
    : null;
  const selectedItemShipment = selectedOrderItem
    ? findShipmentForOrderItem(shipments, selectedOrderItem)
    : null;
  const visibleShipments = selectedOrderItem
    ? [selectedItemShipment].filter(Boolean)
    : shipments;

  const subtotal = getAmount(order, "subtotal");
  const discount = getAmount(order, "discount");
  const walletDiscount = getAmount(order, "walletDiscount");
  const shipping = getAmount(order, "shipping");
  const customerPlatformFee = getCustomerPlatformFeeAmount(order);
  const customerPlatformFeeTaxRate = getCustomerPlatformFeeTaxRate(order);
  const customerPlatformFeeSplit = splitInclusivePlatformFee(
    customerPlatformFee,
    getCustomerPlatformFeeTaxAmount(order),
    customerPlatformFeeTaxRate,
  );
  const customerPlatformFeeBase = customerPlatformFeeSplit.platformFeeBase;
  const customerPlatformFeeTax = customerPlatformFeeSplit.platformFeeTax;
  const pricingSummary =
    order?.metadata?.pricingSummary || order?.metadata?.pricing_summary || {};
  const customerAmount = getCustomerOrderAmount(order);
  const status = getOrderStatus(order);
  const progressStatus = getProgressStatus(order);

  const returnableItems = items.filter((item) => {
    const snapshot =
      item.return_policy_snapshot ||
      item.returnPolicySnapshot ||
      item.product_snapshot?.returnPolicy ||
      {};
    return (
      (item.returnable ?? snapshot.returnable ?? snapshot.eligible ?? true) ===
      true
    );
  });

  const itemReturnDeadlines = returnableItems
    .map(
      (item) =>
        item.return_eligible_until ||
        item.returnEligibleUntil ||
        item.return_policy_snapshot?.eligibleUntil ||
        item.returnPolicySnapshot?.eligibleUntil,
    )
    .filter(Boolean);
  const returnEligibleUntil = itemReturnDeadlines.length
    ? itemReturnDeadlines.reduce((latest, value) =>
        new Date(value).getTime() > new Date(latest).getTime() ? value : latest,
      )
    : null;

  const returnWindowOpen = returnableItems.some((item) => {
    const deadline =
      item.return_eligible_until ||
      item.returnEligibleUntil ||
      item.return_policy_snapshot?.eligibleUntil ||
      item.returnPolicySnapshot?.eligibleUntil;
    return !deadline || new Date(deadline).getTime() >= Date.now();
  });
  const canRequestReturn =
    ["delivered", "fulfilled", "partially_returned"].includes(status) &&
    returnWindowOpen &&
    returnableItems.length > 0;

  const selectedItemReturnPolicy = selectedOrderItem
    ? selectedOrderItem.return_policy_snapshot ||
      selectedOrderItem.returnPolicySnapshot ||
      selectedOrderItem.product_snapshot?.returnPolicy ||
      {}
    : {};
  const selectedItemReturnDeadline = selectedOrderItem
    ? selectedOrderItem.return_eligible_until ||
      selectedOrderItem.returnEligibleUntil ||
      selectedItemReturnPolicy.eligibleUntil ||
      null
    : null;
  const selectedItemReturnWindowOpen = selectedOrderItem
    ? !selectedItemReturnDeadline ||
      new Date(selectedItemReturnDeadline).getTime() >= Date.now()
    : false;

  const selectedItemReturnedQuantity = selectedOrderItem
    ? returns.reduce((sum, returnRequest) => {
        const returnStatus = String(returnRequest.status || "").toLowerCase();
        const refundStatus = String(
          returnRequest.refund?.status ||
            returnRequest.refundStatus ||
            returnRequest.refund_status ||
            "",
        ).toLowerCase();
        if (["rejected", "qc_failure_upheld"].includes(returnStatus))
          return sum;
        if (
          returnStatus === "closed" &&
          !["completed", "not_required"].includes(refundStatus)
        )
          return sum;
        return (
          sum +
          (returnRequest.items || [])
            .filter((returnItem) =>
              returnItemMatchesOrderItem(returnItem, selectedOrderItem),
            )
            .reduce(
              (itemSum, returnItem) =>
                itemSum +
                Number(
                  returnItem.receivedQuantity ??
                    returnItem.received_quantity ??
                    returnItem.approvedQuantity ??
                    returnItem.approved_quantity ??
                    returnItem.requestedQuantity ??
                    returnItem.requested_quantity ??
                    returnItem.quantity ??
                    0,
                ),
              0,
            )
        );
      }, 0)
    : 0;

  const selectedItemReturnableQuantity = selectedOrderItem
    ? Math.max(
        0,
        Number(selectedOrderItem.quantity || 0) - selectedItemReturnedQuantity,
      )
    : 0;

  const selectedItemCanReturn = Boolean(
    selectedOrderItem &&
    selectedItemReturnableQuantity > 0 &&
    selectedItemReturnWindowOpen &&
    (selectedOrderItem.returnable ??
      selectedItemReturnPolicy.returnable ??
      selectedItemReturnPolicy.eligible ??
      true) === true &&
    ["delivered", "fulfilled", "completed"].includes(
      String(
        selectedOrderItem.delivery_status ||
          selectedOrderItem.deliveryStatus ||
          selectedItemStatus ||
          "",
      ).toLowerCase(),
    ),
  );
  const visibleOrderItems = selectedOrderItem ? [selectedOrderItem] : items;

  const returnCoversSelectedItem = (returnRequest = {}) => {
    if (!selectedOrderItem) return true;
    const items = Array.isArray(returnRequest.items) ? returnRequest.items : [];
    if (!items.length) return true; // Assume order-level return covers all items
    return items.some((returnItem) =>
      returnItemMatchesOrderItem(returnItem, selectedOrderItem),
    );
  };
  const visibleReturns = selectedOrderItem
    ? returns.filter(returnCoversSelectedItem)
    : returns;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Order", href: "/orders" },
    { label: `#${orderId}` },
  ];

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
    dispatch(fetchReturnByOrder({ orderId }));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (
      track ||
      shipments.some((shipment) => shipment.status === "out_for_delivery")
    ) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, shipments, track]);

  // Hook 1: Payment Actions
  const { retrying, handleRetryPayment } = useOrderPayment({
    orderId,
    order,
    userState: userState.current,
  });

  // Hook 2: Cancel Actions
  const {
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
  } = useOrderCancel({
    orderId,
    items,
    selectedOrderItem,
    cancellations,
    loading: state.loading,
  });

  // Hook 3: Document Actions
  const {
    invoices,
    downloadingId,
    setDownloadingId,
    handleDownload,
    getInvoiceUrl,
    invoiceDownloadAvailable,
    customerInvoices,
    orderReceipt,
    customerFeeInvoice,
    pendingSellerDocuments,
    visibleCustomerInvoices,
    visiblePendingSellerDocuments,
    downloadableDocuments,
  } = useOrderDocuments({
    orderId,
    order,
    selectedOrderItem,
    visibleReturns,
    visibleCancellations,
  });

  const getReturnNumber = (returnRequest = {}) =>
    returnRequest.returnNumber ||
    returnRequest.return_number ||
    returnRequest.id ||
    returnRequest._id ||
    "Return request";

  const getReturnRefundAmount = (returnRequest = {}) =>
    returnRequest.refundAmount ||
    returnRequest.refund?.requestedAmount ||
    returnRequest.refund?.amount ||
    returnRequest.refund_amount ||
    returnRequest.refundBreakup?.totalRefundAmount ||
    returnRequest.refund_breakup?.total_refund_amount ||
    0;

  const getReturnItemTitle = (item = {}) =>
    getProductTitle(item, item.productId || "Returned item");

  const getReturnItemQuantity = (item = {}) =>
    item.approvedQuantity ||
    item.approved_quantity ||
    item.requestedQuantity ||
    item.requested_quantity ||
    item.quantity ||
    1;

  return {
    state,
    notificationState,
    order,
    items,
    cancellations,
    visibleCancellations,
    returns,
    shipments,
    currency,
    subtotal,
    discount,
    walletDiscount,
    shipping,
    customerPlatformFeeBase,
    customerPlatformFeeTax,
    pricingSummary,
    customerAmount,
    status,
    progressStatus,
    returnEligibleUntil,
    returnWindowOpen,
    canRequestReturn,
    selectedOrderItem,
    selectedItemReturn,
    selectedItemStatus,
    selectedItemAmount,
    selectedItemShipment,
    visibleShipments,
    selectedItemReturnWindowOpen,
    selectedItemReturnableQuantity,
    selectedItemReturnedQuantity,
    selectedItemCanReturn,
    selectedItemReturnDeadline,
    visibleOrderItems,
    invoiceDownloadAvailable,
    customerInvoices,
    orderReceipt,
    customerFeeInvoice,
    pendingSellerDocuments,
    downloadableDocuments,
    breadcrumbItems,
    cancelModalOpen,
    cancelReason,
    cancelReasonError,
    cancelReasonCode,
    cancelItems,
    downloadingId,
    retrying,
    setCancelModalOpen,
    setCancelReason,
    setCancelReasonError,
    setCancelReasonCode,
    setCancelItems,
    setDownloadingId,
    handleRetryPayment,
    handleDownload,
    handleCancelOrder,
    openCancellation,
    hasCancellableQuantity,
    getInvoiceUrl,
    getReturnRefundAmount,
    getReturnItemTitle,
    getReturnItemQuantity,
    getReturnNumber,
    isCodOrder,
    visibleReturns,
    visiblePendingSellerDocuments,
  };
}
