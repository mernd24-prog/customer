import { SkeletonLoader } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import WhyChooseCard from "./WhyChooseCard";

export default function WhyChooseSection({ data }) {
  const sectionDetails = data?.sectionDetails;
  const cards = data?.cards || [];

  const loading = useDelayedLoading();

  return (
    <section className="pt-8 md:pt-20">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-montserrat text-ink font-bold">
          {sectionDetails?.heading}
        </h2>

        <p className="font-montserrat custom-h6 text-ink py-4">
          {sectionDetails?.description}
        </p>
      </div>

      {loading ? (
        <SkeletonLoader
          preset="WHY_CHOOSE_CARD"
          count={8}
          containerClass="my-4 md:my-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
          wrapperClass="bg-white rounded-xl shadow-sm md:shadow-lg"
        />
      ) : (
        <div className="my-4 md:my-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {cards?.map((card, index) => (
            <WhyChooseCard key={card?.title || index} data={card} />
          ))}
        </div>
      )}
    </section>
  );
}
