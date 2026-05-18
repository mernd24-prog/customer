import { Link } from "react-router-dom";
import { cn } from "../../utils/classNames";

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  action,
  className = "",
}) {
  const actionContent = actionHref ? (
    <Link to={actionHref} className="font-montserrat text-sm font-semibold text-[#CE9F2D] underline-offset-4 hover:underline">
      {actionLabel}
    </Link>
  ) : action ? (
    action
  ) : null;

  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="font-montserrat text-xl font-bold text-[#1d1d1d] sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-[#6b6b6b]">{subtitle}</p>}
      </div>
      {actionContent}
    </div>
  );
}
