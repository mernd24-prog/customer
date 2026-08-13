import {
  ORDER_STEPS,
  REFUND_STEPS,
  RETURN_STEPS,
} from "../../../data/orderPage";
import vectorImage from "/image/png/SuccessVector .png";
import { InfoCircleIcon } from "../../../components/ui/icons";

const normalizeProgressStatus = (status) => {
  if (status === "partially_delivered") {
    return "out_for_delivery";
  }
  if (status === "order_closed") {
    return "fulfilled";
  }
  if (status === "created") return "initiated";
  if (status === "paid") return "confirmed";
  if (status === "requested") return "return_requested";
  if (status === "approved") return "return_approved";
  if (status === "rejected") return "return_rejected";
  if (status === "reverse_pickup_scheduled") return "pickup_scheduled";
  if (status === "manual_ship_back") return "pickup_scheduled";
  if (status === "shipped_back") return "pickup_completed";
  if (status === "in_reverse_transit") return "pickup_completed";
  if (status === "received") return "returned";
  if (status === "qc_passed") return "returned";
  if (status === "qc_completed") return "returned";
  if (status === "refunded") return "refund_completed";
  if (status === "completed") return "refund_completed";
  if (status === "refund_failed") return "refund_pending";
  return status;
};

const CUSTOMER_PROGRESS_STEPS = [
  "initiated",
  "pending_payment",
  "confirmed",
  "processing",
  "packed",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "fulfilled",
  "return_requested",
  "return_approved",
  "pickup_scheduled",
  "pickup_completed",
  "returned",
  "refund_pending",
  "refund_initiated",
  "partially_refunded",
  "refund_completed",
];

const PROGRESS_MESSAGES = {
  initiated: "We have received your order.",
  confirmed: "Your order is confirmed.",
  processing: "The seller is preparing this item.",
  packed: "This item is packed.",
  ready_to_ship: "This item is ready for courier pickup.",
  shipped: "This item has been shipped.",
  out_for_delivery: "This item is out for delivery.",
  delivered: "This item has been delivered.",
  fulfilled: "This item is complete.",
  return_requested: "Return request received for this item.",
  return_approved: "Return approved. Follow the return instructions.",
  pickup_scheduled: "Return pickup has been scheduled.",
  pickup_completed: "Return pickup is complete.",
  returned: "Returned item received.",
  refund_pending: "Refund is waiting to be processed.",
  refund_initiated: "Refund has been initiated.",
  partially_refunded: "Partial refund has been processed.",
  refund_completed: "Refund completed.",
  refunded: "Refund completed.",
};

const CUSTOMER_LABELS = {
  pending_payment: "Payment",
  payment_failed: "Payment failed",
  initiated: "Placed",
  confirmed: "Confirmed",
  processing: "Preparing",
  packed: "Packed",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  in_transit: "In Transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  fulfilled: "Complete",
  cancelled: "Cancelled",
  failed_delivery: "Delivery issue",
  return_requested: "Return requested",
  return_approved: "Return approved",
  return_rejected: "Return rejected",
  pickup_scheduled: "Pickup scheduled",
  pickup_completed: "Picked up",
  returned: "Returned",
  refund_pending: "Refund pending",
  refund_initiated: "Refund started",
  partially_refunded: "Partial refund",
  refund_completed: "Refunded",
  refunded: "Refunded",
  replacement_requested: "Replacement requested",
  replacement_pending: "Replacement pending",
  replacement_created: "Replacement ready",
  replacement_shipped: "Replacement shipped",
  replacement_delivered: "Replacement delivered",
  replaced: "Replaced",
  closed: "Closed",
};

