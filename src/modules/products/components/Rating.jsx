import { Star } from "lucide-react";
import { clampRating } from "../../../utils/ecommerce";
import { cn } from "../../../utils/common";

export default function Rating({
  value = 0,
  count,
  max = 5,
  size = 14,
  showValue = false,
  emptyLabel = "",
  className = "",
}) {
  const rating = clampRating(value, max);
  const roundedRating = Math.round(rating);
  if (!rating || Number(rating) <= 0) {
    return emptyLabel ? (
      <span
        className={cn(
          "inline-flex min-h-5 w-fit items-center rounded-full border border-border bg-cream px-2 py-0.5 text-micro font-bold uppercase tracking-[0.06em] text-muted",
          className,
        )}
      >
        {emptyLabel}
      </span>
    ) : null;
  }

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      aria-label={`${rating.toFixed(1)} out of ${max} stars`}
    >
      <div
        className={`flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-white ${
          rating > 3 ? "bg-[#388e3c]" : "bg-[#CE9F2D]"
        }`}
      >
        <Star size={size > 14 ? size : 12} className="fill-white text-white" />
        <span className="text-xs font-bold sm:text-label">
          {rating.toFixed(1)}
        </span>
      </div>
      {count != null && (
        <span className="text-label font-medium text-ink">
          ({count})
        </span>
      )}
    </div>
  );
}
