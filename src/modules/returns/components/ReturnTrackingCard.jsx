import { Check, Truck } from "lucide-react";
import ShowMoreText from "../../../utils/showMore";

const sanitizeDescription = (text) => {
  if (!text) return "";
  let str = String(text)
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/#:\~:[^\s]+/g, "")
    .trim();
  if (str.includes("Timeline-,") || str.includes("Accept Return")) return "";
  return str;
};

export default function ReturnTrackingCard({ steps: customSteps, title }) {
  const stepsToRender = customSteps || [];

  return (
    <section className="border-t border-[#EAEFF5] bg-[#FAFBFD]/60 p-4 sm:p-6 rounded-b-2xl">
      <div className="mb-4 flex items-center gap-2 text-[#1B1D60]">
        <Truck size={18} className="text-[#3E4093]" />
        <h3 className="text-sm sm:text-base font-bold text-[#1B1D60]">
          {title || "Return Tracking Timeline"}
        </h3>
      </div>

      <div className="pl-1 sm:pl-2 space-y-6 sm:space-y-7">
        {stepsToRender.map((step, index) => {
          const isLast = index === stepsToRender.length - 1;
          const isCompleted = step.completed ?? true;
          const isNextStepCompleted = index < stepsToRender.length - 1 && (stepsToRender[index + 1].completed ?? true);
          const lineDelay = `${index * 0.35}s`;
          const ballDelay = `${index * 0.35}s`;
          const cleanDesc = sanitizeDescription(step.description);

          return (
            <div
              key={step.title + index}
              className="relative flex items-start gap-3.5"
            >
              {/* Background track line */}
              {!isLast && (
                <span className="absolute left-[9px] top-[10px] bottom-[-28px] sm:bottom-[-32px] w-[2px] bg-[#E0E0E0] z-0" />
              )}

              {/* Animated active progress fill line */}
              {!isLast && isCompleted && isNextStepCompleted && (
                <span
                  className="absolute left-[9px] top-[10px] bottom-[-28px] sm:bottom-[-32px] w-[2px] bg-[#26A541] origin-top animate-timeline-line z-0"
                  style={{ animationDelay: lineDelay }}
                />
              )}

              {/* Status Circle Dot */}
              {isCompleted ? (
                <span
                  className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-2xs animate-ball-fill-green ${
                    isLast || !isNextStepCompleted ? "animate-timeline-pulse" : ""
                  }`}
                  style={{ animationDelay: ballDelay }}
                >
                  <Check size={12} className="stroke-[3] text-current" />
                </span>
              ) : (
                <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#D7D7D7] bg-[#F5F5F5]">
                  <Check size={12} className="stroke-[2] text-[#B0B0B0]" />
                </span>
              )}

              {/* Step Meta */}
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B1D60]">
                    {step.title}
                  </h4>

                  {cleanDesc && (
                    <div className="mt-0.5 text-xs font-medium text-[#6E6E6E]">
                      <ShowMoreText
                        text={cleanDesc}
                        mode="characters"
                        limit={120}
                        buttonClassName="ml-1 text-xs font-semibold text-[#3E4093] hover:underline"
                      />
                    </div>
                  )}
                </div>

                {step.time && (
                  <span className="shrink-0 text-[11px] sm:text-xs font-medium text-[#6F7480]">
                    {step.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
