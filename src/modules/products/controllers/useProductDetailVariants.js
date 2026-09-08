import { useMemo } from "react";

const attributeAliases = (key = "") => {
  const normalized = String(key || "").trim().toLowerCase();
  return Array.from(
    new Set([
      key,
      normalized,
      normalized.replace(/-/g, "_"),
      normalized.replace(/_/g, "-"),
      normalized.replace(/[-_]+/g, " "),
    ].filter(Boolean)),
  );
};

const getAttributeValue = (variant = {}, key = "") => {
  const attributes = variant?.attributes || {};
  const matchingKey = attributeAliases(key).find(
    (candidate) => attributes[candidate] != null,
  );
  return matchingKey ? attributes[matchingKey] : undefined;
};

export function useProductDetailVariants({
  product,
  variants,
  selectedVariant,
}) {
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

  const selectedAttributes = useMemo(
    () =>
      variantOptions.reduce((result, option) => {
        const value = getAttributeValue(selectedVariant, option.slug);
        if (value != null && value !== "") result[option.slug] = value;
        return result;
      }, {}),
    [selectedVariant, variantOptions],
  );

  const variantMatchesSelection = (variant, selection) =>
    Object.entries(selection).every(
      ([key, selectedVal]) =>
        String(getAttributeValue(variant, key)) === String(selectedVal),
    );

  const findVariantForSelection = (axis, value) => {
    const nextSelection = {
      ...selectedAttributes,
      [axis]: value,
    };

    const exactMatch = variants.find((variant) =>
      variantMatchesSelection(variant, nextSelection),
    );
    if (exactMatch) return exactMatch;

    const matches = variants.filter(
      (variant) => String(getAttributeValue(variant, axis)) === String(value),
    );

    const inStockMatch = matches.find((v) => {
      const stock = Number(v?.stock ?? v?.availableStock ?? 0);
      return stock > 0 && v?.inStock !== false && v?.isAvailable !== false;
    });

    return inStockMatch || matches[0] || null;
  };

  return {
    variantOptions,
    selectedAttributes,
    findVariantForSelection,
    variantMatchesSelection,
    getVariantAttributeValue: getAttributeValue,
  };
}
