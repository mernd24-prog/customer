import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SwiperSlider = () => {
  return (
    <div className="min-h flex items-center justify-center bg-gradient-to-r from-[#6365c2] to-[#1B1D60]">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="relative">
            <img
              src="https://www.shutterstock.com/image-vector/flash-sale-banner-vector-background-260nw-2131315101.jpg"
              alt="slide 1"
              className="w-full h-[400px] object-fill"
            />
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="relative">
            <img
              src="https://www.shutterstock.com/image-vector/flash-sale-banner-vector-background-260nw-2131315101.jpg"
              alt="slide 2"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default SwiperSlider;
