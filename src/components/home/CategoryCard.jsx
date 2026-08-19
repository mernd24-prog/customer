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
        "group h-[375px] md:h-[390px] overflow-hidden rounded-lg lg:rounded-[20px] border border-[#CE9F2D66] bg-white transition-all duration-300 ease-in-out hover:shadow-[0_14px_34px_rgba(17,24,39,0.1)]",
        active && "ring-2 ring-[#33368F]/40",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-[var(--customer-cream)]">
        {/* {badge ? (
          <Label
            variant="featured"
            className="
              absolute left-3 top-3 z-10
              flex h-[24px] min-w-[75px] items-center justify-center
              rounded-[50px]
              bg-[#8A6500]
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
        ) : null} */}

        <img
          src={image || getImageFallbackSrc(title, "category")}
          alt={title}
          width="284"
          height="160"
          className="aspect-[284/160] h-[260px] w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-100"
          loading="lazy"
          decoding="async"
          onError={(event) => applyImageFallback(event, title, "category")}
        />
      </div>

      <div className="pt-4 lg:py-4 px-4">
        <div className="flex flex-col gap-2">
          <h3 className="line-clamp-1 text-h6 font-semibold text-[#2E2E2E]">
            {title}
          </h3>

          {stylesCount ? (
            <p className="font-medium text-extaSmall text-[#2E2E2E]">
              {stylesCount}
            </p>
          ) : null}
        </div>

        <div className="mt-4 md:mt-6 h-[36px] border-t border-[#CE9F2D4D] pt-2">
          <TextGoldButton
            as="span"
            className="my-1"
            rightIcon={<FaAngleRight className="text-[12px] mt-1" />}
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
