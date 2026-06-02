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
        <section className={`w-full overflow-hidden rounded-[var(--customer-radius)] border border-[var(--customer-border)] bg-white ${className}`}>
            <header className={`text-[var(--customer-ink)] ${headerbgColor || "bg-white"}`}>
                <div className="flex min-h-[72px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                        <h2 className="customer-section-title  text-[20px] leading-tight sm:text-[22px]">
                            {title}
                        </h2>
                        <p className="mt-1  text-xs leading-5 text-[var(--customer-muted)]">
                            {subtitle}
                        </p>
                    </div>
                    {actionLabel ? (
                        <button
                            type="button"
                            onClick={onAction}
                            className="group flex shrink-0 items-center gap-2 self-start rounded-full border border-[var(--customer-border)] bg-white px-3 py-1.5  text-xs font-semibold text-[var(--customer-navy)] transition-all duration-300 ease-in-out hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--customer-gold)] sm:self-center"
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
