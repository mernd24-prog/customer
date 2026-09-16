import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
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
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import NotFoundPage from "../../NotFoundPage";
import "swiper/css";
import "swiper/css/pagination";

const STORY_SWIPER_MODULES = [Navigation, Pagination];
const STORY_SWIPER_NAVIGATION = {
  prevEl: ".seller-story-prev",
  nextEl: ".seller-story-next",
};
const STORY_SWIPER_PAGINATION = { clickable: true };
const STORY_SWIPER_BREAKPOINTS = {
  640: { slidesPerView: 2 },
  900: { slidesPerView: 3 },
  1100: { slidesPerView: 4 },
};

export const SELLER_LOGIN_URL = "http://45.195.90.183:3000/login";

const benefitIcons = [
  CircleDollarSign,
  Truck,
  BarChart3,
  ShieldCheck,
  Headphones,
  Sparkles,
];

const stepIcons = [UserRoundPlus, Store, PackageCheck, WalletCards];

function SectionHeading({ eyebrow, title, text, light = false }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span
        className={`inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
          light ? "bg-white/10 text-[#f1c65f]" : "bg-[#f5eddb] text-[#9c6a0a]"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-5 text-h2 font-bold leading-tight  ${
          light ? "text-white" : "text-[#201b78]"
        }`}
      >
        {title}
      </h2>
      {text && (
        <p
          className={`mt-4 leading-7 max-w-md mx-auto ${light ? "text-white/70" : "text-[#6f7480]"}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

export default function BecomeASeller() {
  const { page, loading } = useCmsRecord("become-a-seller");

  if (!page) {
    if (loading) return null;
    return <NotFoundPage />;
  }

  // Map CMS data or use static fallbacks
  const heroTitle = page?.title || "";
  const [titleLine1, titleLine2] = heroTitle.split("\n");
  const heroDesc = page?.excerpt || "";
  const heroImg = page?.image?.url || "";
  
  const cmsExperiences = page?.sections?.[0]?.points?.map(point => ({
    quote: point.description,
    name: point.title,
    role: point.metadata?.role || point.image?.caption || "",
    category: point.metadata?.category || point.image?.title || "",
    result: point.cta?.label || "",
    photo: point.image?.url || "",
    initials: point.title?.substring(0, 2).toUpperCase() || "",
  })) || [];

  const mappedBenefits = page?.sections?.[1]?.points?.map((cmsPoint, i) => ({
    icon: benefitIcons[i % benefitIcons.length],
    title: cmsPoint.title || "",
    text: cmsPoint.description || ""
  })) || [];

  const mappedSteps = page?.sections?.[2]?.points?.map((cmsPoint, i) => ({
    icon: stepIcons[i % stepIcons.length],
    number: `0${i + 1}`,
    title: cmsPoint.title || "",
    text: cmsPoint.description || ""
  })) || [];

  return (
    <div className="full-banner overflow-hidden bg-white">
      <Seo
        title="Become a Seller | Sam Global"
        description="Grow your business with Sam Global. Reach more customers, manage orders easily, and get reliable seller support."
      />

      <section className="relative isolate overflow-hidden bg-[#17145f] text-white">
        <img loading="lazy" width="400" height="400"
          src={heroImg}
          alt="Sam Global Seller Growing His Online Business"
          className="absolute inset-0 -z-20 h-full w-full object-cover  object-top "
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111050] via-[#17145f]/90 to-[#17145f]/5 lg:via-[#17145f]/65" />
        <div className="customer-container flex min-h-[570px] items-center py-16 lg:min-h-[780px] lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={16} className="text-[#efc75f]" />
              Your Next Chapter Starts Here
            </div>
            <h1 className="banner-heading font-bold ">
              {titleLine1}
              {titleLine2 && <span className="block text-[#efc75f]">{titleLine2}</span>}
            </h1>
            <p className="mt-6 max-w-xl text-base  text-white/75 sm:text-lg">
              {heroDesc}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                target="_blank"
                href={SELLER_LOGIN_URL}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d6a323] px-7 font-bold text-[#17145f] transition hover:-translate-y-0.5 hover:bg-[#e5b738]"
              >
                Seller Login <ArrowRight size={18} />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              {["Simple onboarding", "Secure payouts", "Dedicated support"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">
                      <Check size={12} className="text-[#efc75f]" />
                    </span>
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#faf6ee] py-20 sm:py-24">
        <div className="customer-container relative">
          <div className="flex flex-col  items-center justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl  text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f1e5c9] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8d5d08]">
                <Sparkles size={14} /> Real Seller Stories
              </span>
              <h2 className="mt-5 text-h2 font-bold leading-tight text-[#201b78] ">
                Their Growth Is Our{" "}
                <span className="text-[#b17d15]">Favourite Story.</span>
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[#6f7480]">
                Meet the entrepreneurs building remarkable businesses with Sam
                Global by their side.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="seller-story-prev grid h-12 w-12 place-items-center rounded-full border border-[#201b78] bg-white text-[#201b78] shadow-sm transition-all duration-300 hover:bg-[#201b78] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none [&.swiper-button-disabled]:opacity-40 [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:bg-white [&.swiper-button-disabled]:border-[#d9d1c3] [&.swiper-button-disabled]:text-[#999] [&.swiper-button-disabled]:shadow-none"
                aria-label="Previous Seller Story"
              >
                <ArrowLeft size={19} />
              </button>
              <button
                type="button"
                className="seller-story-next grid h-12 w-12 place-items-center rounded-full border border-[#201b78] bg-white text-[#201b78] shadow-sm transition-all duration-300 hover:bg-[#201b78] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none [&.swiper-button-disabled]:opacity-40 [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:bg-white [&.swiper-button-disabled]:border-[#d9d1c3] [&.swiper-button-disabled]:text-[#999] [&.swiper-button-disabled]:shadow-none"
                aria-label="Next Seller Story"
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
          <div className="seller-experience-swiper  mt-10 ">
            <Swiper
              modules={STORY_SWIPER_MODULES}
              navigation={STORY_SWIPER_NAVIGATION}
              pagination={STORY_SWIPER_PAGINATION}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={STORY_SWIPER_BREAKPOINTS}
            >
              {cmsExperiences.map((story, i) => (
                <SwiperSlide key={story.name || i} className="!h-auto pb-12">
                  <article className="group h-full rounded-[22px] bg-white p-3 pb-6   sm:p-4 sm:pb-7">
                    <div className="relative">
                      <div className="overflow-hidden  rounded-xl  bg-[#e8e5df]">
                        <img width="400" height="400"
                          src={story.photo}
                          alt={`${story.name} at their business`}
                          className="h-44 w-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="px-2 pt-9">
                      <h3 className="text-lg font-bold leading-tight text-[#181928]">
                        {story.name}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-[#3e4093]">
                        {story.role}
                      </p>
                      <div className="mt-4 h-px bg-[#eee9df]" />
                      <p className="mt-4 text-[15px] leading-6 text-[#50545e]">
                        {story.quote}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f7f2e7] px-3 py-1.5 text-xs font-bold text-[#8d610d]">
                        <BarChart3 size={14} /> {story.result}
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="customer-container">
          <SectionHeading
            eyebrow="Made for sellers"
            title="Why Suppliers Love Sam Global"
            text="A marketplace should do more than host your products. It should help your business move forward."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mappedBenefits.map(({ icon: Icon, title, text }, i) => (
              <article
                key={title || i}
                className="group rounded-2xl border border-[#e4ddcf] bg-white p-7   hover:border-[#d6a323]/60 "
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl bg-[#f4f2ff] text-[#3E4093] transition group-hover:bg-[#d6a323] group-hover:text-[#201b78]`}
                >
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#201b78]">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-[#6f7480]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#17145f] py-20 sm:py-24">
        <div className="customer-container relative">
          <SectionHeading
            light
            eyebrow="Four simple steps"
            title="How Selling on Sam Global Works"
            text="From registration to your first payout, the path is refreshingly straightforward."
          />
          <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-12 hidden border-t border-dashed border-white/25 lg:block" />
            {mappedSteps.map(({ icon: Icon, number, title, text }) => (
              <article
                key={number}
                className="relative rounded-2xl border border-white/10 bg-white/[0.07] p-6 text-white backdrop-blur-sm"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="grid w-10 h-10 md:h-14 md:w-14 place-items-center rounded-xl bg-[#d6a323] text-[#17145f]">
                    <Icon size={25} />
                  </span>
                  <span className="text-4xl font-bold text-white/10">
                    {number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              target="_blank"
              href={SELLER_LOGIN_URL}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d6a323] px-8 font-bold text-[#17145f] transition hover:-translate-y-0.5 hover:bg-[#e5b738]"
            >
              Open Your Seller Account <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
