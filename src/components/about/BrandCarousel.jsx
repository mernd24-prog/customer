import { SkeletonLoader } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

export default function BrandCarousel({ data = {} }) {
  const sectionDetails = data?.sectionDetails || {};
  const logos = Array.isArray(data?.logos) ? data.logos : [];
  const duplicatedLogos = [...logos, ...logos];
  const loading = useDelayedLoading();

  return (
    <section className="overflow-hidden pt-8 md:pt-20">
      <div className=" flex flex-col items-center gap-2 text-center">
        <h2 className="font-bold font-montserrat text-xl md:text-2xl lg:text-3xl xl:text-4xl">
          {sectionDetails.heading}
        </h2>
        <p className="custom-h6  font-montserrat">
          {sectionDetails.description}
        </p>
      </div>
      {loading ? (
        <SkeletonLoader
          preset="BRAND_LOGO"
          count={logos.length * 2}
          containerClass="brand-auto-carousel my-10 lg:my-16 flex w-max items-center gap-10 md:gap-20"
          wrapperClass="flex-shrink-0"
        />
      ) : (
        <div className="brand-auto-carousel my-10 lg:my-16 flex w-max items-center gap-10 md:gap-20">
          {duplicatedLogos.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex-shrink-0">
              <img
                src={item.icon}
                alt={item.name}
                className="h-8 md:h-12 lg:h-18 w-full object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
