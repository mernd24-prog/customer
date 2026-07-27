export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max,
  disabled,
  increaseDisabled,
  increaseDisabledLabel,
  labelAccessory,
}) {
  const atMax = max != null && quantity >= max;
  const disableIncrease = disabled || increaseDisabled || atMax;

  return (
    <div className="flex w-full flex-col gap-2 md:w-[180px]">
      <div className="flex min-h-5 flex-wrap items-center gap-2">
        <p className="text-extaSmall font-semibold leading-5 text-[#2E2E2E]">
          Quantity
        </p>
        {labelAccessory}
      </div>

      <div className="flex h-12 w-full items-center justify-between rounded-full border border-[#1B1D60]/30 bg-[#F4F4F8] p-1.5">
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled || quantity <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B1D60] text-2xl font-light leading-none text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Decrease Quantity"
        >
          −
        </button>

        <span className="font-dm-sans text-base font-medium leading-none text-[#2E2E2E]">
          {String(quantity).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={() => {
            if (disableIncrease) return;
            onIncrease?.();
          }}
          disabled={disableIncrease}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B1D60] text-2xl font-light leading-none text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={increaseDisabledLabel || "Increase Quantity"}
          title={increaseDisabledLabel || undefined}
        >
          +
        </button>
      </div>
    </div>
  );
}
