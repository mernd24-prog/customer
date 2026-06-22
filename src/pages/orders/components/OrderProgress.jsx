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
  const activeIndex = Math.max(
    0,
    steps.indexOf(normalizeProgressStatus(activeStatus)),
  );
  const progressWidth =
    steps.length <= 1 ? 0 : (activeIndex / (steps.length - 1)) * 100;

  return (
    <div
      className="relative grid min-w-[720px] gap-2 px-1 py-3 lg:min-w-0"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      <span
        className="absolute top-[3rem] h-0.5 overflow-hidden bg-border"
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
          <div key={step} className="relative flex min-w-0 flex-col items-center">
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

function OrderProgress({ status }) {
  const isCancelled = status === "cancelled";
  const isFailed = status === "payment_failed";
  const inReturnFlow = RETURN_STEPS.includes(status);
  const activeIndex = ORDER_STEPS.indexOf(inReturnFlow ? "fulfilled" : status);
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
      : ORDER_STEPS.map((step, index) => ({
          label: TRACKING_LABELS[step],
          current: activeIndex === index,
        }));

  const currentStep =
    visibleSteps.find((step) => step.current) ||
    visibleSteps[visibleSteps.length - 1];

  return (
    <div className="space-y-4">
      <StepBar
        steps={ORDER_STEPS}
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
