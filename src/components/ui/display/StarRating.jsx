import { Star } from "lucide-react";
import { PiStarThin, PiStarFill } from "react-icons/pi";

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

export function RatingStars({
  rating = 0,
  hoverStar = 0,
  interactive = false,
  size = 18,
  filledClassName = "text-[#16A34A]",
  emptyClassName = "text-[#16A34A]",
  onSelect,
  onHover,
  className = "",
  ariaLabelPrefix = "Star",
}) {
  const safeRating = Number(rating || 0);

  return (
    <div className={`flex items-center gap-0 sm:gap-0.5 ${className}`.trim()}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = interactive ? star <= (hoverStar || 0) : star <= safeRating;
        const Icon = isFilled ? PiStarFill : PiStarThin;
        const starClassName = `${isFilled ? filledClassName : emptyClassName} shrink-0`;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              aria-label={`${ariaLabelPrefix} ${star}`}
              onMouseEnter={() => onHover?.(star)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect?.(star);
              }}
            >
              <Icon
                size={size}
                className={starClassName}
                style={{ width: `${size}px`, height: `${size}px` }}
              />
            </button>
          );
        }

        return (
          <Icon
            key={star}
            size={size}
            className={starClassName}
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        );
      })}
    </div>
  );
}

export const StarRatingUI = ({
  item,
  order,
  isUnreviewed,
  myReview,
  onReviewClick,
  hoverStar,
  setHoverStar,
}) => {
  if (isUnreviewed) {
    return (
      <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-2.5">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverStar(0)}
        >
          <RatingStars
            rating={0}
            hoverStar={hoverStar || 0}
            interactive
            size={22}
            filledClassName="text-[#F59E0B] sm:h-6 sm:w-6"
            emptyClassName="text-[#9CA3AF] sm:h-6 sm:w-6"
            onSelect={(star) => onReviewClick?.(item, order, star)}
            onHover={setHoverStar}
            ariaLabelPrefix="Rate"
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReviewClick?.(item, order, hoverStar || 5);
          }}
          className="whitespace-nowrap border-none text-xs font-bold text-[#201B78] outline-none"
        >
          Rate & Review
        </button>
      </div>
    );
  }

  const rating = myReview?.rating || item?.review?.rating || 5;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0FDF4] px-2.5 py-1 sm:bg-transparent sm:px-0 sm:py-0">
      <RatingStars
        rating={rating}
        size={18}
        filledClassName="text-[#16A34A] sm:h-5 sm:w-5"
        emptyClassName="text-[#16A34A] sm:h-5 sm:w-5"
      />

      <span className="text-[#BBF7D0] sm:hidden">|</span>
      <span className="text-xs font-bold text-[#1F2430] sm:hidden">
        {Number(rating).toFixed(1)}
      </span>
      <span className="text-[#BBF7D0] sm:hidden">|</span>

      <span className="rounded-md text-xs font-bold text-[#065F46] sm:bg-[#DCFCE7] sm:px-2 sm:py-0.5 sm:text-xs">
        Reviewed
      </span>
    </div>
  );
};

export default function StarRating({
  rating,
  count,
  showStars = true,
  variant = "inline",
}) {
  const ratingValue = Number(rating || 0);
  const formattedCount = formatRatingCount(count);
  if (!ratingValue || ratingValue <= 0) return null;

  if (variant === "product-detail") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-[4px] bg-[#388e3c] px-1.5 py-0.5 text-white">
          <Star size={12} className="fill-white text-white" />
          <span className="text-xs font-bold sm:text-xs">
            {ratingValue.toFixed(1)}
          </span>
        </div>

        {formattedCount && (
          <span className="text-xs font-medium text-[#6F7480] lg:text-xs">
            {formattedCount} reviews
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {showStars && (
        <RatingStars
          rating={ratingValue}
          size={18}
          filledClassName="text-[#16A34A]"
          emptyClassName="text-[#16A34A]"
        />
      )}

      <span className="text-xs font-bold text-[#1F2430]">
        {ratingValue.toFixed(1)}
      </span>

      {formattedCount && (
        <span className="text-xs font-medium text-[#6F7480]">
          ({formattedCount})
        </span>
      )}
    </div>
  );
}
