import { buildCartItem } from "../../../utils/ecommerce";

export default function ProductActionButtons({
  inStock,
  product,
  selectedVariant,
  quantity,
  addToCart,
  onBuyNow,
}) {
  return (
    <div className="mt-2 grid gap-4 sm:grid-cols-2">
      {inStock ? (
        <>
          <button
            type="button"
            disabled={!inStock}
            onClick={() => {
              addToCart({ ...product, selectedVariant }, quantity);
            }}
            className="py-3 w-full rounded-[10px] bg-gold text-base font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add To Cart
          </button>

          <button
            type="button"
            disabled={!inStock}
            onClick={() => {
              const buyNowItem = buildCartItem(
                { ...product, selectedVariant },
                quantity,
              );
              onBuyNow?.(buyNowItem);
            }}
            className="py-3 w-full rounded-[10px] border border-navy text-base font-semibold text-navy transition-all duration-300 ease-in-out hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy It Now
          </button>
        </>
      ) : (
        <button
          type="button"
          className="py-3 w-full rounded-[10px] bg-gold text-base font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark"
        >
          Notify Me
        </button>
      )}
    </div>
  );
}
