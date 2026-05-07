import SectionContainer from "../SectionContainer";
import { SkeletonLoader } from "../../common/skeleton";
import TopDealCard from "../TopDealCard";

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
    const skeletonPreset =
        skeletonVariant === "new-arrivals" ? "NEW_ARRIVAL_CARD" : "TOP_DEAL_CARD";
    const skeletonWrapperClass =
        skeletonVariant === "new-arrivals"
            ? "relative h-full min-w-0 rounded-[12px] bg-white px-4 pb-6 pt-5 shadow-sm sm:px-5"
            : "min-w-0 px-4 pb-6 pt-5";

    return (
        <SectionContainer
            title={title}
            subtitle={subtitle}
            headerbgColor={headerbgColor}
            bodybgColor={bodybgColor}
            className={className}
        >
            {loading ? (
                <SkeletonLoader
                    preset={skeletonPreset}
                    count={skeletonCount}
                    containerClass={gridClassName}
                    wrapperClass={skeletonWrapperClass}
                />
            ) : (
                <div className={gridClassName}>
                    {items.map((item) => (
                        <CardComponent key={item.id} {...item} link={CardComponent === TopDealCard ? `/top-deals/${item.id}` : `/new-arrivals/${item.id}`} />
                    ))}
                </div>
            )}
        </SectionContainer>
    );
}
