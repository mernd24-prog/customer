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
        "group relative flex flex-col h-full min-h-[300px] sm:min-h-[360px] w-full overflow-hidden rounded-2xl select-none transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-black/10",
        active && "ring-2 ring-indigo-500 ring-offset-2",
        className
      )}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-100">
        <img
          src={cardImage}
          alt={title || "Category"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
          decoding="async"
          onError={(event) => applyImageFallback(event, title, "category")}
        />
        {/* Top Gradient Overlay for Text Readability */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-100" />
      </div>

      {/* Content Overlay */}
      <div className="relative flex flex-col justify-between h-full p-5 sm:p-6 z-10 text-white drop-shadow-md">
        <div className="flex flex-col">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 drop-shadow-lg">
            {title}
          </h3>
          
          {/* Shop Now CTA */}
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white drop-shadow-lg">
            <span>
              {ctaLabel}
            </span>
            <ArrowRight size={16} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100" />
          </div>
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





