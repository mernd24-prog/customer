import { SkeletonLoader } from "../../../components/ui/skeleton";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import FallbackImage from "../../../components/ui/FallbackImage";
import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";

function PrimaryCta({ children }) {
  return (
    <button className="text-white bg-blue px-6 py-3  font-semibold rounded-full">
      {children}
    </button>
  );
}

export default function OurStory({ data }) {
  const loading = useDelayedLoading();
  const fallbackImage =
    FALLBACK_ABOUT.story.image?.url || FALLBACK_ABOUT.story.image;

  return (
    <>
      {loading ? (
        <div className="py-8 lg:py-20">
          <SkeletonLoader preset="OUR_STORY" />
        </div>
      ) : (
        <section className="flex flex-col gap-4 pt-10 md:pt-14 lg:flex-row lg:gap-12">
          <div className=" w-full xl:w-[45%]  flex justify-center">
            <FallbackImage
              src={data?.image?.url || data?.image}
              fallbackSrc={fallbackImage}
              alt={data?.image?.alt || "Sam Global story"}
              loading="lazy"
              width="400"
              height="400"
              className="w-full h-full object-cover rounded-lg max-w-[750px]"
            />
          </div>
          <div className="w-full xl:w-[45%]  flex flex-col lg:mt-8 justify-between">
            <div>
              {data?.title && (
                <h2 className=" text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold py-2">
                  {data?.title}
                </h2>
              )}

              <p
                className="mt-4 text-base font-light leading-8 text-[var(--customer-navy)]/80 md:text-lg lg:mt-8 lg:text-xl"
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
            </div>

            {data?.ctaText && (
              <div className="mt-8  w-full flex justify-center md:justify-normal md:w-fit">
                <PrimaryCta>{data?.ctaText}</PrimaryCta>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
