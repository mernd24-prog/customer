import React from "react";
import Button from "../Button/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { bannerData, bannerConfig } from "../../constant/image.constant";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Banner = () => {
  return (
    <section 
      className="w-full relative overflow-hidden h-[400px] md:h-[500px] lg:h-[600px] flex items-center shadow-lg"
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
          dynamicBullets: true,
        }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="h-full w-full"
      >
        {bannerData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-container h-full flex flex-col lg:flex-row items-center justify-between relative z-10 py-8 gap-8">
              
              {/* Left Content: Text */}
              <div className="text-white space-y-4 lg:space-y-6 max-w-2xl text-center lg:text-left">
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="flex items-center gap-5 mb-2">
                    <img 
                      src={slide.discountImg} 
                      alt="Discount" 
                      className="h-12 md:h-16 lg:h-24 w-auto object-contain" 
                    />
                    <img 
                      src={slide.lineImg} 
                      alt="divider" 
                      className="h-4 md:h-6 lg:h-8 w-auto object-contain brightness-150" 
                    />
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold leading-[0.9] tracking-tighter uppercase">
                    {slide.title} <br />
                    <span className="text-[#BF9B53]">{slide.subtitle}</span>
                  </h2>
                </div>
                
                <p className="text-gray-200 max-w-xl text-sm md:text-base lg:text-lg font-medium leading-relaxed opacity-90">
                  {slide.description}
                </p>
                
                <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                  <Button
                    variant="custom"
                    className="!px-10 !py-4 lg:!px-14 lg:!py-5 font-bold text-lg lg:text-xl shadow-[0_15px_30px_rgba(191,155,83,0.4)] hover:scale-105 transition-transform"
                    bgColor="linear-gradient(270deg, #A26D27 5.77%, #CE9F2D 100%)"
                    textColor="#FFFFFF"
                    rounded={true}
                  >
                    SHOP NOW
                  </Button>
                </div>
              </div>

              {/* Right Content: Image */}
              <div className="hidden lg:flex flex-1 items-center justify-center relative h-full">
                {/* Decorative background for the model */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 scale-150 pointer-events-none">
                  <img src={slide.modelBg} alt="" className="w-full h-full object-contain rotate-12" />
                </div>
                
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="relative z-10 h-[110%] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform translate-y-4"
                />
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Global Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-[#BF9B53]/10 rounded-full blur-[100px] pointer-events-none"></div>
    </section>
  );
};

export default Banner;
