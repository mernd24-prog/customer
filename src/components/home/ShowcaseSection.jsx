import { SkeletonLoader } from "../../components/common/skeleton";
import SectionContainer from "../../components/ui/SectionContainer";
import TopDealCard from "../../components/ui/TopDealCard";
import { asArray, keyOr } from "../../utils/content";

const buildCardLink = (CardComponent, id) =>
  CardComponent === TopDealCard ? `/top-deals/${id}` : `/new-arrivals/${id}`;

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
  actionLabel,
  onAction,
}) {
  const skeletonPreset =
    skeletonVariant === "new-arrivals" ? "NEW_ARRIVAL_CARD" : "TOP_DEAL_CARD";
  const skeletonWrapperClass =
    skeletonVariant === "new-arrivals"
      ? "relative h-full min-w-0 rounded-[12px] bg-white px-4  pb-6 pt-5 shadow-sm sm:px-5"
      : "min-w-0 px-4 pb-6 pt-5";

  return (
    <SectionContainer
      title={title}
      subtitle={subtitle}
      headerbgColor={headerbgColor}
      bodybgColor={bodybgColor}
      className={className}
      actionLabel={actionLabel}
      onAction={onAction}
    >
      {loading ? (
        <SkeletonLoader
          preset={skeletonPreset}
          count={skeletonCount}
          containerClass={gridClassName}
          wrapperClass={skeletonWrapperClass}
        />
      ) : (
        <div className={`  mt-4 ${gridClassName}`}>
          {asArray(items).map((item, index) => (
            <CardComponent
              key={keyOr(item?.id, `item-${index}`)}
              {...item}
              link={buildCardLink(CardComponent, item?.id)}
            />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
