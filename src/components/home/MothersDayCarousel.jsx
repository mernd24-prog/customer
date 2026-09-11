import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { hrefOr } from "../../utils/content";

export default function MothersDayCarousel({ data = [] }) {
  const cards = Array.isArray(data) ? data : [];
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        el.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [cards]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!cards.length) return null;

  return (
    <section
      className="full-banner relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FFF4D6 0%, #FAF6EE 50%, #F2EADC 100%)",
      }}
    >
      {/* Main content container */}
      <div className="relative z-10 customer-container py-6 sm:py-8 lg:py-10">
        <div className="relative group/carousel">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="absolute -left-2 sm:left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-md transition-all duration-200 hover:bg-white  hover:shadow-lg focus:outline-none"
            >
              <IoChevronBack className="text-lg sm:text-xl text-[#333]" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="absolute -right-2 sm:right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-md transition-all duration-200 hover:bg-white  hover:shadow-lg focus:outline-none"
            >
              <IoChevronForward className="text-lg sm:text-xl text-[#333]" />
            </button>
          )}

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-3 sm:gap-4 lg:gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth py-1 w-full"
          >
            {cards.map((card, index) => {
              const cardLink = hrefOr(card?.link || card?.href, "/products");

              return (
                <Link
                  key={index}
                  to={cardLink}
                  className="relative overflow-hidden rounded-xl sm:rounded-2xl group shadow-md sm:shadow-xl h-[240px] min-[375px]:h-[270px] min-[425px]:h-[310px] sm:h-[360px] md:h-[380px] lg:h-[420px] xl:h-[450px] w-[72vw] min-[375px]:w-[68vw] min-[425px]:w-[260px] sm:w-[280px] md:w-[300px] lg:w-[calc(25%-15px)] shrink-0 snap-start block"
                >
                  {/* Product image */}
                  <img
                    src={card.imageSmall || card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    width="371"
                    height="480"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Bottom gradient */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 24%, transparent 48%)",
                    }}
                  />

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 lg:p-5 flex flex-col justify-end text-white z-10">
                    <h3 className="text-xs min-[375px]:text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 leading-snug drop-shadow-md line-clamp-2">
                      {card.title}
                    </h3>

                    {/* Explore button */}
                    <span className="mt-1 sm:mt-2 inline-flex items-center gap-1 sm:gap-1.5 h-[28px] sm:h-[32px] md:h-[36px] w-fit rounded-full bg-[#CE9F2D] px-2.5 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold leading-none text-white shadow-md transition-colors duration-300 group-hover:bg-[#B88B22] group-hover:shadow-lg">
                      Explore
                      <IoChevronForward className="text-[10px] sm:text-xs shrink-0" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
