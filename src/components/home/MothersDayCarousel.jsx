import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import {
  GhostPillButton,
  SolidLargeButton,
} from "../dynamicComponent/button/static";
import { FaAngleRight } from "react-icons/fa6";
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
    <section className="my-8 full-banner relative bg-[#1B1E5C] w-full py-12 lg:py-4 ">
      <div className="max-w-[1760px]   mx-auto px-4 xl:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
        {/* Left Text Block */}

        <div className=" flex flex-col items-center text-center lg:items-start lg:text-left text-white p-2 2xl:p-5">
          <img
            src="/image/png/backgroundImg.png"
            alt="decorative ring"
            aria-hidden="true"
            className="absolute top-0 left-0 lg:block hidden"
          />
          <h2 className="relative z-10 text-2xl xl:text-4xl 2xl:text-[44px] font-bold">
            {isDefaultHeading ? (
              <>
                Special Gifts <br className="hidden lg:block" />
                For{" "}
                <span className="text-[#D6A323] font-extrabold">
                  This Month
                </span>
              </>
            ) : (
              heading
            )}
          </h2>
          <p className="relative z-10 mt-4 mb-8 text-sm md:text-base text-white/80 max-w-md">
            Discover thoughtfully curated gifts for every occasion — from
            birthdays to anniversaries and everything in between.
          </p>
          <SolidLargeButton
            onClick={onCtaClick}
            rightIcon={<FaAngleRight size={16} className="text-lg" />}
            className="w-fit px-8 py-3.5 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 xl:text-base"
          >
            {ctaLabel}
          </SolidLargeButton>
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
                  <GhostPillButton
                    as="span"
                    rightIcon={
                      <IoChevronForward className="text-xs text-[#D6A323]" />
                    }
                    className="w-fit"
                  >
                    Explore
                  </GhostPillButton>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
