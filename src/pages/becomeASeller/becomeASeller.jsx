import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
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
import Seo from "../../components/common/Seo";
import "swiper/css";
import "swiper/css/pagination";

const SELLER_LOGIN_URL = "http://45.195.90.183:3000/login";

const experiences = [
  {
    quote:
      "Sam Global gave our handcrafted home collection the reach it deserved. The dashboard is simple, payments are transparent, and we can focus on making great products.",
    name: "Aarav Mehta",
    role: "Founder, House of Aara",
    category: "Home & Living",
    result: "3.2× growth in 8 months",
    photo:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=720&q=85",
    initials: "AM",
    color: "from-[#3E4093] to-[#6f67c8]",
  },
  {
    quote:
      "From uploading our first catalogue to shipping nationwide, the team made every step feel manageable. The seller tools help us make better decisions every week.",
    name: "Nisha Kapoor",
    role: "Owner, Nivara Studio",
    category: "Fashion",
    result: "18,000+ orders delivered",
    photo:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=720&q=85",
    initials: "NK",
    color: "from-[#c58a18] to-[#e7bd62]",
  },
  {
    quote:
      "Reliable payouts and responsive support gave us the confidence to scale. We started with six products and now manage a catalogue of more than two hundred.",
    name: "Kabir Shah",
    role: "Director, K&S Essentials",
    category: "Beauty & Wellness",
    result: "200+ products listed",
    photo:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=720&q=85",
    initials: "KS",
    color: "from-[#167c68] to-[#45ad96]",
  },
  {
    quote:
      "The marketplace helped our family-run brand find customers far beyond our city. Order management is smooth and the growth insights are genuinely useful.",
    name: "Riya Malhotra",
    role: "Co-founder, Terra Crafts",
    category: "Handmade",
    result: "42 cities reached",
    photo:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=720&q=85",
    initials: "RM",
    color: "from-[#9c4f68] to-[#d58ca4]",
  },
  {
    quote:
      "Sam Global made online selling feel approachable from day one. Today our small electronics store serves customers across the country with confidence.",
    name: "Dev Arora",
    role: "Owner, Volt Avenue",
    category: "Electronics",
    result: "4.8 average rating",
    photo:
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=720&q=85",
    initials: "DA",
    color: "from-[#285f91] to-[#66a0cf]",
  },
];

const benefits = [
  {
    icon: CircleDollarSign,
    title: "Transparent earnings",
    text: "Clear fees, dependable payment cycles, and a simple view of every transaction.",
  },
  {
    icon: Truck,
    title: "Nationwide reach",
    text: "Reach customers across India with logistics designed for growing businesses.",
  },
  {
    icon: BarChart3,
    title: "Insights that help",
    text: "Understand product performance and spot opportunities with actionable analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Seller-first protection",
    text: "Secure payments and thoughtful safeguards keep your business protected.",
  },
  {
    icon: Headphones,
    title: "Support when needed",
    text: "Get practical assistance through onboarding, fulfilment, and everyday selling.",
  },
  {
    icon: Sparkles,
    title: "Tools built to grow",
    text: "Manage listings, orders, inventory, and promotions from one clean workspace.",
  },
];

const steps = [
  {
    icon: UserRoundPlus,
    number: "01",
    title: "Create your account",
    text: "Register your business and share a few basic details to get started.",
  },
  {
    icon: Store,
    number: "02",
    title: "Build your storefront",
    text: "Add your products, pricing, inventory, and the story behind your brand.",
  },
  {
    icon: PackageCheck,
    number: "03",
    title: "Receive & ship orders",
    text: "Manage new orders from your seller dashboard and prepare them for delivery.",
  },
  {
    icon: WalletCards,
    number: "04",
    title: "Get paid & grow",
    text: "Track payouts, learn from performance insights, and scale with confidence.",
  },
];

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
  return (
    <div className="full-banner overflow-hidden bg-white">
      <Seo
        title="Become a Seller | Sam Global"
        description="Grow your business with Sam Global. Reach more customers, manage orders easily, and get reliable seller support."
      />

      <section className="relative isolate overflow-hidden bg-[#17145f] text-white">
        <img
          src="/image/png/sellerBanner.png"
          alt="Sam Global seller growing his online business"
          className="absolute inset-0 -z-20 h-full w-full object-cover  object-top "
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111050] via-[#17145f]/90 to-[#17145f]/5 lg:via-[#17145f]/65" />
        <div className="customer-container flex min-h-[570px] items-center py-16 lg:min-h-[780px] lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={16} className="text-[#efc75f]" />
              Your next chapter starts here
            </div>
            <h1 className="banner-heading font-bold ">
              Your products deserve a
              <span className="block text-[#efc75f]">bigger marketplace.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base  text-white/75 sm:text-lg">
              Join Sam Global and turn your ambition into a business customers
              can discover, trust, and love—across India.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SELLER_LOGIN_URL}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d6a323] px-7 font-bold text-[#17145f] transition hover:-translate-y-0.5 hover:bg-[#e5b738]"
              >
                Seller login <ArrowRight size={18} />
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
                <Sparkles size={14} /> Real seller stories
              </span>
              <h2 className="mt-5 text-h2 font-bold leading-tight text-[#201b78] ">
                Their growth is our{" "}
                <span className="text-[#b17d15]">favourite story.</span>
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[#6f7480]">
                Meet the entrepreneurs building remarkable businesses with Sam
                Global by their side.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="seller-story-prev grid h-12 w-12 place-items-center rounded-full border border-[#d9d1c3] bg-white text-[#201b78] shadow-sm transition hover:border-[#201b78] hover:bg-[#201b78] hover:text-white"
                aria-label="Previous seller story"
              >
                <ArrowLeft size={19} />
              </button>
              <button
                className="seller-story-next grid h-12 w-12 place-items-center rounded-full bg-[#201b78] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3e4093]"
                aria-label="Next seller story"
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
          <div className="seller-experience-swiper  mt-10 ">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl: ".seller-story-prev",
                nextEl: ".seller-story-next",
              }}
              pagination={{ clickable: true }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                900: { slidesPerView: 3 },
                1100: { slidesPerView: 4 },
              }}
            >
              {experiences.map((story) => (
                <SwiperSlide key={story.name} className="!h-auto pb-12">
                  <article className="group h-full rounded-[22px] bg-white p-3 pb-6  transition duration-300 hover:-translate-y-1  sm:p-4 sm:pb-7">
                    <div className="relative">
                      <div className="overflow-hidden  rounded-xl  bg-[#e8e5df]">
                        <img
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
            title="Why suppliers love Sam Global"
            text="A marketplace should do more than host your products. It should help your business move forward."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="group rounded-2xl border border-[#e4ddcf] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#d6a323]/60 "
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl ${index === 0 ? "bg-[#201b78] text-white" : "bg-[#f4f2ff] text-[#3E4093]"} transition group-hover:bg-[#d6a323] group-hover:text-[#201b78]`}
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
            title="How selling on Sam Global works"
            text="From registration to your first payout, the path is refreshingly straightforward."
          />
          <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-12 hidden border-t border-dashed border-white/25 lg:block" />
            {steps.map(({ icon: Icon, number, title, text }) => (
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
              href={SELLER_LOGIN_URL}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d6a323] px-8 font-bold text-[#17145f] transition hover:-translate-y-0.5 hover:bg-[#e5b738]"
            >
              Open your seller account <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
