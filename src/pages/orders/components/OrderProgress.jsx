import {
  ORDER_STEPS,
  REFUND_STEPS,
  RETURN_STEPS,
  TRACKING_LABELS,
} from "../../../data/orderPage";
import vectorImage from "/image/png/SuccessVector .png";

const normalizeProgressStatus = (status) => {
  if (status === "out_for_delivery" || status === "partially_delivered") {
    return "delivered";
  }
  if (status === "order_closed") {
    return "fulfilled";
  }
  return status;
};

function StepBar({ steps, activeStatus, colorClass = "border-gold bg-gold" }) {
  const normalizedSteps = steps.map((step) =>
    typeof step === "string"
      ? { status: step, label: TRACKING_LABELS[step] }
      : step,
  );

  const activeIndex = Math.max(
    0,
    normalizedSteps.findIndex(
      (step) =>
        normalizeProgressStatus(step.status) ===
        normalizeProgressStatus(activeStatus),
    ),
  );
  const progressWidth =
    normalizedSteps.length <= 1
      ? 0
      : (activeIndex / (normalizedSteps.length - 1)) * 100;

  return (
    <div
      className="relative grid min-w-0 gap-2 px-1 py-3"
      style={{
        gridTemplateColumns: `repeat(${normalizedSteps.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        className="absolute top-[3rem] h-0.5 overflow-hidden bg-border"
        style={{
          left: `calc(100% / ${normalizedSteps.length} / 2)`,
          right: `calc(100% / ${normalizedSteps.length} / 2)`,
        }}
      >
        <span
          className={`block h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${progressWidth}%` }}
        />
      </span>
      {normalizedSteps.map((step, index) => {
        const done = activeIndex >= index;
        const current = activeIndex === index;
        const label =
          step.status === "pending_payment"
            ? "Payment"
            : step.label || TRACKING_LABELS[step.status] || String(step.status);

        return (
          <div
            key={step}
            className="relative flex min-w-0 flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <div
                className={`flex h-[70px] w-[70px] items-center justify-center rounded-full ${
                  done ? "bg-[#B88200]" : "bg-[#83858C]"
                }`}
              >
                <div
                  className={`flex h-[50px] w-[50px] items-center justify-center rounded-full ${
                    done ? "bg-[#CE9F2D]" : "bg-[#8A8C92]"
                  }`}
                >
                  <img src={vectorImage} alt="done" className="h-5 w-5" />
                </div>
              </div>
            </div>
            <p
              className={`mt-3 min-h-[26px] w-full max-w-[140px] text-center font-sans text-[20px] font-semibold leading-[26px] ${
                current || done ? "text-[#CE9F2D]" : "text-muted"
              }`}
            >
              {label}
            </p>
            {step.note ? (
              <p className="mt-1 w-full max-w-[160px] text-center text-[18px] font-medium leading-5 text-muted">
                {step.note}
              </p>
            ) : null}
          </div>
        );
      })}
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

function OrderProgress({ status, cancellations = [], returns = [] }) {
  const isCancelled = status === "cancelled";
  const isFailed = status === "payment_failed";
  const returnStatus = getReturnStatus(returns, status);
  const refundStatus = getRefundStatus({ returns, cancellations, status });
  const cancelStatus =
    isCancelled || cancellations.length > 0 ? "cancelled" : null;
  const progressSteps = cancelStatus
    ? ["pending_payment", "confirmed", "cancelled"]
    : refundStatus
      ? [...ORDER_STEPS, ...RETURN_STEPS, ...REFUND_STEPS]
      : returnStatus
        ? [...ORDER_STEPS, ...RETURN_STEPS]
        : isFailed
          ? ["pending_payment", "payment_failed"]
          : ORDER_STEPS;
  const activeStatus =
    cancelStatus || refundStatus || returnStatus || status;
  const activeIndex = progressSteps.indexOf(normalizeProgressStatus(activeStatus));
  const visibleSteps =
    isCancelled || isFailed
      ? [
          {
            label: TRACKING_LABELS.confirmed,
            note: "Your order update has been recorded.",
          },
          {
            label: TRACKING_LABELS[status],
            note: isCancelled
              ? "Your cancellation request is being processed."
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
    <div className="space-y-4 ">
      <StepBar
        steps={progressSteps}
        activeStatus={activeStatus}
        colorClass="border-gold bg-gold"
      />
      {(isCancelled || isFailed) && (
        <div className="rounded-[8px] border border-border bg-white px-4 py-3 text-sm">
          <p className="font-semibold capitalize text-ink">
            {currentStep?.label || "Status update"}
          </p>
          <p className="mt-1 text-xs text-muted">{currentStep?.note}</p>
        </div>
      )}
    </div>
  );
}

export { StepBar };
export default OrderProgress;
