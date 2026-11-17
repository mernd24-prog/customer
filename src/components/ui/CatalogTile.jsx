
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/common";

import DynamicButton from "./button/button.jsx";
export default function CatalogTile({
  to,
  onClick,
  title,
  image,
  imageAlt = "",
  fallbackImage = "/image/webp/favicon.webp",
  fallbackIcon: FallbackIcon,
  actionIcon: ActionIcon = ArrowUpRight,
  meta,
  active = false,
  className = "",
  imageClassName = "",
  titleClassName = "",
}) {
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;

    if (fallbackImage) {
      event.currentTarget.src = fallbackImage;
    }
  };

  const content = (
    <article
      className={cn(
        "group block text-center",
        active && "ring-2 ring-gold/50",
        className
      )}
    >
      {/* Card Wrapper */}
      <div
        className="
          mt-2 overflow-hidden rounded-lg
          border border-[#E4CA8E]
          bg-[#FAF8F3]
          p-1.5
          shadow-[0_2px_8px_rgba(0,0,0,0.04)]
          transition-all duration-300
          hover:border-[#E4CA8E]
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]
        "
      >
        {/* Image Container */}
        <div
          className="
            relative flex h-[140px] w-full
            items-center justify-center
            overflow-hidden rounded-lg
            bg-white p-3
            transition-all duration-300
            sm:h-[150px]
            lg:h-[115px]
          "
        >
          {image ? (
            <img
              src={image}
              alt={imageAlt}
              width="100"
              height="100"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className={cn(
                "h-[52px] w-[52px] object-contain transition-transform duration-300 sm:h-[60px] sm:w-[60px] lg:h-[76px] lg:w-[76px]",
                imageClassName
              )}
            />
          ) : FallbackIcon ? (
            <FallbackIcon
              size={36}
              strokeWidth={1.4}
              className="text-[var(--customer-border-strong)]"
            />
          ) : null}

          {/* Hover Action */}
          <span
            aria-hidden="true"
            className="
              absolute right-2 top-2
              flex h-7 w-7 items-center justify-center
              rounded-full border border-border
              bg-white/90 text-gold-dark
              opacity-0 shadow-sm
              transition-all duration-300 ease-in-out
              group-hover:opacity-100
            "
          >
            <ActionIcon size={14} strokeWidth={1.8} />
          </span>
        </div>
      </div>

      {/* Title */}
      <h2
        className={cn(
          "mt-2 line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base",
          titleClassName
        )}
      >
        {title}
      </h2>

      {/* Optional Meta */}
      {meta != null && meta !== "" && (
        <p className="mt-0.5 text-xs font-semibold text-muted">{meta}</p>
      )}
    </article>
  );

  if (onClick && !to) {
    return (
      <DynamicButton
        onClick={onClick}
        className="
          block h-full w-full text-left
          focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-gold
        "
      >
        {content}
      </DynamicButton>
    );
  }

  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className="
        block h-full
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-gold
      "
    >
      {content}
    </Link>
  );
}
