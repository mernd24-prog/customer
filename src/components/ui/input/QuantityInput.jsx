import { cn } from "../../../utils/common";
import { DynamicButton } from "../button";
import { resolveInputClasses } from "./inputConfig";

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
        resolveInputClasses({ variant: "quantity", size }),
        disabled && "opacity-60",
        className,
      )}
    >
      <DynamicButton
        variant={variant}
        size="iconSm"
        shape="circle"
        onClick={handleDecrease}
        disabled={atMin || disabled}
        aria-label="Decrease Quantity"
        className="font-semibold"
      >
        −
      </DynamicButton>
      <span className="flex min-w-[40px] items-center justify-center border-x border-[#1B1D60]/15 bg-white/40 px-3 py-1 text-xs font-semibold text-[#1B1D60] sm:min-w-[50px] sm:px-4 sm:text-sm">
        {value}
      </span>
      <DynamicButton
        variant={variant}
        size="iconSm"
        shape="circle"
        onClick={handleIncrease}
        disabled={atMax || disabled}
        aria-label="Increase Quantity"
        className="font-semibold"
      >
        +
      </DynamicButton>
    </div>
  );
}

