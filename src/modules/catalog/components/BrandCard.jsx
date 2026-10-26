import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../../utils/common";
import { getOptimizedCloudinaryUrl } from "../../../utils/ecommerce";

export const getValidImage = (...images) => {
  for (const image of images) {
    if (
      typeof image === "string" &&
      image.trim() !== "" &&
      image !== "null" &&
      image !== "undefined"
    ) {
      return image.trim();
    }
  }

  return null;
};

export default function BrandCard({
  image,
  logo,
  name,
  subtitle,
  productCount,
  href,
  onClick,
  active = false,
  className = "",
}) {
  const displayImage = getValidImage(logo, image);

  const to =
    href ||
    `/brands/${encodeURIComponent((name || "").toLowerCase().replace(/\s+/g, "-"))}`;


  const content = (
    <article
      className={cn(
        "group block text-center",
        active && "ring-2 ring-gold/50",
        className
      )}
    >
      <div
        className="
          mt-2 overflow-hidden rounded-lg
          border border-[#EEE8DA]
          bg-[#FAF8F3]
          p-1.5
          shadow-[0_2px_8px_rgba(0,0,0,0.04)]
          transition-all duration-300
          hover:-translate-y-0.5
          hover:border-[#E5D6B5]
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]
        "
      >
        <div
          className="
            relative flex h-[140px] w-full
            items-center justify-center
            overflow-hidden rounded-lg
            bg-white
            p-3
            transition-all duration-300
            sm:h-[150px]
            lg:h-[115px]
          "
        >
          <img
            src={getOptimizedCloudinaryUrl(displayImage || "/image/webp/favicon.webp", 200)}
            alt=""
            width="200"
            height="100"
            className="
              h-[52px] w-[52px]
              object-contain
              transition-transform duration-300
              sm:h-[60px] sm:w-[60px]
              lg:h-[76px] lg:w-[76px]
              group-hover:scale-[1.04]
            "
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/image/webp/favicon.webp";
            }}
          />

          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white/90 text-gold-dark opacity-0 shadow-sm transition-all duration-300 ease-in-out group-hover:opacity-100"
          >
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </span>
        </div>
      </div>

      <h2 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base">
        {name}
      </h2>

      {productCount != null && (
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {Number(productCount).toLocaleString()} Products
        </p>
      )}
    </article>
  );
 
  if (onClick && !href) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block h-full w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {content}
    </Link>
  );
}