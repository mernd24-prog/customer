import { Link } from "react-router-dom";
import { cn } from "../../../utils/common";

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  action,
  className = "",
}) {
  const actionContent = actionHref ? (
    <Link to={actionHref} className="customer-section-action">
      {actionLabel}
    </Link>
  ) : action ? (
    action
  ) : null;

  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6",
        className,
      )}
    >
      <div>
        <h2 className="customer-section-title text-xl sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--customer-muted)]">{subtitle}</p>}
      </div>
      {actionContent}
    </div>
  );
}
