import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Tag } from "lucide-react";
import { bannerData } from "../constants/image.constant";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import Label from "../components/common/label/Label";
import {
  OutlineLightButton,
  SolidLargeButton,
} from "../components/dynamicComponent/button/static";

/**
 * Hero Banner Component
 * Fully Responsive Full Width Slider
 */
const HeroBanner = () => {
  return (
    <section className=" relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[480px] sm:h-[520px] md:h-[620px] lg:h-[750px] w-screen items-center overflow-hidden bg-[#1B1D60]">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={false}
        navigation={false}
        modules={[Autoplay, Navigation]}
        className="banner-swiper h-full w-full"
      >
        {bannerData.map((slide) => (
          <SwiperSlide
            key={slide.id}
            className="relative overflow-hidden bg-[#1B1D60]"
          >
            {/* Slide Background Image - Aligned to right, preserving aspect ratio */}
            <img
              src={slide.image}
              alt="Banner Background"
              className="absolute right-0 top-0 h-full w-auto object-cover object-right z-0"
            />

            {/* Gradient Overlay to blend left side seamlessly */}
            <div className="absolute inset-y-0 left-0 right-0  lg:right-1/3 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/90 to-transparent z-10 pointer-events-none" />

            <div className="customer-container relative z-20 flex h-full flex-col items-center justify-between gap-6 py-8 lg:flex-row lg:py-0">
              {/* Left Content */}
              <div className=" flex flex-1 flex-col  space-y-4 md:space-y-5  pt-4  text-white items-start lg:pl-4 lg:pt-0 lg:text-left">
                {/* Top Decorative */}
                <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-6 lg:items-start">
                  <Label variant="seasonSale" leftIcon={<Tag size={14} className="text-[#CE9F2D]" />}>
                    {slide.label}
                  </Label>

                  {/* Heading */}
                  <h2 className="max-w-[681px] lg:max-w-[800px] font-sans text-3xl font-bold leading-[40px] tracking-normal sm:text-5xl sm:leading-[58px] lg:text-[48px] lg:leading-[58px] xl:text-[54px] xl:leading-[64px] 2xl:text-[65px] 2xl:leading-[75px]">
                    {slide.title} <br />
                    <span className="text-[#CE9F2D]">{slide.subtitle}</span>
                  </h2>
                </div>

                {/* Description */}
                <p className="max-w-[681px] font-sans text-xs sm:text-sm md:text-base lg:text-[18px] font-normal leading-relaxed lg:leading-[28px] text-white/80">
                  {slide.description}
                </p>

                {/* CTA */}
                <div className="flex  flex-wrap  gap-3 pt-1 md:pt-3 justify-start">
                  <SolidLargeButton
                    to="/products"
                    className="h-[48px]  w-full sm:w-[141px] rounded-[10px] text-base font-semibold shadow-none hover:scale-105"
                  >
                    Shop Now
                  </SolidLargeButton>
                  <OutlineLightButton
                    to="/products"
                    className="h-[50px] border-[1px]  border-white w-full sm:w-[212px] rounded-[10px] text-base font-semibold hover:scale-105"
                  >
                    Explore Categories
                  </OutlineLightButton>
                </div>
              </div>

              {/* Right Content Placeholder to keep the flex layout balanced */}
              <div className="hidden flex-1 lg:block" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Decorative Background */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/25 to-transparent"></div>

      <div className="pointer-events-none absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-[var(--customer-gold)]/10 blur-[80px]"></div>
    </section>
  );
};

export default HeroBanner;
