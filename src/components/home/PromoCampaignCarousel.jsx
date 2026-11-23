
import CustomSwiper, { SwiperSlide } from "../swiper/CustomSwiper";
import CarouselCard from "../ui/carousel/CarouselCard";
import { FALLBACK_PROMO_CARDS } from "../../data/fallbackCmsData";
import { PillButton } from "../ui/button/buttonSpecialized";
import { ArrowRight } from "lucide-react";

function normalizeCards(data) {
  let rawList = [];

  if (Array.isArray(data)) {
    rawList = data;
  } else if (data && typeof data === "object") {
    const sections = Array.isArray(data?.sections)
      ? data.sections
      : Array.isArray(data?.metadata?.data?.sections)
        ? data.metadata.data.sections
        : [];

    const sectionPoints = sections.flatMap((section) =>
      Array.isArray(section?.points) ? section.points : [],
    );

    if (sectionPoints.length) {
      rawList = sectionPoints;
    } else if (Array.isArray(data?.points)) {
      rawList = data.points;
    } else if (Array.isArray(data?.gallery)) {
      rawList = data.gallery;
    } else if (Array.isArray(data?.metadata?.data?.points)) {
      rawList = data.metadata.data.points;
    }
  }

  return rawList
    .map((item) => {
      if (!item) return null;

      const imageUrl =
        item?.image?.url ||
        (typeof item?.image === "string" ? item.image : "") ||
        item?.imageSmall ||
        item?.imageUrl ||
        item?.url ||
        "";

      return {
        image: imageUrl,
        title: item?.title || item?.name || item?.image?.title || "",
        description: item?.description || item?.subtitle || "",
        link:
          item?.cta?.url || item?.link || item?.href || item?.targetUrl || "",
        ctaLabel: item?.cta?.label || "",
        ctaTarget: item?.cta?.target || "_self",
      };
    })
    .filter((card) => card && (card.image || card.title));
}

export default function PromoCampaignCarousel({
  data = null,
  className = "",
}) {
  const cmsCards = normalizeCards(data);
  const cards = cmsCards.length ? cmsCards : FALLBACK_PROMO_CARDS;

  if (!cards.length) return null;

  return (
    <section
      className={`full-banner relative w-full overflow-hidden bg-transparent sm:bg-[linear-gradient(135deg,_#FFF4D6_0%,_#FAF6EE_50%,_#F2EADC_100%)] ${className}`}
    >
      <div className="relative z-10 customer-container !px-0 !py-0 sm:!px-4 sm:!py-4 lg:!py-5">
        <div className="group/carousel relative">
          <CustomSwiper
            showNavigation
            showPagination
            paginationClassName="shared-carousel-pagination"
            watchOverflow
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: { slidesPerView: 1.15, spaceBetween: 12 },
              375: { slidesPerView: 1.35, spaceBetween: 12 },
              425: { slidesPerView: 1.55, spaceBetween: 14 },
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 2.5, spaceBetween: 16 },
              1024: { slidesPerView: 3.25, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="
              !m-0 !px-0.5 !pb-2
              [&_.swiper-slide>a]:!my-0
              sm:[&_.swiper-slide>a]:!my-3
              md:[&_.swiper-slide>a]:!my-4
            "
          >
            {cards.map((card, index) => (
              <SwiperSlide key={`${card.title || "campaign"}-${index}`}>
                <CarouselCard
                  image={card.image}
                  alt={card.title || "Campaign"}
                  fallbackType="promo"
                  href={card.link || undefined}
                  target={card.ctaTarget}
                  articleClassName="h-[240px] flex-col sm:h-[360px] md:h-[380px] lg:h-[420px] xl:h-[450px]"
                  imageWidth="371"
                  imageHeight="480"
                  overlay={
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.1) 60%, transparent 75%)",
                      }}
                    />
                  }
                >
                  <div className="mt-auto flex h-full flex-col justify-end p-2.5 text-white sm:p-4 lg:p-5">
                    {card.title && (
                      <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug drop-shadow-md sm:text-base lg:text-lg">
                        {card.title}
                      </h3>
                    )}

                    {card.description && (
                      <p className="mb-1 line-clamp-2 text-xs leading-relaxed drop-shadow sm:text-sm">
                        {card.description}
                      </p>
                    )}

                    {card.ctaLabel && (
                      <PillButton
                        size="xs"
                        shape="square"
                        rightIcon={<ArrowRight size={14} />}
                        className="!inline-flex !w-fit !self-start"
                      >
                        {card.ctaLabel}
                      </PillButton>
                    )}
                  </div>
                </CarouselCard>
              </SwiperSlide>
            ))}
          </CustomSwiper>
        </div>
      </div>
    </section>
  );
}
