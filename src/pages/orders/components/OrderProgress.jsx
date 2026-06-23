import { ORDER_STEPS, RETURN_STEPS, TRACKING_LABELS } from "../../../data/orderPage";
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
            key={`${step.status}-${index}`}
            className="relative flex min-w-0 flex-col items-center gap-2"
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

function OrderProgress({ status, steps = ORDER_STEPS }) {
  const isCancelled = status === "cancelled";
  const isFailed = status === "payment_failed";
  const inReturnFlow = RETURN_STEPS.includes(status);
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
        normalizeProgressStatus(inReturnFlow ? "fulfilled" : status),
    ),
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
      : normalizedSteps.map((step, index) => ({
          label: step.label || TRACKING_LABELS[step.status],
          current: activeIndex === index,
        }));

  const currentStep =
    visibleSteps.find((step) => step.current) ||
    visibleSteps[visibleSteps.length - 1];

  return (
    <div className="space-y-4">
      <StepBar
        steps={normalizedSteps}
        activeStatus={inReturnFlow ? "fulfilled" : status}
        colorClass="border-gold bg-gold"
      />
      {inReturnFlow && (
        <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Return &amp; refund progress
          </p>
          <StepBar
            steps={RETURN_STEPS}
            activeStatus={status}
            colorClass="border-amber-500 bg-amber-500"
          />
        </div>
      )}
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
