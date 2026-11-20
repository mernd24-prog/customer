import { Plus, Minus } from "lucide-react";
import { DynamicButton } from "../../../components/ui/button";
import { resolveInputClasses } from "../../../components/ui/input";

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
}) {
  const atMax = max != null && quantity >= max;
  const disableIncrease = disabled || increaseDisabled || atMax;
  const message = String(increaseDisabledLabel || "").trim();
  const isMaximumMessage = /^max\b/i.test(message);

  return (
    <div
      className={`flex flex-col gap-1 ${
        fluid
          ? "w-full"
          : fullWidth
            ? "w-full sm:w-[128px]"
            : "w-[150px] sm:w-[170px]"
      }`}
    >
      <div
        className={[
          "flex w-full items-center justify-between",
          "h-10 p-1",
          resolveInputClasses({
            variant: "quantity",
          }),
        ].join(" ")}
      >
        <DynamicButton
          variant="qtyWhite"
          size="iconSm"
          shape="circle"
          onClick={onDecrease}
          disabled={disabled || quantity <= 1}
          aria-label="Decrease Quantity"
        >
          <Minus size={16} strokeWidth={2.5} className="block shrink-0" />
        </DynamicButton>
        <span
          className="min-w-[32px] text-center font-dm-sans text-sm font-bold tabular-nums text-[#1B1D60]"
          aria-live="polite"
        >
          {String(quantity).padStart(2, "0")}
        </span>
        <DynamicButton
          variant="primary"
          size="iconSm"
          shape="circle"
          onClick={() => {
            if (!disableIncrease) onIncrease?.();
          }}
          disabled={disableIncrease}
          aria-label={
            increaseDisabledLabel ||
            (disableIncrease ? "Maximum quantity reached" : "Increase Quantity")
          }
          title={
            increaseDisabledLabel ||
            (disableIncrease ? `Max ${max} items per order` : undefined)
          }
        >
          <Plus/>
        </DynamicButton>
      </div>
      {message && (
        <p
          className={`mt-1 text-center text-xs font-semibold leading-4 ${
            isMaximumMessage ? "text-red-600" : "text-amber-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
