import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { bannerData } from "../constant/image.constant";

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
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[330px] w-screen items-center overflow-hidden border-y-2 border-[var(--customer-danger)] bg-[var(--customer-navy)] md:h-[390px] lg:h-[450px]">
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
            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 md:px-8 lg:flex-row lg:px-12 lg:py-0">
              
              {/* Left Content */}
              <div className="flex flex-1 flex-col items-center space-y-4 pt-4 text-center text-white lg:items-start lg:pl-4 lg:pt-0 lg:text-left">
                
                {/* Top Decorative */}
                <div className="flex flex-col items-center gap-2 lg:items-start">
                  <span className="customer-pill border-[var(--customer-gold)]/50 bg-[var(--customer-gold)]/10 text-[var(--customer-gold)]">
                    End of season sale up to 35% off
                  </span>

                  {/* Heading */}
                  <h2 className="max-w-xl text-3xl font-black leading-tight tracking-normal sm:text-4xl lg:text-5xl">
                    Shop Smarter Across
                    <br className="hidden sm:block" />
                    <span className="text-[var(--customer-gold)]">
                      Every Category
                    </span>
                  </h2>
                </div>

                {/* Description */}
                <p className="max-w-xs text-xs font-medium leading-relaxed text-white/75 sm:max-w-md sm:text-sm lg:max-w-lg">
                  Discover fashion, electronics, beauty, home essentials, gifts, and more from trusted sellers. Enjoy exciting deals, secure payments, fast delivery, and a smooth shopping experience.
                </p>

                {/* CTA */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start">
                  <Button
                    variant="primary"
                    className="!min-h-[34px] !px-5 text-xs font-bold shadow-none"
                    rounded={true}
                    label="Shop Now"
                  />
                  <Button
                    variant="outline"
                    className="!min-h-[34px] border-white/50 bg-transparent !px-5 text-xs font-bold text-white hover:bg-white/10"
                    rounded={true}
                    label="Explore Categories"
                  />
                </div>
              </div>

              {/* Right Content */}
              <div className="relative hidden flex-1 items-end justify-center self-stretch lg:flex">
                <div className="absolute bottom-8 left-6 h-44 w-44 rounded-full border border-[var(--customer-gold)]/30" />
                <div className="absolute bottom-0 right-8 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
                <div className="relative z-20 mb-0 h-[340px] w-[420px] overflow-hidden rounded-t-[120px] border border-[var(--customer-gold)]/30 bg-white/5 shadow-2xl">
                  <img
                    src={slide.image}
                    alt="Featured shopping collection"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
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
