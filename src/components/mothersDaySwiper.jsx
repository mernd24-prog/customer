import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Button from "../components/Button/Button";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";
import { mothersDaySwiperImages } from "../constant/image.constant";

const slides = [
  {
    name: "Lace & Beads long sleeve ruffle hem maxi dress in white polka dot",
    image: mothersDaySwiperImages.maxi,
  },
  {
    name: "Men's Classic Loose Fit Track Pants – Green & White",
    image: mothersDaySwiperImages.blazer,
  },
  {
    name: "Lace & Beads long sleeve ruffle hem maxi dress in white polka dot",
    image: mothersDaySwiperImages.pants,
  },
  {
    name: "Lace & Beads long sleeve ruffle hem maxi dress in white polka dot",
    image: mothersDaySwiperImages.maxi,
  },
  {
    name: "Men's Classic Loose Fit Track Pants – Green & White",
    image: mothersDaySwiperImages.blazer,
  },
  {
    name: "Lace & Beads long sleeve ruffle hem maxi dress in white polka dot",
    image: mothersDaySwiperImages.pants,
  },
  {
    name: "Lace & Beads long sleeve ruffle hem maxi dress in white polka dot",
    image: mothersDaySwiperImages.maxi,
  },
  {
    name: "Men's Classic Loose Fit Track Pants – Green & White",
    image: mothersDaySwiperImages.blazer,
  },
  {
    name: "Lace & Beads long sleeve ruffle hem maxi dress in white polka dot",
    image: mothersDaySwiperImages.pants,
  },
];

export default function MothersDaySwiper() {
  const swiperRef = useRef(null);

  return (
    <section className="   w-full   overflow-x-hidden">
      {/* Mobile Heading */}
      <div className="xl:hidden xl:mb-8 md:mb-4">
        <h2 className="custom-h5 font-bold text-center font-montserrat text-blue">
          SAM-Special Gifts For <br /> Mother's Day
        </h2>
      </div>

      <div className="relative">
        {/* Desktop Blue Banner Background */}
        <div className="hidden xl:block absolute top-0 left-0 right-0 h-[85%] bg-blue rounded-[40px] -z-10 translate-y-6"></div>

        <div className="flex flex-col xl:flex-row items-center">
          {/* Left Side Content (Desktop Only) */}
          <div className="hidden xl:flex flex-col justify-center items-center   md:w-auto 2xl:w-[40%] p-24 2xl:p-16 z-10">
            <h2 className="custom-h5 font-bold text-white 2xl:text-center font-montserrat mb-8">
              SAM-Special Gifts For <br className="lg:hidden" /> Mother's Day
            </h2>
            <Button
              variant="gradient"
              rounded="true"
              label="Get Inspired"
              size="lg"
              className="font-montserrat font-semibold !px-10"
            />
          </div>

          {/* Right Side Swiper */}
          <div className="w-full relative  xl:w-[60%] my-2  md:-ml-12 lg:-ml-20">
            {/* Navigation Buttons for Desktop */}
            <div className="flex  gap-2 absolute bottom-0  -left-[7rem] z-20">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-12 h-12 flex items-center justify-center bg-[#E5E5E5] text-gray-500 hover:bg-primary hover:text-white transition-all duration-300"
              >
                <IoArrowBackOutline size={24} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-12 h-12 flex items-center justify-center bg-accent text-white ry transition-all duration-300"
              >
                <IoArrowForwardOutline size={24} />
              </button>
            </div>

            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1.2}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
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
              {slides.map((slide, index) => (
                <SwiperSlide key={index} className="">
                  <div className="relative overflow-hidden group h-[350px] p-3 xl:p-0 md:h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full rounded-b-2xl h-full object-cover object-top duration-700 transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <p className="text-white font-montserrat font-bold text-lg md:text-xl">
                        {slide.title}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons for Mobile */}
            <div className="flex xl:hidden justify-center gap-4  mt-8 xl:mt-4">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-12 h-12 flex items-center justify-center bg-[#E5E5E5] text-gray-500"
              >
                <IoArrowBackOutline size={20} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-12 h-12 flex items-center justify-center bg-accent text-white"
              >
                <IoArrowForwardOutline size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden flex justify-center mt-10">
        <Button
          variant="gradient"
          rounded="true"
          label="Get Inspired"
          size="lg"
          className="font-montserrat font-semibold "
        />
      </div>
    </section>
  );
}
