import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryCard from "./CategoryCard";
import SectionContainer from "../ui/SectionContainer";
import CUSTOMER_ROUTES from "../../constants/routes";
import { SkeletonLoader } from "../../components/ui/skeleton";
import { getRootCategories } from "../../utils/pages/categoryUtils";
import { cn } from "../../utils/common";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

    let rootList = getRootCategories(rawList);

    rootList = rootList.filter(
      (c) => c?.isDashboardVisible !== false && c?.active !== false,
    );

    if (rootList && rootList.length > 0) {
      return rootList;
    }

    const visibleCategories = rawList.filter((c) => {
      if (!c || c.isDashboardVisible === false || c.active === false) {
        return false;
      }

      const hasParent = Boolean(c.parentKey || c.parentId || c.parent);

      const isLevel0 =
        c.level === 0 || c.level === "0" || c.level === undefined;

      return !hasParent || isLevel0;
    });

    return visibleCategories;
  }, [categories]);

  if (loading) {
    return (
      <SectionContainer
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
        actionStyle="icon"
        className="pt-2 pb-8 sm:pt-4 sm:pb-8 lg:pb-10"
        disablePadding={true}
      >
        <div
          className="
            relative
            mt-2
            overflow-hidden
            rounded-[24px]
            border-0
            bg-transparent
            p-3.5
            sm:p-4.5
            shadow-none
          "
        >
          <SkeletonLoader
            preset="CATEGORY_CARD"
            count={5}
            containerClass="flex w-full gap-2 overflow-hidden sm:gap-4.5"
            wrapperClass="
              w-[calc(100%/1.45-7px)]
              min-[360px]:w-[calc(100%/1.65-8px)]
              sm:w-[calc(100%/2.5-16px)]
              md:w-[calc(100%/3.5-20px)]
              lg:w-[calc(100%/4.5-24px)]
              flex-none
              h-full
            "
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
      disablePadding={true}
    >
      <div className="relative group/carousel rounded-3xl my-2 sm:my-4">
        {/* Previous Button */}
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous categories"
          className={cn(
            `
              hidden sm:flex
              absolute
              left-2 lg:left-4
              top-1/2
              -translate-y-1/2
              z-30
              h-12 w-12
              rounded-full
              bg-white/90
              backdrop-blur-md
              shadow-xl
              border border-black/5
              items-center justify-center
              text-gray-800
              transition-all
              hover:bg-white
              hover:scale-105
              active:scale-95
              focus:outline-none
            `,
            isBeginning && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="h-6 w-6 stroke-[2]" />
        </button>

        {/* Categories Slider */}
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1.45,
              spaceBetween: 6,
            },
            360: {
              slidesPerView: 1.65,
              spaceBetween: 8,
            },
            480: {
              slidesPerView: 2.2,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2.8,
              spaceBetween: 14,
            },
            768: {
              slidesPerView: 3.6,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 4.4,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 18,
            },
          }}
          pagination={{
            el: ".category-custom-pagination",
            clickable: true,
          }}
          className="
            category-grid-swiper
            w-full
            !px-0.5
            !pt-1
            !pb-0
            sm:!px-0.5

            [&_.swiper-pagination-bullet]:!m-0
[&_.swiper-pagination-bullet]:!h-[3px]
[&_.swiper-pagination-bullet]:!w-[5px]
[&_.swiper-pagination-bullet]:!rounded-full

[&_.swiper-pagination-bullet-active]:!h-[3px]
[&_.swiper-pagination-bullet-active]:!w-[10px]
          "
        >
          {displayCategories.map((category, index) => {
            const categoryId =
              category.id || category._id || category.routeKey;
            const categoryRouteKey =
              category.routeKey || category.categoryKey || category.slug;

            return (
              <SwiperSlide key={categoryId}>
                <CategoryCard
                  title={category.displayName || category.title || category.name}
                  image={
                    category.displayImage ||
                    category.imageUrl ||
                    category.bannerUrl ||
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
        </Swiper>

        {/* Next Button */}
        <button
          ref={nextRef}
          type="button"
          aria-label="Next categories"
          className={cn(
            `
              hidden sm:flex
              absolute
              right-2 lg:right-4
              top-1/2
              -translate-y-1/2
              z-30
              h-12 w-12
              rounded-full
              bg-white/90
              backdrop-blur-md
              shadow-xl
              border border-black/5
              items-center justify-center
              text-gray-800
              transition-all
              hover:bg-white
              hover:scale-105
              active:scale-95
              focus:outline-none
            `,
            isEnd && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="h-6 w-6 stroke-[2]" />
        </button>

        {/* Pagination */}
        <div
  className="
    category-custom-pagination
    !static
    !relative
    !flex
    w-full
    items-center
    justify-center
    !gap-[4px]
    mt-3
    pb-2
    sm:mt-5
    sm:!gap-2
    sm:pb-0

    max-sm:!gap-[4px]
    max-sm:mt-2
    max-sm:mb-2
    max-sm:py-2

    max-sm:[&_.swiper-pagination-bullet]:!m-0
    max-sm:[&_.swiper-pagination-bullet]:!h-[4px]
    max-sm:[&_.swiper-pagination-bullet]:!w-[6px]
    max-sm:[&_.swiper-pagination-bullet]:!rounded-full

    max-sm:[&_.swiper-pagination-bullet-active]:!h-[4px]
    max-sm:[&_.swiper-pagination-bullet-active]:!w-[11px]
  "
/>
      </div>
    </SectionContainer>
  );
}
