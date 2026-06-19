import { Star } from "lucide-react";
export default function StarRating({ rating, count }) {
  const stars = Math.round(rating || 0);

  return (
    <div className="flex items-center  gap-3 my-2">
      <div className="flex items-center gap-1 ">
        {rating != null && (
          <span className=" text-sm lg:text-[20px]  font-medium text-ink">
            {Number(rating).toFixed(1)}
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

      {count != null && (
        <span className="text-sm lg:text-[20px]  font-medium text-[#2E2E2E]">
          ({count.toLocaleString()} reviews)
        </span>
      )}
    </div>
  );
}
