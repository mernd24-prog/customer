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
  style = {},
}) {
  const hasHeader = Boolean(title || subtitle || actionLabel);
  const hasAction = Boolean(actionLabel && (actionHref || onAction)) || Boolean(actionStyle === "icon" && actionHref);

  return (
    <section className={`${className || "bg-white"}`} style={style}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${headerbgColor || "bg-transparent"}`}
        >
          <div
            className={`flex flex-col gap-2 mt-0 lg:mt-1 mb-1 sm:gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 ${headerClassName}`}
          >
            <div className="min-w-0 ">
              {title && (
                <h2 className="font-bold text-[20px] md:text-[24px] text-[#3E4093]">{title}</h2>
              )}
              {subtitle && (
                <p className="font-medium text-p md:text-small lg:pt-1.5 align-middle text-[var(--customer-muted,#5E626D)]">
                  {subtitle}
                </p>
              )}
            </div>

            {hasAction && actionHref ? (
              actionStyle === "icon" ? (
                <Link
                  to={actionHref}
                  className="self-start sm:self-center md:flex hidden w-[52px] h-8 rounded-[100px] bg-[#3E4093] text-white items-center justify-center hover:bg-[#2A2B66] transition-colors outline-none focus:outline-none"
                  aria-label={`Go to ${title}`}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </Link>
              ) : (
                <OutlineSmallButton
                  to={actionHref}
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

      <div className={`${bodybgColor || "bg-transparent"} px-4 sm:px-6 lg:px-8 ${contentClassName}`}>
        {children}
      </div>

      <div className="mt-8 md:hidden flex justify-center">
        {hasAction && actionHref ? (
          actionStyle === "icon" ? (
            <Link
              to={actionHref}
              className="flex w-[48px] h-7 rounded-[100px] bg-[#3E4093] text-white items-center justify-center outline-none focus:outline-none"
              aria-label={`Go to ${title}`}
            >
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          ) : (
            <OutlineSmallButton
              to={actionHref}
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
              className="inline-flex"
              aria-label={`${actionLabel} ${title || ""}`}
            >
              {actionLabel}
            </OutlineSmallButton>
          )
        ) : null}
      </div>
    </section>
  );
}
