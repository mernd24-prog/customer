import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { applyImageFallback, getImageFallbackSrc } from "../../utils/ecommerce";
import { cn } from "../../utils/common";

export function getCategoryTheme(item = {}, index = 0) {
  if (item && (item.bgColor || item.bgHex)) {
    return { bgHex: item.bgColor || item.bgHex };
  }
  return { bgHex: "#FFFCF6" };
}

export default function CategoryCard({
  image,
  title,
  href,
  ctaLabel = "Shop Now",
  active = false,
  onClick,
  className = "",
  index = 0,
  categoryItem = null,
}) {
  const cardImage = image || getImageFallbackSrc(title, "category");

  const cardContent = (
    <article
      className={cn(
        "relative flex flex-col h-full min-h-[300px] sm:min-h-[340px] w-full overflow-hidden rounded-[16px] sm:rounded-[18px] border border-[#EAD9B6]/80 bg-[#FFFCF6] select-none transition-all duration-300 hover:shadow-md hover:border-[#CE9F2D]/60",
        active && "ring-2 ring-[#1B1D60]",
        className
      )}
    >
      {/* Top Image Container with Scoped Hover Scale */}
      <div className="group/image relative h-[220px] sm:h-[250px] w-full overflow-hidden bg-white shrink-0 rounded-t-[16px] sm:rounded-t-[18px]">
        <img
          src={cardImage}
          alt={title || "Category"}
          width="280"
          height="260"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/image:scale-105"
          loading="lazy"
          decoding="async"
          onError={(event) => applyImageFallback(event, title, "category")}
        />
      </div>

      {/* Bottom Content Area */}
      <div className="group/cta flex flex-col justify-between p-3 sm:p-3.5 bg-[#FFFCF6] gap-2 flex-1">
        <h3 className="line-clamp-1 text-sm sm:text-[15px] font-extrabold text-[#1B1D60] tracking-tight group-hover/cta:text-[#A96F14] transition-colors">
          {title}
        </h3>

        {/* Subtle Horizontal Divider Line */}
        <div className="w-full border-b border-[#E8DAAF]/60 my-0.5" />

        {/* Shop Now CTA with Aligned Arrow Icon Badge */}
        <div className="flex items-center justify-between w-full text-[#A96F14] font-bold text-xs sm:text-[13px] transition-colors pt-0.5">
          <span className="tracking-wide group-hover/cta:text-[#CE9F2D] transition-colors">{ctaLabel}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#CE9F2D]/15 text-[#A96F14] group-hover/cta:bg-[#CE9F2D] group-hover/cta:text-white transition-all duration-300 shadow-2xs">
            <ArrowRight size={13} strokeWidth={2.5} className="transition-transform group-hover/cta:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link to={href} onClick={onClick} className="block h-full w-full group">
        {cardContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full text-left focus:outline-none group"
    >
      {cardContent}
    </button>
  );
}





