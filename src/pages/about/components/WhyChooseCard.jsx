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
    <article className="group">
      <div className="bg-white relative rounded-xl group-hover:bg-primary transition-all duration-300 ease-in-out shadow-md md:shadow-lg max-w-lg gap-8 p-4 lg:p-5">
        <div className="bg-blue w-[6rem] h-[5px] rounded-full absolute top-0 left-20" />
        <div className="flex flex-row gap-4 ">
          {imageUrl || fallbackImage ? (
            <div>
              <FallbackImage
                src={imageUrl}
                fallbackSrc={fallbackImage}
                alt={imageAlt || card?.title || ""}
                width="40"
                height="40"
                loading="lazy"
                className="aspect-square object-contain bg-primary rounded-lg group-hover:bg-blue transition-all duration-300 ease-in-out p-1 md:p-2"
              />
            </div>
          ) : null}
          <div>
            <h4 className=" text-blue font-semibold  text-md lg:text-lg group-hover:text-white transition-all duration-300 ease-in-out">
              {card?.title}
            </h4>
            <p className="  text-sm lg:text-base max-w-sm py-2 group-hover:text-white transition-all duration-300 ease-in-out">
              {card?.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
