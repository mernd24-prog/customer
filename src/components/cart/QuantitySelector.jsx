export default function QuantitySelector({ quantity, onIncrease, onDecrease, max, disabled }) {
  const atMax = max != null && quantity >= max;

  return (
    <div className="flex w-fit items-center overflow-hidden rounded-[var(--customer-radius-sm)] border border-[var(--customer-border)] bg-white">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        className="flex h-8 w-8 items-center justify-center text-base font-semibold text-[var(--customer-navy)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] disabled:cursor-not-allowed disabled:text-[var(--customer-subtle)] disabled:hover:bg-white sm:h-9 sm:w-9 sm:text-lg"
        aria-label="Decrease quantity"
      >
        -
      </button>

      <span className="flex min-w-[40px] items-center justify-center border-x border-[var(--customer-border)] px-3 py-1 text-xs font-semibold text-[var(--customer-ink)] sm:min-w-[50px] sm:px-4 sm:text-sm">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || atMax}
        className="flex h-8 w-8 items-center justify-center text-base font-semibold text-[var(--customer-navy)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] disabled:cursor-not-allowed disabled:text-[var(--customer-subtle)] disabled:hover:bg-white sm:h-9 sm:w-9 sm:text-lg"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
