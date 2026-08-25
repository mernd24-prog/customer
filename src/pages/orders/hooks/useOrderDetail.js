import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { notify } from "../../../utils/notify";
import {
  fetchOrderById,
  cancelOrder,
  retryOrderPayment,
} from "../../../features/order/orderSlice";
import {
  initiatePayment,
  verifyPayment,
} from "../../../features/payment/paymentSlice";
import { fetchReturnByOrder } from "../../../features/returns/returnsSlice";
import { fetchMarketplaceInvoices } from "../../../features/tax/taxSlice";
import { fetchNotifications } from "../../../features/notification/notificationSlice";
import { downloadAuthDocument, getDocumentId } from "../../../utils/downloadAuthDocument";
import { openRazorpayCheckout } from "../../../utils/razorpay";
import { endpoints } from "../../../api/endpoints";
import { getOpaquePaymentResultPath } from "../../../utils/routeTokens";
import {
  getOrderId,
  getOrderStatus,
  getDeliveryStatus,
  getProgressStatus,
  hasKnownStatus,
  canCancelOrder,
  getOrderItems,
  hasDeliveredSellerPackage,
  getItemProductId,
  getItemImage,
  getOrderCurrency,
  getProductTitle,
  getItemLineTotal,
  getOrderCollection,
  getMatchingOrder,
  getAmount,
  getCustomerOrderAmount,
  getCustomerPlatformFeeAmount,
  getCustomerPlatformFeeTaxAmount,
  getCustomerPlatformFeeTaxRate,
  splitInclusivePlatformFee,
  getPaymentMethod,
  asNumber,
  getOrderItemId,
  findShipmentForOrderItem,
  resolveOrderItemDisplayStatus,
  returnItemMatchesOrderItem
} from "../../../utils/pages/orderUtils";

