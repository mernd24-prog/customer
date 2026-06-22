import { cn } from "../../../lib/utils";

export default function Badge({
  children,
  variant = "gold",
  className = "",
}) {
  const variantMap = {
    gold: "border-[var(--customer-gold)] bg-[var(--customer-gold-soft)] text-[var(--customer-navy)]",
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-600",
    gray: "border-[var(--customer-border)] bg-[var(--customer-surface-soft)] text-[var(--customer-muted)]",
    navy: "border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white",
  };

  return (
    <span
      className={cn(
        "mb-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-normal sm:px-3 sm:text-[11px]",
        variantMap[variant] || variantMap.gold,
        className
      )}
    >
      {children}
    </span>
  );
}
