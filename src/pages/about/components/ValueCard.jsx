import FallbackImage from "../../../components/ui/FallbackImage";
import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";

export default function ValueCard({ data }) {
  const card = data;
  const fallbackImage =
    FALLBACK_ABOUT.values.points?.find((point) => point.title === card?.title)?.image?.url ||
    FALLBACK_ABOUT.values.points?.[0]?.image?.url || "";

  return (
    <article className="flex w-full md:w-[26rem] xl:w-[30rem] flex-col">
      <div className="bg-band flex h-full w-full flex-col items-center justify-start gap-4 rounded-t-lg p-4 text-center md:p-8 xl:p-10">
        <FallbackImage
          loading="lazy"
          width="400"
          height="400"
          src={card?.image?.url || card?.image}
          fallbackSrc={fallbackImage}
          alt={card?.title}
          className="h-14 w-14 object-contain md:h-18 md:w-18"
        />

        <h3 className="py-2 text-lg font-semibold md:text-2xl">
          {card?.title}
        </h3>

        <p className="flex-1 whitespace-pre-line pb-2 md:pb-0">{card?.description}</p>
      </div>

      <div className="relative z-40 mx-auto -mt-1 h-[8px] max-w-60 rounded-full bg-gradient-to-l from-accent to-primary" />
    </article>
  );
}
