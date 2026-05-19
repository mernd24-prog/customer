import { cn } from "../../../utils/classNames";

export default function Badge({
  children,
  variant = "gold",
  className = "",
}) {
  const variantMap = {
    gold: "border-[#d48f03] text-[#d48f03]",
    green: "border-green-500 text-green-600",
    red: "border-red-400 text-red-500",
    gray: "border-[#A6A6A6] text-[#A6A6A6]",
  };

  return (
    <span
      className={cn(
        "mb-1 inline-block rounded-[16px] border px-2 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:text-[11px] md:text-[12px]",
        variantMap[variant] || variantMap.gold,
        className
      )}
    >
      {children}
    </span>
  );
}
