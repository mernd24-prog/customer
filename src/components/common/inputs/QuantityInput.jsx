import { cn } from "../../../lib/utils";

export default function QuantityInput({
  value = 1,
  min = 1,
  max,
  onIncrease,
  onDecrease,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}) {
  const sizeMap = {
    sm: { btn: "h-7 w-7 text-sm", count: "min-w-[32px] px-2 py-0.5 text-xs" },
    md: { btn: "h-8 w-8 sm:h-9 sm:w-9 text-base sm:text-lg", count: "min-w-[40px] sm:min-w-[50px] px-3 sm:px-4 py-1 text-xs sm:text-sm" },
    lg: { btn: "h-10 w-10 text-xl", count: "min-w-[52px] px-4 py-1.5 text-sm" },
  };
  const s = sizeMap[size] || sizeMap.md;
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  const handleDecrease = () => {
    if (!atMin) {
      onDecrease?.();
      onChange?.(value - 1);
    }
  };

  const handleIncrease = () => {
    if (!atMax) {
      onIncrease?.();
      onChange?.(value + 1);
    }
  };

  return (
    <div
      className={cn(
        "flex w-fit items-center overflow-hidden rounded-[var(--customer-radius-sm)] border border-border bg-white",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={atMin || disabled}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center font-semibold text-navy transition-all duration-300 ease-in-out hover:bg-gold-soft disabled:cursor-not-allowed disabled:text-gray disabled:hover:bg-white",
          s.btn,
        )}
      >
        −
      </button>
      <span
        className={cn(
          "flex items-center justify-center border-x border-border font-semibold text-ink",
          s.count,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={atMax || disabled}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center font-semibold text-navy transition-all duration-300 ease-in-out hover:bg-gold-soft disabled:cursor-not-allowed disabled:text-gray disabled:hover:bg-white",
          s.btn,
        )}
      >
        +
      </button>
    </div>
  );
}
