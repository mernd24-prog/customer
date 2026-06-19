export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max,
  disabled,
  disabled = false,
  increaseDisabled = false,
  increaseDisabledLabel = "Increase quantity unavailable",
}) {
  const atMax = max != null && quantity >= max;

  return (
    <div className="flex w-fit flex-col gap-2">
      <p className="font-dm-sans text-[15px] font-bold leading-none text-[#2E2E2E] min-[375px]:text-[16px] sm:text-[18px]">
        Quantity
      </p>

      <div className="flex h-[40px] w-[183px] items-center justify-between rounded-full border border-[#1B1D60]/60 bg-[#D9D9E3] p-[6px] min-[375px]:h-[48px] min-[375px]:w-[160px] min-[375px]:p-[7px] sm:h-[54px] sm:w-[183px]">
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
          onClick={onIncrease}
          disabled={disabled || atMax}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#1B1D60] text-[24px] font-light leading-none text-white disabled:cursor-not-allowed disabled:opacity-50 min-[375px]:h-[36px] min-[375px]:w-[36px] min-[375px]:text-[28px] sm:h-[40px] sm:w-[40px] sm:text-[32px]"
          aria-label={disabled || increaseDisabled ? increaseDisabledLabel : "Increase quantity"}
        >
          +
        </button>
      </div>
    </div>
  );
}
