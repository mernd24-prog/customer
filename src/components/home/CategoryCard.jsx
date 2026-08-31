import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";
import { TextGoldButton } from "../ui/button/static";
import { applyImageFallback, getImageFallbackSrc } from "../../utils/ecommerce";
import { cn } from "../../utils/common";

export default function CategoryCard({
  image,
  title,
  stylesCount,
  href,
  ctaLabel = "Shop Now",
  active = false,
  onClick,
  className = "",
}) {
  const content = (
    <article
      className={cn(
        "group flex flex-col h-full overflow-hidden rounded-xl lg:rounded-[20px] border border-[#CE9F2D66] bg-white transition-all duration-300 ease-in-out hover:shadow-[0_14px_34px_rgba(17,24,39,0.1)]",
        active && "ring-2 ring-[#33368F]/40",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-[var(--customer-cream)] shrink-0">
        <img
          src={image || getImageFallbackSrc(title, "category")}
          alt={title}
          width="284"
          height="160"
          className="h-[160px] xs:h-[150px]  md:h-[250px] w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(event) => applyImageFallback(event, title, "category")}
        />
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h3 className="line-clamp-1 text-sm sm:text-base font-semibold text-[#2E2E2E]">
            {title}
          </h3>

          {stylesCount ? (
            <p className="font-medium text-xs sm:text-sm text-[#2E2E2E]">
              {stylesCount}
            </p>
          ) : null}
        </div>

        <div className="mt-3 sm:mt-4 border-t border-[#CE9F2D4D] pt-2">
          <TextGoldButton
            as="span"
            className="my-0.5 text-xs sm:text-sm"
            rightIcon={
              <FaAngleRight className="text-[10px] sm:text-[12px] mt-0.5" />
            }
          >
            {ctaLabel}
          </TextGoldButton>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link to={href} onClick={onClick} className="block h-full ">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full text-left hover:bg-transparent"
    >
      {content}
    </button>
  );
}
