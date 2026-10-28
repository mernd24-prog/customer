import { Check, X } from "lucide-react";
import { useMemo } from "react";

import { ShowMoreText } from "../../../utils/showMore";

import {
  dateTime,
  TIMELINE_STEPS,
  STATUS_RANK,
  getCancellationSteps,
  getReturnSteps,
} from "../utils/orderTimelineUtils";

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

  // Cancelled and returned order timeline
  if (stepsToRender) {
    return (
      <div className="flex min-w-0 flex-col md:flex-row md:items-start md:justify-center">
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
              stepsToRender[stepIndex + 1].status ===
                "cancellation_requested");

          const lineColor = nextIsCancelled
            ? "bg-[#E53935]"
            : "bg-[#26A541]";

          return (
            <div
              key={step.status}
              className="relative min-w-0 pb-6 pl-7 last:pb-0 md:flex-1 md:pb-0 md:pl-0 md:pt-7 md:text-center"
            >
              {!isLast && (
                <span className="absolute left-[7px] top-[10px] bottom-[-14px] z-0 w-[2px] bg-[#E0E0E0] md:bottom-auto md:left-1/2 md:right-[-50%] md:top-[7px] md:h-[2px] md:w-auto" />
              )}

              {!isLast && isCompleted && isNextStepCompleted && (
                <span
                  className={`absolute left-[7px] top-[10px] bottom-[-14px] z-0 w-[2px] origin-top animate-timeline-line md:bottom-auto md:left-1/2 md:right-[-50%] md:top-[7px] md:h-[2px] md:w-auto md:origin-left ${lineColor}`}
                  style={{ animationDelay: lineDelay }}
                />
              )}

              {isCompleted ? (
                <span
                  className={`absolute left-0 top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full ${
                    isCancelledStep
                      ? "animate-ball-fill-red"
                      : "animate-ball-fill-green"
                  } ${
                    isLast || !isNextStepCompleted
                      ? "animate-timeline-pulse"
                      : ""
                  } md:left-1/2 md:top-0 md:-translate-x-1/2`}
                  style={{ animationDelay: ballDelay }}
                >
                  {isCancelledStep ? (
                    <X className="h-2.5 w-2.5 stroke-[3] text-current" />
                  ) : (
                    <Check className="h-2.5 w-2.5 stroke-[3] text-current" />
                  )}
                </span>
              ) : (
                <span className="absolute left-0 top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-[#D7D7D7] bg-[#F5F5F5] md:left-1/2 md:top-0 md:-translate-x-1/2">
                  <Check className="h-2.5 w-2.5 stroke-[2] text-[#B0B0B0]" />
                </span>
              )}

              <div className="min-w-0 md:px-2">
                <p
                  className={`text-sm font-semibold md:text-center ${
                    isCompleted
                      ? isCancelledStep
                        ? "text-[#E53935]"
                        : "text-ink"
                      : "text-muted"
                  }`}
                >
                  {step.label}
                </p>

                {/* {step.note && (
                  <ShowMoreText
                    text={
                      typeof step.note === "string"
                        ? step.note.replace(/_/g, " ")
                        : step.note
                    }
                    mode="lines"
                    limit={1}
                    className="mt-1 block"
                    textClassName="text-xs text-ink whitespace-pre-wrap"
                    buttonClassName="ml-1 text-caption font-semibold text-[#26A541] hover:underline"
                    moreLabel="Show more"
                    lessLabel="Show less"
                  />
                )} */}

                {isCompleted && displayTime && (
                  <p className="mt-1 text-xs font-medium text-muted md:text-center">
                    {displayTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Regular order tracking timeline
  return (
    <div className="flex min-w-0 flex-col md:flex-row md:items-start md:justify-center">
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
          step.status === "delivered" ||
          step.status === "out_for_delivery";

        const showExpected =
          !isCompleted && isExpectedDelivery && expectedDelivery;

        const isNextStepCompleted =
          stepIndex < TIMELINE_STEPS.length - 1 &&
          currentRank >=
            STATUS_RANK[TIMELINE_STEPS[stepIndex + 1].status];

        const isLast = stepIndex === TIMELINE_STEPS.length - 1;
        const lineDelay = `${stepIndex * 0.35}s`;
        const ballDelay = `${stepIndex * 0.35}s`;
        const isCurrentActive =
          isCompleted && (!isNextStepCompleted || isLast);

        let fallbackTime = shipment?.updated_at || group?.expectedDeliveryAt;

        if (step.status === "confirmed") {
          fallbackTime = group?.items?.[0]?.created_at || fallbackTime;
        }

        return (
          <div
            key={step.status}
            className="relative min-w-0 pb-6 pl-7 last:pb-0 md:flex-1 md:pb-0 md:pl-0 md:pt-7 md:text-center"
          >
            {!isLast && (
              <span className="absolute left-[7px] top-[10px] bottom-[-14px] z-0 w-[2px] bg-[#E0E0E0] md:bottom-auto md:left-1/2 md:right-[-50%] md:top-[7px] md:h-[2px] md:w-auto" />
            )}

            {!isLast && isCompleted && isNextStepCompleted && (
              <span
                className="absolute left-[7px] top-[10px] bottom-[-14px] z-0 w-[2px] origin-top animate-timeline-line bg-[#26A541] md:bottom-auto md:left-1/2 md:right-[-50%] md:top-[7px] md:h-[2px] md:w-auto md:origin-left"
                style={{ animationDelay: lineDelay }}
              />
            )}

            {isCompleted ? (
              <span
                className={`absolute left-0 top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full animate-ball-fill-green ${
                  isCurrentActive ? "animate-timeline-pulse" : ""
                } md:left-1/2 md:top-0 md:-translate-x-1/2`}
                style={{ animationDelay: ballDelay }}
              >
                <Check className="h-2.5 w-2.5 stroke-[3] text-current" />
              </span>
            ) : (
              <span className="absolute left-0 top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-[#D7D7D7] bg-[#F5F5F5] md:left-1/2 md:top-0 md:-translate-x-1/2">
                <Check className="h-2.5 w-2.5 stroke-[2] text-[#B0B0B0]" />
              </span>
            )}

            <div className="min-w-0 md:px-2">
              <p
                className={`text-sm font-semibold md:text-center ${
                  isCompleted ? "text-ink" : "text-muted"
                }`}
              >
                {step.label}
              </p>

              {/*
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
                  textClassName="text-xs text-ink whitespace-pre-wrap"
                  buttonClassName="ml-1 text-caption font-semibold text-gold hover:underline"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : isCompleted && step.status === "confirmed" ? (
                <ShowMoreText
                  text="Your order has been placed."
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-ink whitespace-pre-wrap"
                  buttonClassName="ml-1 text-caption font-semibold text-gold hover:underline"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : isCompleted && step.status === "in_transit" ? (
                <ShowMoreText
                  text="Your package is on the way to the delivery address."
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-ink whitespace-pre-wrap"
                  buttonClassName="ml-1 text-caption font-semibold text-gold hover:underline"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : !isCompleted && step.status === "in_transit" ? (
                <ShowMoreText
                  text="Will be updated as soon as the item is shipped."
                  mode="lines"
                  limit={1}
                  className="mt-1 block"
                  textClassName="text-xs text-muted whitespace-pre-wrap"
                  buttonClassName="ml-1 text-caption font-semibold text-gold hover:underline"
                  moreLabel="Show more"
                  lessLabel="Show less"
                />
              ) : null} */}

              {isCompleted ? (
                <p className="mt-1 text-xs font-medium text-navy md:text-center">
                  {displayTime || dateTime(fallbackTime)}
                </p>
              ) : showExpected ? (
                <p className="mt-1 text-xs font-medium text-navy md:text-center">
                  Expected by {expectedDelivery}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}