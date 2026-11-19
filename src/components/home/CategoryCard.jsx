import { Link } from "react-router-dom";
import { applyImageFallback, getImageFallbackSrc } from "../../utils/ecommerce";
import { cn } from "../../utils/common";
import DynamicButton from "../ui/button/button.jsx";
import CarouselCard from "../ui/carousel/CarouselCard";

export default function CategoryCard({
  image,
  title,
  href,
  ctaLabel = "Shop Now",
  active = false,
  onClick,
  className = "",
  index = 0,
}) {
  return (
    <CarouselCard
      image={image}
      alt={title}
      fallbackType="category"
      href={href}
      onClick={href ? undefined : onClick}
      active={active}
      className={className}
      articleClassName="min-h-[300px] flex-col sm:min-h-[360px]"
      overlay={
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/80 to-transparent opacity-80 transition-opacity duration-500 group-hover/card:opacity-100" />
      }
    >
      <div className="flex h-full flex-col justify-between p-5 text-white drop-shadow-md sm:p-6">
        <div className="flex flex-col">
          <h3 className="mb-2 text-xl font-bold tracking-tight drop-shadow-lg sm:text-2xl">
            {title}
          </h3>
          <span className="text-sm font-semibold text-white">
            {ctaLabel}
          </span>
        </div>
      </div>
    </CarouselCard>
  );
}
