import { formatMoney } from "../../utils/ecommerce";
import { cn } from "../../lib/utils";

function normalizeMoneyValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numericValue = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isNaN(numericValue) ? value : numericValue;
  }
  return value;
}

export default function Price({
  price,
  oldPrice,
  currency,
  layout = "inline",
  showSavings = false,
  showDiscount = false,
  className = "",
  priceClassName = "",
  oldPriceClassName = "",
}) {
  const currentPrice = normalizeMoneyValue(price || 0);
  const compareAtPrice = normalizeMoneyValue(oldPrice || 0);
  const currentPriceNumber = Number(currentPrice || 0);
  const compareAtPriceNumber = Number(compareAtPrice || 0);
  const hasDiscount = compareAtPriceNumber > currentPriceNumber;
  const savings = hasDiscount ? compareAtPriceNumber - currentPriceNumber : 0;
  const discountPct =
    hasDiscount && compareAtPriceNumber > 0
      ? Math.round((savings / compareAtPriceNumber) * 100)
      : 0;

  return (
    <div
      className={cn(
        "flex ",
        layout === "pill"
          ? "h-[32px] w-full max-w-[160px] items-center justify-evenly gap-1 rounded-full border border-[var(--customer-gold)] bg-white px-2"
          : "items-baseline gap-2",
        layout === "stacked" && "flex-col gap-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "font-semibold leading-none text-[var(--customer-ink)]",
          layout === "pill"
            ? "text-[12px] sm:text-[13px] lg:text-[14px] xl:text-[15px]"
            : "text-sm",
          priceClassName,
        )}
      >
        {formatMoney(currentPrice, currency)}
      </span>

      {hasDiscount && (
        <span
          className={cn(
            "leading-none text-[var(--customer-gold-dark)] line-through",
            layout === "pill"
              ? "text-[10px] sm:text-[11px] lg:text-[12px] xl:text-[13px]"
              : "text-xs",
            oldPriceClassName,
          )}
        >
          {formatMoney(compareAtPrice, currency)}
        </span>
      )}

      {showDiscount && discountPct > 0 && (
        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          {discountPct}% off
        </span>
      )}

      {showSavings && hasDiscount && (
        <span className="text-xs font-medium text-[var(--customer-success)]">
          Save {formatMoney(savings, currency)}
        </span>
      )}
    </div>
  );
}
