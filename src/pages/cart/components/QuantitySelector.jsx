export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max,
  disabled,
  increaseDisabled,
  increaseDisabledLabel
}) {
  const atMax = max != null && quantity >= max;
  const disableIncrease = disabled || increaseDisabled || atMax;

  return (
    <div className="flex w-full flex-col gap-1.5 w-[140px] sm:w-[150px]">
      <div className="flex h-11 w-full items-center justify-between rounded-full border border-[#1B1D60]/25 bg-[#F4F4F8] p-1">
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled || quantity <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B1D60] text-lg font-normal leading-none text-white disabled:cursor-not-allowed disabled:opacity-40 transition hover:bg-[#25287d]"
          aria-label="Decrease Quantity"
        >
          −
        </button>

        <span className="font-dm-sans text-sm font-bold text-[#2E2E2E]">
          {String(quantity).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={() => {
            if (disableIncrease) return;
            onIncrease?.();
          }}
          disabled={disableIncrease}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B1D60] text-lg font-normal leading-none text-white disabled:cursor-not-allowed disabled:opacity-40 transition hover:bg-[#25287d]"
          aria-label={increaseDisabledLabel || "Increase Quantity"}
          title={increaseDisabledLabel || undefined}
        >
          +
        </button>
      </div>
    </div>
  );
}