export function useOrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const run = useToastThunk();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonCode, setCancelReasonCode] = useState("changed_mind");
  const [cancelReasonError, setCancelReasonError] = useState(false);
  const [cancelItems, setCancelItems] = useState({});
  const cancelRequestKey = useRef(null);
  const [invoices, setInvoices] = useState(null);
  const [, setInvoicesLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [retrying, setRetrying] = useState(false);
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
  const pendingCancellationQuantity = (itemId) => cancellations
    .filter((request) => !["completed", "failed", "rejected"].includes(String(request.status || "").toLowerCase()))
    .flatMap((request) => request.items || [])
    .filter((item) => String(item.orderItemId || item.order_item_id || "") === String(itemId))
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
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
    ? returns.find((returnRequest) =>
      (returnRequest.items || []).some((returnItem) =>
        returnItemMatchesOrderItem(returnItem, selectedOrderItem),
      ),
    )
    : null;
  const cancellationMatchesSelectedItem = (cancellation = {}) =>
    selectedOrderItem &&
    (Array.isArray(cancellation.items) ? cancellation.items : []).some(
      (item) =>
        String(item.orderItemId || item.order_item_id || item.id || "") ===
        getOrderItemId(selectedOrderItem),
    );
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

  const getInvoiceUrl = (order) =>
    order?.invoice_url ||
    order?.invoiceUrl ||
    order?.relations?.invoice?.url ||
    null;

  const taxBreakup = order?.tax_breakup || order?.taxBreakup;
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
  const rawPaymentMethod = getPaymentMethod(order);
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
  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const customerInvoices = Array.isArray(invoices?.sellerInvoices)
    ? invoices.sellerInvoices
    : [];
  const orderReceipt = invoices?.orderInvoice || null;
  const relationInvoices = Array.isArray(order?.relations?.invoices)
    ? order.relations.invoices
    : [];
  const getInvoiceType = (invoice = {}) =>
    String(
      invoice.invoiceType || invoice.invoice_type || invoice.type || "",
    ).toLowerCase();
  const customerFeeInvoice =
    invoices?.customerFeeInvoice ||
    relationInvoices.find(
      (invoice) => getInvoiceType(invoice) === "platform_customer_fee",
    ) ||
    null;
  const pendingSellerDocuments = invoices?.pendingSellerDocuments || [];

  const invoiceSellerName = (invoice, index) => {
    const metadata = invoice?.metadata || {};
    const seller = metadata.seller || {};
    const organization =
      metadata.organization || invoice?.organizationSnapshot || {};
    return (
      organization.legalBusinessName ||
      organization.displayName ||
      seller.legalBusinessName ||
      seller.businessName ||
      seller.displayName ||
      `Seller ${index + 1}`
    );
  };
  const invoiceItemSummary = (invoice) => {
    const coveredItems =
      invoice?.metadata?.items || invoice?.metadata?.lineItems || [];
    const titles = coveredItems
      .map((item) => item.productTitle || item.description)
      .filter(Boolean);
    if (!titles.length) return "Delivered seller items";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} + ${titles.length - 1} more`;
  };
  const documentCoversSelectedItem = (document = {}) => {
    if (!selectedOrderItem) return true;
    const selectedItemId = getOrderItemId(selectedOrderItem);
    if (!selectedItemId) return true;
    const metadata = document.metadata || {};
    const coveredItems = [
      ...(Array.isArray(metadata.items) ? metadata.items : []),
      ...(Array.isArray(metadata.lineItems) ? metadata.lineItems : []),
    ];
    const explicitIds = [
      ...(Array.isArray(metadata.orderItemIds) ? metadata.orderItemIds : []),
      ...(Array.isArray(metadata.order_item_ids)
        ? metadata.order_item_ids
        : []),
    ].map(String);
    if (explicitIds.includes(selectedItemId)) return true;
    if (!coveredItems.length) return true;
    return coveredItems.some(
      (item) =>
        String(
          item.orderItemId || item.order_item_id || item.id || item._id || "",
        ) === selectedItemId,
    );
  };
  const returnCoversSelectedItem = (returnRequest = {}) => {
    if (!selectedOrderItem) return true;
    return (returnRequest.items || []).some((returnItem) =>
      returnItemMatchesOrderItem(returnItem, selectedOrderItem),
    );
  };
  const visibleReturns = selectedOrderItem
    ? returns.filter(returnCoversSelectedItem)
    : returns;
  const visibleCustomerInvoices = selectedOrderItem
    ? customerInvoices.filter(documentCoversSelectedItem)
    : customerInvoices;
  const visiblePendingSellerDocuments = selectedOrderItem
    ? pendingSellerDocuments.filter(documentCoversSelectedItem)
    : pendingSellerDocuments;

  const returnReverseInvoices = visibleReturns
    .map((returnRequest) => {
      const creditNoteId =
        returnRequest.creditNoteId ||
        returnRequest.credit_note_id ||
        returnRequest.refund?.creditNoteId ||
        returnRequest.refund?.credit_note_id ||
        returnRequest.refund?.metadata?.creditNoteId ||
        returnRequest.refund?.metadata?.credit_note_id;
      if (!creditNoteId) return null;
      const returnNumber =
        returnRequest.returnNumber ||
        returnRequest.return_number ||
        returnRequest.id ||
        returnRequest._id;
      const downloadPath = endpoints.tax.creditNoteDownload(creditNoteId);
      return {
        id: creditNoteId,
        title: "Return reverse invoice",
        subtitle: `For return ${returnNumber}`,
        downloadPath,
        filename: `reverse-invoice-${returnNumber}.pdf`,
      };
    })
    .filter(Boolean);

  const cancellationReverseInvoices = cancellations
    .map((cancellation) => {
      const creditNoteId =
        cancellation.credit_note_id || cancellation.creditNoteId;
      if (!creditNoteId) return null;
      const cancellationNumber =
        cancellation.cancellation_number ||
        cancellation.cancellationNumber ||
        cancellation.id;
      const downloadPath = endpoints.tax.creditNoteDownload(creditNoteId);
      return {
        id: creditNoteId,
        title: "Cancellation reverse invoice",
        subtitle: `For cancellation ${cancellationNumber}`,
        downloadPath,
        filename: `reverse-invoice-${cancellationNumber}.pdf`,
      };
    })
    .filter(Boolean);

  const downloadableDocuments = [
    ...visibleCustomerInvoices.map((invoice, index) => {
      const invoiceId = getDocumentId(invoice);
      if (!invoiceId) return null;
      return {
        id: invoiceId,
        title: "Seller tax invoice",
        subtitle: `${invoiceSellerName(invoice, index)} · ${invoiceItemSummary(invoice)}`,
        downloadPath: endpoints.tax.invoiceDownload(invoiceId),
        filename: `${invoice.invoice_number || invoice.invoiceNumber || `invoice-${index + 1}`}.pdf`,
      };
    }),
    !selectedOrderItem && orderReceipt && getDocumentId(orderReceipt)
      ? {
        id: getDocumentId(orderReceipt),
        title: "Order receipt",
        subtitle: "Marketplace payment summary",
        downloadPath: endpoints.tax.invoiceDownload(
          getDocumentId(orderReceipt),
        ),
        filename: `${orderReceipt.invoice_number || orderReceipt.invoiceNumber || `receipt-${orderId}`}.pdf`,
      }
      : null,
    customerFeeInvoice && getDocumentId(customerFeeInvoice)
      ? {
        id: getDocumentId(customerFeeInvoice),
        title: "Platform fee invoice",
        subtitle: "Marketplace tax invoice for platform fee",
        downloadPath: endpoints.tax.invoiceDownload(
          getDocumentId(customerFeeInvoice),
        ),
        filename: `${customerFeeInvoice.invoice_number || customerFeeInvoice.invoiceNumber || `platform-fee-${orderId}`}.pdf`,
      }
      : null,
    !customerFeeInvoice && customerPlatformFee > 0
      ? {
        id: `pending-platform-fee-${orderId}`,
        title: "Platform fee invoice",
        subtitle: "Will be available after payment document is generated.",
        pending: true,
      }
      : null,
    ...(selectedOrderItem ? [] : cancellationReverseInvoices),
    ...returnReverseInvoices,
  ].filter(Boolean);

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
    item.productTitle ||
    item.productName ||
    item.title ||
    item.name ||
    item.productId ||
    "Returned item";
  const getReturnItemQuantity = (item = {}) =>
    item.approvedQuantity ||
    item.approved_quantity ||
    item.requestedQuantity ||
    item.requested_quantity ||
    item.quantity ||
    1;

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

  useEffect(() => {
    if (!orderId) {
      setInvoices(null);
      return;
    }
    setInvoicesLoading(true);
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => { })
      .finally(() => setInvoicesLoading(false));
  }, [dispatch, orderId]);

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      await run(dispatch, retryOrderPayment({ orderId }), null);
      const paymentResult = await run(
        dispatch,
        initiatePayment({
          orderId,
          provider: "razorpay",
          currency: "INR",
          notes: { source: "web_retry" },
        }),
        null,
      );
      const payment = paymentResult?.data || paymentResult;
      await openRazorpayCheckout({
        dispatch,
        run,
        order,
        orderId,
        payment,
        user: userState.current,
        verifyPayment,
      });
      const refreshed = await dispatch(fetchOrderById({ orderId })).unwrap();
      const refreshedOrder = refreshed?.data?.order || refreshed?.data?.data?.order ||
        refreshed?.data?.data || refreshed?.order || refreshed?.data || refreshed;
      const paymentStatus = String(
        refreshedOrder?.paymentStatus || refreshedOrder?.payment_status || "",
      ).toLowerCase();
      const orderStatus = getOrderStatus(refreshedOrder);
      navigate(
        paymentStatus === "captured" && !["pending_payment", "payment_failed"].includes(orderStatus)
          ? getOpaquePaymentResultPath("success", orderId)
          : getOpaquePaymentResultPath("failed", orderId, "pending_confirmation"),
      );
    } catch (error) {
      const reason = error?.code === "PAYMENT_GATEWAY_FAILED"
        ? "failed"
        : error?.code === "PAYMENT_DISMISSED"
          ? "dismissed"
          : "pending_confirmation";
      navigate(getOpaquePaymentResultPath("failed", orderId, reason));
    } finally {
      setRetrying(false);
      dispatch(fetchOrderById({ orderId }));
    }
  };

  const handleDownload = async (apiPath, filename) => {
    setDownloadingId(apiPath);
    try {
      await downloadAuthDocument(apiPath, filename);
    } catch (error) {
      notify.error(
        error?.message || "Document download failed. Please try again.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelOrder = async () => {
    if (state.loading) return;
    const selectedItems = Object.entries(cancelItems)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([orderItemId, quantity]) => ({
        orderItemId,
        quantity: Number(quantity),
      }));
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
      "Cancellation request submitted for seller/admin approval",
    );
    if (!result) return;
    setCancelModalOpen(false);
    setCancelReason("");
    setCancelReasonError(false);
    setCancelItems({});
    cancelRequestKey.current = null;
    dispatch(fetchOrderById({ orderId }));
  };

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
    visiblePendingSellerDocuments
  };
}
