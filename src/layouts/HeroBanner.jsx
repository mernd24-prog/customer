import BrandButton from "../ui/BrandButton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { bannerData, bannerConfig } from "../constant/image.constant";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

/**
 * Banner Component
 * A fully responsive, reusable hero slider.
 * Data is fetched from bannerData in image.constant.js
 */
const HeroBanner = () => {
  return (
    <section
      className="w-full relative overflow-hidden h-[340px] md:h-[400px] lg:h-[480px] flex items-center shadow-lg"
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
            return `<span class="${className} custom-bullet "></span>`;
          },
        }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="banner-swiper h-full w-full"
      >
        {bannerData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-container h-full flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 py-6 lg:py-0">
              {/* Left Content */}
              <div className="flex-1  text-white space-y-4 lg:pl-10 text-center lg:text-left pt-6 lg:pt-0">
                <div className="flex flex-col items-center lg:items-start gap-2 relative">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={slide.discountImg}
                      alt="Discount"
                      className="h-10 lg:h-16 w-auto object-contain"
                    />
                    <img
                      src={slide.lineImg}
                      alt="divider"
                      className="h-0.5 lg:h-1 w-auto object-contain opacity-50"
                    />
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-black leading-tight tracking-tight uppercase">
                    {slide.title} <br />
                    <span className="text-[#BF9B53]">{slide.subtitle}</span>
                  </h2>
                </div>

                <p className="text-gray-300 max-w-xs md:max-w-md mx-auto lg:mx-0 text-xs lg:text-base font-medium leading-relaxed opacity-80 line-clamp-2">
                  {slide.description}
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-6 pt-3">
                  <BrandButton
                    variant="custom"
                    className="!px-8 !py-3 lg:!px-10 lg:!py-4 font-black text-base lg:text-xl shadow-[0_10px_20px_rgba(191,155,83,0.3)] hover:scale-105 transition-transform"
                    bgColor="linear-gradient(270deg, #A26D27 5.77%, #CE9F2D 100%)"
                    textColor="#FFFFFF"
                    rounded={true}
                    label={"SHOP NOW"}
                  />
                </div>
              </div>

              {/* Right Content - Model with 3-Color Border */}
              <div className="relative mb-6 lg:mb-0 lg:pr-10 scale-90 lg:scale-100">
                {/* 3 Colors Border effect: Golden, White, Purple */}
                <div className="absolute inset-[-12px] rounded-full border-[6px] border-[#BF9B53] z-0 shadow-lg"></div>
                <div className="absolute  inset-[-8px] rounded-full border-[3px] border-white z-0"></div>
                <div className="absolute  inset-[-4px] rounded-full border-[3px] border-[#3E4094] z-0"></div>

                <div className="w-48 h-48 lg:w-[340px] lg:h-[340px] rounded-full overflow-hidden border-2 border-white shadow-2xl relative z-20">
                  <img
                    src={slide.image}
                    alt="Banner Model"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3    h-full bg-gradient-to-l from-[#BF9B53]/10 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-48 -left-48 w-[400px] h-[400px] bg-[#BF9B53]/5 rounded-full blur-[80px] pointer-events-none"></div>
    </section>
  );
};

export default HeroBanner;
