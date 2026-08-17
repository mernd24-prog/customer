import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { GhostPillButton, SolidLargeButton } from "../ui/button/static";
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

  const isDefaultHeading = heading === "SAM-Special Gifts For Mother's Day";

  return (
    <section className="my-8 full-banner relative bg-[#1B1E5C] w-full py-12 lg:py-4 ">
      <div className="customer-container grid grid-cols-1 xl:grid-cols-4 gap-6 items-center">
        {/* Left Text Block */}

        <div className="flex flex-col items-center text-center xl:items-start xl:text-left text-white py-2">
          <h2 className="relative z-10 text-lg sm:text-xl lg:text-2xl 2xl:text-[28px] font-bold leading-snug">
            {isDefaultHeading ? (
              <>
                Celebrate Raksha Bandhan <br className="hidden lg:block mt-1" />
                With{" "}
                <span className="text-[#D6A323] font-extrabold">
                  Tokens of Love
                </span>
              </>
            ) : (
              heading
            )}
          </h2>
          <p className="relative z-10 mt-4 mb-8 text-sm md:text-base text-white/80 max-w-md">
            Express Your Bond of Protection with Thoughtfully Curated Rakhi
            Gifts, Hampers, and Special Tokens for Your Siblings.
          </p>
        </div>

        {/* Right Cards Section */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {cards.map((card, index) => {
            const cardLink = hrefOr(card?.link || card?.href, "/products");
            return (
              <Link
                key={index}
                to={cardLink}
                className="relative overflow-hidden  rounded-md md:rounded-2xl group shadow-xl h-[300px] xl:h-[380px] w-full block"
              >
                {/* Background Image */}
                <picture>
                  {card.imageSmall && card.image && (
                    <>
                      <source
                        srcSet={`${card.imageSmall.replace('.webp', '.avif')} 371w`}
                        sizes="100vw"
                        type="image/avif"
                      />
                      <source
                        srcSet={`${card.imageSmall} 371w`}
                        sizes="100vw"
                        type="image/webp"
                      />
                    </>
                  )}
                  <img
                    src={card.imageSmall || card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    width="371"
                    height="380"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </picture>

                {/* Soft Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 pointer-events-none transition-opacity duration-300 " />

                {/* Content at Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 p-4 xl:p-5 flex flex-col justify-end text-white z-10">
                  <h3 className="text-lg xl:text-xl font-bold mb-3 text-white drop-shadow-md">
                    {card.title}
                  </h3>

                  <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] group-hover:bg-[linear-gradient(#bd9025,#bd9025)] px-4 py-1.5 text-xs xl:text-sm font-bold text-white shadow-md transition-all duration-300">
                    Explore <IoChevronForward className="text-xs text-white" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
