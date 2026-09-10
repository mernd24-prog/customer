import { Check, X } from "lucide-react";
import { ShowMoreText } from "../../../utils/showMore";
import {
  dateTime,
  TIMELINE_STEPS,
  STATUS_RANK,
  getCancellationSteps,
  getReturnSteps,
} from "../utils/orderTimelineUtils";
import { useMemo } from "react";

export function OrderTimeline({
  isCancelled,
  isReturned,
  groupCancellation,
  resolvedGroupReturn,
  group,
  events,
  currentRank,
  shipment,
  expectedDelivery,
  currency,
  formatMoney,
  isCodOrder,
}) {
  const stepsToRender = useMemo(() => {
    if (isCancelled || isReturned) {
      if (isCancelled) {
        return getCancellationSteps(
          groupCancellation,
          group,
          currency,
          formatMoney,
          isCodOrder,
        );
      }
      return getReturnSteps(
        resolvedGroupReturn,
        group,
        currency,
        formatMoney,
        isCodOrder,
      );
    }
    return null;
  }, [
    isCancelled,
    isReturned,
    groupCancellation,
    resolvedGroupReturn,
    group,
    currency,
    formatMoney,
    isCodOrder,
  ]);

  if (stepsToRender) {
    return (
      <>
        {stepsToRender.map((step, stepIndex) => {
          const isCompleted = step.completed;
          const isCancelledStep =
            step.status === "cancelled" ||
            step.status === "cancellation_requested";
          const isLast = stepIndex === stepsToRender.length - 1;
          const lineDelay = `${stepIndex * 0.35}s`;
          const ballDelay = `${stepIndex * 0.35}s`;
          const displayTime = step.time ? dateTime(step.time) : null;

          const isNextStepCompleted =
            stepIndex < stepsToRender.length - 1 &&
            stepsToRender[stepIndex + 1].completed;

          const nextIsCancelled =
            stepIndex < stepsToRender.length - 1 &&
            (stepsToRender[stepIndex + 1].status === "cancelled" ||
              stepsToRender[stepIndex + 1].status === "cancellation_requested");

          const lineColor = nextIsCancelled ? "bg-[#E53935]" : "bg-[#26A541]";

          return (
            <div key={step.status} className="relative pb-6 pl-7 last:pb-0">
              {!isLast && (
                <span className="absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] bg-[#E0E0E0] z-0" />
              )}
              {!isLast && isCompleted && isNextStepCompleted && (
                <span
                  className={`absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] ${lineColor} origin-top animate-timeline-line z-0`}
                  style={{ animationDelay: lineDelay }}
                />
              )}

              {isCompleted ? (
                <span
                  className={`absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full flex items-center justify-center ${
                    isCancelledStep
                      ? "animate-ball-fill-red"
                      : "animate-ball-fill-green"
                  } ${
                    isLast || !isNextStepCompleted
                      ? "animate-timeline-pulse"
                      : ""
                  }`}
                  style={{ animationDelay: ballDelay }}
                >
                  {isCancelledStep ? (
                    <X className="h-2.5 w-2.5 stroke-[3] text-current" />
                  ) : (
                    <Check className="h-2.5 w-2.5 stroke-[3] text-current" />
                  )}
                </span>
              ) : (
                <span className="absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full border border-[#D7D7D7] bg-[#F5F5F5] flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 stroke-[2] text-[#B0B0B0]" />
                </span>
              )}

              <div>
                <p
                  className={`text-sm font-semibold ${
                    isCompleted
                      ? isCancelledStep
                        ? "text-[#E53935]"
                        : "text-[#2E2E2E]"
                      : "text-[#6F7480]"
                  }`}
                >
                  {step.label}
                </p>

                {step.note && (
                  <ShowMoreText
                    text={
                      typeof step.note === "string"
                        ? step.note.replace(/_/g, " ")
                        : step.note
                    }
                    mode="lines"
                    limit={1}
                    className="mt-1 block"
                    textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                    buttonClassName="text-[11px] font-semibold text-[#26A541] hover:underline ml-1"
                    moreLabel="Show more"
                    lessLabel="Show less"
                  />
                )}

                {isCompleted && displayTime && (
                  <p className="mt-1 text-xs font-medium text-[#6F7480]">
                    {displayTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {TIMELINE_STEPS.map((step, stepIndex) => {
        const stepRank = STATUS_RANK[step.status];
        const isCompleted = currentRank >= stepRank;

        const matchingEvent = isCompleted
          ? events?.find(
              (e) =>
                e.status === step.status ||
                e.to_status === step.status ||
                e.toStatus === step.status ||
                (step.status === "delivered" &&
                  (e.status === "delivered" ||
                    e.to_status === "delivered" ||
                    e.toStatus === "delivered" ||
                    e.status === "fulfilled" ||
                    e.to_status === "fulfilled" ||
                    e.reason === "seller_marked_delivered" ||
                    e.status === "completed" ||
                    e.to_status === "completed")) ||
                (step.status === "in_transit" &&
                  (e.status === "shipped" ||
                    e.to_status === "shipped" ||
                    e.status === "in_transit" ||
                    e.to_status === "in_transit" ||
                    e.status === "out_for_delivery" ||
                    e.to_status === "out_for_delivery" ||
                    e.status === "ready_to_ship" ||
                    e.status === "packed")) ||
                (step.status === "confirmed" &&
                  (e.status === "initiated" ||
                    e.to_status === "initiated" ||
                    e.status === "pending_payment" ||
                    e.to_status === "pending_payment" ||
                    e.status === "confirmed" ||
                    e.to_status === "confirmed")),
            )
          : null;
        const displayTime = matchingEvent
          ? dateTime(matchingEvent.event_time || matchingEvent.created_at)
          : null;

        const isExpectedDelivery =
          step.status === "delivered" || step.status === "out_for_delivery";
        const showExpected =
          !isCompleted && isExpectedDelivery && expectedDelivery;

        const isNextStepCompleted =
          stepIndex < TIMELINE_STEPS.length - 1 &&
          currentRank >= STATUS_RANK[TIMELINE_STEPS[stepIndex + 1].status];
        const isLast = stepIndex === TIMELINE_STEPS.length - 1;
        const lineDelay = `${stepIndex * 0.35}s`;
        const ballDelay = `${stepIndex * 0.35}s`;
        const isCurrentActive = isCompleted && (!isNextStepCompleted || isLast);

        let fallbackTime = shipment?.updated_at || group?.expectedDeliveryAt;
        if (step.status === "confirmed")
          fallbackTime = group?.items?.[0]?.created_at || fallbackTime;

        return (
          <div key={step.status} className="relative pb-6 pl-7 last:pb-0">
            {!isLast && (
              <span className="absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] bg-[#E0E0E0] z-0" />
            )}
            {!isLast && isCompleted && isNextStepCompleted && (
              <span
                className="absolute left-[7px] top-[10px] bottom-[-14px] w-[2px] bg-[#26A541] origin-top animate-timeline-line z-0"
                style={{ animationDelay: lineDelay }}
              />
            )}

            {isCompleted ? (
              <span
                className={`absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full flex items-center justify-center animate-ball-fill-green ${
                  isCurrentActive ? "animate-timeline-pulse" : ""
                }`}
                style={{ animationDelay: ballDelay }}
              >
                <Check className="h-2.5 w-2.5 stroke-[3] text-current" />
              </span>
            ) : (
              <span className="absolute left-0 top-0.5 z-10 h-4 w-4 rounded-full border border-[#D7D7D7] bg-[#F5F5F5] flex items-center justify-center">
                <Check className="h-2.5 w-2.5 stroke-[2] text-[#B0B0B0]" />
              </span>
            )}

            <div>
              <p
                className={`text-sm font-semibold ${isCompleted ? "text-[#2E2E2E]" : "text-[#6F7480]"}`}
              >
                {step.label}
              </p>

              {matchingEvent?.note ? (
                <ShowMoreText
                  text={
                    typeof matchingEvent.note === "string"
                      ? matchingEvent.note.replace(/_/g, " ")
                      : matchingEvent.note
                  }
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                  buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : isCompleted && step.status === "confirmed" ? (
                <ShowMoreText
                  text="Your order has been placed."
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                  buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : isCompleted && step.status === "in_transit" ? (
                <ShowMoreText
                  text="Your package is on the way to the delivery address."
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-[#2E2E2E] whitespace-pre-wrap"
                  buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : !isCompleted && step.status === "in_transit" ? (
                <ShowMoreText
                  text="Will be updated as soon as the item is shipped."
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-[#6F7480] whitespace-pre-wrap"
                  buttonClassName="text-[11px] font-semibold text-[#CE9F2D] hover:underline ml-1"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : null}

              {isCompleted ? (
                <p className="mt-1 text-xs font-medium text-[#1B1D60]">
                  {displayTime || dateTime(fallbackTime)}
                </p>
              ) : showExpected ? (
                <p className="mt-1 text-xs font-medium text-[#1B1D60]">
                  Expected by {expectedDelivery}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}
