import SectionContainer from "../SectionContainer";
import { SkeletonBox } from "../../common/skeleton";

function TopDealSkeletonCard() {
  return (
    <article className="min-w-0 px-4 pb-6 pt-5">
      <SkeletonBox className="aspect-[292/310] w-full rounded-[10px]" />
      <div className="mt-4 flex min-h-[38px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <SkeletonBox className="h-[16px] w-1/2" />
        <SkeletonBox className="h-[34px] w-[138px] rounded-full" />
      </div>
    </article>
  );
}

function NewArrivalSkeletonCard() {
  return (
    <article className="relative h-full min-w-0 rounded-[12px]  bg-white px-4 pb-6 pt-5 shadow-sm sm:px-5">
      <SkeletonBox className="h-[34px] w-3/4 mx-auto" />
      <SkeletonBox className="mt-3 h-[18px] w-[100px]" />
      <div className="mt-2 grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="min-w-0">
            <SkeletonBox className="aspect-[238/273] w-full rounded-[10px]" />
            <SkeletonBox className="mx-auto mt-4 h-[34px] w-full max-w-[160px] rounded-full" />
          </div>
        ))}
      </div>
    </article>
  );
}

export default function ShowcaseSection({
  title,
  subtitle,
  headerbgColor,
  bodybgColor,
  className = "mt-8",
  gridClassName,
  items = [],
  CardComponent,
  loading = false,
  skeletonVariant = "top-deals",
  skeletonCount = 4,
}) {
  const SkeletonCard =
    skeletonVariant === "new-arrivals"
      ? NewArrivalSkeletonCard
      : TopDealSkeletonCard;

  return (
    <SectionContainer
      title={title}
      subtitle={subtitle}
      headerbgColor={headerbgColor}
      bodybgColor={bodybgColor}
      className={className}
    >
      <div className={gridClassName}>
        {loading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : items.map((item) => <CardComponent key={item.id} {...item} />)}
      </div>
    </SectionContainer>
  );
}
