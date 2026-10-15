import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";
import FallbackImage from "../../../components/ui/FallbackImage";

export default function AboutBanner({ image }) {
  const fallbackImage = FALLBACK_ABOUT.banner.image;

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
      <div className="relative h-[250px] w-full sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px]">
        <FallbackImage
          src={image}
          fallbackSrc={fallbackImage}
          alt="About Sam Global"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="650"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
