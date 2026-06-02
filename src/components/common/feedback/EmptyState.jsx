import { PackageSearch } from "lucide-react";
import Button from "../buttons/Button";

export default function EmptyState({
  icon: Icon = PackageSearch,
  title = "Nothing here yet",
  description = "Once data is available, it will appear here.",
  actionLabel,
  onAction,
  children,
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[var(--customer-radius)] border border-dashed border-[var(--customer-border)] bg-[var(--customer-surface-soft)] px-4 py-8 text-center ">
      <Icon
        className="h-10 w-10 text-[var(--customer-navy)]"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-[18px] font-semibold text-[var(--customer-ink)]">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-[var(--customer-muted)]">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
