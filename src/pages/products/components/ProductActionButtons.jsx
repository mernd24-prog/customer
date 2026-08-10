import { buildCartItem } from "../../../utils/ecommerce";
import { BUY_NOW_STORAGE_KEY } from "../utils/productUtils";

export default function ProductActionButtons({
  inStock,
  product,
  selectedVariant,
  quantity,
  addToCart,
  navigate,
}) {
  return (
    <div className="mt-2  grid gap-4 sm:grid-cols-2">
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

          window.sessionStorage.setItem(
            BUY_NOW_STORAGE_KEY,
            JSON.stringify([buyNowItem]),
          );

          navigate("/checkout");
        }}
        className="py-3 w-full rounded-[10px] border border-navy text-base font-semibold text-navy transition-all duration-300 ease-in-out hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy It Now
      </button>
    </div>
  );
}
