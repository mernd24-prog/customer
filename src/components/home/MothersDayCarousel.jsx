import { Link } from "react-router-dom";
import { IoArrowForwardOutline, IoChevronForward } from "react-icons/io5";
import { hrefOr } from "../../utils/content";

export default function MothersDayCarousel({
  data = [],
  heading = "SAM-Special Gifts For Mother's Day",
  ctaLabel = "Get Inspired",
  onCtaClick,
}) {
  const cards = Array.isArray(data) ? data : [];

  if (!cards.length) return null;

  // If heading is the default fallback, render the exact UI text from design:
  // "Special Gifts For This Month"
  const isDefaultHeading = heading === "SAM-Special Gifts For Mother's Day";

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

        {/* Right Cards Section */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {cards.map((card, index) => {
            const cardLink = hrefOr(card?.link || card?.href, "/products");
            return (
              <Link
                key={index}
                to={cardLink}
                className="relative overflow-hidden  rounded-md md:rounded-2xl group shadow-xl h-[350px] xl:h-[440px] w-full block"
              >
                {/* Background Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                {/* Content at Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 p-3 xl:p-4 flex flex-col justify-end text-white z-10">
                  <h3 className="text-lg xl:text-2xl font-bold mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm xl:text-base  text-white/65 mb-3 lg:mb-5 ">
                    {card.description}
                  </p>
                  <button className="flex items-center gap-1.5 bg-[#CE9F2D4D] border border-[#CE9F2D4D]  text-[#D6A323] text-sm  xl:text-base font-semibold px-4 py-2 rounded-full transition-all duration-300 w-fit hover:bg-black/60">
                    <span>Explore</span>
                    <IoChevronForward className="text-xs text-[#D6A323]" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
