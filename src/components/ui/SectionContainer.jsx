import { ArrowRight } from "lucide-react";
import { OutlineSmallButton } from "../ui/button/static";
import { Link } from "react-router-dom";

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
}) {
  const finalMobileActionStyle = mobileActionStyle || actionStyle;
  const hasHeader = Boolean(title || subtitle || actionLabel);

  const hasAction =
    Boolean(actionLabel && (actionHref || onAction)) ||
    Boolean(actionStyle === "icon" && actionHref);
  const iconButtonClass =
    "group inline-flex h-8 w-[52px] shrink-0 items-center justify-center rounded-lg !bg-[#3E4093] !text-white shadow-none outline-none transition-none hover:!bg-[#3E4093] hover:shadow-none focus:!bg-[#3E4093] focus:shadow-none focus:outline-none focus-visible:!bg-[#3E4093] focus-visible:outline-none active:!bg-[#3E4093] active:shadow-none";

  const arrowIconClass =
    "h-5 w-5 !text-white transition-none group-hover:!text-white group-focus:!text-white group-active:!text-white";
  return (
    <section className={className || "bg-white"} style={style}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${
            headerbgColor || "bg-transparent"
          } mb-3 sm:mb-4`}
        >
          <div
            className={`mt-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:mt-1 ${
              !disablePadding ? "px-4 sm:px-6 lg:px-8" : ""
            } ${headerClassName}`}
          >
            <div className="flex w-full min-w-0 items-center justify-between sm:w-auto">
              <div>
                {title && (
                  <h2 className="text-[20px] font-bold text-[#3E4093] md:text-[24px]">
                    {title}
                  </h2>
                )}

                {subtitle && (
                  <p className="mb-4 text-p font-medium text-[var(--customer-muted,#5E626D)] md:text-small lg:pt-1.5">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Mobile Icon Button */}
              {hasAction &&
                actionHref &&
                actionStyle === "icon" &&
                finalMobileActionStyle === "icon" && (
                  <Link
                    to={actionHref}
                    className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full !bg-[#3E4093] !text-white shadow-none outline-none transition-none hover:!bg-[#3E4093] hover:shadow-none focus:!bg-[#3E4093] focus:shadow-none focus:outline-none focus-visible:!bg-[#3E4093] focus-visible:outline-none active:!bg-[#3E4093] active:shadow-none"
                    aria-label={`Go to ${title}`}
                  >
                    <ArrowRight className="h-4 w-4 !text-white transition-none group-hover:!text-white group-focus:!text-white group-active:!text-white" />
                  </Link>
                )}
            </div>

            {/* Desktop Action */}
            {hasAction && (actionHref || onAction) ? (
              actionStyle === "icon" && actionHref ? (
                <Link
                  to={actionHref}
                  className={`${iconButtonClass} hidden sm:inline-flex`}
                  aria-label={`Go to ${title}`}
                >
                  <ArrowRight className={arrowIconClass} strokeWidth={2} />
                </Link>
              ) : (
                <OutlineSmallButton
                  to={actionHref}
                  onClick={onAction}
                  rightIcon={
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  }
                  className="my-2 hidden self-start sm:self-center md:inline-flex"
                  aria-label={`${actionLabel} ${title || ""}`}
                >
                  {actionLabel}
                </OutlineSmallButton>
              )
            ) : null}
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

      {/* Mobile Button */}
      {finalMobileActionStyle === "button" && hasAction && actionHref ? (
        <div
          className={`my-8 flex md:hidden ${
            mobileActionFullWidth ? "w-full px-3" : "justify-center"
          }`}
        >
          <OutlineSmallButton
            to={actionHref}
            rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={2.2} />}
            className={
              mobileActionFullWidth
                ? "flex w-full justify-center"
                : "inline-flex"
            }
            aria-label={`${actionLabel} ${title || ""}`}
          >
            {actionLabel}
          </OutlineSmallButton>
        </div>
      ) : null}
    </section>
  );
}
