import { useEffect, useState } from "react";
import CustomSwiper, {
  SwiperSlide,
} from "../../../components/swiper/CustomSwiper";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
import PageHeroBanner from "../../../components/ui/banner/PageHeroBanner";

import Seo from "../../../components/ui/Seo";
import Loader from "../../../components/ui/Loader";
import FallbackImage from "../../../components/ui/FallbackImage";
import Button from "../../../components/ui/buttons/Button";
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import { FALLBACK_SELLER_PAGE } from "../../../data/fallbackCmsData";

import { SELLER_LOGIN_URL } from "../../../config/seller";
import { SolidLargeButton } from "../../../components/ui/button/static";

function useStorySlidesPerView() {
  const getSlidesPerView = () => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 1100) return 4;
    if (width >= 900) return 3;
    if (width >= 640) return 2;
    return 1;
  };

  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView);

  useEffect(() => {
    const updateSlidesPerView = () => setSlidesPerView(getSlidesPerView());
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  return slidesPerView;
}

const benefitIcons = [
  CircleDollarSign,
  Truck,
  BarChart3,
  ShieldCheck,
  Headphones,
  Sparkles,
];

const stepIcons = [UserRoundPlus, Store, PackageCheck, WalletCards];

const getCmsPayload = (page) =>
  page?.metadata?.data ||
  page?.metadata?.content ||
  page?.data ||
  page?.content ||
  page;

function SectionHeading({ eyebrow, title, text, light = false }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span
        className={`inline-flex rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] sm:px-4 sm:py-2 ${
          light ? "bg-white/10 text-[#f1c65f]" : "bg-[#f5eddb] text-[#9c6a0a]"
        }`}
      >
        {eyebrow}
      </span>

      <h2
        className={`mt-4 text-h2 font-bold leading-tight sm:mt-5 ${
          light ? "text-white" : "text-[#201b78]"
        }`}
      >
        {title}
      </h2>

      {text && (
        <p
          className={`mx-auto mt-3 max-w-md leading-7 sm:mt-4 ${
            light ? "text-white/70" : "text-[#6f7480]"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

function SellerStoryCard({ story, featured = false }) {
  return (
    <article
      className={`h-full overflow-hidden rounded-lg bg-white ${
        featured
          ? "grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
          : "flex flex-col p-2.5 "
      }`}
    >
      <div
        className={`overflow-hidden bg-[#e8e5df] ${featured ? "min-h-[220px] md:min-h-full" : "rounded-lg"}`}
      >
        {story.photo ? (
          <img
            width="600"
            height="400"
            src={story.photo}
            alt={`${story.name} at their business`}
            className={`w-full object-cover object-top ${featured ? "h-full min-h-[220px] md:min-h-[360px]" : "h-40 sm:h-52"}`}
            loading="lazy"
          />
        ) : (
          <div
            className={`flex items-center justify-center text-3xl font-bold text-[#201b78] ${featured ? "h-full min-h-[220px] md:min-h-[360px]" : "h-40 sm:h-52"}`}
          >
            {story.initials}
          </div>
        )}
      </div>

      <div
        className={`flex flex-col ${featured ? "justify-center p-4 sm:p-7 lg:p-9" : "flex-1 px-1 pt-3 sm:px-2 sm:pt-6"}`}
      >
        <h3 className="text-base font-bold leading-tight text-[#181928] sm:text-xl">
          {story.name}
        </h3>

        {story.role && (
          <p className="mt-1.5 text-xs font-medium text-[#3e4093] sm:mt-2 sm:text-sm">
            {story.role}
          </p>
        )}

        <div className="mt-2.5 h-px bg-[#eee9df] sm:mt-4" />

        {story.quote && (
          <p className="mt-2.5 text-xs leading-5 text-[#50545e] sm:mt-4 sm:text-[15px] sm:leading-6">
            {story.quote}
          </p>
        )}

        {story.result && (
          <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-[#f7f2e7] px-2.5 py-1.5 text-[11px] font-bold text-[#8d610d] sm:mt-5 sm:px-3 sm:text-xs">
            <BarChart3 size={14} />
            {story.result}
          </div>
        )}
      </div>
    </article>
  );
}

export default function BecomeASeller() {
  const storySlidesPerView = useStorySlidesPerView();
  const { page: cmsPage, loading, error } = useCmsRecord("become-a-seller");

  const cmsPayload = getCmsPayload(cmsPage);

  const sellerPage = cmsPayload?.image?.url ? cmsPayload : FALLBACK_SELLER_PAGE;

  const heroTitle = sellerPage?.title || "";

  const [titleLine1, titleLine2] = heroTitle.split("\n");

  const heroDesc = sellerPage?.excerpt || "";

  const heroImg = sellerPage?.image?.url || FALLBACK_SELLER_PAGE.image.url;

  const storySection = sellerPage?.sections?.[0];

  const benefitsSection = sellerPage?.sections?.[1];

  const stepsSection = sellerPage?.sections?.[2];

  const fallbackStoryPoints = Array.isArray(FALLBACK_SELLER_PAGE?.sections?.[0]?.points)
    ? FALLBACK_SELLER_PAGE.sections[0].points
    : [];

  const sellerStories = Array.isArray(storySection?.points) && storySection.points.length
    ? storySection.points
    : fallbackStoryPoints;

  const mergedSellerStories = sellerStories.map((point, index) => {
    const fallbackPoint =
      fallbackStoryPoints.find((item) => item?.title === point?.title) ||
      fallbackStoryPoints[index] ||
      fallbackStoryPoints[fallbackStoryPoints.length - 1] ||
      {};

    return {
      ...fallbackPoint,
      ...point,
      image:
        point?.image?.url ||
        point?.image ||
        fallbackPoint?.image ||
        "",
      description: point?.description || fallbackPoint?.description || "",
      title: point?.title || fallbackPoint?.title || "",
      cta: point?.cta || fallbackPoint?.cta || {},
      metadata: { ...(fallbackPoint?.metadata || {}), ...(point?.metadata || {}) },
    };
  });

  const benefits = Array.isArray(benefitsSection?.points)
    ? benefitsSection.points
    : [];

  const steps = Array.isArray(stepsSection?.points) ? stepsSection.points : [];

  const mappedExperiences = mergedSellerStories.map((point) => ({
    quote: point?.description || "",
    name: point?.title || "",
    role: point?.metadata?.role || "",
    category: point?.metadata?.category || "",
    result: point?.cta?.label || "",
    photo: point?.image?.url || point?.image || "",
    initials: point?.title?.substring(0, 2).toUpperCase() || "",
  }));

  const mappedBenefits = benefits.map((point, index) => ({
    icon: benefitIcons[index % benefitIcons.length],
    title: point?.title || "",
    text: point?.description || "",
  }));

  const mappedSteps = steps.map((point, index) => ({
    icon: stepIcons[index % stepIcons.length],
    number: `0${index + 1}`,
    title: point?.title || "",
    text: point?.description || "",
  }));

  return (
    <div className="full-banner overflow-hidden bg-white">
      <Seo
        title="Become a Seller | Sam Global"
        description={
          sellerPage?.excerpt ||
          "Grow your business with Sam Global. Reach more customers, manage orders easily, and get reliable seller support."
        }
      />

      {loading && !cmsPage && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="xl" />
        </div>
      )}

      {(!loading || cmsPage) && (
        <>
          {/* =====================================================
              HERO
          ===================================================== */}

          <PageHeroBanner
            image={heroImg}
            badge={
              <>
                <Sparkles size={16} className="text-[#efc75f]" />
                <span>Your Next Chapter Starts Here</span>
              </>
            }
            title={
              <>
                {titleLine1}
                {titleLine2 && (
                  <span className="block text-[#efc75f]">{titleLine2}</span>
                )}
              </>
            }
            description={heroDesc}
            theme="navy"
            actions={
              <SolidLargeButton
                type="button"
                onClick={() =>
                  window.open(SELLER_LOGIN_URL, "_blank", "noopener,noreferrer")
                }
                className="group min-h-12 rounded-lg px-6 font-bold sm:px-7"
              >
                Seller Login
                <ArrowRight
                  size={18}
                  className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </SolidLargeButton>
            }
            bottomContent={
              <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-white/75 sm:gap-x-6 sm:gap-y-3">
                {[
                  "Simple onboarding",
                  "Secure payouts",
                  "Dedicated support",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">
                      <Check size={12} className="text-[#efc75f]" />
                    </span>

                    {item}
                  </span>
                ))}
              </div>
            }
          />

          {/* =====================================================
              SELLER STORIES
          ===================================================== */}

          {mappedExperiences.length > 0 && (
            <section className="relative overflow-hidden bg-[#faf6ee] py-7 sm:py-12 lg:py-16">
              <div className="customer-container relative">
                <div
                  className={`flex flex-col gap-3 sm:gap-5 md:flex-row md:items-end md:justify-between ${mappedExperiences.length < 3 ? "mb-5 sm:mb-9" : ""}`}
                >
                  <div
                    className={`max-w-2xl ${mappedExperiences.length < 3 ? "mx-auto text-center" : "text-center md:text-left"}`}
                  >
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#f1e5c9] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#8d5d08] sm:px-4 sm:py-2">
                      <Sparkles size={14} />
                      Real Seller Stories
                    </span>

                    <h2 className="mt-3 text-h2 font-bold leading-tight text-[#201b78] sm:mt-5">
                      Their Growth Is Our{" "}
                      <span className="text-[#b17d15]">Favourite Story.</span>
                    </h2>

                    <p
                      className={`mt-2 text-sm leading-6 text-[#6f7480] sm:mt-4 sm:text-base sm:leading-7 ${mappedExperiences.length < 3 ? "mx-auto max-w-xl" : "max-w-xl"}`}
                    >
                      Meet the entrepreneurs building remarkable businesses with
                      Sam Global by their side.
                    </p>
                  </div>

                  {mappedExperiences.length > storySlidesPerView && (
                    <div className="hidden justify-center gap-2.5 sm:flex sm:gap-3 md:shrink-0">
                      <button
                        type="button"
                        className="seller-story-prev grid h-10 w-10 place-items-center rounded-full border border-[#201b78] bg-white text-[#201b78] shadow-sm transition-all duration-300 hover:bg-[#201b78] hover:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:border-[#d9d1c3] [&.swiper-button-disabled]:bg-white [&.swiper-button-disabled]:text-[#999] [&.swiper-button-disabled]:opacity-40 [&.swiper-button-disabled]:shadow-none sm:h-12 sm:w-12"
                        aria-label="Previous Seller Story"
                      >
                        <ArrowLeft size={19} />
                      </button>
                      <button
                        type="button"
                        className="seller-story-next grid h-10 w-10 place-items-center rounded-full border border-[#201b78] bg-white text-[#201b78] shadow-sm transition-all duration-300 hover:bg-[#201b78] hover:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:border-[#d9d1c3] [&.swiper-button-disabled]:bg-white [&.swiper-button-disabled]:text-[#999] [&.swiper-button-disabled]:opacity-40 [&.swiper-button-disabled]:shadow-none sm:h-12 sm:w-12"
                        aria-label="Next Seller Story"
                      >
                        <ArrowRight size={19} />
                      </button>
                    </div>
                  )}
                </div>

                {mappedExperiences.length === 1 && (
                  <div className="mx-auto max-w-4xl">
                    <SellerStoryCard story={mappedExperiences[0]} featured />
                  </div>
                )}

                {mappedExperiences.length === 2 && (
                  <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-2">
                    {mappedExperiences.map((story, index) => (
                      <SellerStoryCard
                        key={story.name || index}
                        story={story}
                      />
                    ))}
                  </div>
                )}

                {mappedExperiences.length >= 3 && (
                  <>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:hidden">
                    {mappedExperiences.map((story, index) => (
                      <SellerStoryCard key={story.name || index} story={story} />
                    ))}
                  </div>

                  <div className="mt-8 hidden sm:block sm:mt-10">
                    <CustomSwiper
                      prevEl=".seller-story-prev"
                      nextEl=".seller-story-next"
                      showPagination={
                        mappedExperiences.length > storySlidesPerView
                      }
                      spaceBetween={20}
                      slidesPerView={1}
                      breakpoints={{
                        640: {
                          slidesPerView: Math.min(2, mappedExperiences.length),
                        },
                        900: {
                          slidesPerView: Math.min(3, mappedExperiences.length),
                        },
                        1100: {
                          slidesPerView: Math.min(4, mappedExperiences.length),
                        },
                      }}
                    >
                      {mappedExperiences.map((story, index) => (
                        <SwiperSlide
                          key={story.name || index}
                          className="!h-auto pb-2"
                        >
                          <SellerStoryCard story={story} />
                        </SwiperSlide>
                      ))}
                    </CustomSwiper>
                  </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* =====================================================
              BENEFITS
          ===================================================== */}

          {mappedBenefits.length > 0 && (
            <section className="bg-[#FAF8F3] py-8 sm:py-14 lg:py-24">
              <div className="mx-auto max-w-7xl px-3 sm:px-6">
                <div className="mx-auto max-w-3xl text-center">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#F5E9C6] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#B88400] sm:px-4 sm:py-2">
                    <ShieldCheck size={14} />
                    Made for sellers
                  </span>

                  <h2 className="mt-4 text-[24px] font-bold leading-[32px] text-[#18156D] sm:mt-5 md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                    Why Suppliers Love Sam Global
                  </h2>

                  <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-gray-600 sm:mt-4 md:text-[17px] md:leading-7">
                    {benefitsSection?.description ||
                      "A marketplace should do more than host your products. It should help your business move forward."}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {mappedBenefits.map(({ icon: Icon, title, text }, index) => (
                    <div
                      key={title || index}
                      className="flex items-start gap-3 rounded-lg border border-[#E8E1D4] bg-white p-3.5 shadow-sm transition-colors duration-200 hover:border-[#D4A52A] sm:gap-4 sm:p-6 lg:p-7"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#18156D]/10 text-[#18156D] sm:h-12 sm:w-12">
                        <Icon size={20} strokeWidth={2} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {title && (
                          <h3 className="text-base font-bold leading-5 text-[#18156D] sm:text-[18px] sm:leading-6">
                            {title}
                          </h3>
                        )}

                        {text && (
                          <p className="mt-1.5 text-sm leading-5 text-gray-600 sm:mt-2 sm:text-[15px] sm:leading-6">
                            {text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* =====================================================
              STEPS
          ===================================================== */}

          {mappedSteps.length > 0 && (
            <section className="relative overflow-hidden bg-[#17145f] py-8 sm:py-14 lg:py-24">
              <div className="customer-container relative">
                <SectionHeading
                  light
                  eyebrow="Four simple steps"
                  title="How Selling on Sam Global Works"
                  text={
                    stepsSection?.description ||
                    "From registration to your first payout, the path is refreshingly straightforward."
                  }
                />

                <div className="relative mt-6 sm:mt-12 lg:mt-14">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-4">
                    {mappedSteps.map(({ icon: Icon, number, title, text }) => (
                      <article
                        key={number}
                        className="flex h-full items-start gap-2.5 rounded-lg border border-white/15 bg-white/[0.07] p-3 text-white transition-colors duration-200 hover:border-[#d6a323]/60 hover:bg-white/[0.10] sm:gap-3.5 sm:p-4"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#d6a323] text-[#17145f] shadow-sm sm:h-12 sm:w-12">
                          <Icon size={20} strokeWidth={1.9} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="min-w-0 text-[15px] font-bold leading-5 sm:text-[17px] sm:leading-6">
                              {title}
                            </h3>

                            <span className="shrink-0 text-[21px] font-extrabold leading-none tracking-tight text-[#d6a323] sm:text-[27px]">
                              {String(number).padStart(2, "0")}
                            </span>
                          </div>

                          <p className="mt-1.5 text-xs leading-5 text-white/70 sm:mt-2 sm:text-base sm:leading-[1.4rem]">
                            {text}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-6 text-center sm:mt-12">
                  <SolidLargeButton
                    as="a"
                    href={SELLER_LOGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-12 items-center justify-center gap-2  px-7 "
                  >
                    Get Started
                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
                    />
                  </SolidLargeButton>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}