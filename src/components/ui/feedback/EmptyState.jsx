
import { ContinueShoppingButton } from "../../ui/button/static";
import { ArrowRight } from "lucide-react";
import EmptyStateIllustration from "./EmptyStateIllustration";
import ReviewEmptyIllustration from "./ReviewEmptyIllustration";

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
  children,
  bordered = true,
}) {
  const resolvedActionLabel = actionLabel || buttonLabel;
  const resolvedAction = onAction || onButtonClick;

  const containerClasses = bordered
    ? "rounded-xl border border-dashed border-[#E7D9B8] bg-[#FFFDF6] px-5 py-10 text-center"
    : "rounded-xl bg-[#FFFDF6] px-4 py-8 text-center";

  return (
    <div
      className={`flex min-h-[280px] w-full flex-col items-center justify-center ${containerClasses} sm:min-h-[320px] sm:px-6 sm:py-10 lg:min-h-[380px] ${className}`}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0FA] text-[#52749B] ring-1 ring-[#D8E3F0] sm:h-14 sm:w-14 lg:h-16 lg:w-16">
          <Icon
            className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            aria-hidden="true"
          />
        </div>
      ) : imageSrc ? (
        <img
          loading="lazy"
          width="400"
          height="400"
          src={imageSrc}
          alt={title}
className="h-28 w-28 object-contain mix-blend-multiply xs:h-32 xs:w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-52 lg:w-52 xl:h-60 xl:w-60"        />
      ) : illustration === "reviews" ? <ReviewEmptyIllustration /> : <EmptyStateIllustration count={count} />}

      <h2 className="mt-5 max-w-lg text-lg font-bold text-[var(--customer-ink)] sm:text-xl">
        {title}
      </h2>

      <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--customer-muted)] sm:max-w-md sm:text-base lg:max-w-xl">
        {description}
      </p>

      {resolvedActionLabel && resolvedAction && (
        <div className="mt-6 flex justify-center">
          <ContinueShoppingButton
            onClick={resolvedAction}
            className="!mx-0 !mt-0 !h-12 !w-auto !min-w-0 !max-w-full !gap-2 !px-8 !rounded-full"
          >
            {resolvedActionLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </ContinueShoppingButton>
        </div>
      )}

      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
