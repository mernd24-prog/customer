import React from "react";
import {
  applyImageFallback,
  getAvailableStock,
} from "../../../utils/ecommerce";
import { getColorSwatchImage } from "../../../utils/pages/productUtils";
import HorizontalScrollControls from "../../../components/ui/HorizontalScrollControls";

export default function VariantSelector({
  variantOptions,
  selectedAttributes,
  findVariantForSelection,
  variantMatchesSelection,
  getVariantAttributeValue,
  setSelectedVariant,
  product,
  onSizeChartClick,
}) {
  const variants = product?.variants || [];

  const sortedVariantOptions = [...variantOptions].sort((a, b) => {
    const aIsColor =
      a.displayType === "color_swatch" ||
      a.slug?.toLowerCase().includes("color") ||
      a.slug?.toLowerCase().includes("colour");
    const bIsColor =
      b.displayType === "color_swatch" ||
      b.slug?.toLowerCase().includes("color") ||
      b.slug?.toLowerCase().includes("colour");

    if (aIsColor && !bIsColor) return -1;
    if (!aIsColor && bIsColor) return 1;

    return 0;
  });
  return (
    <div className="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-4">
      {sortedVariantOptions.map((option) => {
        const isColorOption =
          option.displayType === "color_swatch" ||
          option.slug?.toLowerCase().includes("color") ||
          option.slug?.toLowerCase().includes("colour");

        return (
        <div
          key={option.slug}
          className={`min-w-0 max-w-full ${isColorOption ? "w-full" : "w-fit"}`}
        >
          <div className="mb-3 flex items-center gap-4">
            <p className="text-lg font-semibold capitalize text-ink">
              {option.displayType === "color_swatch" ? "Colour" : option.name}{":"}{" "}
              <span className="text-sm font-medium text-muted">
                {selectedAttributes[option.slug] || "Choose an option"}
              </span>
            </p>

            {option.name?.toLowerCase() === "size" &&
              (product?.category?.toLowerCase().includes("fashion") ||
                product?.parentCategory?.toLowerCase().includes("fashion")) && (
                <button
                  type="button"
                  onClick={onSizeChartClick}
                  className="text-sm font-bold text-gold transition-colors hover:text-gold-dark hover:underline"
                >
                  Size Chart
                </button>
              )}
          </div>

          <HorizontalScrollControls
            className="relative"
            viewportClassName="hide-scrollbar flex max-w-full items-center gap-4 overflow-x-auto pb-1"
            leftButtonClassName="left-0"
            rightButtonClassName="right-0"
          >
            {option.values.map((value, valueIndex) => {
              const isSelected =
                String(selectedAttributes[option.slug]) === String(value);

              const matchingVariant = findVariantForSelection(option.slug, value);

              const exactVariant = variants.find((variant) =>
                variantMatchesSelection(variant, {
                  ...selectedAttributes,
                  [option.slug]: value,
                }),
              );

              const isComboAvailable =
                option.slug === "storage" || isColorOption
                  ? true
                  : Boolean(exactVariant);

              const matchingVariantStock = getAvailableStock(matchingVariant);

              let isUnavailable = false;
              if (isColorOption) {
                const colorVariants = variants.filter(
                  (v) =>
                    String(
                      getVariantAttributeValue(v, option.slug) ||
                        getVariantAttributeValue(v, "color") ||
                        getVariantAttributeValue(v, "colour") ||
                        "",
                    ).toLowerCase() === String(value).toLowerCase(),
                );
                const hasInStock = colorVariants.some((v) => {
                  const s = getAvailableStock(v);
                  return (
                    s > 0 && v?.inStock !== false && v?.isAvailable !== false
                  );
                });
                isUnavailable = colorVariants.length > 0 && !hasInStock;
              } else {
                isUnavailable =
                  Boolean(matchingVariant) &&
                  (matchingVariantStock === 0 ||
                    matchingVariant?.inStock === false ||
                    matchingVariant?.isAvailable === false);
              }

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
                    className={`relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-lg border bg-white transition-all duration-300 ease-in-out sm:h-[95px] sm:w-[95px] ${
                      isSelected
                        ? "border border-gold shadow-sm"
                        : "border border-gold/20 hover:border-gold/50"
                    } ${isUnavailable ? "opacity-55 grayscale" : ""} ${
                      !isComboAvailable ? "cursor-not-allowed opacity-40" : ""
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
                        loading="lazy"
                        width="400"
                        height="400"
                        src={swatchImage}
                        alt={`${value} colour`}
                        className="h-full w-full object-contain p-2"
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
                        <span className="rounded bg-white/80 px-1.5 py-0.5">
                          {value}
                        </span>
                      </span>
                    )}

                    {isUnavailable && (
                      <span className="absolute inset-x-0 bottom-0 bg-red-600 px-1 py-1 text-xs font-semibold text-white">
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
                  aria-label={`${option.name} ${value}${
                    !isComboAvailable
                      ? ", not available in this combination"
                      : isUnavailable
                        ? ", out Of Stock"
                        : ""
                  }`}
                  title={
                    !isComboAvailable
                      ? `${value} - Not available in this combination`
                      : isUnavailable
                        ? `${value} - Out Of stock`
                        : value
                  }
                  className={`relative min-h-10 min-w-12 shrink-0 rounded-[8px] px-3 py-1 text-xs font-bold transition-all duration-300 ease-in-out disabled:cursor-not-allowed ${
                    isSelected
                      ? "border border-gold bg-gold/10 text-gold-dark shadow-sm"
                      : "border border-gold/20 hover:border-gold/50"
                  } ${
                    isUnavailable ? "border-red-200 bg-red-50 text-red-500" : ""
                  } ${!isComboAvailable ? "opacity-40" : ""}`}
                >
                  <span
                    className={
                      isUnavailable || !isComboAvailable
                        ? "text-gray-400 line-through"
                        : ""
                    }
                  >
                    {value}
                  </span>

                  {isUnavailable && (
                    <span className="mt-0.5 block whitespace-nowrap text-xs font-semibold leading-none no-underline">
                      Out Of Stock
                    </span>
                  )}
                </button>
              );
            })}
          </HorizontalScrollControls>
        </div>
        );
      })}
    </div>
  );
}
