import { cn } from "../../../utils/common";
import { DynamicButton } from "../button";
import { resolveInputClasses } from "./inputStyles";

export default function QuantityInput({
  value = 1,
  min = 1,
  max,
  onIncrease,
  onDecrease,
  onChange,
  disabled = false,
  size = "md",
  variant = "qtyWhite",
  className = "",
}) {
  const sizeMap = {
    sm: {
      btn: "h-7 w-7 text-sm",
      count: "min-w-[32px] px-2 py-0.5 text-xs",
      shell: "p-0.5",
    },
    md: {
      btn: "h-8 w-8 sm:h-9 sm:w-9 text-base sm:text-lg",
      count:
        "min-w-[40px] sm:min-w-[50px] px-3 sm:px-4 py-1 text-xs sm:text-sm",
      shell: "p-0.5",
    },
    lg: {
      btn: "h-10 w-10 text-xl",
      count: "min-w-[52px] px-4 py-1.5 text-sm",
      shell: "p-1",
    },
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
        "flex w-fit items-center overflow-hidden",
        resolveInputClasses({ variant: "quantity" }),
        disabled && "opacity-60",
        className,
      )}
    >
      <DynamicButton
        variant={variant}
        size="none"
        shape="circle"
        onClick={handleDecrease}
        disabled={atMin || disabled}
        aria-label="Decrease Quantity"
        className={cn("font-semibold", s.btn)}
      >
        −
      </DynamicButton>
      <span
        className={cn(
          "flex items-center justify-center border-x border-[#1B1D60]/15 bg-white/40 font-semibold text-[#1B1D60]",
          s.count,
        )}
      >
        {value}
      </span>
      <DynamicButton
        variant={variant}
        size="none"
        shape="circle"
        onClick={handleIncrease}
        disabled={atMax || disabled}
        aria-label="Increase Quantity"
        className={cn("font-semibold", s.btn)}
      >
        +
      </DynamicButton>
    </div>
  );
}
