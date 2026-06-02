import { Link } from "react-router-dom";
import { Grid2X2 } from "lucide-react";
import { cn } from "../../utils/classNames";
import { applyImageFallback } from "../../utils/ecommerce";

export default function CategoryCard({
  image,
  title,
  href,
  active,
  onClick,
  className = "",
}) {
  const content = (
    <article
      className={cn(
        "customer-card h-full w-full cursor-pointer p-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[var(--customer-gold)] hover:bg-[var(--customer-surface-soft)]",
        active && "ring-2 ring-primary/50",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="aspect-[284/256] w-full object-cover transition-all duration-300 ease-in-out hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            onError={(event) => applyImageFallback(event, title, "category")}
          />
        ) : (
          <div className="flex aspect-[284/256] items-center justify-center text-[var(--customer-border-strong)]">
            <Grid2X2 size={42} strokeWidth={1.4} />
          </div>
        )}
      </div>
      <p className="mt-3 line-clamp-1 text-center font-montserrat text-[13px] font-semibold leading-5 text-[var(--customer-ink)] sm:text-[14px]">
        {title}
      </p>
    </article>
  );

  if (href) {
    return (
      <Link to={href} onClick={onClick} className="block h-full">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block h-full w-full text-left">
      {content}
    </button>
  );
}
