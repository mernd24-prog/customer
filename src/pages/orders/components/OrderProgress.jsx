import {
  ORDER_STEPS,
  REFUND_STEPS,
  RETURN_STEPS,
  TRACKING_LABELS,
} from "../../../data/orderPage";
import vectorImage from "/image/png/SuccessVector .png";

const normalizeProgressStatus = (status) => {
  if (status === "partially_delivered") {
    return "out_for_delivery";
  }
  if (status === "order_closed") {
    return "fulfilled";
  }
  if (status === "requested") return "return_requested";
  if (status === "approved") return "return_approved";
  if (status === "rejected") return "return_rejected";
  return status;
};

const PROGRESS_MESSAGES = {
  initiated: "Your order has been initiated.",
  confirmed: "Your order is confirmed and waiting for seller packing.",
  processing: "The seller is preparing your items.",
  packed: "Your order is packed and ready for shipment details.",
  ready_to_ship: "Your order is ready to be handed to the courier.",
  shipped: "Your order has shipped. Use shipment tracking for courier updates.",
  out_for_delivery:
    "Your order has active delivery progress. Orders may arrive separately.",
  delivered:
    "Your order has been delivered. Item return windows are now active.",
  fulfilled: "The return window has closed and this order is complete.",
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
              {step === "pending_payment" ? "Payment" : TRACKING_LABELS[step]}
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
          const label =
            step === "pending_payment"
              ? "Payment"
              : TRACKING_LABELS[step] || step.replace(/_/g, " ");

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
                    Current order status
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
  if (returnStatus === "approved") return "return_approved";
  if (returnStatus === "requested") return "return_requested";
  if (returnStatus === "pickup_scheduled") return "pickup_scheduled";
  if (returnStatus === "pickup_completed") return "pickup_completed";
  if (returnStatus === "received" || returnStatus === "returned")
    return "returned";
  return RETURN_STEPS.includes(returnStatus) ? returnStatus : null;
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
  const cancelStatus =
    isCancelled || cancellations.length > 0 ? "cancelled" : null;

  let progressSteps = cancelStatus
    ? ["pending_payment", "confirmed", "cancelled"]
    : refundStatus
      ? [...ORDER_STEPS, ...RETURN_STEPS, ...REFUND_STEPS]
      : returnStatus
        ? [...ORDER_STEPS, ...RETURN_STEPS]
        : isFailed
          ? ["pending_payment", "payment_failed"]
          : isDeliveryFailed
            ? [
                ...ORDER_STEPS.slice(
                  0,
                  ORDER_STEPS.indexOf("out_for_delivery") + 1,
                ),
                "failed_delivery",
              ]
            : ORDER_STEPS;

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

  if (mergedTimeline.length > 0) {
    const timelineSteps = Array.from(
      new Set(
        mergedTimeline
          .map((t) => normalizeProgressStatus(t.to_status || t.status))
          .filter(Boolean),
      ),
    );
    if (timelineSteps.length > 0) {
      progressSteps = timelineSteps;
    }
  }
  const activeStatus = cancelStatus || refundStatus || returnStatus || status;
  const activeIndex = progressSteps.indexOf(
    normalizeProgressStatus(activeStatus),
  );
  const visibleSteps =
    isCancelled || isFailed || isDeliveryFailed
      ? [
          {
            label: TRACKING_LABELS.confirmed,
            note: "Your order update has been recorded.",
          },
          {
            label: TRACKING_LABELS[status],
            note: isCancelled
              ? "Your cancellation request is being processed."
              : isDeliveryFailed
                ? "Delivery could not be completed. We will update you with the next step."
                : "Payment could not be completed for this order.",
          },
        ]
      : progressSteps.map((step, index) => ({
          label: TRACKING_LABELS[step],
          current: activeIndex === index,
        }));

  const currentStep =
    visibleSteps.find((step) => step.current) ||
    visibleSteps[visibleSteps.length - 1];

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
            <svg
              className="h-5 w-5 shrink-0 text-[#83858C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
