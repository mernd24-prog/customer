
import { Plus, Minus } from "lucide-react";

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max = 10,
  disabled,
  increaseDisabled,
  increaseDisabledLabel,
  fullWidth = false,
  fluid = false,
  variant = "product",
}) {
  const isCart = variant === "cart";
  const atMax = max != null && quantity >= max;

  const disableIncrease =
    disabled || increaseDisabled || atMax;

  return (
    <div
      className={`flex flex-col gap-1 ${
        fluid
          ? "w-full"
          : fullWidth
            ? isCart
              ? "w-full sm:w-[128px]"
              : "w-full sm:w-[170px]"
            : isCart
              ? "w-[128px]"
              : "w-[150px] sm:w-[170px]"
      }`}
    >
      <div
        className={`flex w-full items-center justify-between ${
          isCart
            ? "h-10 rounded-lg border border-[#1B1D60]/20 bg-[#F8F5EE] p-0.5"
            : "h-10 rounded-lg border border-[#1B1D60]/20 bg-[#F4F4F8] p-1"
        }`}
      >
        {/* Decrease */}
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled || quantity <= 1}
          className={`inline-flex shrink-0 items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
            isCart
              ? "h-8 w-8 rounded-md bg-[#F1F0EB] text-[#1B1D60] hover:bg-[#F0E4C6]"
              : "h-8 w-8 rounded-full bg-white text-[#1B1D60] hover:bg-[#E8E8F3]"
          }`}
          aria-label="Decrease Quantity"
        >
          <Minus
            size={16}
            strokeWidth={2.5}
            className="block shrink-0"
          />
        </button>

        {/* Quantity */}
        <span
          className="min-w-[32px] text-center font-dm-sans text-sm font-bold tabular-nums text-[#1B1D60]"
          aria-live="polite"
        >
          {String(quantity).padStart(2, "0")}
        </span>

        {/* Increase */}
        <button
          type="button"
          onClick={() => {
            if (!disableIncrease) onIncrease?.();
          }}
          disabled={disableIncrease}
          className={`inline-flex shrink-0 items-center justify-center text-white transition-colors duration-200 hover:bg-[#2F346F] disabled:cursor-not-allowed disabled:opacity-40 ${
            isCart
              ? "h-8 w-8 rounded-md bg-[#1B1D60]"
              : "h-8 w-8 rounded-full bg-[#1B1D60]"
          }`}
          aria-label={
            increaseDisabledLabel ||
            (disableIncrease
              ? "Maximum quantity reached"
              : "Increase Quantity")
          }
          title={
            increaseDisabledLabel ||
            (disableIncrease ? `Max ${max} items per order` : undefined)
          }
        >
          <Plus
            size={16}
            strokeWidth={2.5}
            className="block shrink-0"
          />
        </button>
      </div>
    </div>
  );
}
