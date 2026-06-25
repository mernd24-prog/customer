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

const heroContent = [
  {
    id: 1,
    badge: "END OF SEASON SALE | UP TO 50% OFF",
    title: "Shop Smarter Across",
    highlight: "Every Category",
    description:
      "Discover fashion, electronics, beauty, home essentials, gifts, and more from trusted sellers. Enjoy exciting deals, secure payments, fast delivery, and a smooth shopping experience. Experience in one marketplace.",
    primaryButton: "Shop Now",
    secondaryButton: "Explore Categories",
    primaryLink: "/products",
    secondaryLink: "/products",
  },
];

const HeroBanner = ({ content = heroContent }) => {
  return (
    <section className="  relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[480px] w-screen items-center overflow-hidden bg-[#1B1D60] sm:h-[520px] md:h-[620px] lg:h-[750px]">
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
        {bannerData.map((slide, index) => {
          const item = content[index] || content[0];

          return (
            <SwiperSlide
              key={slide.id}
              className="relative overflow-hidden bg-[#1B1D60]"
            >
              <img
                src={slide.image}
                alt="Banner Background"
                className="absolute right-0 top-0 z-0 h-full w-auto object-cover object-right"
              />

              <div className="  pointer-events-none absolute inset-y-0 left-0 right-1/3 z-10 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/90 to-transparent" />

              <div className="  customer-container relative z-20 flex h-full flex-col items-center justify-between gap-6 pb-8 pt-12 sm:pb-8 sm:pt-16 md:pb-10 md:pt-20 lg:flex-row lg:py-0">
                <div className="flex flex-1 flex-col items-center space-y-4 pt-4 text-center text-white md:space-y-6 lg:items-start lg:space-y-8 lg:pl-4 lg:pt-0 lg:text-left">
                  <div className="  flex flex-col items-center gap-2 md:gap-4 lg:items-start lg:gap-6">
                    <Label
                      variant="seasonSale"
                      className="
    max-w-[290px]
    px-2
    py-1
    text-[10px]
    leading-4
    text-center

    min-[375px]:max-w-[330px]
    min-[375px]:text-[11px]

    sm:max-w-fit
    sm:text-[12px]

    lg:text-[14px]
  "
                      leftIcon={
                        <Tag
                          size={12}
                          className="text-[#CE9F2D] lg:h-[14px] lg:w-[14px]"
                        />
                      }
                    >
                      {item.badge}
                    </Label>

                    <h2 className=" max-w-[681px] font-sans text-2xl font-bold leading-[35px] tracking-normal sm:text-5xl sm:leading-[58px] lg:max-w-[800px] lg:text-[48px] lg:leading-[58px] xl:text-[54px] xl:leading-[64px] 2xl:text-[65px] 2xl:leading-[75px]">
                      {" "}
                      {item.title} <br />{" "}
                      <span className="text-[#CE9F2D]">
                        {item.highlight}
                      </span>{" "}
                    </h2>
                  </div>

                  <p
                    className="
    max-w-[290px]
    text-center
    font-sans
    text-[11px]
    font-normal
    leading-[18px]
    tracking-normal
    text-white/80

    min-[375px]:max-w-[330px]
    min-[375px]:text-[12px]
    min-[375px]:leading-[20px]

    sm:max-w-[500px]
    sm:text-sm

    md:max-w-[600px]
    md:text-base

    lg:max-w-[681px]
    lg:text-[18px]
    lg:leading-[28px]
    lg:text-left
  "
                  >
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:pt-3 lg:justify-start">
                    <SolidLargeButton
                      to={item.primaryLink}
                      className="h-[40px] min-w-[116px] rounded-[8px] px-4 !text-[16px] xl:font-semibold shadow-none hover:scale-105 sm:h-[44px] sm:min-w-[128px] sm:px-5 sm:text-sm lg:h-[48px] lg:w-[141px] lg:min-w-0 lg:rounded-[10px] lg:px-[22px]"
                    >
                      {item.primaryButton}
                    </SolidLargeButton>

                    <OutlineLightButton
                      to={item.secondaryLink}
                      className="h-[42px] min-w-[156px] rounded-[8px] px-4 !text-[16px] xl:font-semibold hover:scale-105 sm:h-[46px] sm:min-w-[184px] sm:px-5 sm:text-sm lg:h-[50px] lg:w-[212px] lg:min-w-0 lg:rounded-[10px]"
                    >
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

      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/25 to-transparent" />
      <div className="pointer-events-none absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-[var(--customer-gold)]/10 blur-[80px]" />
    </section>
  );
};

export default HeroBanner;
