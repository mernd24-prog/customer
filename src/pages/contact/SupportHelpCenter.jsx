import { useMemo } from "react";
import {
  Boxes,
  CircleDollarSign,
  HandCoins,
  PackageCheck,
  PackageOpen,
  RefreshCcw,
  Search,
  ShieldCheck,
  Store,
  Truck,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";

import Seo from "../../components/common/Seo";
import Button from "../../components/common/buttons/Button";
import { ContactHero, ReasonCard, SectionIntro } from "./ContactUs";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";

const commonQuestions = [
  {
    title: "Where is my order?",
    description: "Track your order status in real-time through your account dashboard.",
    icon: PackageCheck,
  },
  {
    title: "How do returns work?",
    description: "Simple and hassle-free return process within the defined return window.",
    icon: HandCoins,
  },
  {
    title: "Payment Methods",
    description: "We support secure payments via cards, UPI, net banking, and wallets.",
    icon: WalletCards,
  },
];

const helpTopics = [
  { title: "Return & Refunds", icon: RefreshCcw },
  { title: "Tracking", icon: Truck, active: true },
  { title: "Paying", icon: CircleDollarSign },
  { title: "Selling Fees", icon: Store },
  { title: "Shipping Labels", icon: Boxes },
  { title: "Selling Protection", icon: ShieldCheck },
  { title: "Account Security", icon: UserCheck },
  { title: "Verification", icon: PackageOpen },
];

const topicIconByTitle = {
  order: PackageCheck,
  track: Truck,
  payment: CircleDollarSign,
  paying: CircleDollarSign,
  return: RefreshCcw,
  refund: RefreshCcw,
  seller: Store,
  account: UserCheck,
  verification: PackageOpen,
  shipping: Boxes,
  security: ShieldCheck,
};

function getTopicIcon(title = "") {
  const normalized = title.toLowerCase();
  const match = Object.entries(topicIconByTitle).find(([key]) =>
    normalized.includes(key),
  );
  return match?.[1] || PackageOpen;
}

function normalizeHelpTopics(cmsData) {
  const cmsPoints = Array.isArray(cmsData?.points) ? cmsData.points : [];
  const sectionItems = Array.isArray(cmsData?.sections)
    ? cmsData.sections.flatMap((section) => section?.points || section?.items || [])
    : [];
  const candidates = [...cmsPoints, ...sectionItems]
    .filter((item) => item?.title)
    .slice(0, 8)
    .map((item, index) => ({
      title: item.title,
      description: item.description,
      icon: getTopicIcon(item.title),
      active: index === 1,
    }));

  return candidates.length ? candidates : helpTopics;
}

const options = [
  { title: "Ask the Community", icon: Users },
  { title: "Start a return", icon: RefreshCcw },
  { title: "Report an item that hasn't arrived", icon: Truck },
];

function SearchBox() {
  return (
    <form className="mx-auto mt-6 flex h-11 max-w-[500px] items-center rounded-full border border-[#CE9F2D] bg-white pl-5 pr-1 shadow-sm">
      <input
        type="search"
        aria-label="Search SAM Global Help"
        placeholder="Search SAM Global Help"
        className="min-w-0 flex-1 bg-transparent font-montserrat text-xs text-[#2E2E2E] outline-none placeholder:text-[#A6A6A6]"
      />
      <button
        type="submit"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#CE9F2D] text-white transition hover:bg-[#A26D27]"
      >
        <Search size={18} />
      </button>
    </form>
  );
}

function TopicCard({ topic }) {
  const Icon = topic.icon;
  return (
    <button
      type="button"
      className={`relative flex min-h-[74px] items-center gap-4 rounded-[8px] px-4 py-3 text-left font-montserrat shadow-[0_10px_28px_rgba(46,46,46,0.08)] transition hover:-translate-y-0.5 ${
        topic.active ? "bg-blue text-white" : "bg-white text-[#2E2E2E]"
      }`}
    >
      <span className="absolute left-14 top-0 h-1 w-14 rounded-b-full bg-[#A26D27]" />
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] ${
          topic.active ? "bg-white text-[#CE9F2D]" : "bg-[#CE9F2D] text-white"
        }`}
      >
        <Icon size={24} />
      </span>
      <span className="text-base font-semibold">{topic.title}</span>
    </button>
  );
}

function OptionCard({ option }) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      className="flex min-h-[82px] items-center gap-5 rounded-[8px] border border-[#2E2E2E] bg-white px-6 text-left font-montserrat shadow-sm transition hover:border-[#CE9F2D] hover:text-blue"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3F3FA] text-blue">
        <Icon size={25} fill="currentColor" strokeWidth={1.7} />
      </span>
      <span className="text-lg font-bold leading-snug">{option.title}</span>
    </button>
  );
}

export default function SupportHelpCenter() {
  const { page } = useCmsRecord("help-contact");
  const cmsData = useMemo(
    () =>
      getCmsPayload(page, {
        title: "Help & Support Centre",
        description: "Find answers, get support, and connect with our team.",
      }),
    [page],
  );
  const pageTitle = cmsData?.title || page?.title || "Help & Support Centre";
  const pageDescription =
    cmsData?.description ||
    page?.description ||
    page?.excerpt ||
    "Find answers, get support, and connect with our team.";
  const topics = useMemo(() => normalizeHelpTopics(cmsData), [cmsData]);

  return (
    <>
      <Seo
        title={`${pageTitle} | Sam Global`}
        description={pageDescription}
      />
      <ContactHero />

      <section className="w-container py-14 sm:py-16 lg:py-20">
        <SectionIntro
          title="Help & Support Centre"
          description={pageDescription}
        />
        <SearchBox />

        <SectionIntro className="mt-16" title="Common Question" />

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-0">
          {commonQuestions.map((item, index) => (
            <div key={item.title} className="relative">
              <ReasonCard item={item} showDivider={index > 0} />
              <p className="mx-auto -mt-3 max-w-[300px] text-center font-montserrat text-sm leading-7 text-[#787878]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <Button
            rounded
            size="lg"
            className="!bg-blue !px-8 !text-white hover:!bg-[#1b1a62]"
            onClick={() => {
              window.location.href = "/help-contact";
            }}
          >
            Still need help? Contact our support team
          </Button>
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F3F3FA] py-14">
        <div className="w-container">
          <SectionIntro title="All Help Topics" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {topics.map((topic) => (
              <TopicCard key={topic.title} topic={topic} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-container py-14">
        <SectionIntro title="Other Options For You" />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {options.map((option) => (
            <OptionCard key={option.title} option={option} />
          ))}
        </div>
      </section>
    </>
  );
}
