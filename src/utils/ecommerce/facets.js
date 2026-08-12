import { isProductInStock, getProductPrice } from "./product";

export function getAvailabilityCounts(items = [], productFacets = {}) {
  if (productFacets?.availability && typeof productFacets.availability === "object") {
    return {
      inStock: Number(productFacets.availability.inStock || productFacets.availability.in_stock || 0),
      outOfStock: Number(productFacets.availability.outOfStock || productFacets.availability.out_of_stock || 0)
    };
  }

  return items.reduce(
    (counts, product) => {
      if (isProductInStock(product)) {
        counts.inStock += 1;
      } else {
        counts.outOfStock += 1;
      }
      return counts;
    },
    { inStock: 0, outOfStock: 0 }
  );
}

export function calculateAbsolutePriceLimits(productFacets, items) {
  let backendMin = productFacets?.priceStats?.min ?? productFacets?.price?.min;
  let backendMax = productFacets?.priceStats?.max ?? productFacets?.price?.max;

  let currentMin = backendMin;
  let currentMax = backendMax;

  if (currentMin == null || currentMax == null || currentMin >= currentMax) {
    if (items && items.length > 0) {
      const prices = items
        .map((p) => Number(getProductPrice(p) || 0))
        .filter((price) => price > 0);

      if (prices.length > 0) {
        currentMin = Math.min(...prices);
        currentMax = Math.max(...prices);
      }
    }
  }

  return { min: currentMin, max: currentMax };
}