const customerLabel = (status = "") =>
  CUSTOMER_LABELS[normalizeProgressStatus(status)] ||
  TRACKING_LABELS[status] ||
  String(status || "Status")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const buildReadableProgressSteps = (
  baseSteps = [],
  timeline = [],
  activeStatus,
) => {
  const normalizedBase = baseSteps.map(normalizeProgressStatus).filter(Boolean);
  const normalizedTimeline = (timeline || [])
    .map((entry) => normalizeProgressStatus(entry.to_status || entry.status))
    .filter(Boolean);
  const allKnownSteps = new Set([...normalizedBase, ...normalizedTimeline]);
  const active = normalizeProgressStatus(activeStatus);
  const hasReturnOrRefundStep = [...allKnownSteps, active].some(
    (step) =>
      RETURN_STEPS.includes(step) ||
      REFUND_STEPS.includes(step) ||
      step === "returned",
  );

  if (hasReturnOrRefundStep) {
    allKnownSteps.delete("fulfilled");
  }

  if (active && !allKnownSteps.has(active)) {
    allKnownSteps.add(active);
  }

  const orderedSteps = CUSTOMER_PROGRESS_STEPS.filter((step) =>
    allKnownSteps.has(step),
  );
  const extraSteps = [...allKnownSteps].filter(
    (step) => !CUSTOMER_PROGRESS_STEPS.includes(step),
  );

  return [...orderedSteps, ...extraSteps];
};

