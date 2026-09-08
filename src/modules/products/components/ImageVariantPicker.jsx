import {
  applyImageFallback,
  getImageUrlFromValue,
} from "../../../utils/ecommerce";

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
      <p className="mb-3 text-lg font-semibold capitalize text-ink">
        Style:
      </p>

      <div className="flex w-fit flex-wrap gap-3">
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

          const stock = Number(
            variant.availableStock ?? variant.stock ?? 0
          );
          const isOutOfStock =
            stock === 0 ||
            variant.inStock === false ||
            variant.isAvailable === false;

          return (
            <button
              key={variantId}
              type="button"
              onClick={() => setSelectedVariant(variant)}
              className={`relative h-[80px] w-[80px] overflow-hidden rounded-xl border bg-white transition-all duration-300 ease-in-out sm:h-[95px] sm:w-[95px] ${
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
                      "product"
                    )
                  }
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-center text-xs font-semibold text-gray-500">
                  Style {index + 1}
                </span>
              )}

              {/* Out Of Stock badge */}
              {isOutOfStock && (
                <span className="absolute inset-x-0 bottom-0 bg-red-600 px-1 py-1 text-[10px] font-semibold text-white">
                  Out Of Stock
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
