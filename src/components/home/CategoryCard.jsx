import { Link } from "react-router-dom";
import { Grid2X2 } from "lucide-react";
import { FaAngleRight } from "react-icons/fa6";
import Label from "../common/label/Label";
import { TextGoldButton } from "../dynamicComponent/button/static";
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
        "group h-[421px]   overflow-hidden rounded-[14px] border border-[#CE9F2D66] bg-white transition-all duration-300 ease-in-out hover:shadow-[0_14px_34px_rgba(17,24,39,0.1)]",
        active && "ring-2 ring-[#33368F]/40",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-[var(--customer-cream)]">
        {badge ? (
        <Label
  variant="featured"
  className="
    absolute left-3 top-3 z-10
    flex h-[24px] min-w-[75px] items-center justify-center
    rounded-[50px]
    bg-[#CE9F2D]
    px-[12px] py-[5px]
    font-dmSans
    text-[12px] font-semibold
    leading-none
    text-[#FFFFFF]
    sm:h-[28px] sm:min-w-[91px]
    sm:px-[15px]
    sm:text-[14px]
  "
>
  {badge}
</Label>
        ) : null}

        {image ? (
          <img
            src={image}
            alt={title}
            className="aspect-[284/160] h-[260px] object-cover transition-all duration-300 ease-in-out group-hover:scale-100"
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

      <div className="px-4 py-6">
        <div className="flex flex-col gap-3">
          <h3 className="mt-3 line-clamp-1 font-dmSans text-2xl font-semibold leading-none text-[#2E2E2E]">
            {title}
          </h3>

          {stylesCount ? (
            <p className="font-medium text-[16px] leading-none text-[#2E2E2E] font-sans  ">
              {stylesCount}
            </p>
          ) : null}
        </div>

        {/* <div className="my-3 h-px w-full bg-[#CE9F2D33]" /> */}

        <div className="mt-[17px] h-[36px] border-t border-[#CE9F2D4D] pt-[15px]">
          <TextGoldButton
            as="span"
            rightIcon={<FaAngleRight className="text-[10px]" />}
          >
            {ctaLabel}
          </TextGoldButton>
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
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full text-left"
    >
      {content}
    </button>
  );
}
