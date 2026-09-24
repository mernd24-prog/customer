import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/common";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export { SwiperSlide };

export default function CustomSwiper({
  children,
  modules = [Navigation, Pagination, Autoplay],
  showNavigation = false,
  showPagination = true,
  prevEl,
  nextEl,
  className = "",
  paginationClassName = "category-custom-pagination",
  navigationPrevClassName = "",
  navigationNextClassName = "",
  containerClassName = "",
  onInit,
  onSlideChange,
  onBeforeInit,
  ...swiperProps
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [paginationEl, setPaginationEl] = useState(null);

  const internalPrevRef = useRef(null);
  const internalNextRef = useRef(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const effectivePrevEl = prevEl || internalPrevRef.current;
  const effectiveNextEl = nextEl || internalNextRef.current;

  // Dynamically initialize pagination when Swiper instance and DOM element are ready
  useEffect(() => {
    if (swiperInstance && paginationEl && showPagination) {
      try {
        swiperInstance.params.pagination.el = paginationEl;
        swiperInstance.params.pagination.clickable = true;
        if (swiperInstance.pagination) {
          swiperInstance.pagination.destroy();
          swiperInstance.pagination.init();
          swiperInstance.pagination.render();
          swiperInstance.pagination.update();
        }
      } catch (e) {
        // Safe fallback
      }
    }
  }, [swiperInstance, paginationEl, showPagination]);

  return (
    <div className={cn("relative group/custom-swiper w-full", containerClassName)}>
      {/* Built-in Navigation Previous Button */}
      {showNavigation && !prevEl && (
        <button
          ref={internalPrevRef}
          type="button"
          aria-label="Previous slide"
          className={cn(
            `
              hidden sm:flex
              absolute
              left-2 lg:left-4
              top-1/2
              -translate-y-1/2
              z-30
              h-11 w-11
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
            navigationPrevClassName
          )}
        >
          <ChevronLeft className="h-6 w-6 stroke-[2]" />
        </button>
      )}

      <Swiper
        modules={modules}
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
        }}
        onBeforeInit={(swiper) => {
          if (showNavigation) {
            if (typeof prevEl === "string") {
              swiper.params.navigation.prevEl = prevEl;
            } else if (effectivePrevEl) {
              swiper.params.navigation.prevEl = effectivePrevEl;
            }

            if (typeof nextEl === "string") {
              swiper.params.navigation.nextEl = nextEl;
            } else if (effectiveNextEl) {
              swiper.params.navigation.nextEl = effectiveNextEl;
            }
          }

          if (onBeforeInit) onBeforeInit(swiper);
        }}
        onInit={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
          if (onInit) onInit(swiper);
        }}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
          if (onSlideChange) onSlideChange(swiper);
        }}
        navigation={
          showNavigation || prevEl || nextEl
            ? {
                prevEl: typeof prevEl === "string" ? prevEl : effectivePrevEl,
                nextEl: typeof nextEl === "string" ? nextEl : effectiveNextEl,
              }
            : false
        }
        pagination={
          showPagination
            ? {
                clickable: true,
              }
            : false
        }
        className={cn("w-full", className)}
        {...swiperProps}
      >
        {children}
      </Swiper>

      {/* Built-in Navigation Next Button */}
      {showNavigation && !nextEl && (
        <button
          ref={internalNextRef}
          type="button"
          aria-label="Next slide"
          className={cn(
            `
              hidden sm:flex
              absolute
              right-2 lg:right-4
              top-1/2
              -translate-y-1/2
              z-30
              h-11 w-11
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
            navigationNextClassName
          )}
        >
          <ChevronRight className="h-6 w-6 stroke-[2]" />
        </button>
      )}

      {/* Custom Pagination Container */}
      {showPagination && (
        <div
          ref={(node) => setPaginationEl(node)}
          className={cn(
            "category-custom-pagination flex justify-center w-full mt-4 gap-1",
            paginationClassName
          )}
        />
      )}
    </div>
  );
}
