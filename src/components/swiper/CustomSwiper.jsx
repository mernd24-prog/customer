
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import CarouselNavButton from "../ui/buttons/CarouselNavButton";
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
  paginationClassName = "shared-carousel-pagination",
  containerClassName = "",
  onInit,
  onSlideChange,
  onBeforeInit,
  onNavigationStateChange,
  alwaysVisibleNavigation = false,
  ...swiperProps
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [paginationEl, setPaginationEl] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const internalPrevRef = useRef(null);
  const internalNextRef = useRef(null);

  const navigationPrevEl = prevEl || internalPrevRef;
  const navigationNextEl = nextEl || internalNextRef;

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
    if (!swiper || swiper.destroyed) return;

    setIsBeginning(Boolean(swiper.isBeginning));
    setIsEnd(Boolean(swiper.isEnd));

    const canOverflow =
      Array.isArray(swiper.snapGrid) && swiper.snapGrid.length > 1;

    setHasOverflow(Boolean(canOverflow));

    onNavigationStateChange?.(swiper.isBeginning, swiper.isEnd);
  };

  useEffect(() => {
    if (!swiperInstance || !showNavigation) return;

    const prev = resolveEl(navigationPrevEl);
    const next = resolveEl(navigationNextEl);

    if (!prev || !next) return;

    swiperInstance.params.navigation.prevEl = prev;
    swiperInstance.params.navigation.nextEl = next;

    swiperInstance.navigation?.destroy();
    swiperInstance.navigation?.init();
    swiperInstance.navigation?.update();

    handleNavState(swiperInstance);
  }, [swiperInstance, showNavigation, prevEl, nextEl]);

  return (
    <div className={cn("group/carousel relative w-full", containerClassName)}>
      <Swiper
        modules={modules}
        onSwiper={setSwiperInstance}
        onBeforeInit={(swiper) => {
          if (showNavigation) {
            swiper.params.navigation.prevEl = resolveEl(navigationPrevEl);
            swiper.params.navigation.nextEl = resolveEl(navigationNextEl);
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
            ? {
                prevEl: resolveEl(navigationPrevEl),
                nextEl: resolveEl(navigationNextEl),
              }
            : false
        }
        pagination={showPagination ? { clickable: true } : false}
        className={cn("w-full", className)}
        {...swiperProps}
      >
        {children}
      </Swiper>

      {showNavigation && hasOverflow && !prevEl && !nextEl && (
        <>
          <CarouselNavButton
            ref={internalPrevRef}
            direction="prev"
            disabled={!alwaysVisibleNavigation && isBeginning}
            onClick={() => swiperInstance?.slidePrev()}
            className={cn(
              "absolute left-3 top-1/2 z-30 -translate-y-1/2",
              !alwaysVisibleNavigation &&
                isBeginning &&
                "opacity-0 pointer-events-none",
            )}
          />

          <CarouselNavButton
            ref={internalNextRef}
            direction="next"
            disabled={!alwaysVisibleNavigation && isEnd}
            onClick={() => swiperInstance?.slideNext()}
            className={cn(
              "absolute right-3 top-1/2 z-30 -translate-y-1/2",
              !alwaysVisibleNavigation &&
                isEnd &&
                "opacity-0 pointer-events-none",
            )}
          />
        </>
      )}

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
