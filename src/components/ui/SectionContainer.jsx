
import { ArrowRight } from "lucide-react";
import DynamicButton from "./button/button";

export default function SectionContainer({
  title,
  subtitle = "",
  headerbgColor,
  children,
  bodybgColor,
  actionLabel = "",
  actionHref = "",
  onAction,
  className = "",
  headerClassName = "",
  contentClassName = "",
  actionStyle = "button",
  mobileActionStyle,
  mobileActionFullWidth = false,
  style = {},
  disablePadding = false,
  headerSpacingClassName = "my-3 sm:my-4",
}) {
  const finalMobileActionStyle = mobileActionStyle || actionStyle;

  const hasHeader = Boolean(title || subtitle || actionLabel);

  const hasAction =
    Boolean(actionLabel && (actionHref || onAction)) ||
    Boolean(actionStyle === "icon" && actionHref);

  return (
    <section className={className || "bg-white"} style={style}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${
            headerbgColor || "bg-transparent"
          } ${headerSpacingClassName}`}
        >
          <div
            className={`mt-0 flex w-full items-center justify-between gap-3 ${
              !disablePadding ? "px-4 sm:px-6 lg:px-8" : ""
            } ${headerClassName}`}
          >
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-[20px] font-bold leading-tight text-[#3E4093] sm:text-[22px] md:text-[24px]">
                  {title}
                </h2>
              )}
            </div>
            {hasAction && actionStyle === "icon" && actionHref && (
              <DynamicButton
                variant="primary"
                size="xs"
                shape="square"
                to={actionHref}
                className="shrink-0 "
                aria-label={`Go to ${title}`}
              >
                <ArrowRight className="!size-5" />
              </DynamicButton>
            )}

            {/* Desktop Text Action */}
            {hasAction &&
              (actionHref || onAction) &&
              actionStyle !== "icon" && (
                <DynamicButton
                  variant="outlineSmall"
                  size="xs"
                  to={actionHref}
                  onClick={onAction}
                  rightIcon={<ArrowRight />}
                  className="my-2 hidden self-center md:inline-flex"
                  aria-label={`${actionLabel} ${title || ""}`}
                >
                  {actionLabel}
                </DynamicButton>
              )}
          </div>
        </header>
      )}

      {/* Section Content */}
      <div
        className={`${bodybgColor || "bg-transparent"} ${
          !disablePadding ? "px-4 sm:px-6 lg:px-8" : ""
        } ${contentClassName}`}
      >
        {children}
      </div>

      {/* Mobile Text Action */}
      {finalMobileActionStyle === "button" && hasAction && actionHref && (
        <div
          className={`my-8 flex md:hidden ${
            mobileActionFullWidth ? "w-full px-3" : "justify-center"
          }`}
        >
          <DynamicButton
            variant="outlineSmall"
            size="sm"
            to={actionHref}
            rightIcon={<ArrowRight />}
            className={mobileActionFullWidth ? "w-full" : ""}
            aria-label={`${actionLabel} ${title || ""}`}
          >
            {actionLabel}
          </DynamicButton>
        </div>
      )}
    </section>
  );
}
