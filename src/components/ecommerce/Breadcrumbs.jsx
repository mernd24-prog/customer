import { Link } from "react-router-dom";
import { cn } from "../../utils/classNames";

export default function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav className={cn("flex flex-wrap items-center gap-1  text-xs", className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {item.href && !isLast ? (
              <Link to={item.href} className="text-white">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <span>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
