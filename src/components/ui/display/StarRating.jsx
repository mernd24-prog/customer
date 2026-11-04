
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

const formatIndianRatingCount = (count) => {
  const value = Number(count);

  if (!Number.isFinite(value) || value <= 0) return "";

  return value.toLocaleString("en-IN");
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
  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div className={`flex shrink-0 items-center gap-0 sm:gap-0.5 ${className}`.trim()}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillAmount = interactive
          ? (star <= (hoverStar || 0) ? 1 : 0)
          : Math.min(1, Math.max(0, safeRating - star + 1));

        const starClassName = `${
          fillAmount > 0 ? filledClassName : emptyClassName
        } shrink-0`;

        if (interactive) {
          const Icon = fillAmount > 0 ? PiStarFill : PiStarThin;

          return (
            <button
              key={star}
              type="button"
              className="shrink-0 focus:outline-none"
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
                style={{ width: size, height: size }}
              />
            </button>
          );
        }

        return (
          <span
            key={star}
            className="relative inline-flex shrink-0 overflow-hidden"
            style={{ width: size, height: size }}
          >
            <PiStarThin
              size={size}
              className={`absolute inset-0 ${emptyClassName}`}
              style={{ width: size, height: size }}
            />

            {fillAmount > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <PiStarFill
                  size={size}
                  className={filledClassName}
                  style={{
                    width: size,
                    height: size,
                    maxWidth: "none",
                  }}
                />
              </span>
            )}
          </span>
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
  showValue = true,
  showCountText = true,
}) {
  const ratingValue = Number(rating || 0);
  const formattedCount = formatRatingCount(count);

  if (!ratingValue || ratingValue <= 0) return null;

  const valueBadge = showValue ? (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#388e3c] px-1.5 py-0.5 text-white">
      <Star size={12} className="fill-white text-white" />
      <span className="text-xs font-bold">
        {ratingValue.toFixed(1)}
      </span>
    </div>
  ) : null;

  // Cart rating - Flipkart-style layout
  if (variant === "cart") {
    const indianCount = formatIndianRatingCount(count);

    return (
      <div className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
        {showStars && (
          <RatingStars
            rating={ratingValue}
            size={16}
            filledClassName="text-[#16A34A]"
            emptyClassName="text-[#16A34A]"
          />
        )}

        {showValue && (
          <span className="shrink-0 text-xs font-semibold leading-none text-[#16A34A]">
            {ratingValue.toFixed(1)}
          </span>
        )}

        {indianCount && showCountText && (
          <>
            <span className="shrink-0 text-[10px] text-[#9CA3AF]">
              ·
            </span>

            <span className="shrink-0 text-xs font-medium leading-none text-[#6F7480]">
              ({indianCount})
            </span>
          </>
        )}
      </div>
    );
  }

  if (variant === "product-detail") {
    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        {valueBadge}

        {formattedCount && showCountText && (
          <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[#6F7480] lg:text-xs">
            {formattedCount} reviews
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {showStars && (
        <RatingStars
          rating={ratingValue}
          size={18}
          filledClassName="text-[#16A34A]"
          emptyClassName="text-[#16A34A]"
        />
      )}

      {valueBadge}

      {formattedCount && showCountText && (
        <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[#6F7480]">
          ({formattedCount})
        </span>
      )}
    </div>
  );
}
