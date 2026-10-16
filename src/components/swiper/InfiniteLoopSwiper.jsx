import FallbackImage from "../ui/FallbackImage";
import { FALLBACK_ABOUT } from "../../data/fallbackCmsData";

export default function InfiniteLoopSwiper({ item, index }) {
  const imageSrc = typeof item?.image === "string" ? item.image : item?.image?.url;
  const fallbackSrc =
    FALLBACK_ABOUT.brands.points?.find(
      (brand) =>
        brand?.title?.toLowerCase() === item?.title?.toLowerCase(),
    )?.image?.url || "";

  return (
    <div key={`${item?.title}-${index}`} className="flex-shrink-0">
      <FallbackImage
        width="400"
        height="400"
        src={imageSrc}
        fallbackSrc={fallbackSrc}
        alt={item?.title}
        loading="lazy"
        decoding="async"
        className="h-8 md:h-12 lg:h-18 w-full object-contain"
      />
    </div>
  );
}
