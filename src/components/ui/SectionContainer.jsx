import { FaAngleRight } from "react-icons/fa6";
export default function SectionContainer({
  title,
  subtitle,
  headerbgColor,
  children,
  bodybgColor,
  actionLabel = "",
  onAction,
  className = "",
}) {
  return (
    <section
      className={`w-full overflow-hidden rounded-[var(--customer-radius)]  bg-white ${className}`}
    >
      <header
        className={`text-[var(--customer-ink)] ${headerbgColor || "bg-white"}`}
      >
        <div className="flex min-h-[72px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <h2 className="customer-section-title  text-[20px]  sm:text-[36px]">
              {title}
            </h2>
            <p className="mt-1  text-lg text-[var(--customer-muted)]">
              {subtitle}
            </p>
          </div>
          {actionLabel ? (
            <button
              type="button"
              onClick={onAction}
              className="flex gap-1 text-[var(--customer-navy)] items-center justify-center border border-[var(--customer-navy)] px-4 py-2 rounded-md"
            >
              {actionLabel}
              <FaAngleRight className="transition-all duration-300 ease-in-out group-hover:translate-x-1" />
            </button>
          ) : null}
        </div>
      </header>
      <div className={`p-3 sm:p-4 ${bodybgColor || "bg-white"}`}>
        {children}
      </div>
    </section>
  );
}
