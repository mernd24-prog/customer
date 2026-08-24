import { memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Tag } from "lucide-react";
import { bannerData } from "../constants/image.constant";
import Label from "../components/ui/label/Label";
import { OutlineLightButton, SolidLargeButton } from "../components/ui/button/static";

// Swiper styles
import "swiper/css";

const SWIPER_MODULES = [Autoplay, Pagination];
const AUTOPLAY_CONFIG = { delay: 2000, disableOnInteraction: false };
const PAGINATION_CONFIG = { clickable: true };

const HeroSwiper = memo(({ content }) => {
  return (
    <Swiper
      key="hero-swiper"
      spaceBetween={0}
      centeredSlides={false}
      loop
      autoplay={AUTOPLAY_CONFIG}
      pagination={PAGINATION_CONFIG}
      modules={SWIPER_MODULES}
      className="seller-experience-swiper h-full w-full"
    >
      {bannerData.map((slide, index) => {
        const item = content[index] || content[0];

        return (
          <SwiperSlide key={slide.id} className="relative overflow-hidden bg-[#1B1D60]">
            <img loading="lazy"
              src={slide.image}
              alt="Banner Background"
              width="1664"
              height="650"
              className="absolute right-0 top-0 z-0 h-full w-auto object-cover object-right"
              fetchpriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />

            <div className="pointer-events-none absolute inset-y-0 left-0 right-1/3 z-10 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/90 to-transparent" />

            <div className="customer-container relative z-20 flex h-full flex-col items-center justify-between gap-6 pb-8 pt-12 sm:pb-8 sm:pt-16 md:pb-10 md:pt-20 lg:flex-row lg:py-0">
              <div className="flex flex-1 flex-col items-center space-y-4 pt-4 text-center text-white md:space-y-6 lg:items-start lg:pt-0 lg:text-left">
                <div className="flex flex-col items-center gap-2 md:gap-4 lg:items-start lg:gap-6">
                  <Label
                    variant="seasonSale"
                    className="max-w-[290px] px-2 py-1 text-[10px] leading-4 text-center min-[375px]:max-w-[330px] min-[375px]:text-[11px] sm:max-w-fit sm:text-[12px] lg:text-[14px]"
                    leftIcon={<Tag size={12} className="text-[#CE9F2D] lg:h-[14px] lg:w-[14px]" />}
                  >
                    {item.badge}
                  </Label>
                  <h2 className="banner-heading mt-4 md:mt-0 max-w-[681px] lg:max-w-[800px] font-bold">
                    {item.title} <br /> <span className="text-[#CE9F2D]">{item.highlight}</span>
                  </h2>
                </div>
                <p className="max-w-xl lg:max-w-2xl font-medium text-center text-sm md:text-base xl:text-lg text-white/80 lg:text-left">
                  {item.description}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:pt-3 lg:justify-start">
                  <SolidLargeButton to={item.primaryLink} className="h-[40px] min-w-[116px] rounded-[8px] px-4 text-sm md:text-[16px] xl:font-semibold shadow-none hover:scale-105 sm:h-[44px] sm:min-w-[128px] sm:px-5 sm:text-base lg:h-[48px] lg:w-[141px] lg:min-w-0 lg:rounded-[10px] lg:px-[22px]">
                    {item.primaryButton}
                  </SolidLargeButton>
                  <OutlineLightButton to={item.secondaryLink} className="h-[42px] min-w-[156px] rounded-[8px] px-4 text-sm md:text-[16px] xl:font-semibold hover:scale-105 sm:h-[46px] sm:min-w-[184px] sm:px-5 sm:text-base lg:h-[50px] lg:w-[212px] lg:min-w-0 lg:rounded-[10px]">
                    {item.secondaryButton}
                  </OutlineLightButton>
                </div>
              </div>
              <div className="hidden flex-1 lg:block" />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
});

HeroSwiper.displayName = "HeroSwiper";
export default HeroSwiper;
