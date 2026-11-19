
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { cn } from "../../utils/common";
import "./customSwiper.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export { SwiperSlide };

function resolveEl(el) {
  if (!el) return el;
  if (typeof el === "string") return el;
  if (typeof el === "object" && "current" in el) return el.current;
  return el;
}

export default function CustomSwiper({
  children,
  modules = [Navigation, Pagination, Autoplay],
  showNavigation = false,
  showPagination = true,
  prevEl,
  nextEl,
  className = "",
  paginationClassName = "category-custom-pagination",
  containerClassName = "",
  onInit,
  onSlideChange,
  onBeforeInit,
  onNavigationStateChange,
  ...swiperProps
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [paginationEl, setPaginationEl] = useState(null);

  useEffect(() => {
    if (!swiperInstance || !paginationEl || !showPagination) return;

    swiperInstance.params.pagination.el = paginationEl;
    swiperInstance.params.pagination.clickable = true;

    swiperInstance.pagination?.destroy();
    swiperInstance.pagination?.init();
    swiperInstance.pagination?.render();
    swiperInstance.pagination?.update();
  }, [swiperInstance, paginationEl, showPagination]);

  const handleNavState = (swiper) => {
    if (!swiper) return;
    onNavigationStateChange?.(swiper.isBeginning, swiper.isEnd);
  };

  useEffect(() => {
    if (!swiperInstance || !showNavigation) return;
    const prev = resolveEl(prevEl);
    const next = resolveEl(nextEl);
    if (!prev || !next) return;

    swiperInstance.params.navigation.prevEl = prev;
    swiperInstance.params.navigation.nextEl = next;

    swiperInstance.navigation?.destroy();
    swiperInstance.navigation?.init();
    swiperInstance.navigation?.update();
    handleNavState(swiperInstance);
  }, [swiperInstance, showNavigation, prevEl, nextEl]);

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Swiper
        modules={modules}
        onSwiper={setSwiperInstance}
        onBeforeInit={(swiper) => {
          if (showNavigation) {
            swiper.params.navigation.prevEl = resolveEl(prevEl);
            swiper.params.navigation.nextEl = resolveEl(nextEl);
          }

          onBeforeInit?.(swiper);
        }}
        onInit={(swiper) => {
          handleNavState(swiper);
          onInit?.(swiper);
        }}
        onSlideChange={(swiper) => {
          handleNavState(swiper);
          onSlideChange?.(swiper);
        }}
        onReachBeginning={handleNavState}
        onReachEnd={handleNavState}
        onFromEdge={handleNavState}
        onUpdate={handleNavState}
        navigation={
          showNavigation
            ? { prevEl: resolveEl(prevEl), nextEl: resolveEl(nextEl) }
            : false
        }
        pagination={showPagination ? { clickable: true } : false}
        className={cn("w-full", className)}
        {...swiperProps}
      >
        {children}
      </Swiper>

      {showPagination && (
        <div
          ref={setPaginationEl}
          className={cn(
            "mt-4 flex w-full justify-center gap-1",
            paginationClassName,
          )}
        />
      )}
    </div>
  );
}
