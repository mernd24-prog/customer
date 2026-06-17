import { Link } from "react-router-dom";
import { ArrowUpRight, Store } from "lucide-react";
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
  const to =
    href ||
    `/brands/${encodeURIComponent((name || "").toLowerCase().replace(/\s+/g, "-"))}`;
  const initials = String(name || "Brand")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const content = (
    <article
      className={cn(
        "group flex h-full  min-h-[188px] flex-col items-center  border-border bg-white p-3 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lg",
        active && "ring-2 ring-gold/50",
        className,
      )}
    >
      <div className="relative flex h-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-cream p-4">
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            className="max-h-full max-w-full object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            onError={(event) => applyImageFallback(event, name, "brand")}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white text-center  text-lg font-bold text-gold shadow-sm">
            {initials || (
              <Store
                size={30}
                strokeWidth={1.4}
                className="text-border-strong"
              />
            )}
          </div>
        )}
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white/90 text-gold-dark opacity-0 shadow-sm transition-all duration-300 ease-in-out group-hover:opacity-100"
        >
          <ArrowUpRight size={14} strokeWidth={1.8} />
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-1  text-[14px] font-semibold text-ink sm:text-[15px]">
          {name}
        </h3>

        {subtitle && (
          <p className="mt-1 line-clamp-2  text-[12px] leading-5 text-muted">
            {subtitle}
          </p>
        )}

        {productCount != null && (
          <p className="mt-auto pt-2  text-[11px] font-medium text-muted">
            {Number(productCount).toLocaleString()} products
          </p>
        )}
      </div>
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
