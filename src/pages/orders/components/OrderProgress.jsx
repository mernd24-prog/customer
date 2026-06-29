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
  const activeIndex = Math.max(
    0,
    steps.indexOf(normalizeProgressStatus(activeStatus)),
  );
  const progressWidth =
    steps.length <= 1 ? 0 : (activeIndex / (steps.length - 1)) * 100;

  return (
    <div
      className="relative grid min-w-0 gap-2 px-1 py-8"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      <span
        className="absolute top-[67px] h-0.5 overflow-hidden bg-border"
        style={{
          left: `calc(100% / ${steps.length} / 2)`,
          right: `calc(100% / ${steps.length} / 2)`,
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
              className={`mt-3 flex h-[26px] w-[92px] items-center justify-center text-center font-sans text-[20px] font-semibold leading-[26px] ${
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
  const activeStatus = cancelStatus || refundStatus || returnStatus || status;
  const activeIndex = progressSteps.indexOf(
    normalizeProgressStatus(activeStatus),
  );
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
    <div className="space-y-6   mb-6 ">
      <div className="hidden  xl:block">
        <StepBar
          steps={progressSteps}
          activeStatus={activeStatus}
          colorClass="border-gold bg-gold"
        />
      </div>
      <MobileStepBar steps={progressSteps} activeStatus={activeStatus} />
      {(isCancelled || isFailed) && (
        <div className="rounded-[8px]   md:border md:border-border bg-white px-4 py-3 text-sm">
          <p className="font-semibold  capitalize text-ink">
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
