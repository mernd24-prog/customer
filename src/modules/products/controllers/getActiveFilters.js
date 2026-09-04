import { parseMultiValue } from "../../../utils/filterUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";

export function getActiveFilters(searchParams, attributeFacets, absolutePriceLimits = {}) {
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const minLabel = minPrice ? Number(minPrice).toLocaleString("en-IN") : "0";
  const maxLabel = maxPrice 
    ? Number(maxPrice).toLocaleString("en-IN") 
    : absolutePriceLimits?.max 
      ? absolutePriceLimits.max.toLocaleString("en-IN") + "+" 
      : "1,50,000+";

  return [
    ...parseMultiValue(searchParams.get("category")).map((val) => ({
      key: `category:${val}`,
      type: "category",
      label: "Category: " + capitalizeFirst(val.replace(/-/g, " ")),
      value: val,
    })),
    ...parseMultiValue(searchParams.get("brand")).map((val) => ({
      key: `brand:${val}`,
      type: "brand",
      label: "Brand: " + capitalizeFirst(val.replace(/-/g, " ")),
      value: val,
    })),
    ...parseMultiValue(searchParams.get("rating")).map((val) => ({
      key: `rating:${val}`,
      type: "rating",
      label: val + String.fromCharCode(9733) + " & above",
      value: val,
    })),
    ...(minPrice || maxPrice
      ? [
          {
            key: "price",
            type: "price",
            label: `Price: \u20B9${minLabel} - \u20B9${maxLabel}`,
            value: "price",
          },
        ]
      : []),
    ...(searchParams.get("inStock") === "true"
      ? [{ key: "inStock", type: "inStock", label: "In Stock Only", value: "true" }]
      : []),
    ...(searchParams.get("outOfStock") === "true"
      ? [{ key: "outOfStock", type: "outOfStock", label: "Out of Stock", value: "true" }]
      : []),
    ...(searchParams.get("featured") === "true"
      ? [{ key: "featured", type: "featured", label: "Featured", value: "true" }]
      : []),
    ...(searchParams.get("bestSeller") === "true"
      ? [{ key: "bestSeller", type: "bestSeller", label: "Best Seller", value: "true" }]
      : []),
    ...(searchParams.get("newArrival") === "true"
      ? [{ key: "newArrival", type: "newArrival", label: "New Arrival", value: "true" }]
      : []),
    ...Array.from(searchParams.entries())
      .filter(
        ([k]) =>
          !["category", "brand", "rating", "minPrice", "maxPrice", "sort", "limit", "page", "q", "inStock", "outOfStock", "featured", "bestSeller", "newArrival"].includes(k),
      )
      .flatMap(([k, v]) => {
        const attributeKey = k.startsWith("attr_") ? k.replace(/^attr_/, "") : k;
        const attribute = (attributeFacets || []).find((a) => a.key === attributeKey);
        if (!attribute) return [];
        return parseMultiValue(v).map((val) => {
          const option = attribute.values.find(
            (opt) => String(opt.value) === String(val),
          );
          const displayLabel = option?.label || val;
          return {
            key: `${k}:${val}`,
            type: "attribute",
            attributeKey: k,
            label: attribute.label + ": " + capitalizeFirst(displayLabel),
            value: val,
          };
        });
      }),
  ].filter(Boolean);
}
