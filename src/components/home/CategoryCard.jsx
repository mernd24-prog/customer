import { Link } from "react-router-dom";
import { Grid2X2 } from "lucide-react";
import { FaAngleRight } from "react-icons/fa6";
import Label from "../common/label/Label";
import { applyImageFallback } from "../../utils/ecommerce";
import { cn } from "../../utils/classNames";

export default function CategoryCard({
  image,
  title,
  stylesCount = "3,200+ styles",
  href,
  badge = "Featured",
  ctaLabel = "Shop Now",
  active = false,
  onClick,
  className = "",
}) {
  const content = (
    <article
      className={cn(
        "group h-full overflow-hidden rounded-[14px] border border-[#CE9F2D66] bg-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(17,24,39,0.1)]",
        active && "ring-2 ring-[#33368F]/40",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-[var(--customer-cream)]">
        {badge ? (
          <Label
            variant="featured"
            className="absolute left-3 top-3 z-10 px-3 py-1 text-[10px] font-bold leading-none lg:text-[11px]"
          >
            {badge}
          </Label>
        ) : null}

        {image ? (
          <img
            src={image}
            alt={title}
            className="aspect-[284/170] w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onError={(event) => applyImageFallback(event, title, "category")}
          />
        ) : (
          <div className="flex aspect-[284/170] items-center justify-center text-[var(--customer-border-strong)]">
            <Grid2X2 size={42} strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-4">
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-[24px] leading-none text-[#2E2E2E] line-clamp-1 mt-3">
            {title}
          </h3>

          {stylesCount ? (
            <p className="font-medium text-[16px] leading-none text-[#2E2E2E]">
              {stylesCount}
            </p>
          ) : null}
        </div>

        {/* <div className="my-3 h-px w-full bg-[#CE9F2D33]" /> */}

       <div className="w-[297px] h-[36px] pt-[15px] border-t border-[#CE9F2D4D] mt-[17px]">
  <span className="inline-flex  items-center gap-[10px] text-[16px] font-semibold leading-none text-[#CE9F2D] transition-all duration-300">
    {ctaLabel}
    <FaAngleRight className="text-[10px]" />
  </span>
</div>
      </div>
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
