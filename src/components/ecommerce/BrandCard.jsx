import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { cn } from "../../utils/classNames";
import { applyImageFallback } from "../../utils/ecommerce";

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
  const displayImage = logo || image;
  const to = href || `/brands/${encodeURIComponent((name || "").toLowerCase().replace(/\s+/g, "-"))}`;

  const content = (
    <article
      className={cn(
        "group flex h-full flex-col items-center rounded-[12px] border border-[#e7dfd1] bg-white p-4 text-center shadow-sm transition-all duration-300 hover:shadow-lg",
        active && "ring-2 ring-[#CE9F2D]/50",
        className,
      )}
    >
      <div className="mb-3 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e7dfd1] bg-[#FAF6EE] p-2">
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            onError={(event) => applyImageFallback(event, name, "brand")}
          />
        ) : (
          <Store size={32} strokeWidth={1.4} className="text-[#CFC6B8]" />
        )}
      </div>

      <h3 className="line-clamp-1 font-montserrat text-[14px] font-semibold text-[#2E2E2E] sm:text-[15px]">
        {name}
      </h3>

      {subtitle && (
        <p className="mt-1 line-clamp-2 font-montserrat text-[12px] text-[#787878]">{subtitle}</p>
      )}

      {productCount != null && (
        <p className="mt-1 font-montserrat text-[11px] text-[#A6A6A6]">
          {Number(productCount).toLocaleString()} products
        </p>
      )}
    </article>
  );

  if (onClick && !href) {
    return (
      <button type="button" onClick={onClick} className="block h-full w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link to={to} onClick={onClick} className="block h-full">
      {content}
    </Link>
  );
}
