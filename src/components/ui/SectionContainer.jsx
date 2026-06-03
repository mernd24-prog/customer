import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";

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
  const actionClassName =
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-[6px] border border-[#33368F33] px-4 text-[12px] font-bold text-[#33368F] transition-all duration-300 ease-in-out hover:border-[#CE9F2D] hover:bg-[#CE9F2D1A] sm:self-center";

  return (
    <section className={`my-8 bg-white ${className}`}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${headerbgColor || "bg-white"}`}
        >
          <div
            className={`mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${headerClassName}`}
          >
            <div className="min-w-0">
              {title && (
                <h2 className="text-[24px] font-bold leading-tight text-[#3E4093] sm:text-[28px] md:text-[32px] lg:text-[38px]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-2 text-[14px] font-medium leading-normal text-[#2E2E2E] sm:text-[16px] md:text-[17px] lg:text-[18px]">
                  {subtitle}
                </p>
              )}
            </div>

            {hasAction && actionHref ? (
              <Link to={actionHref} className={actionClassName}>
                {actionLabel}
                <FaAngleRight className="text-[10px]" />
              </Link>
            ) : null}

            {hasAction && !actionHref ? (
              <button
                type="button"
                onClick={onAction}
                className={actionClassName}
              >
                {actionLabel}
                <FaAngleRight className="text-[10px]" />
              </button>
            ) : null}
          </div>
        </header>
      )}

      <div className={`${bodybgColor || "bg-white"} ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
