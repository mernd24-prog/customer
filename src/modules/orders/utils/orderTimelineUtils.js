export const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export const TIMELINE_STEPS = [
  { status: "confirmed", label: "Order Confirmed" },
  { status: "shipped", label: "Shipped / Handed to Courier" },
  { status: "in_transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

export const STATUS_RANK = {
  initiated: 0,
  pending_payment: 0,
  payment_failed: 0,
  confirmed: 1,
  processing: 1,
  packed: 2,
  ready_to_ship: 2,
  shipped: 3,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  partially_delivered: 5,
  delivered: 6,
  fulfilled: 6,
  completed: 6,
  order_closed: 6,
  seller_marked_delivered: 6,
};

export const getCancellationSteps = (
  cancellation,
  group,
  currency,
  formatMoney,
  isCodOrder,
) => {
  const itemWithCancellation = group?.items?.find(
    (gi) =>
      gi.cancellation_status ||
      gi.timeline?.some(
        (t) =>
          t.source === "cancellation" || t.status?.includes("cancellation"),
      ),
  );
  const timelineEvent = itemWithCancellation?.timeline?.find(
    (t) => t.source === "cancellation" || t.status?.includes("cancellation"),
  );

  const effectiveCancellation = cancellation || {
    status:
      itemWithCancellation?.cancellation_status ||
      timelineEvent?.status ||
      timelineEvent?.to_status ||
      "cancellation_approved",
    reason: timelineEvent?.note || "User requested cancellation",
    refund_amount:
      itemWithCancellation?.cancellation_lifecycle?.refundAmount || 0,
  };

  const steps = [];

  const reasonText = effectiveCancellation.reason || "";
  const isMockData = reasonText.includes("Request item cancellation?");
  const scenario = effectiveCancellation.metadata?.refundPolicyScenario;
  const isRtoCancellation = Boolean(
    effectiveCancellation.metadata?.rtoSettlement ||
      effectiveCancellation.reason_code === "shipment_rto" ||
      scenario === "rtoDeliveryFailed",
  );
  const isSellerCancellation = Boolean(
    effectiveCancellation.metadata?.sellerSupplyCancellation ||
      scenario === "sellerCancellation",
  );
  const isMerchantFault = isRtoCancellation || isSellerCancellation;

  steps.push({
    label: isRtoCancellation
      ? "Delivery could not be completed"
      : isSellerCancellation
        ? "Cancelled by seller"
        : "Cancellation requested",
    completed: true,
    status: "requested",
    time: timelineEvent?.created_at || null,
    note: isMerchantFault
      ? "This was not caused by you. No action is required from you."
      : isMockData
      ? "User requested cancellation"
      : effectiveCancellation.reason || "Not specified",
  });

  const refundAmountText =
    Number(effectiveCancellation.refund_amount) > 0 && formatMoney
      ? ` of ${formatMoney(effectiveCancellation.refund_amount, currency)}`
      : "";
  const codNote =
    isCodOrder && effectiveCancellation.refund_status !== "not_required"
      ? " COD refund: after approval, the refund is completed through the marketplace COD refund process."
      : "";

  if (
    effectiveCancellation.status === "failed" ||
    effectiveCancellation.status === "rejected"
  ) {
    steps.push({
      label: "Cancellation failed",
      completed: true,
      status: "rejected",
      time: null,
      note:
        effectiveCancellation.rejection_reason ||
        effectiveCancellation.metadata?.rejectionReason,
    });
  } else {
    const isApproved =
      effectiveCancellation.metadata?.approvedAt ||
      effectiveCancellation.status === "approved" ||
      effectiveCancellation.status === "completed" ||
      effectiveCancellation.status === "cancellation_approved" ||
      effectiveCancellation.status === "cancelled";
    steps.push({
      label: isMerchantFault ? "Refund eligibility confirmed" : "Cancellation approved",
      completed: Boolean(isApproved),
      status: "approved",
      time: timelineEvent?.created_at || null,
      note: isApproved
        ? isMerchantFault
          ? "The item amount and eligible customer-paid delivery and platform fees will be returned."
          : "Cancellation request has been approved."
        : null,
    });

    const isRefunded =
      effectiveCancellation.refund_status === "completed" ||
      effectiveCancellation.refund_status === "processed";
    const refundFailed = effectiveCancellation.refund_status === "failed";

    if (refundFailed) {
      steps.push({
        label: isMerchantFault ? "Refund needs review" : "Refund failed",
        completed: true,
        status: "refund_failed",
        time: null,
        note: isMerchantFault
          ? `We are reviewing the refund${refundAmountText}. No action is required from you.`
          : `Refund${refundAmountText} could not be processed.`,
      });
    } else if (isRefunded) {
      steps.push({
        label: "Refund completed",
        completed: true,
        status: "refunded",
        time: null,
        note: `Refund${refundAmountText} has been successfully processed.${codNote}`,
      });
    } else {
      steps.push({
        label: "Refund pending",
        completed: false,
        status: "refund_pending",
        time: null,
        note: isApproved
          ? `Refund${refundAmountText} will be processed shortly.${codNote}`
          : null,
      });
    }
  }
  return steps;
};

export const getDoorstepReturnSteps = (request = {}) => {
  const qc = request.collectionQc || {};
  const status = String(request.status || "");
  const replacement = ["replacement", "exchange"].includes(request.resolution);
  const timeline = request.timeline || [];
  const at = state => [...timeline].reverse().find(event => event.status === state)?.at || null;
  const createdAt = request.createdAt || request.created_at || at("requested");
  const approvedAt = request.approvedAt || request.approved_at || at("approved");
  const approved = !!approvedAt || !["requested", "rejected", "cancelled"].includes(status);
  const steps = [{ label: "Return requested", status: "requested", completed: true, time: createdAt }];
  if (["rejected", "cancelled"].includes(status)) {
    return [...steps, { label: `Return ${status}`, status, completed: true, time: at(status) }];
  }
  steps.push({ label: "Return approved", status: "approved", completed: approved, time: approvedAt });
  if (replacement) steps.push({
    label: "Replacement dispatched", status: "replacement_dispatched",
    completed: !!request.replacement?.shippedAt, time: request.replacement?.shippedAt,
  });
  const failedPickup = ["pickup_failed", "return_pickup_failed"].includes(status);
  steps.push({
    label: failedPickup ? "Pickup failed" : replacement ? "Exchange visit scheduled" : "Pickup scheduled",
    status: failedPickup ? "pickup_failed" : "pickup_scheduled",
    completed: failedPickup || !!request.reverseShipment?.pickupScheduledAt || !!qc.inspectedAt,
    time: failedPickup ? at("pickup_failed") : request.reverseShipment?.pickupScheduledAt,
    exception: failedPickup,
    notice: failedPickup ? "Pickup could not be completed. The seller will need to arrange another visit." : null,
  });
  const failedQc = status === "qc_failed" || status === "qc_failure_upheld";
  steps.push({
    label: failedQc ? "Doorstep QC failed" : qc.status === "partially_passed" ? "Doorstep QC partially passed" : "Doorstep QC",
    status: "doorstep_qc", completed: !!qc.inspectedAt, time: qc.inspectedAt,
    exception: failedQc,
    notice: failedQc ? status === "qc_failure_upheld"
      ? "The item was not collected because it did not meet the return checks. The rejection was confirmed after review."
      : "The item remains with you. View the inspection findings below. If you disagree, request platform review before the displayed deadline."
      : qc.status === "partially_passed" ? "Only the accepted quantities qualify for collection and refund. Rejected units remain with you." : null,
  });
  steps.push({ label: replacement ? "Old item collected" : "Return item collected", status: "doorstep_collected", completed: !!qc.collectedAt, time: qc.collectedAt });
  if (replacement) {
    const delivered = ["replacement_delivered", "replaced"].includes(status) ||
      ["delivered", "completed"].includes(request.replacement?.status);
    steps.push({ label: "Replacement handed over", status: "replacement_delivered", completed: delivered, time: delivered ? request.replacement?.deliveredAt : null });
  } else {
    const refunded = request.refund?.status === "completed" || status === "refunded";
    const failed = status === "refund_failed" || request.refund?.status === "failed";
    steps.push({ label: failed ? "Refund needs attention" : refunded ? "Refund completed" : failedQc && !qc.collectedAt ? "Refund awaiting review" : qc.collectedAt ? "Collected — refund pending" : "Refund pending", status: "refund_processed", completed: refunded,
      time: request.refund?.processedAt || request.refundedAt, exception: failed,
      notice: failed ? "Your item was collected. The refund needs attention from the platform; contact support for an update." : null });
  }
  return steps;
};

export const getReturnSteps = (
  returnRequest,
  group,
  currency,
  formatMoney,
  isCodOrder,
) => {
  if (returnRequest?.collectionQc?.required && returnRequest?.reverseShipment?.provider !== "customer_manual") {
    return getDoorstepReturnSteps(returnRequest);
  }
  const steps = [];
  const requestTime =
    returnRequest?.created_at ||
    returnRequest?.createdAt ||
    returnRequest?.updated_at ||
    returnRequest?.updatedAt ||
    null;

  steps.push({
    label: "Return requested",
    completed: true,
    status: "requested",
    time: requestTime,
    note: returnRequest?.reason || "Not specified",
  });

  if (
    returnRequest?.status === "rejected" ||
    returnRequest?.status === "cancelled"
  ) {
    steps.push({
      label: `Return ${returnRequest.status}`,
      completed: true,
      status: returnRequest.status,
      time: null,
      note:
        returnRequest.rejection_reason ||
        returnRequest.metadata?.rejectionReason ||
        "Return request was not approved.",
    });
    return steps;
  }

  const currentStatus = String(
    returnRequest?.status ||
      returnRequest?.return_status ||
      returnRequest?.returnStatus ||
      group?.items?.find((i) => i.return_status || i.return_lifecycle)?.return_status ||
      (group?.status?.includes("return") ? group?.status : null) ||
      ""
  ).toLowerCase();

  const pickupFailed = ["pickup_failed", "return_pickup_failed"].includes(currentStatus);
  const failureEvent = [...(returnRequest?.timeline || [])].reverse().find(
    event => ["pickup_failed", "return_pickup_failed"].includes(event.status),
  );

  const isApproved = [
    "pickup_failed",
    "return_pickup_failed",
    "approved",
    "return_approved",
    "reverse_pickup_scheduled",
    "pickup_scheduled",
    "in_reverse_transit",
    "picked_up",
    "received",
    "qc_completed",
    "qc_passed",
    "return_qc_passed",
    "qc_failed",
    "return_qc_failed",
    "completed",
    "refund_processed",
    "refunded",
    "partially_returned",
    "returned",
  ].includes(currentStatus);
  const pickupDate =
    returnRequest?.reverseShipment?.pickupScheduledAt ||
    returnRequest?.metadata?.pickupScheduledAt;

  steps.push({
    label: "Return approved",
    completed: isApproved,
    status: "approved",
    time:
      returnRequest?.approved_at ||
      returnRequest?.approvedAt ||
      returnRequest?.metadata?.approvedAt ||
      requestTime,
    note: null,
  });

  const isPickupScheduled = [
    "pickup_failed",
    "return_pickup_failed",
    "reverse_pickup_scheduled",
    "pickup_scheduled",
    "in_reverse_transit",
    "picked_up",
    "received",
    "qc_completed",
    "qc_passed",
    "return_qc_passed",
    "qc_failed",
    "return_qc_failed",
    "completed",
    "refund_processed",
    "refunded",
    "partially_returned",
    "returned",
  ].includes(currentStatus);

  steps.push({
    label: "Pickup scheduled",
    completed: isPickupScheduled,
    status: "pickup_scheduled",
    time: isPickupScheduled ? pickupDate || returnRequest?.updated_at : null,
    note: null,
  });

  const isPickedUp = [
    "in_reverse_transit",
    "picked_up",
    "received",
    "qc_completed",
    "qc_passed",
    "return_qc_passed",
    "qc_failed",
    "return_qc_failed",
    "completed",
    "refund_processed",
    "refunded",
    "partially_returned",
    "returned",
  ].includes(currentStatus);

  steps.push({
    label: pickupFailed ? "Pickup failed" : "Picked up",
    completed: pickupFailed || isPickedUp,
    status: pickupFailed ? "pickup_failed" : "picked_up",
    exception: pickupFailed,
    notice: pickupFailed
      ? "Pickup could not be completed. The seller can arrange another pickup or provide ship-back instructions."
      : null,
    time: pickupFailed
      ? failureEvent?.at || returnRequest?.updatedAt || returnRequest?.updated_at || null
      : isPickedUp
      ? returnRequest?.metadata?.pickedUpAt ||
        returnRequest?.reverseShipment?.pickedUpAt ||
        returnRequest?.updated_at
      : null,
    note: null,
  });

  const isReturned = [
    "received",
    "qc_completed",
    "qc_passed",
    "return_qc_passed",
    "qc_failed",
    "return_qc_failed",
    "completed",
    "refund_processed",
    "refunded",
    "partially_returned",
    "returned",
  ].includes(currentStatus);

  steps.push({
    label: "Returned",
    completed: isReturned,
    status: "returned",
    time:
      returnRequest?.received_at ||
      returnRequest?.receivedAt ||
      returnRequest?.metadata?.receivedAt ||
      returnRequest?.updated_at ||
      returnRequest?.updatedAt ||
      requestTime,
    note: null,
  });

  const isQcCompleted =
    [
      "qc_completed",
      "qc_passed",
      "return_qc_passed",
      "qc_failed",
      "return_qc_failed",
      "completed",
      "refund_processed",
      "refunded",
      "partially_returned",
    ].includes(currentStatus) || currentStatus.includes("qc");

  let qcLabel = "QC Pending";
  if (isQcCompleted) {
    if (currentStatus.includes("fail")) qcLabel = "QC Failed";
    else qcLabel = "QC Passed";
  }

  steps.push({
    label: isQcCompleted ? qcLabel : "QC Pending",
    completed: isQcCompleted,
    status: "qc",
    time:
      returnRequest?.qc_completed_at ||
      returnRequest?.qcCompletedAt ||
      returnRequest?.metadata?.qcCompletedAt ||
      returnRequest?.updated_at ||
      returnRequest?.updatedAt ||
      requestTime,
    note: null,
  });

  const isRefundProcessed =
    ["refund_processed", "refund_completed", "completed", "refunded"].includes(currentStatus) ||
    returnRequest?.refund?.status === "processed" ||
    returnRequest?.refund?.status === "completed" ||
    currentStatus.includes("refund");

  steps.push({
    label: "Refund processed",
    completed: isRefundProcessed,
    status: "refund_processed",
    time:
      returnRequest?.refund?.processed_at ||
      returnRequest?.refund?.processedAt ||
      returnRequest?.refund?.updated_at ||
      returnRequest?.refund?.updatedAt ||
      returnRequest?.updated_at ||
      returnRequest?.updatedAt ||
      requestTime,
    note: null,
  });

  return steps;
};
