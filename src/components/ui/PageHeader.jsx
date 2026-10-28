import { cn, formatPageTitle } from "../../utils/common";

export default function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className = "",
}) {
  const displayTitle = formatPageTitle(title);

  return (
    <header className={cn("customer-page-header", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="customer-eyebrow">{eyebrow}</p>}
        <h1 className="customer-page-title">{displayTitle}</h1>
        {description && (
          <p className="customer-page-description">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
