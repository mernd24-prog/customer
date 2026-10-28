import { useEffect, useMemo, useRef, useState } from "react";
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

const NAV_BUTTON_CLASS = `
  hidden sm:flex
  absolute top-1/2 z-30
  h-10 w-10 lg:h-11 lg:w-11
  -translate-y-1/2
  appearance-none items-center justify-center
  rounded-full border border-[#E8D9B7]
  bg-white/95 text-navy
  shadow-md backdrop-blur-sm
  transition-colors duration-200
  hover:border-[#CE9F2D] hover:bg-[#FFF8E8]
  active:bg-[#F7EBCF]
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[#CE9F2D] focus-visible:ring-offset-2
`;

const CATEGORY_SWIPER_CLASS = `
  category-grid-swiper
  w-full
  !px-0.5 !pt-1 !pb-0
  [&_.swiper-pagination-bullet]:!m-0
  [&_.swiper-pagination-bullet]:!h-[4px]
  [&_.swiper-pagination-bullet]:!w-[6px]
  [&_.swiper-pagination-bullet]:!rounded-full
  [&_.swiper-pagination-bullet-active]:!h-[4px]
  [&_.swiper-pagination-bullet-active]:!w-[11px]
`;

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
  const swiperRef = useRef(null);

  useEffect(() => {
    const swiper = swiperRef.current?.swiper ?? swiperRef.current;

    if (!swiper || typeof swiper.on !== "function") return;

    const updateNavState = () => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    };

    updateNavState();

    swiper.on("slideChange", updateNavState);
    swiper.on("reachBeginning", updateNavState);
    swiper.on("reachEnd", updateNavState);
    swiper.on("fromEdge", updateNavState);
    swiper.on("update", updateNavState);

    return () => {
      swiper.off("slideChange", updateNavState);
      swiper.off("reachBeginning", updateNavState);
      swiper.off("reachEnd", updateNavState);
      swiper.off("fromEdge", updateNavState);
      swiper.off("update", updateNavState);
    };
  }, []);

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
            wrapperClass="
              h-full flex-none
              w-[calc(100%/1.45-7px)]
              min-[360px]:w-[calc(100%/1.65-8px)]
              sm:w-[calc(100%/2.5-16px)]
              md:w-[calc(100%/3.5-20px)]
              lg:w-[calc(100%/4.5-24px)]
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
      disablePadding
      className="mt-5"
    >
      <div className="group/carousel relative my-3 sm:my-4">
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous categories"
          className={cn(
            NAV_BUTTON_CLASS,
            "left-2 lg:left-3",
            isBeginning && "pointer-events-none opacity-0",
          )}
        >
          <ChevronLeft className="h-5 w-5 stroke-[2]" />
        </button>

        <Swiper
          ref={swiperRef}
          modules={[Navigation, Autoplay, Pagination]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          watchOverflow
          onBeforeInit={(swiper) => {
            if (prevRef.current && nextRef.current) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
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
            320: { slidesPerView: 1.45, spaceBetween: 8 },
            360: { slidesPerView: 1.65, spaceBetween: 8 },
            480: { slidesPerView: 2.2, spaceBetween: 10 },
            640: { slidesPerView: 2.8, spaceBetween: 14 },
            768: { slidesPerView: 3.6, spaceBetween: 16 },
            1024: { slidesPerView: 4.4, spaceBetween: 16 },
            1280: { slidesPerView: 5, spaceBetween: 18 },
          }}
          pagination={{
            el: ".category-custom-pagination",
            clickable: true,
          }}
          className={CATEGORY_SWIPER_CLASS}
        >
          {displayCategories.map((category, index) => {
            const categoryId =
              category.id || category._id || category.routeKey || category.slug;

            const categoryRouteKey =
              category.routeKey || category.categoryKey || category.slug;

            return (
              <SwiperSlide key={categoryId}>
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
        </Swiper>

        <button
          ref={nextRef}
          type="button"
          aria-label="Next categories"
          className={cn(
            NAV_BUTTON_CLASS,
            "right-2 lg:right-3",
            isEnd && "pointer-events-none opacity-0",
          )}
        >
          <ChevronRight className="h-5 w-5 stroke-[2]" />
        </button>

        <div
          className="
            category-custom-pagination
            relative !static flex w-full items-center justify-center
            !gap-1.5 py-2.5
            sm:!gap-2 sm:py-3
            [&_.swiper-pagination-bullet]:!m-0
            [&_.swiper-pagination-bullet]:!bg-[#D8D8D8]
            [&_.swiper-pagination-bullet-active]:!bg-[#CE9F2D]
          "
        />
      </div>
    </SectionContainer>
  );
}