function StepBar({ steps, activeStatus, colorClass = "border-gold bg-gold" }) {
  const activeIndex = Math.max(
    0,
    steps.indexOf(normalizeProgressStatus(activeStatus)),
  );
  const progressWidth =
    steps.length <= 1 ? 0 : (activeIndex / (steps.length - 1)) * 100;
  const compact = steps.length > 8;
  const lineTop = compact ? 32 : 36;

  return (
    <div
      className="relative grid w-full  py-3"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      <span
        className="absolute h-0.5 overflow-hidden bg-border"
        style={{
          left: `calc(100% / ${steps.length} / 2)`,
          right: `calc(100% / ${steps.length} / 2)`,
          top: `${lineTop}px`,
        }}
      >
        <span
          className={`block h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${progressWidth}%` }}
        />
      </span>
      {steps.map((step, index) => {
        const done = activeIndex >= index;
        const current = activeIndex === index;

        return (
          <div
            key={step}
            className="relative flex min-w-0 flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <div
                className={`flex items-center justify-center rounded-full ${
                  done ? "bg-[#B88200]" : "bg-[#83858C]"
                } ${compact ? "h-9 w-9" : "h-12 w-12"}`}
              >
                <div
                  className={`flex items-center justify-center rounded-full ${
                    done ? "bg-[#CE9F2D]" : "bg-[#8A8C92]"
                  } ${compact ? "h-7 w-7" : "h-8 w-8"}`}
                >
                  <img
                    src={vectorImage}
                    alt="done"
                    className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
                  />
                </div>
              </div>
            </div>
            <p
              className={`mt-2 flex min-h-[32px] w-full items-start justify-center px-1 text-center font-sans text-xs font-semibold leading-4 ${
                current || done ? "text-[#CE9F2D]" : "text-muted"
              }`}
            >
              {customerLabel(step)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MobileStepBar({ steps, activeStatus }) {
  const activeIndex = Math.max(
    0,
    steps.indexOf(normalizeProgressStatus(activeStatus)),
  );

  return (
    <div className="rounded-xl  bg-white  xl:hidden">
      <div className="space-y-0">
        {steps.map((step, index) => {
          const done = activeIndex >= index;
          const current = activeIndex === index;
          const label = customerLabel(step);

          return (
            <div key={step} className="relative flex min-h-12 gap-3">
              {index < steps.length - 1 && (
                <span
                  className={`absolute bottom-0 left-[15px] top-8 w-0.5 ${
                    done && activeIndex > index
                      ? "bg-[#CE9F2D]"
                      : "bg-[#D7D7D7]"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-[#B88200] bg-[#CE9F2D]"
                    : "border-[#A9A9A9] bg-white"
                }`}
              >
                {done ? (
                  <img
                    src={vectorImage}
                    alt="Completed"
                    className="h-3.5 w-3.5"
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#A9A9A9]" />
                )}
              </span>
              <div className="min-w-0 pb-5 pt-1">
                <p
                  className={`text-sm font-semibold capitalize leading-5 ${
                    current || done ? "text-[#B88200]" : "text-muted"
                  }`}
                >
                  {label}
                </p>
                {current && (
                  <p className="mt-0.5 text-xs leading-4 text-muted">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const normalizeRefundStatus = (status) => {
  if (status === "pending") return "refund_pending";
  if (status === "initiated" || status === "processing")
    return "refund_initiated";
  if (status === "completed") return "refund_completed";
  if (status === "refunded") return "refund_completed";
  return status;
};

const getReturnStatus = (returns = [], status) => {
  if (RETURN_STEPS.includes(status)) return status;
  if (status === "partially_returned") return "returned";
  const latestReturn = returns.find(Boolean);
  const returnStatus =
    latestReturn?.status ||
    latestReturn?.return_status ||
    latestReturn?.returnStatus;

  const normalizedReturnStatus = normalizeProgressStatus(returnStatus);
  if (RETURN_STEPS.includes(normalizedReturnStatus)) {
    return normalizedReturnStatus;
  }
  return null;
};

const getRefundStatus = ({ returns = [], cancellations = [], status }) => {
  if (REFUND_STEPS.includes(status)) return status;
  if (status === "refunded") return "refund_completed";

  const records = [...returns, ...cancellations].filter(Boolean);
  for (const record of records) {
    const refundStatus =
      record?.refund?.status ||
      record?.refund_status ||
      record?.refundStatus ||
      record?.status;
    const normalized = normalizeRefundStatus(refundStatus);
    if (REFUND_STEPS.includes(normalized)) return normalized;
  }

  return null;
};

function OrderProgress({
  status,
  cancellations = [],
  returns = [],
  timeline = [],
}) {
  const isCancelled = status === "cancelled";
  const isFailed = status === "payment_failed";
  const isDeliveryFailed = status === "failed_delivery";
  const returnStatus = getReturnStatus(returns, status);
  const refundStatus = getRefundStatus({ returns, cancellations, status });
  const hasFullCancellation = cancellations.some(
    (cancellation) => String(cancellation.scope || "").toLowerCase() === "full",
  );
  const cancelStatus = isCancelled || hasFullCancellation ? "cancelled" : null;

  const activeStatus = cancelStatus || refundStatus || returnStatus || status;

  const mergedTimeline = [...(timeline || [])];
  if (returns && Array.isArray(returns)) {
    returns.forEach((ret) => {
      if (ret.timeline && Array.isArray(ret.timeline)) {
        mergedTimeline.push(...ret.timeline);
      }
    });
  }
  mergedTimeline.sort(
    (a, b) =>
      new Date(a.created_at || a.at).getTime() -
      new Date(b.created_at || b.at).getTime(),
  );

  let progressSteps = cancelStatus
    ? ["initiated", "cancelled"]
    : refundStatus
      ? [...ORDER_STEPS, ...RETURN_STEPS, ...REFUND_STEPS]
      : returnStatus
        ? [...ORDER_STEPS, ...RETURN_STEPS]
        : isFailed
          ? ["initiated", "payment_failed"]
          : isDeliveryFailed
            ? [
                ...ORDER_STEPS.slice(
                  0,
                  ORDER_STEPS.indexOf("out_for_delivery") + 1,
                ),
                "failed_delivery",
              ]
            : ORDER_STEPS;

  if (!cancelStatus && !isFailed && !isDeliveryFailed) {
    progressSteps = buildReadableProgressSteps(
      progressSteps,
      mergedTimeline,
      activeStatus,
    );
  }

  return (
    <div className="">
      <div className="hidden  xl:block">
        <StepBar
          steps={progressSteps}
          activeStatus={activeStatus}
          colorClass="border-gold bg-gold"
        />
      </div>
      <MobileStepBar steps={progressSteps} activeStatus={activeStatus} />
      {!isCancelled &&
        !isFailed &&
        !isDeliveryFailed &&
        PROGRESS_MESSAGES[normalizeProgressStatus(activeStatus)] && (
          <div className="mx-3 mb-3 flex items-center gap-3 rounded-lg bg-[#F8F9FA] px-4 py-3">
            <InfoCircleIcon className="h-5 w-5 shrink-0 text-[#83858C]" />
            <p className="text-sm font-medium text-[#333333]">
              {PROGRESS_MESSAGES[normalizeProgressStatus(activeStatus)]}
            </p>
          </div>
        )}
    </div>
  );
}

export { StepBar };
export default OrderProgress;
