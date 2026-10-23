import FallbackImage from "../../../components/ui/FallbackImage";
import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";

const InfoSection = ({ data }) => {
  const finalData = data || FALLBACK_ABOUT.mission;
  const title = finalData.title || FALLBACK_ABOUT.mission.title;
  const description = finalData.description || FALLBACK_ABOUT.mission.description;
  const image = finalData.image || FALLBACK_ABOUT.mission.image;
  const imageUrl = typeof image === "string" ? image : image?.url;
  const imageAlt = typeof image === "object" ? image?.alt : title;
  const fallbackImage = FALLBACK_ABOUT.mission.image?.url || FALLBACK_ABOUT.mission.image;

  return (
    <section className="relative left-1/2 right-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] overflow-hidden bg-gradient-to-r from-navy to-navy-dark py-8 ">
      <div className="customer-container">
        <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="flex flex-col justify-center py-2 sm:py-3 lg:py-4">
            <h2 className="text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold">
              {title}
            </h2>

            <div
              className="mt-6 max-w-[640px] text-base leading-7 text-white/90 sm:text-lg lg:text-[1.02rem] [&_ul]:mt-4 [&_ul]:space-y-3 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li]:leading-7 [&_li]:before:mt-2 [&_li]:before:inline-block [&_li]:before:h-2 [&_li]:before:w-2 [&_li]:before:rounded-full [&_li]:before:bg-[#d9b15a] [&_li]:before:content-['']"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {imageUrl || fallbackImage ? (
            <div className="flex items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.18)] ring-1 ring-white/10">
                <FallbackImage
                  src={imageUrl}
                  fallbackSrc={fallbackImage}
                  alt={imageAlt || title || ""}
                  loading="lazy"
                  width="800"
                  height="600"
                  className="block h-[300px] w-full object-cover sm:h-[330px] lg:h-[390px]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
