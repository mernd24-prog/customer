import { parseMultiValue } from "../../../utils/filterUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";

export function getActiveFilters(searchParams, attributeFacets) {
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

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
            label: "Price: \u20B9" + (minPrice || "0") + " - \u20B9" + (maxPrice || "\u221E"),
            value: "price",
          },
        ]
      : []),
    ...Array.from(searchParams.entries())
      .filter(
        ([k]) =>
          !["category", "brand", "rating", "minPrice", "maxPrice", "sort", "limit", "page", "q"].includes(k),
      )
      .flatMap(([k, v]) => {
        const attribute = (attributeFacets || []).find((a) => a.key === k);
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
