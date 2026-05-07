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
