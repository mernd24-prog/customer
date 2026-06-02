import { Link } from "react-router-dom";
import { cn } from "../../../utils/classNames";

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  action,
  className = "",
}) {
  const actionContent = actionHref ? (
    <Link to={actionHref} className="rounded-full border border-[var(--customer-border)] px-3 py-1.5  text-xs font-semibold text-[var(--customer-navy)] hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold-soft)]">
      {actionLabel}
    </Link>
  ) : action ? (
    action
  ) : null;

  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-3",
        className,
      )}
    >
      <div>
        <h2 className="customer-section-title  text-xl sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-[var(--customer-muted)]">{subtitle}</p>}
      </div>
      {actionContent}
    </div>
  );
}
