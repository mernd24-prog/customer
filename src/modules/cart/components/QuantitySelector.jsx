import { Plus, Minus } from "lucide-react";
import { DynamicButton } from "../../../components/ui/button";
import { resolveInputClasses } from "../../../components/ui/inputs/inputStyles";

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
  const disableIncrease = disabled || increaseDisabled || atMax;

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
        className={[
          "flex w-full items-center justify-between",
          isCart ? "h-10 p-0.5" : "h-10 p-1",
          resolveInputClasses({
            variant: isCart ? "cart" : "quantity",
          }),
        ].join(" ")}
      >
        <DynamicButton
          variant={isCart ? "qtySoft" : "qtyWhite"}
          size="iconSm"
          shape={isCart ? "md" : "circle"}
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
          shape={isCart ? "md" : "circle"}
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
    </div>
  );
}
