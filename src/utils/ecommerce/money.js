export function formatMoney(value, currency = "INR", options = {}) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return options.fallback || "Price on request";
  }

  return new Intl.NumberFormat(options.locale || "en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(Number(value));
}

export function formatAmount(value, options = {}) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return options.fallback || "";
  }

  return new Intl.NumberFormat(options.locale || "en-IN", {
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(Number(value));
}

export function calculateDiscountPercent(price, oldPrice) {
  const current = Number(price);
  const previous = Number(oldPrice);

  if (!previous || Number.isNaN(current) || Number.isNaN(previous) || current >= previous) {
    return 0;
  }

  return Math.round(((previous - current) / previous) * 100);
}

/** Sum of (mrp × qty) across items — the "before discount" total */
export function calcMRPSubtotal(items = []) {
  return items.reduce((sum, item) => {
    const mrp = Number(item.oldPrice ?? item.mrp ?? item.price ?? 0);
    return sum + mrp * Number(item.quantity || 1);
  }, 0);
}

/** Sum of (sellingPrice × qty) across items */
export function calcSellingSubtotal(items = []) {
  return items.reduce((sum, item) => {
    return sum + Number(item.price ?? 0) * Number(item.quantity || 1);
  }, 0);
}

/** Sum of per-unit shipping × qty */
export function calcShippingTotal(items = []) {
  return items.reduce((sum, item) => {
    return sum + Number(item.shipping ?? 0) * Number(item.quantity || 1);
  }, 0);
}

/** Savings = MRP subtotal − selling subtotal (clamped to 0) */
export function calcTotalSavings(items = []) {
  return Math.max(0, calcMRPSubtotal(items) - calcSellingSubtotal(items));
}

/** Safe numeric coercion */
export function toNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
