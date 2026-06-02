import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Button from "../../components/ui/Button";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";
import { SkeletonLoader, SKELETON_PRESETS } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import PromoSlideCard from "../../components/ui/PromoSlideCard";

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
        480: { slidesPerView: 1.5 },
        768: { slidesPerView: 2.2 },
        1024: { slidesPerView: 2.5 },
        1280: { slidesPerView: 3 },
      }}
      className="mother-day-swiper !overflow-hidden"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide._slideKey}>
          {loading ? (
            <SkeletonLoader
              layout={SKELETON_PRESETS.HERO_CARDS}
              count={3}
              containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            />
          ) : (
            <PromoSlideCard slide={slide} />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function SwiperButtons({ swiperRef, isBeginning, isEnd }) {
  return (
    <div className="flex flex-row gap-2">
      <button
        disabled={isBeginning}
        onClick={() => swiperRef.current?.slidePrev()}
        className={`flex h-14 w-14 items-center justify-center bg-border text-gray-500 transition-all duration-300 ease-in-out ${isBeginning ? "cursor-not-allowed opacity-80" : ""}`}
      >
        <IoArrowBackOutline size={24} />
      </button>
      <button
        disabled={isEnd}
        onClick={() => swiperRef.current?.slideNext()}
        className={`flex h-14 w-14 items-center justify-center bg-accent text-white transition-all duration-300 ease-in-out ${isEnd ? "cursor-not-allowed opacity-80" : ""}`}
      >
        <IoArrowForwardOutline size={24} />
      </button>
    </div>
  );
}

export default function MothersDayCarousel({
  data,
  heading = "SAM-Special Gifts For Mother's Day",
  ctaLabel = "Get Inspired",
  onCtaClick,
}) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const rawSlides = Array.isArray(data) ? data : [];
  const slides = useMemo(
    () =>
      rawSlides
        .filter((slide) => slide?.image)
        .map((slide, index) => {
          const identity =
            slide.id || slide._id || slide.cmsKey || slide.slug ||
            slide.link || slide.title || slide.name || "slide";
          return { ...slide, _slideKey: `${identity}-${slide.image}-${index}` };
        }),
    [rawSlides],
  );

  if (!slides.length) return null;

  const handleSlideChange = (swiper) => {
    if (!swiper || swiper.destroyed) return;
    setIsBeginning(Boolean(swiper.isBeginning));
    setIsEnd(Boolean(swiper.isEnd));
  };

  return (
    <section className="my-8 w-full overflow-x-hidden lg:my-12">
      {/* Mobile heading */}
      <div className="xl:hidden xl:mb-8 md:mb-4">
        <h2 className="custom-h5 text-center font-bold  text-blue">{heading}</h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-0 hidden h-[85%] -z-10 translate-y-6 rounded-[40px] bg-blue xl:block" />

        <div className="flex flex-col items-center xl:flex-row">
          {/* Desktop left panel */}
          <div className="hidden flex-col items-center justify-center p-24 z-10 xl:flex 2xl:w-[40%] 2xl:p-16">
            <h2 className="custom-h5 mb-8 font-bold  text-white 2xl:text-center">{heading}</h2>
            <Button
              variant="gradient"
              rounded
              label={ctaLabel}
              size="lg"
              className=" font-semibold !px-10 py-4"
              onClick={onCtaClick}
            />
          </div>

          {/* Swiper */}
          <div className="relative mt-6 w-full xl:w-[60%] md:-ml-12 lg:-ml-20">
            <div className="absolute -left-[7.5rem] bottom-0 z-20 flex gap-2">
              <SwiperButtons swiperRef={swiperRef} isBeginning={isBeginning} isEnd={isEnd} />
            </div>
            <SwiperSection swiperRef={swiperRef} onSlideChange={handleSlideChange} slides={slides} />
            <div className="mt-8 flex justify-center gap-10 xl:hidden xl:mt-4">
              <SwiperButtons swiperRef={swiperRef} isBeginning={isBeginning} isEnd={isEnd} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="mt-10 flex justify-center lg:hidden">
        <Button
          variant="gradient"
          rounded
          label={ctaLabel}
          size="lg"
          className="w-full  font-semibold px-8 md:w-fit"
          onClick={onCtaClick}
        />
      </div>
    </section>
  );
}
