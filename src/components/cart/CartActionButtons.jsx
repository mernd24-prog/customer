export default function CartActionButtons({
  BuyNow,
  SaveForLater,
  Remove,
  onBuyNow,
  onSaveForLater,
  onRemove,
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm sm:flex-row sm:items-center">
      {BuyNow && (
        <button
          type="button"
          onClick={onBuyNow}
          className="rounded-md px-4 py-2 underline font-semibold text-[#292929] transition hover:bg-gray-100"
        >
          {BuyNow}
        </button>
      )}

      {SaveForLater && (
        <button
          type="button"
          onClick={onSaveForLater}
          className="rounded-md px-4 py-2 underline font-semibold text-[#292929] transition hover:bg-gray-100"
        >
          {SaveForLater}
        </button>
      )}

      {Remove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-4 py-2 underline font-semibold text-[#292929] transition hover:bg-red-50"
        >
          {Remove}
        </button>
      )}
    </div>
  );
}
