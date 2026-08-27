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
  { status: "in_transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

export const STATUS_RANK = {
  initiated: 1,
  pending_payment: 1,
  confirmed: 1,
  processing: 1,
  packed: 2,
  ready_to_ship: 2,
  shipped: 3,
  in_transit: 3,
  out_for_delivery: 4,
  delivered: 5,
  fulfilled: 5,
  completed: 5,
  order_closed: 5,
  seller_marked_delivered: 5,
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

  steps.push({
    label: "Cancellation requested",
    completed: true,
    status: "requested",
    time: timelineEvent?.created_at || null,
    note: isMockData
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
      label: "Cancellation approved",
      completed: Boolean(isApproved),
      status: "approved",
      time: timelineEvent?.created_at || null,
      note: isApproved ? "Cancellation request has been approved." : null,
    });

    const isRefunded =
      effectiveCancellation.refund_status === "completed" ||
      effectiveCancellation.refund_status === "processed";
    const refundFailed = effectiveCancellation.refund_status === "failed";

    if (refundFailed) {
      steps.push({
        label: "Refund failed",
        completed: true,
        status: "refund_failed",
        time: null,
        note: `Refund${refundAmountText} could not be processed.`,
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

export const getReturnSteps = (
  returnRequest,
  group,
  currency,
  formatMoney,
  isCodOrder,
) => {
  const steps = [];

  steps.push({
    label: "Return requested",
    completed: true,
    status: "requested",
    time: null,
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

  const isApproved = [
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
    time: null,
    note: null,
  });

  const isPickupScheduled = [
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
    label: "Picked up",
    completed: isPickedUp,
    status: "picked_up",
    time: isPickedUp
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
    time: null,
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
    time: null,
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
    time: null,
    note: null,
  });

  return steps;
};
