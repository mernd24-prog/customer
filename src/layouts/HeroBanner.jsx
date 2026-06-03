import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Tag } from "lucide-react";
import { bannerData } from "../constant/image.constant";


// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { Button } from "../components/common";

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
          <SwiperSlide key={slide.id} className="relative overflow-hidden bg-[#1B1D60]">
            {/* Slide Background Image - Aligned to right, preserving aspect ratio */}
            <img
              src={slide.image}
              alt="Banner Background"
              className="absolute right-0 top-0 h-full w-auto object-cover object-right z-0"
            />

            {/* Gradient Overlay to blend left side seamlessly */}
            <div className="absolute inset-y-0 left-0 right-1/3 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/90 to-transparent z-10 pointer-events-none" />

            <div className="customer-container relative z-20 flex h-full flex-col items-center justify-between gap-6 py-8 lg:flex-row lg:py-0">
              
              {/* Left Content */}
              <div className=" flex flex-1 flex-col items-center space-y-4 md:space-y-6 lg:space-y-8 pt-4 text-center text-white lg:items-start lg:pl-4 lg:pt-0 lg:text-left">
                
                {/* Top Decorative */}
                <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-6 lg:items-start">
                  <div className="flex items-center gap-2 rounded-full border border-[#CE9F2D1A] bg-[#CE9F2D]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[#CE9F2D]">
                    <Tag size={14} className="text-[#CE9F2D]" />
                    <span>END OF SEASON SALE | UP TO 50% OFF</span>
                  </div>

                  {/* Heading */}
                  <h2 className="max-w-[681px] lg:max-w-[800px] font-sans text-3xl font-bold leading-[40px] tracking-normal sm:text-5xl sm:leading-[58px] lg:text-[48px] lg:leading-[58px] xl:text-[54px] xl:leading-[64px] 2xl:text-[65px] 2xl:leading-[75px]">
                    Shop Smarter Across {' '}
                    <br />
                    <span className="text-[#CE9F2D]">
                      Every Category {' '}
                    </span>
                  </h2>
                </div>

                {/* Description */}
                <p className="max-w-[681px] font-sans text-xs sm:text-sm md:text-base lg:text-[18px] font-normal leading-relaxed lg:leading-[28px] text-white/80">
                  Discover fashion, electronics, beauty, home essentials, gifts, and more from trusted sellers. Enjoy exciting deals, secure payments, fast delivery, and a smooth shopping experience. Experience in one marketplace.
                </p>

                {/* CTA */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:pt-3 lg:justify-start">
                  <Button
                    variant="custom"
                    bgColor="#CE9F2D"
                    textColor="#03014D"
                    className="font-bold shadow-none text-sm hover:scale-105 transition-transform"
                    style={{ width: "141px", height: "48px", borderRadius: "10px" }}
                    rounded={false}
                    label="Shop Now"
                    link="/products"
                  />
                  <Button
                    variant="custom"
                    className="border border-white/50 bg-transparent font-bold text-white hover:bg-white/10 text-sm hover:scale-105 transition-transform"
                    style={{ width: "212px", height: "50px", borderRadius: "10px" }}
                    rounded={false}
                    label="Explore Categories"
                    link="/products"
                  />
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
