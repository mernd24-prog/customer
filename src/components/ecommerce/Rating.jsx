import { Star } from "lucide-react";
import { clampRating } from "../../utils/ecommerce";
import { cn } from "../../utils/classNames";

export default function Rating({
  value = 0,
  count,
  max = 5,
  size = 14,
  showValue = false,
  className = "",
}) {
  const rating = clampRating(value, max);
  const roundedRating = Math.round(rating);

  return (
    <div
      className={cn("flex items-center gap-1  text-xs text-[var(--customer-muted)]", className)}
      aria-label={`${rating} out of ${max} stars`}
    >
      <span className="flex items-center gap-0.5 text-[var(--customer-gold)]">
        {Array.from({ length: max }, (_, index) => (
          <Star
            key={index}
            size={size}
            className={
              index < roundedRating
                ? "fill-[var(--customer-gold)] text-[var(--customer-gold)]"
                : "fill-[var(--customer-border)] text-[var(--customer-border)]"
            }
          />
        ))}
      </span>
      {showValue && <span>{rating.toFixed(1)}</span>}
      {count != null && <span>({count})</span>}
    </div>
  );
}
