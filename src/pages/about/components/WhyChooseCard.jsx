import FallbackImage from "../../../components/ui/FallbackImage";
import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";

export default function WhyChooseCard({ data }) {
  const card = data;
  const imageUrl =
    typeof card?.image === "string" ? card.image : card?.image?.url;
  const imageAlt =
    typeof card?.image === "object" ? card.image?.alt : card?.title;
  const fallbackImage =
    FALLBACK_ABOUT.whyChoose.points?.find((point) => point.title === card?.title)?.image?.url ||
    FALLBACK_ABOUT.whyChoose.points?.[0]?.image?.url || "";

  return (
    <article className="group w-full max-w-[500px]">
      <div className="relative h-full rounded-xl bg-white p-4 shadow-md transition-all duration-300 ease-in-out group-hover:bg-primary md:shadow-lg lg:p-5">
<div className="absolute left-1/2 top-0 h-[5px] w-[6rem] -translate-x-1/2 rounded-full bg-[#d9b15a] transition-colors duration-300 group-hover:bg-white" />        <div className="flex items-start gap-4 pt-5">
          {imageUrl || fallbackImage ? (
            <div className="flex-shrink-0">
              <FallbackImage
                src={imageUrl}
                fallbackSrc={fallbackImage}
                alt={imageAlt || card?.title || ""}
                width="40"
                height="40"
                loading="lazy"
                className="aspect-square object-contain rounded-lg bg-primary p-1 transition-all duration-300 ease-in-out group-hover:bg-blue md:p-2"
              />
            </div>
          ) : null}
          <div className="flex-1">
            <h4 className="text-md font-semibold text-blue transition-all duration-300 ease-in-out group-hover:text-white lg:text-lg">
              {card?.title}
            </h4>
            <p className="max-w-sm whitespace-pre-line py-2 text-sm leading-relaxed text-ink transition-all duration-300 ease-in-out group-hover:text-white lg:text-base">
              {card?.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
