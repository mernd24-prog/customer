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

import Seo from "../../../components/ui/Seo";
import Loader from "../../../components/ui/Loader";
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import { FALLBACK_SELLER_PAGE } from "../../../data/fallbackCmsData";

const SELLER_LOGIN_URL = "http://45.195.90.183:3000/login";

const STORY_SWIPER_BREAKPOINTS = {
  640: {
    slidesPerView: 2,
  },
  900: {
    slidesPerView: 3,
  },
  1100: {
    slidesPerView: 4,
  },
};

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
        className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] sm:px-4 sm:py-2 ${
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

export default function BecomeASeller() {
  const { page: cmsPage, loading, error } =
    useCmsRecord("become-a-seller");

  const cmsPayload = getCmsPayload(cmsPage);

  const sellerPage = cmsPayload?.image?.url
    ? cmsPayload
    : FALLBACK_SELLER_PAGE;

  const heroTitle = sellerPage?.title || "";

  const [titleLine1, titleLine2] = heroTitle.split("\n");

  const heroDesc = sellerPage?.excerpt || "";

  const heroImg = sellerPage?.image?.url || "";

  const storySection = sellerPage?.sections?.[0];

  const benefitsSection = sellerPage?.sections?.[1];

  const stepsSection = sellerPage?.sections?.[2];

  const sellerStories = Array.isArray(storySection?.points)
    ? storySection.points
    : [];

  const benefits = Array.isArray(benefitsSection?.points)
    ? benefitsSection.points
    : [];

  const steps = Array.isArray(stepsSection?.points)
    ? stepsSection.points
    : [];

  const mappedExperiences = sellerStories.map((point) => ({
    quote: point?.description || "",
    name: point?.title || "",
    role: point?.metadata?.role || "",
    category: point?.metadata?.category || "",
    result: point?.cta?.label || "",
    photo: point?.image?.url || "",
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

          <section className="relative isolate overflow-hidden bg-[#17145f] text-white">
            {heroImg && (
              <img
                loading="lazy"
                width="400"
                height="400"
                src={heroImg}
                alt="Sam Global Seller Growing His Online Business"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
              />
            )}

            <div
              className="
                absolute inset-0 -z-10
                bg-gradient-to-r
                from-[#111050]/95
                via-[#17145f]/80
                to-transparent
                lg:from-[#111050]/90
                lg:via-[#17145f]/35
                lg:to-transparent
              "
            />

            <div className="customer-container flex min-h-[570px] items-center py-12 sm:py-16 lg:min-h-[780px] lg:py-20">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2">
                  <Sparkles size={16} className="text-[#efc75f]" />

                  Your Next Chapter Starts Here
                </div>

                <h1 className="banner-heading font-bold">
                  {titleLine1}

                  {titleLine2 && (
                    <span className="block text-[#efc75f]">
                      {titleLine2}
                    </span>
                  )}
                </h1>

                {heroDesc && (
                  <p className="mt-5 max-w-xl text-base text-white/75 sm:mt-6 sm:text-lg">
                    {heroDesc}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={SELLER_LOGIN_URL}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d6a323] px-6 font-bold text-[#17145f] transition hover:-translate-y-0.5 hover:bg-[#e5b738] sm:px-7"
                  >
                    Seller Login
                    <ArrowRight size={18} />
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-white/75 sm:mt-8 sm:gap-x-6 sm:gap-y-3">
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
              </div>
            </div>
          </section>

          {/* =====================================================
              SELLER STORIES
          ===================================================== */}

          {mappedExperiences.length > 0 && (
            <section className="relative overflow-hidden bg-[#faf6ee] py-8 sm:py-14">
              <div className="customer-container relative">
                <div className="flex flex-col items-center justify-between gap-5 md:flex-row md:items-end md:gap-7">
                  <div className="max-w-2xl text-center md:text-left">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f1e5c9] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#8d5d08] sm:px-4 sm:py-2">
                      <Sparkles size={14} />
                      Real Seller Stories
                    </span>

                    <h2 className="mt-4 text-h2 font-bold leading-tight text-[#201b78] sm:mt-5">
                      Their Growth Is Our{" "}
                      <span className="text-[#b17d15]">
                        Favourite Story.
                      </span>
                    </h2>

                    <p className="mt-3 max-w-xl leading-7 text-[#6f7480] sm:mt-4">
                      Meet the entrepreneurs building remarkable businesses
                      with Sam Global by their side.
                    </p>
                  </div>

                  <div className="flex gap-2.5 sm:gap-3">
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
                </div>

                <div className="mt-8 sm:mt-10">
                  <CustomSwiper
                    prevEl=".seller-story-prev"
                    nextEl=".seller-story-next"
                    spaceBetween={16}
                    slidesPerView={1}
                    breakpoints={STORY_SWIPER_BREAKPOINTS}
                  >
                    {mappedExperiences.map((story, index) => (
                      <SwiperSlide
                        key={story.name || index}
                        className="!h-auto pb-2"
                      >
                        <article className="group h-full rounded-[22px] bg-white p-3 pb-5 sm:p-4 sm:pb-7">
                          <div className="relative">
                            <div className="overflow-hidden rounded-xl bg-[#e8e5df]">
                              {story.photo ? (
                                <img
                                  width="400"
                                  height="400"
                                  src={story.photo}
                                  alt={`${story.name} at their business`}
                                  className="h-44 w-full object-cover object-top"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-44 items-center justify-center text-3xl font-bold text-[#201b78]">
                                  {story.initials}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-2 pt-6 sm:pt-9">
                            <h3 className="text-lg font-bold leading-tight text-[#181928]">
                              {story.name}
                            </h3>

                            {story.role && (
                              <p className="mt-2 text-sm font-medium text-[#3e4093]">
                                {story.role}
                              </p>
                            )}

                            <div className="mt-3 h-px bg-[#eee9df] sm:mt-4" />

                            <p className="mt-3 text-[15px] leading-6 text-[#50545e] sm:mt-4">
                              {story.quote}
                            </p>

                            {story.result && (
                              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f7f2e7] px-3 py-1.5 text-xs font-bold text-[#8d610d] sm:mt-5">
                                <BarChart3 size={14} />

                                {story.result}
                              </div>
                            )}
                          </div>
                        </article>
                      </SwiperSlide>
                    ))}
                  </CustomSwiper>
                </div>
              </div>
            </section>
          )}

          {/* =====================================================
              BENEFITS
          ===================================================== */}

          {mappedBenefits.length > 0 && (
            <section className="bg-[#FAF8F3] py-12 sm:py-16 lg:py-24">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mx-auto max-w-3xl text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F5E9C6] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#B88400] sm:px-4 sm:py-2">
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

                <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {mappedBenefits.map(
                    ({ icon: Icon, title, text }, index) => (
                      <div
                        key={title || index}
                        className="rounded-2xl border border-[#E8E1D4] bg-white p-5 shadow-sm transition-colors duration-200 hover:border-[#D4A52A] sm:p-6 lg:p-7"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/10 text-[#18156D]">
                          <Icon size={24} strokeWidth={2} />
                        </div>

                        {title && (
                          <h3 className="mt-4 text-[18px] font-bold leading-6 text-[#18156D] sm:mt-6">
                            {title}
                          </h3>
                        )}

                        {text && (
                          <p className="mt-2.5 text-[14px] leading-6 text-gray-600 md:mt-3 md:text-[15px]">
                            {text}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          )}

          {/* =====================================================
              STEPS
          ===================================================== */}

          {mappedSteps.length > 0 && (
            <section className="relative overflow-hidden bg-[#17145f] py-12 sm:py-16 lg:py-24">
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

                <div className="relative mt-8 sm:mt-12 lg:mt-14">
                  <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden border-t border-dashed border-white/20 lg:block" />

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                    {mappedSteps.map(
                      ({ icon: Icon, number, title, text }) => (
                        <article
                          key={number}
                          className="relative flex min-h-[190px] flex-col rounded-[20px] border border-white/10 bg-white/[0.075] p-4 text-white backdrop-blur-sm sm:min-h-[214px] sm:p-6"
                        >
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] bg-[#d6a323] text-[#17145f] shadow-[0_8px_20px_rgba(0,0,0,0.12)] sm:h-14 sm:w-14">
                              <Icon size={24} strokeWidth={1.9} />
                            </span>

                            <span className="text-[32px] font-bold leading-none tracking-tight text-white/10 sm:text-[34px]">
                              {number}
                            </span>
                          </div>

                          <div className="mt-4 sm:mt-5">
                            <h3 className="text-[18px] font-bold leading-6 sm:text-[19px]">
                              {title}
                            </h3>

                            <p className="mt-2.5 max-w-[270px] text-[14px] leading-6 text-white/65">
                              {text}
                            </p>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-8 text-center sm:mt-12">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={SELLER_LOGIN_URL}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d6a323] px-7 font-bold text-[#17145f] transition-colors duration-200 hover:bg-[#e5b738] sm:px-8"
                  >
                    Get Started
                    <ChevronRight size={18} />
                  </a>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}