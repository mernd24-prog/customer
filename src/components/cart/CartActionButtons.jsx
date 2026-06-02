export default function CartActionButtons({
  BuyNow,
  SaveForLater,
  Remove,
  onBuyNow,
  onSaveForLater,
  onRemove,
}) {
  const actionClass =
    "rounded-[var(--customer-radius-sm)] border border-transparent px-3 py-2 font-semibold text-[var(--customer-navy)] underline-offset-2 transition-all duration-300 ease-in-out hover:border-[var(--customer-border)] hover:bg-[var(--customer-gold-soft)] hover:no-underline";

  return (
    <div className="mt-4 flex flex-wrap gap-2 text-sm sm:flex-row sm:items-center">
      {BuyNow && (
        <button
          type="button"
          onClick={onBuyNow}
          className={actionClass}
        >
          {BuyNow}
        </button>
      )}

      {SaveForLater && (
        <button
          type="button"
          onClick={onSaveForLater}
          className={actionClass}
        >
          {SaveForLater}
        </button>
      )}

      {Remove && (
        <button
          type="button"
          onClick={onRemove}
          className={`${actionClass} hover:bg-red-50 hover:text-red-600`}
        >
          {Remove}
        </button>
      )}
    </div>
  );
}
