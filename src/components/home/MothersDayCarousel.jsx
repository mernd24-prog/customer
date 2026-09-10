import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { hrefOr } from "../../utils/content";

export default function MothersDayCarousel({ data = [] }) {
  const cards = Array.isArray(data) ? data : [];
  if (!cards.length) return null;

  return (
    <section
      className="full-banner relative w-full overflow-hidden"
      style={{
        minHeight: "380px",
        background: "linear-gradient(135deg, #FFF4D6 0%, #FAF6EE 50%, #F2EADC 100%)",
      }}
    >


      {/* Main content */}
      <div className="relative z-10 customer-container grid grid-cols-1 xl:grid-cols-3 gap-6 items-center py-8 lg:py-10">
        {/* ── Right Cards Grid ── */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {cards.map((card, index) => {
            const cardLink = hrefOr(card?.link || card?.href, "/products");

            return (
              <Link
                key={index}
                to={cardLink}
                className="relative overflow-hidden rounded-2xl group shadow-xl h-[400px] xl:h-[440px] w-full block"
              >
                {/* Product image */}
                <img
                  src={card.imageSmall || card.image}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  width="371"
                  height="480"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Bottom gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,5,2,0.82) 0%, rgba(10,5,2,0.25) 45%, transparent 100%)",
                  }}
                />

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-8 flex flex-col justify-end text-white z-10">
                  <h3 className="text-lg xl:text-xl font-bold mb-1 leading-tight drop-shadow-lg">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-sm text-white/80 mb-4 drop-shadow-sm">
                      {card.description}
                    </p>
                  )}

                  {/* Explore button — dark frosted pill */}
                  <span
                    className="inline-flex items-center gap-2 h-9 w-fit rounded-full px-5 text-sm font-semibold leading-none shadow-lg transition-all duration-300 group-hover:bg-white group-hover:text-black"
                    style={{
                      background: "rgba(20,14,10,0.70)",
                      color: "#fff",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    Explore
                    <IoChevronForward className="text-xs shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
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
