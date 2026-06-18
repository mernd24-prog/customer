import { SkeletonLoader } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import InfiniteLoopSwiper from "../../components/swiper/InfiniteLoopSwiper";

export default function BrandCarousel({ data = {} }) {
  const loading = useDelayedLoading();
  const points = Array.isArray(data?.points) ? data?.points : [];
  const repeatedPoints = [...points, ...points];

  return (
    <section className="overflow-hidden pt-8 md:pt-20 ">
      <div className=" flex flex-col items-center gap-2 text-center">
        <h2 className="font-bold  text-xl md:text-2xl lg:text-3xl xl:text-4xl">
          {data?.title}
        </h2>
        <p className="custom-h6  ">{data?.description}</p>
      </div>
      {loading ? (
        <SkeletonLoader
          preset="BRAND_LOGO"
          count={points.length * 2}
          containerClass="brand-auto-carousel my-10 lg:my-16 flex w-max items-center gap-10 md:gap-20"
          wrapperClass="flex-shrink-0"
        />
      ) : (
        <div className="brand-auto-carousel my-10 lg:my-16 flex w-max items-center gap-10 md:gap-20">
          {repeatedPoints.map((item, index) => (
            <InfiniteLoopSwiper
              key={`${item?.title || item?.name || "brand"}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
