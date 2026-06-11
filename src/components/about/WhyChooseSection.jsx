import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import WhyChooseCard from "../../components/card/WhyChooseCard";
import { SkeletonLoader } from "../../components/common/skeleton";

export default function WhyChooseSection({ data }) {
  const loading = useDelayedLoading();

  return (
    <section className="pt-8 md:pt-20">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl  text-ink font-bold">
          {data?.title}
        </h2>

        {data?.description && (
          <p className=" custom-h6 text-ink py-4">{data.description}</p>
        )}
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
          {data?.points?.map((card) => (
            <WhyChooseCard key={card?.title} data={card} />
          ))}
        </div>
      )}
    </section>
  );
}
