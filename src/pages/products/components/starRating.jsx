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
    <div className="my-2 flex items-center gap-2">
      <div className="flex items-center gap-1">
        {rating != null && (
          <span className="text-sm font-medium text-ink lg:text-lg">
            {ratingValue.toFixed(1)}
          </span>
        )}

        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={18}
            className={
              i < stars
                ? "fill-[#F58220] text-[#F58220]"
                : "fill-border text-border"
            }
          />
        ))}
      </div>

      {formattedCount && (
        <span className="text-sm font-medium text-[#2E2E2E] lg:text-lg">
          ({formattedCount})
        </span>
      )}
    </div>
  );
}
