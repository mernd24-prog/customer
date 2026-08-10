import { applyImageFallback, getAvailableStock } from "../../../utils/ecommerce";
import { getColorSwatchImage } from "../utils/productUtils";

export default function VariantSelector({
  variantOptions,
  selectedAttributes,
  findVariantForSelection,
  setSelectedVariant,
  product,
  onSizeChartClick,
}) {
  const variants = product?.variants || [];

  return (
    <div className="flex flex-col gap-6">
      {variantOptions.map((option) => (
        <div
          key={option.slug}
          className={
            option.displayType === "color_swatch"
              ? "order-2 w-full"
              : "order-1 w-full"
          }
        >
          <div className="flex items-center gap-4 mb-3">
            <p
              className={`font-semibold capitalize text-ink ${
                option.displayType === "color_swatch" ? "text-lg" : "text-lg"
              }`}
            >
              {option.displayType === "color_swatch" ? "Colour" : option.name}:
            </p>
            {option.name?.toLowerCase() === "size" &&
              (product?.category?.toLowerCase().includes("fashion") ||
                product?.parentCategory?.toLowerCase().includes("fashion")) && (
                <button
                  type="button"
                  onClick={onSizeChartClick}
                  className="text-sm font-bold text-gold hover:text-gold-dark hover:underline transition-colors"
                >
                  Size Chart
                </button>
              )}
          </div>

          <div className="flex  w-fit flex-wrap gap-4">
            {option.values.map((value, valueIndex) => {
              const isSelected =
                String(selectedAttributes[option.slug]) === String(value);

              const matchingVariant = findVariantForSelection(
                option.slug,
                value,
              );

              // Check if this exact combination exists
              const exactVariant = variants.find((variant) =>
                Object.entries({
                  ...selectedAttributes,
                  [option.slug]: value,
                }).every(
                  ([key, selectedVal]) =>
                    String(variant.attributes?.[key]) === String(selectedVal),
                ),
              );

              // Storage row should not show slashes/Not Available states, but RAM and Color should.
              const isComboAvailable =
                option.slug === "storage" ? true : Boolean(exactVariant);

              const matchingVariantStock = getAvailableStock(matchingVariant);
              const isUnavailable =
                Boolean(matchingVariant) &&
                (matchingVariantStock === 0 ||
                  matchingVariant?.inStock === false ||
                  matchingVariant?.isAvailable === false);

              const swatchImage =
                option.displayType === "color_swatch"
                  ? getColorSwatchImage({
                      option,
                      value,
                      matchingVariant,
                      product,
                      index: valueIndex,
                    })
                  : "";
              const swatchColor = option?.valueCodes?.[value] || value;

              if (option.displayType === "color_swatch") {
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isComboAvailable}
                    onClick={() =>
                      matchingVariant && setSelectedVariant(matchingVariant)
                    }
                    className={`relative h-[80px] w-[80px] overflow-hidden rounded-xl border bg-white transition-all duration-300 ease-in-out sm:h-[95px] sm:w-[95px] ${
                      isSelected
                        ? "border border-gold bg-gradient-to-t from-[#1B1D60]/65 to-transparent"
                        : "border border-gold/20 "
                    } ${isUnavailable ? "opacity-55 grayscale" : ""} ${
                      !isComboAvailable ? "opacity-40   cursor-not-allowed" : ""
                    }`}
                    title={`${value}${
                      !isComboAvailable
                        ? " - Not available in this combination"
                        : isUnavailable
                          ? " - Out Of Stock"
                          : ""
                    }`}
                  >
                    {swatchImage ? (
                      <img
                        src={swatchImage}
                        alt={`${value} colour`}
                        className="h-full w-full object-contain p-3"
                        onError={(event) =>
                          applyImageFallback(event, value, "product")
                        }
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-end justify-center p-2 text-center text-xs font-semibold text-[var(--customer-ink)]"
                        style={{
                          backgroundColor:
                            typeof swatchColor === "string" &&
                            (/^#([0-9a-f]{3,8})$/i.test(swatchColor) ||
                              /^(rgb|hsl)a?\(/i.test(swatchColor))
                              ? swatchColor
                              : "var(--customer-cream)",
                        }}
                      >
                        <span className="rounded bg-white/80 px-1.5 py-0.5 ">
                          {value}
                        </span>
                      </span>
                    )}
                    {isUnavailable && (
                      <span className="absolute inset-x-0 bottom-0 bg-red-600 px-1 py-1 text-[10px] font-semibold text-white">
                        Out Of Stock
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!isComboAvailable}
                  onClick={() =>
                    matchingVariant && setSelectedVariant(matchingVariant)
                  }
                  aria-label={`${option.name} ${value}${!isComboAvailable ? ", not available in this combination" : isUnavailable ? ", out Of Stock" : ""}`}
                  title={
                    !isComboAvailable
                      ? `${value} - Not available in this combination`
                      : isUnavailable
                        ? `${value} - Out Of stock`
                        : value
                  }
                  className={`relative min-h-10 min-w-12 rounded-[8px] px-3 py-1 text-xs font-bold transition-all duration-300 ease-in-out disabled:cursor-not-allowed ${
                    isSelected
                      ? "border border-gold bg-gradient-to-t from-[#1B1D60]/25 to-transparent"
                      : "border border-gold/20 "
                  } ${
                    isUnavailable ? "border-red-200 bg-red-50 text-red-500" : ""
                  } ${!isComboAvailable ? "opacity-40" : ""}`}
                >
                  <span
                    className={
                      isUnavailable || !isComboAvailable
                        ? "line-through text-gray-400"
                        : ""
                    }
                  >
                    {value}
                  </span>
                  {isUnavailable && (
                    <span className="mt-0.5 block whitespace-nowrap text-[9px] font-semibold leading-none no-underline">
                      Out Of Stock
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
