import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BrandButton from "../ui/BrandButton";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";
import { mothersDayData } from "../../data/homeSections";
import { SkeletonLoader, SKELETON_PRESETS } from "../common/skeleton";
import { Link } from "react-router-dom";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

// Swiper js Setup
function SwiperSection({ swiperRef, onSlideChange, slides }) {
  const loading = useDelayedLoading();

  return (
    <Swiper
      modules={[Navigation]}
      spaceBetween={20}
      slidesPerView={1.2}
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      onSlideChange={(swiper) => onSlideChange(swiper)}
      onReachBeginning={(swiper) => onSlideChange(swiper)}
      onReachEnd={(swiper) => onSlideChange(swiper)}
      breakpoints={{
        480: {
          slidesPerView: 1.5,
        },
        768: {
          slidesPerView: 2.2,
        },
        1024: {
          slidesPerView: 2.5,
        },
        1280: {
          slidesPerView: 3,
        },
      }}
      className="mother-day-swiper !overflow-hidden"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide._slideKey} className="">
          {loading ? (
            <SkeletonLoader
              layout={SKELETON_PRESETS.HERO_CARDS}
              count={3}
              containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            />
          ) : (
            <Link to={slide.link || "/products"}>
              <div className="relative rounded-b-xl overflow-hidden group h-[350px] p-3 xl:p-0 md:h-full">
                <img
                  src={slide.image}
                  alt={slide.title || slide.name || "Featured offer"}
                  className="w-full rounded-b-2xl h-full object-cover object-top duration-700 transition-transform hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                  <p className="text-white  font-montserrat font-bold text-lg md:text-xl">
                    {slide.name || slide.title}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

//Swiper Buttons
function SwiperButtons({ swiperRef, isBeginning, isEnd }) {
  return (
    <div className="flex flex-row gap-2">
      <button
        disabled={isBeginning}
        onClick={() => swiperRef.current?.slidePrev()}
        className={`w-14 h-14 flex items-center justify-center bg-[#E5E5E5] text-gray-500  transition-all duration-300 ${
          isBeginning ? "opacity-80 cursor-not-allowed" : ""
        }`}
      >
        <IoArrowBackOutline size={24} />
      </button>
      <button
        disabled={isEnd}
        onClick={() => swiperRef.current?.slideNext()}
        className={`w-14 h-14 flex items-center justify-center bg-accent text-white transition-all duration-300 ${
          isEnd ? "opacity-80 cursor-not-allowed" : ""
        }`}
      >
        <IoArrowForwardOutline size={24} />
      </button>
    </div>
  );
}

export default function MothersDayCarousel({ data }) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const rawSlides = Array.isArray(data) && data.length ? data : mothersDayData;
  const slides = useMemo(
    () =>
      rawSlides
        .filter((slide) => slide?.image)
        .map((slide, index) => {
          const identity =
            slide.id ||
            slide._id ||
            slide.cmsKey ||
            slide.slug ||
            slide.link ||
            slide.title ||
            slide.name ||
            "slide";
          return {
            ...slide,
            _slideKey: `${identity}-${slide.image}-${index}`,
          };
        }),
    [rawSlides],
  );

  const handleSlideChange = (swiper) => {
    if (!swiper || swiper.destroyed) return;
    setIsBeginning(Boolean(swiper.isBeginning));
    setIsEnd(Boolean(swiper.isEnd));
  };

  return (
    <section className="my-8 lg:my-12  w-full   overflow-x-hidden">
      {/* Mobile Heading */}
      <div className="xl:hidden xl:mb-8 md:mb-4">
        <h2 className="custom-h5 font-bold text-center font-montserrat text-blue">
          SAM-Special Gifts For <br /> Mother&apos;s Day
        </h2>
      </div>

      <div className="relative">
        {/* Desktop Blue Banner Background */}

        <div className="hidden xl:block absolute top-0 left-0 right-0 h-[85%] bg-blue rounded-[40px] -z-10 translate-y-6"></div>

        <div className="flex flex-col xl:flex-row items-center">
          {/* Left Side Content (Desktop) */}
          <div className="hidden xl:flex flex-col justify-center items-center   md:w-auto 2xl:w-[40%] p-24 2xl:p-16 z-10">
            <h2 className="custom-h5 font-bold text-white 2xl:text-center font-montserrat mb-8">
              SAM-Special Gifts For <br className="lg:hidden" /> Mother&apos;s Day
            </h2>

            <BrandButton
              variant="gradient"
              rounded="true"
              label="Get Inspired"
              size="lg"
              className="font-montserrat font-semibold !px-10 py-4"
            />
          </div>

          {/* Right Side Swiper */}
          <div className="w-full relative  xl:w-[60%] mt-6  md:-ml-12 lg:-ml-20">
            {/* Navigation Buttons for Desktop */}
            <div className="flex  gap-2 absolute bottom-0  -left-[7.5rem] z-20">
              <SwiperButtons
                swiperRef={swiperRef}
                isBeginning={isBeginning}
                isEnd={isEnd}
              />
            </div>

            <SwiperSection
              swiperRef={swiperRef}
              onSlideChange={handleSlideChange}
              slides={slides}
            />

            {/* Navigation Buttons for Mobile */}
            <div className="flex xl:hidden justify-center gap-10   mt-8 xl:mt-4">
              <SwiperButtons
                swiperRef={swiperRef}
                isBeginning={isBeginning}
                isEnd={isEnd}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden flex justify-center mt-10">
        <BrandButton
          variant="gradient"
          rounded="true"
          label="Get Inspired"
          size="lg"
          className="font-montserrat font-semibold px-8 w-full md:w-fit"
        />
      </div>
    </section>
  );
}
