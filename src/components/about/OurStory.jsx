import { SkeletonLoader } from "../../components/common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

function PrimaryCta({ children }) {
  return (
    <button className="text-white bg-blue px-6 py-3  font-semibold rounded-full">
      {children}
    </button>
  );
}

export default function OurStory({ data }) {
  const loading = useDelayedLoading();

  return (
    <>
      {loading ? (
        <div className="py-8 lg:py-20">
          <SkeletonLoader preset="OUR_STORY" />
        </div>
      ) : (
        <section className="flex  flex-col lg:flex-row  lg:gap-12 gap-2 py-8 lg:py-20">
          <div className=" w-full xl:w-[45%]  flex justify-center">
            <img
              src={data?.image?.url}
              alt={data?.image?.alt}
              className="w-full h-full object-cover rounded-lg max-w-[750px]  "
            />
          </div>
          <div className="w-full xl:w-[45%]  flex flex-col lg:mt-8 justify-between">
            <div>
              <p
                className="text-base md:text-lg lg:text-xl font-light mt-4 lg:mt-8 "
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
