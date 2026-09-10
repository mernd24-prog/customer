import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import CategoryCard from "./CategoryCard";
import SectionContainer from "../ui/SectionContainer";
import CUSTOMER_ROUTES from "../../constants/routes";
import { SkeletonLoader } from "../../components/ui/skeleton";
import { getRootCategories } from "../../utils/pages/categoryUtils";
import { cn } from "../../utils/common";
import { Link } from "react-router-dom";

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

  // Dynamic categories list from backend (Filter ONLY root top-level parent categories, exclude subcategories)
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

    return rawList.filter((c) => {
      if (!c || c.isDashboardVisible === false || c.active === false)
        return false;
      const hasParent = Boolean(c.parentKey || c.parentId || c.parent);
      const isLevel0 =
        c.level === 0 || c.level === "0" || c.level === undefined;
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
      >
        <div className="relative mt-2 rounded-[24px] bg-transparent p-3.5 sm:p-4.5 border-0 shadow-none overflow-hidden">
          <SkeletonLoader
            preset="CATEGORY_CARD"
            count={5}
            containerClass="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5"
            wrapperClass="w-full h-full"
          />
        </div>
      </SectionContainer>
    );
  }

  if (!displayCategories.length) {
    return null;
  }

  return (
    <SectionContainer
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      actionHref={actionHref}
      actionStyle="icon"
    >
      {/* Background container block */}
      <div className="relative group/carousel rounded-3xl my-4">
        {/* Left Navigation Arrow */}
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous categories"
          className={cn(
            "hidden sm:flex absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-black/5 items-center justify-center text-gray-800 transition-all hover:bg-white hover:scale-105 active:scale-95 focus:outline-none",
            isBeginning && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="h-6 w-6 stroke-[2]" />
        </button>

        {/* Swiper Slider */}
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
            320: { slidesPerView: 2.2, spaceBetween: 12 },
            480: { slidesPerView: 2.8, spaceBetween: 14 },
            640: { slidesPerView: 3.6, spaceBetween: 14 },
            1024: { slidesPerView: 4.4, spaceBetween: 16 },
            1280: { slidesPerView: 5, spaceBetween: 18 },
          }}
          pagination={{
            el: ".category-custom-pagination",
            clickable: true,
          }}
          className="category-grid-swiper w-full !pt-1 !pb-0 !px-0.5"
        >
          {displayCategories.map((item, idx) => {
            const itemTitle =
              item.displayName ||
              item.title ||
              item.name ||
              "Featured Collection";
            const itemImage =
              item.displayImage ||
              item.bannerUrl ||
              item.imageUrl ||
              item.image ||
              item.thumbnail;
            const categorySlug = item.categoryKey || item.slug || item.routeKey;

            return (
              <SwiperSlide
                key={
                  item.id
                    ? item.id
                    : item.categoryKey
                      ? item.categoryKey
                      : `idx-${idx}`
                }
                className="h-auto"
              >
                <CategoryCard
                  index={idx}
                  categoryItem={item}
                  image={itemImage}
                  title={itemTitle}
                  stylesCount={
                    item.stylesCount ||
                    item.productCountLabel ||
                    item.countLabel
                  }
                  href={
                    categorySlug
                      ? CUSTOMER_ROUTES.category(categorySlug)
                      : undefined
                  }
                  badge={item.badge || badge}
                  ctaLabel={ctaLabel}
                  active={activeId === item.id}
                  onClick={() => setActiveId(item.id)}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Right Navigation Arrow */}
        <button
          ref={nextRef}
          type="button"
          aria-label="Next categories"
          className={cn(
            "hidden sm:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-black/5 items-center justify-center text-gray-800 transition-all hover:bg-white hover:scale-105 active:scale-95 focus:outline-none",
            isEnd && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="h-6 w-6 stroke-[2]" />
        </button>
        <div className="category-custom-pagination flex justify-center w-full mt-6 gap-2"></div>
      </div>
    </SectionContainer>
  );
}
