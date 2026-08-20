import { Star } from "lucide-react";
import { clampRating } from "../../utils/ecommerce";
import { cn } from "../../utils/common";

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
      className={cn("flex items-center gap-2", className)}
      aria-label={`${rating.toFixed(1)} out of ${max} stars`}
    >
      <div className="flex items-center gap-1 rounded-[4px] bg-[#CE9F2D] px-1.5 py-0.5 text-white">
        <Star size={size > 14 ? size : 12} className="fill-white text-white" />
        <span className="text-xs font-bold sm:text-[13px]">
          {rating.toFixed(1)}
        </span>
      </div>
      {count != null && (
        <span className="text-[13px] font-medium text-[#2E2E2E]">
          ({count})
        </span>
      )}
    </div>
  );
}
