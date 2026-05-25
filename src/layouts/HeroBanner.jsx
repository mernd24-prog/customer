import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { bannerData, bannerConfig } from "../constant/image.constant";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Button } from "../components/common";

/**
 * Hero Banner Component
 * Fully Responsive Full Width Slider
 */
const HeroBanner = () => {
  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[340px] w-screen items-center overflow-hidden shadow-lg md:h-[420px] lg:h-[520px]"
      style={{ background: bannerConfig.gradient }}
    >
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className} custom-bullet"></span>`;
          },
        }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="banner-swiper h-full w-full"
      >
        {bannerData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-6 sm:px-6 md:px-8 lg:flex-row lg:px-12 lg:py-0">
              
              {/* Left Content */}
              <div className="flex flex-1 flex-col items-center space-y-4 pt-4 text-center text-white lg:items-start lg:pl-4 lg:pt-0 lg:text-left">
                
                {/* Top Decorative */}
                <div className="flex flex-col items-center gap-2 lg:items-start">
                  <div className="mb-2 flex items-center gap-3">
                    <img
                      src={slide.discountImg}
                      alt="Discount"
                      className="h-10 w-auto object-contain lg:h-16"
                    />

                    <img
                      src={slide.lineImg}
                      alt="Divider"
                      className="h-[2px] w-16 object-contain opacity-50 lg:h-1 lg:w-28"
                    />
                  </div>

                  {/* Heading */}
                  <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                    {slide.title}
                    <br />

                    <span className="text-[#BF9B53]">
                      {slide.subtitle}
                    </span>
                  </h2>
                </div>

                {/* Description */}
                <p className="max-w-xs text-xs font-medium leading-relaxed text-gray-300 opacity-80 sm:max-w-md sm:text-sm lg:max-w-lg lg:text-base">
                  {slide.description}
                </p>

                {/* CTA */}
                <div className="flex items-center justify-center pt-3 lg:justify-start">
                  <Button
                    variant="custom"
                    className="!px-6 !py-3 text-sm font-black shadow-[0_10px_20px_rgba(191,155,83,0.3)] transition-transform hover:scale-105 sm:!px-8 sm:text-base lg:!px-10 lg:!py-4 lg:text-xl"
                    bgColor="linear-gradient(270deg, #A26D27 5.77%, #CE9F2D 100%)"
                    textColor="#FFFFFF"
                    rounded={true}
                    label="SHOP NOW"
                  />
                </div>
              </div>

              {/* Right Content */}
              <div className="relative mb-4 scale-90 lg:mb-0 lg:pr-6 lg:scale-100">
                
                {/* Decorative Rings */}
                <div className="absolute inset-[-12px] z-0 rounded-full border-[6px] border-[#BF9B53] shadow-lg"></div>

                <div className="absolute inset-[-8px] z-0 rounded-full border-[3px] border-white"></div>

                <div className="absolute inset-[-4px] z-0 rounded-full border-[3px] border-[#3E4094]"></div>

                {/* Image */}
                <div className="relative z-20 h-48 w-48 overflow-hidden rounded-full border-2 border-white shadow-2xl sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-[340px] lg:w-[340px]">
                  <img
                    src={slide.image}
                    alt="Banner Model"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Decorative Background */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#BF9B53]/10 to-transparent"></div>

      <div className="pointer-events-none absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-[#BF9B53]/5 blur-[80px]"></div>
    </section>
  );
};

export default HeroBanner;