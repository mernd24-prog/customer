import ValueCard from "./ValueCard";
import { SkeletonLoader } from "../../../components/ui/skeleton";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";

export default function ValuesSection({ data }) {
  const loading = useDelayedLoading();

  return (
    <section className="pt-10 md:pt-10 pb-6 md:pb-6">
      <div className="w-full flex flex-col items-center gap-4 ">
        <h2 className=" text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold py-2">
          {data?.title}
        </h2>

        {data?.intro && (
          <p className="text-center text-base md:text-lg text-ink/80">
            {data.intro}
          </p>
        )}
      </div>
      {loading ? (
        <SkeletonLoader
          preset="CATEGORY_CARD"
          count={3}
          containerClass="grid grid-cols-1 gap-4 sm:grid-cols-2  lg:grid-cols-3 mt-4"
          wrapperClass="rounded-[var(--customer-radius)] border border-card-border bg-white p-2"
        />
      ) : (
        <div className="my-8 flex flex-wrap justify-center gap-8">
          {data?.points?.map((item) => (
            <ValueCard key={item.title} data={item} />
          ))}
        </div>
      )}
    </section>
  );
}
