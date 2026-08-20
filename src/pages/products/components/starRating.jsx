import { Star } from "lucide-react";

const formatRatingCount = (count) => {
  const value = Number(count);

  if (!Number.isFinite(value) || value <= 0) return "";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}m`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }

  return value.toLocaleString();
};

export default function StarRating({ rating, count }) {
  const ratingValue = Number(rating || 0);
  const stars = Math.round(Math.max(0, Math.min(ratingValue, 5)));
  const formattedCount = formatRatingCount(count);

  return (
    <div className="flex items-center gap-2">
      {rating != null && (
        <div 
          className={`flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-white ${
            ratingValue > 3 ? "bg-[#388e3c]" : ratingValue === 0 ? "bg-[#9e9e9e]" : "bg-[#CE9F2D]"
          }`}
        >
          <Star size={12} className="fill-white text-white" />
          <span className="text-xs font-bold sm:text-[13px]">
            {ratingValue.toFixed(1)}
          </span>
        </div>
      )}

      {formattedCount && (
        <span className="text-sm font-medium text-[#2E2E2E] lg:text-base">
          ({formattedCount})
        </span>
      )}
    </div>
  );
}
