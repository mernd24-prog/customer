import { memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Sparkles } from "lucide-react";
import Label from "../components/ui/label/Label";
import {
  OutlineLightButton,
  SolidLargeButton,
} from "../components/ui/button/static";

import "swiper/css";

const SWIPER_MODULES = [Autoplay, Pagination];
const AUTOPLAY_CONFIG = { delay: 3000, disableOnInteraction: false };
const PAGINATION_CONFIG = { clickable: true };

const HeroSwiper = memo(({ slides }) => {
  const slideList = Array.isArray(slides) ? slides : [];

  if (slideList.length === 0) return null;

  return (
    <Swiper
      key="hero-swiper"
      spaceBetween={0}
      centeredSlides={false}
      loop
      speed={1000}
      autoplay={AUTOPLAY_CONFIG}
      pagination={PAGINATION_CONFIG}
      modules={SWIPER_MODULES}
      className="seller-experience-swiper h-full w-full"
    >
      {slideList.map((slide, index) => (
        <SwiperSlide
          key={slide.id ?? index}
          className="relative overflow-hidden bg-[#1B1D60]"
        >
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title || "Banner Background"}
              width="1664"
              height="650"
              className="absolute right-0 top-0 z-0 h-full w-full object-cover object-right sm:w-auto"
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          )}

          <div className="pointer-events-none absolute inset-y-0 left-0 right-1/4 z-10 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/95 to-transparent" />

          <div className="customer-container relative z-20 flex h-full flex-col items-center justify-between gap-3 px-4 pb-9 pt-7 text-white sm:gap-5 sm:px-6 sm:pb-9 sm:pt-10 md:gap-6 md:pb-10 md:pt-12 lg:flex-row lg:px-0 lg:py-0">
            <div className="flex w-full flex-1 flex-col items-center space-y-3 text-center text-white sm:space-y-4 md:space-y-5 lg:items-start lg:space-y-6 lg:text-left">
              <div className="flex w-full flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:items-start lg:gap-6">
                {slide.badge && (
                  <Label
                    variant="seasonSale"
                    className="inline-flex w-fit max-w-[calc(100vw-2rem)] items-start justify-center whitespace-normal break-words rounded-full border border-[#CE9F2D]/50 bg-[#FFF8E7] px-2 py-1 text-center text-[9px] font-semibold leading-3 text-[#18156D] shadow-sm min-[375px]:px-2.5 min-[375px]:text-[10px] sm:max-w-[330px] sm:items-center sm:px-4 sm:py-1.5 sm:text-xs sm:leading-4 lg:max-w-fit lg:text-base lg:leading-5"
                    leftIcon={
                      <Sparkles
                        size={11}
                        className="h-[11px] w-[11px] shrink-0 text-[#A8790A] sm:h-3 sm:w-3 lg:h-[14px] lg:w-[14px]"
                      />
                    }
                  >
                    {slide.badge}
                  </Label>
                )}

               <h2 className="banner-heading mt-1 max-w-[300px] text-[18px] font-bold leading-[1.2] min-[375px]:text-[20px] sm:mt-0 sm:max-w-[550px] sm:text-[32px] sm:leading-tight md:text-[38px] lg:max-w-[800px] lg:text-[48px] xl:text-[62px]">
  {slide.title} {slide.highlight && <br />}{" "}
  {slide.highlight && (
    <span className="text-[#CE9F2D]">{slide.highlight}</span>
  )}
</h2>
              </div>

              {slide.description && (
                <p className="max-w-[320px] text-center text-[11px] font-medium leading-[1.5] text-white/80 sm:max-w-xl sm:text-sm md:text-base xl:text-lg lg:max-w-2xl lg:text-left">
                  {slide.description}
                </p>
              )}

              <div className="relative z-30 flex w-full shrink-0 flex-wrap items-center justify-center gap-2.5 pt-1 pb-1 sm:gap-3 sm:pt-2 md:pt-3 lg:w-auto lg:justify-start">
                {slide.primaryButton && (
                  <SolidLargeButton
                    to={slide.primaryLink || "/products"}
                    className="h-[40px] min-w-[145px] px-3 text-xs shadow-none min-[375px]:min-w-[155px] min-[375px]:text-sm sm:h-[46px] sm:min-w-[184px] sm:px-5 sm:text-base lg:h-[50px] lg:w-[212px] lg:min-w-0"
                  >
                    {slide.primaryButton}
                  </SolidLargeButton>
                )}

                {slide.secondaryButton && (
                  <OutlineLightButton
                    to={slide.secondaryLink || "/categories"}
                    className="hero-outline-btn h-[40px] min-w-[145px] rounded-lg px-3 text-xs min-[375px]:min-w-[155px] min-[375px]:text-sm sm:h-[46px] sm:min-w-[184px] sm:px-5 sm:text-base lg:h-[50px] lg:w-[212px] lg:min-w-0"
                  >
                    {slide.secondaryButton}
                  </OutlineLightButton>
                )}
              </div>
            </div>

            <div className="hidden flex-1 lg:block" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

HeroSwiper.displayName = "HeroSwiper";

export default HeroSwiper;