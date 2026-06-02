import ValueCard from "../../components/card/ValueCard";
import { SkeletonLoader } from "../../components/common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

export default function ValuesSection({ data }) {
  const { sectionDetails, cards } = data;
  const loading = useDelayedLoading();

  return (
    <section className="pt-8 md:pt-18">
      <div className="w-full flex flex-col items-center gap-4 ">
        <h2 className="font-montserrat text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold py-2">
          {sectionDetails?.heading}
        </h2>
      </div>
      {loading ? (
        <SkeletonLoader
          preset="CATEGORY_CARD"
          count={3}
          containerClass="grid grid-cols-1 gap-4 sm:grid-cols-2  lg:grid-cols-3 mt-4"
          wrapperClass="rounded-[var(--customer-radius)] border border-card-border bg-white p-2"
        />
      ) : (
        <div className="flex justify-center gap-8 my-8 flex-wrap ">
          {cards.map((card) => (
            <ValueCard key={card.title} data={card} />
          ))}
        </div>
      )}
    </section>
  );
}
