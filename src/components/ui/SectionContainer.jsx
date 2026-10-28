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
  actionStyle = "button", // 'button' or 'icon'
  mobileActionStyle, // defaults to actionStyle
  style = {},
  disablePadding = false,
}) {
  const finalMobileActionStyle = mobileActionStyle || actionStyle;
  const hasHeader = Boolean(title || subtitle || actionLabel);
  const hasAction =
    Boolean(actionLabel && (actionHref || onAction)) ||
    Boolean(actionStyle === "icon" && actionHref);

  return (
    <section className={`${className || "bg-white"}`} style={style}>
      {hasHeader && (
        <header
          className={`mb-4 text-[var(--customer-ink)] sm:mb-5 ${headerbgColor || "bg-transparent"}`}
        >
          <div
            className={`mt-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mt-1 ${!disablePadding ? "px-4 sm:px-6 lg:px-8" : ""} ${headerClassName}`}
          >
            <div className="min-w-0 flex items-center justify-between w-full sm:w-auto">
              <div>
                {title && (
                  <h2 className="customer-section-title text-xl md:text-2xl">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--customer-muted)]">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Mobile-only header action if icon */}
              {hasAction &&
                actionHref &&
                actionStyle === "icon" &&
                finalMobileActionStyle === "icon" && (
                  <Link
                    to={actionHref}
                    className="sm:hidden flex w-8 h-8 rounded-[100px] bg-[#3E4093] text-white items-center justify-center hover:bg-[#2A2B66] transition-colors outline-none focus:outline-none"
                    aria-label={`Go to ${title}`}
                  >
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </Link>
                )}
            </div>

            {hasAction && (actionHref || onAction) ? (
              actionStyle === "icon" && actionHref ? (
                <Link
                  to={actionHref}
                  className="self-start sm:self-center hidden sm:flex w-[52px] h-8 sm:h-7 rounded-lg bg-[#3E4093] text-white items-center justify-center hover:bg-[#2A2B66] transition-colors outline-none focus:outline-none"
                  aria-label={`Go to ${title}`}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </Link>
              ) : (
                <OutlineSmallButton
                  to={actionHref}
                  onClick={onAction}
                  rightIcon={
                    <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                  }
                  className="self-start my-2 sm:self-center md:inline-flex hidden"
                  aria-label={`${actionLabel} ${title || ""}`}
                >
                  {actionLabel}
                </OutlineSmallButton>
              )
            ) : null}
          </div>
        </header>
      )}

      <div
        className={`${bodybgColor || "bg-transparent"} ${!disablePadding ? "px-4 sm:px-6 lg:px-8" : ""} ${contentClassName}`}
      >
        {children}
      </div>

      {finalMobileActionStyle === "button" && hasAction && actionHref ? (
        <div className="my-8 md:hidden flex justify-center ">
          <OutlineSmallButton
            to={actionHref}
            rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
            className="inline-flex"
            aria-label={`${actionLabel} ${title || ""}`}
          >
            {actionLabel}
          </OutlineSmallButton>
        </div>
      ) : null}
    </section>
  );
}
