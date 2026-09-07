import { ArrowRight } from "lucide-react";
import { OutlineSmallButton } from "../ui/button/static";

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
}) {
  const hasHeader = Boolean(title || subtitle || actionLabel);
  const hasAction = Boolean(actionLabel && (actionHref || onAction));

  return (
    <section className={` bg-white ${className}`}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${headerbgColor || "bg-white"}`}
        >
          <div
            className={` flex flex-col gap-2 my-8 lg:my-10 sm:gap-4 sm:flex-row sm:items-center sm:justify-between ${headerClassName}`}
          >
            <div className="min-w-0 ">
              {title && (
                <h2 className="font-bold text-h2 text-[#3E4093]">{title}</h2>
              )}
              {subtitle && (
                <p className="  text-small  lg:pt-3 align-middle text-[#2E2E2E]">
                  {subtitle}
                </p>
              )}
            </div>

            {hasAction && actionHref ? (
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
            ) : null}
          </div>
        </header>
      )}

      <div className={`${bodybgColor || "bg-white"} ${contentClassName}`}>
        {children}
      </div>

      <div className="mt-8">
        {hasAction && actionHref ? (
          <OutlineSmallButton
            to={actionHref}
            rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
            className="self-start text-center md:hidden inline-flex sm:self-center"
            aria-label={`${actionLabel} ${title || ""}`}
          >
            {actionLabel}
          </OutlineSmallButton>
        ) : null}
      </div>
    </section>
  );
}
