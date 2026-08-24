import { useMemo } from "react";

export function useProductDetailVariants({ product, variants, selectedVariant }) {
  const variantOptions = useMemo(() => {
    const configuredOptions = Array.isArray(product?.options)
      ? product.options
      : [];

    if (configuredOptions.length) {
      return configuredOptions
        .map((option) => ({
          ...option,
          slug:
            option.slug ||
            String(option.name || "")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_+|_+$/g, ""),
          values: Array.from(new Set((option.values || []).filter(Boolean))),
        }))
        .filter((option) => option.slug && option.values.length);
    }

    const axisMap = new Map();

    variants.forEach((variant) => {
      Object.entries(variant.attributes || {}).forEach(([key, value]) => {
        if (!axisMap.has(key)) axisMap.set(key, new Set());
        axisMap.get(key).add(String(value));
      });
    });

    return Array.from(axisMap.entries()).map(([slug, values]) => ({
      name: slug.replace(/_/g, " "),
      slug,
      values: Array.from(values),
      displayType: slug.includes("color") ? "color_swatch" : "button",
      valueCodes: {},
    }));
  }, [product?.options, variants]);

  const selectedAttributes = selectedVariant?.attributes || {};

  const findVariantForSelection = (axis, value) => {
    const nextSelection = {
      ...selectedAttributes,
      [axis]: value,
    };

    return (
      variants.find((variant) =>
        Object.entries(nextSelection).every(
          ([key, selectedValue]) =>
            String(variant.attributes?.[key]) === String(selectedValue),
        ),
      ) ||
      variants.find(
        (variant) => String(variant.attributes?.[axis]) === String(value),
      )
    );
  };

  return {
    variantOptions,
    selectedAttributes,
    findVariantForSelection
  };
}
