import { PillButton } from "../button/buttonSpecialized";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "../layout";
import EmptyStateIllustration from "./EmptyStateIllustration";
import ReviewEmptyIllustration from "./ReviewEmptyIllustration";
import { cn } from "../../../utils/common";

export default function EmptyState({
  icon: Icon,
  imageSrc,
  count = 0,
  illustration = "box",
  title = "Nothing here yet",
  description = "Once data is available, it will appear here.",
  actionLabel,
  onAction,
  buttonLabel,
  onButtonClick,
  className = "",
  buttonClassName = "",
  buttonSize = "md",
  children,
  bordered = true,
}) {
  const resolvedActionLabel = actionLabel || buttonLabel;
  const resolvedAction = onAction || onButtonClick;

  const containerClasses = bordered
    ? "rounded-lg border border-dashed border-[#E7D9B8] bg-[#FFFDF6] px-4 py-6 text-center"
    : "rounded-lg bg-[#FFFDF6] px-4 py-5 text-center";

  return (
    <PageContainer>
      <div
        className={cn(
          "flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#E7D9B8] bg-[#FFFDF6] px-4 py-6 text-center",
          className,
        )}
        role="alert"
      >
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F0FA] text-[#52749B] ring-1 ring-[#D8E3F0] sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </div>
        ) : imageSrc ? (
          <img
            loading="lazy"
            width="400"
            height="400"
            src={imageSrc}
            alt={title}
            className="h-24 w-24 object-contain mix-blend-multiply sm:h-28 sm:w-28 md:h-32 md:w-32"
          />
        ) : illustration === "reviews" ? (
          <ReviewEmptyIllustration />
        ) : (
          <EmptyStateIllustration count={count} />
        )}

        <h2 className="mt-3 max-w-lg text-base font-bold text-[var(--customer-ink)] sm:text-lg">
          {title}
        </h2>

        <p className="mt-1.5 max-w-xs text-sm leading-5 text-[var(--customer-muted)] sm:max-w-md sm:leading-6">
          {description}
        </p>

        {resolvedActionLabel && resolvedAction && (
          <div className="mt-4 flex justify-center">
            <PillButton
              shape="square"
              size={buttonSize}
              onClick={resolvedAction}
              className={`gap-2 ${buttonClassName}`}
            >
              <span>{resolvedActionLabel}</span>
              <ArrowRight size={16} />
            </PillButton>
          </div>
        )}

        {children && <div className="mt-4 w-full">{children}</div>}
      </div>
    </PageContainer>
  );
}
