import { useMemo, useRef, useState } from "react";
import CustomSwiper, { SwiperSlide } from "../swiper/CustomSwiper";
import CarouselNavigation from "../ui/carousel/CarouselNavigation";
import CategoryCard from "./CategoryCard";
import SectionContainer from "../ui/SectionContainer";
import CUSTOMER_ROUTES from "../../constants/routes";
import { SkeletonLoader } from "../../components/ui/skeleton";
import { getRootCategories } from "../../utils/pages/categoryUtils";

const CATEGORY_SWIPER_CLASS = "category-grid-swiper w-full !px-0.5 !pt-1 !pb-0";

const CATEGORY_PAGINATION_CLASS = "shared-carousel-pagination";

export default function HomeCategoryGrid({
  categories = [],
  loading = false,
  title = "Time for a Spring Refresh",
  subtitle = "Curated collections for every style & home",
  actionLabel = "View All Collections",
  actionHref = "/categories",
  badge = "Featured",
  ctaLabel = "Shop Now",
}) {
  const [activeId, setActiveId] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const displayCategories = useMemo(() => {
    const rawList = Array.isArray(categories) ? categories : [];
    if (!rawList.length) return [];

    const visibleCategories = rawList.filter(
      (category) =>
        category &&
        category.isDashboardVisible !== false &&
        category.active !== false,
    );

    const rootCategories = getRootCategories(visibleCategories);
    if (rootCategories?.length) return rootCategories;

    return visibleCategories.filter((category) => {
      const hasParent = Boolean(
        category.parentKey || category.parentId || category.parent,
      );
      const isLevel0 =
        category.level === 0 ||
        category.level === "0" ||
        category.level === undefined;
      return !hasParent || isLevel0;
    });
  }, [categories]);

  if (loading) {
    return (
      <SectionContainer
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
        actionStyle="icon"
        className="mt-5 pb-8 sm:pb-8 lg:pb-10"
        disablePadding
      >
        <div className="relative mt-3 overflow-hidden bg-transparent p-1 sm:mt-4 sm:p-0">
          <SkeletonLoader
            preset="CATEGORY_CARD"
            count={5}
            containerClass="flex w-full gap-2 overflow-hidden sm:gap-4"
            wrapperClass="h-full flex-none w-[calc(100%/1.45-7px)] min-[360px]:w-[calc(100%/1.65-8px)] sm:w-[calc(100%/2.5-16px)] md:w-[calc(100%/3.5-20px)] lg:w-[calc(100%/4.5-24px)]"
          />
        </div>
      </SectionContainer>
    );
  }

  if (!displayCategories.length) return null;

  return (
    <SectionContainer
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      actionHref={actionHref}
      actionStyle="icon"
      disablePadding
      className="mt-5"
    >
      <div className="group/carousel relative my-3 sm:my-4">
        <CarouselNavigation
          prevRef={prevRef}
          nextRef={nextRef}
          isBeginning={isBeginning}
          isEnd={isEnd}
          prevLabel="Previous categories"
          nextLabel="Next categories"
        />

        <CustomSwiper
          prevEl={prevRef}
          nextEl={nextRef}
          showNavigation
          showPagination
          onNavigationStateChange={(beginning, end) => {
            setIsBeginning(beginning);
            setIsEnd(end);
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          watchOverflow
          breakpoints={{
            320: { slidesPerView: 1.45, spaceBetween: 8 },
            360: { slidesPerView: 1.65, spaceBetween: 8 },
            480: { slidesPerView: 2.2, spaceBetween: 10 },
            640: { slidesPerView: 2.8, spaceBetween: 14 },
            768: { slidesPerView: 3.6, spaceBetween: 16 },
            1024: { slidesPerView: 4.4, spaceBetween: 16 },
            1280: { slidesPerView: 5, spaceBetween: 18 },
          }}
          className={CATEGORY_SWIPER_CLASS}
          paginationClassName={CATEGORY_PAGINATION_CLASS}
        >
          {displayCategories.map((category, index) => {
            const categoryId =
              category.id || category._id || category.routeKey || category.slug;
            const categoryRouteKey =
              category.routeKey || category.categoryKey || category.slug;

            return (
              <SwiperSlide key={categoryId || index}>
                <CategoryCard
                  title={
                    category.displayName || category.title || category.name
                  }
                  image={
                    category.bannerUrl ||
                    category.imageUrl ||
                    category.iconUrl
                  }
                  active={activeId === categoryId}
                  onClick={() => setActiveId(categoryId)}
                  index={index}
                  badge={badge}
                  ctaLabel={ctaLabel}
                  href={
                    categoryRouteKey
                      ? CUSTOMER_ROUTES.category(categoryRouteKey)
                      : CUSTOMER_ROUTES.products
                  }
                />
              </SwiperSlide>
            );
          })}
        </CustomSwiper>
      </div>
    </SectionContainer>
  );
}