import {
  applyImageFallback,
  getImageUrlFromValue,
} from "../../../utils/ecommerce";
import HorizontalScrollControls from "../../../components/ui/HorizontalScrollControls";

/**
 * ImageVariantPicker — a thumbnail-based variant selector shown when variants
 * exist but have no distinguishing attributes (empty `attributes: {}`).
 *
 * Each variant is represented by its first image so users can visually pick
 * between different designs / styles.
 */
export default function ImageVariantPicker({
  variants,
  selectedVariant,
  setSelectedVariant,
  productTitle,
}) {
  if (!variants || variants.length < 2) return null;

  const selectedId =
    selectedVariant?._id || selectedVariant?.id || selectedVariant?.sku || "";

  return (
    <div className="w-full">
      <p className="mb-3 text-base font-semibold capitalize text-ink">Style:</p>

      <HorizontalScrollControls
        className="min-w-0 w-full"
        viewportClassName="hide-scrollbar flex min-w-0 max-w-full flex-nowrap gap-3 overflow-x-auto pb-2"
        showButtons={false}
        wheelToScroll
        dragToScroll
        resetOnMount
        resetKey={variants.map((variant) => variant._id || variant.id || variant.sku).join("|")}
      >
          {variants.map((variant, index) => {
          const variantId = variant._id || variant.id || variant.sku || index;
          const isSelected = String(variantId) === String(selectedId);

          // Get the first image of this variant
          const variantImages = Array.isArray(variant.images)
            ? variant.images
            : [];
          const thumbUrl =
            getImageUrlFromValue(variantImages[0]) ||
            getImageUrlFromValue(variant.image) ||
            "";

          const stock = Number(variant.availableStock ?? variant.stock ?? 0);
          const isOutOfStock =
            stock === 0 ||
            variant.inStock === false ||
            variant.isAvailable === false;

          return (
            <button
              key={variantId}
              type="button"
              onClick={() => setSelectedVariant(variant)}
              className={`relative h-[80px] w-[70px] shrink-0 overflow-hidden rounded-lg border bg-white transition-all duration-300 ease-in-out sm:h-[100px] sm:w-[80px] ${
                isSelected
                  ? "border border-gold shadow-sm"
                  : "border border-gold/20 hover:border-gold/50"
              } ${isOutOfStock ? "opacity-55 grayscale" : ""}`}
              title={`${
                variant.title || `Style ${index + 1}`
              }${isOutOfStock ? " - Out Of Stock" : ""}`}
            >
              {thumbUrl ? (
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src={thumbUrl}
                  alt={variant.title || `${productTitle} - Style ${index + 1}`}
                  className="h-full w-full object-contain p-2"
                  onError={(event) =>
                    applyImageFallback(
                      event,
                      variant.title || `Style ${index + 1}`,
                      "product",
                    )
                  }
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-center text-xs font-semibold text-gray-500">
                  Style {index + 1}
                </span>
              )}

              {isOutOfStock && (
                <span className="absolute inset-x-0 bottom-0 bg-red-600 px-1 py-1 text-xs font-semibold text-white">
                  Out Of Stock
                </span>
              )}
            </button>
          );
        })}
      </HorizontalScrollControls>
    </div>
  );
}
