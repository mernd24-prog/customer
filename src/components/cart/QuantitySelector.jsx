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
    <div className="flex w-full flex-col  gap-2  md:w-fit">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-dm-sans text-[15px] font-semibold leading-none text-[#2E2E2E] min-[375px]:text-[16px] sm:text-[20px]">
          Quantity
        </p>
        {labelAccessory}
      </div>

      <div className="flex mt-2  h-[44px] w-full items-center justify-between rounded-full border border-[#1B1D60]/60 bg-[#D9D9E3]  p-[6px]  min-[375px]:h-[46px] min-[375px]:p-[7px] sm:h-[54px] sm:w-[180px]">
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled || quantity <= 1}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#1B1D60] text-[24px] font-light leading-none text-white disabled:cursor-not-allowed disabled:opacity-50 min-[375px]:h-[36px] min-[375px]:w-[36px] min-[375px]:text-[28px] sm:h-[40px] sm:w-[40px] sm:text-[32px]"
          aria-label="Decrease quantity"
        >
          −
        </button>

        <span className="font-dm-sans text-[14px] font-medium leading-none text-[#2E2E2E] min-[375px]:text-[15px] sm:text-[16px]">
          {String(quantity).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={() => {
            if (disableIncrease) return;
            onIncrease?.();
          }}
          disabled={disableIncrease}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#1B1D60] text-[24px] font-light leading-none text-white disabled:cursor-not-allowed disabled:opacity-50 min-[375px]:h-[36px] min-[375px]:w-[36px] min-[375px]:text-[28px] sm:h-[40px] sm:w-[40px] sm:text-[32px]"
          aria-label={increaseDisabledLabel || "Increase quantity"}
          title={increaseDisabledLabel || undefined}
        >
          +
        </button>
      </div>
    </div>
  );
}
