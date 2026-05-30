import { useMemo } from "react";
import {
  Boxes,
  CircleDollarSign,
  PackageCheck,
  PackageOpen,
  RefreshCcw,
  ShieldCheck,
  Store,
  Truck,
  UserCheck,
  WalletCards,
} from "lucide-react";

import Seo from "../../components/common/Seo";
import Button from "../../components/common/buttons/Button";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import SearchBar from "../../components/ui/SearchBar";
import { ReasonCard, SectionIntro } from "./ContactUs";
import { useCmsRecord } from "../../hooks/useCmsRecord";

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
  wallet: WalletCards,
};

function getTopicIcon(title = "") {
  const normalized = title.toLowerCase();
  const match = Object.entries(topicIconByTitle).find(([key]) =>
    normalized.includes(key),
  );
  return match?.[1] || PackageOpen;
}

function parseBodySections(body = "") {
  if (!body) return [];

  const sections = [];
  let current = null;

  body.split(/\n+/).forEach((line) => {
    const value = line.trim();
    if (!value) return;

    if (value.startsWith("## ")) {
      current = {
        title: value.replace(/^##\s+/, "").trim(),
        description: "",
      };
      sections.push(current);
      return;
    }

    if (value.startsWith("# ")) return;

    if (current) {
      current.description = [current.description, value]
        .filter(Boolean)
        .join(" ");
    }
  });

  return sections.filter((section) => section.title);
}

function normalizeKey(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSection(page, names) {
  const sections = Array.isArray(page?.sections) ? page.sections : [];
  const normalizedNames = names.map(normalizeKey);

  return sections.find((section) => {
    const sectionKeys = [section?.type, section?.title].map(normalizeKey);

    return sectionKeys.some((key) => normalizedNames.includes(key));
  });
}

function getSectionTitle(section) {
  return section?.title || section?.type || "";
}

function mapCards(items = []) {
  return items
    .filter((item) => item?.title)
    .map((item, index) => ({
      title: item.title,
      description: item.description,
      icon: getTopicIcon(item.title),
      active: index === 1,
    }));
}

function normalizeHelpTopics(page) {
  const section = getSection(page, ["All Help Topics"]);
  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) return mapCards(points);

  const rootPoints = Array.isArray(page?.points) ? page.points : [];
  return mapCards(rootPoints.filter((item) => !item?.description)).slice(0, 8);
}

function normalizeCommonQuestions(page) {
  const section = getSection(page, ["Common Question", "Common Questions"]);
  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) return mapCards(points);

  const rootPoints = Array.isArray(page?.points) ? page.points : [];
  const questionPoints = rootPoints.filter((item) => item?.description);
  const bodySections = parseBodySections(page?.body);

  return mapCards(questionPoints.length ? questionPoints : bodySections).slice(
    0,
    3,
  );
}

function normalizeOptions(page) {
  const optionSection = getSection(page, [
    "Other Options For You",
    "Options",
    "Support Options",
  ]);
  const points = Array.isArray(optionSection?.points)
    ? optionSection.points
    : [];

  return mapCards(points);
}

function TopicCard({ topic }) {
  const Icon = topic.icon;
  return (
    <Button
      type="button"
      variant="ghost"
      className={`!relative !flex min-h-[74px] w-full !items-center !justify-start gap-4 rounded-[8px] border-none px-4 py-3 text-left font-montserrat shadow-[0_10px_28px_rgba(46,46,46,0.08)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 
      `}
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
    </Button>
  );
}

function OptionCard({ option }) {
  const Icon = option.icon;
  return (
    <Button
      type="button"
      variant="ghost"
      className="!flex min-h-[82px] w-full !items-center !justify-start gap-5 rounded-[8px] !border !border-[#2E2E2E] !bg-white px-6 text-left font-montserrat shadow-sm transition-all duration-300 ease-in-out hover:!border-[#CE9F2D] hover:!text-blue"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3F3FA] text-blue">
        <Icon size={25} fill="currentColor" strokeWidth={1.7} />
      </span>
      <span className="text-lg font-bold leading-snug">{option.title}</span>
    </Button>
  );
}

export default function SupportHelpCenter() {
  const { page } = useCmsRecord("support-center");

  const pageTitle = page?.title || "";
  const pageDescription = page?.description || page?.excerpt || "";
  const topics = useMemo(() => normalizeHelpTopics(page), [page]);
  const commonQuestions = useMemo(() => normalizeCommonQuestions(page), [page]);
  const options = useMemo(() => normalizeOptions(page), [page]);
  const introSection = getSection(page, [
    "Help & Support Centre",
    "Support Center",
  ]);
  const commonSection = getSection(page, [
    "Common Question",
    "Common Questions",
  ]);
  const topicsSection = getSection(page, ["All Help Topics"]);
  const optionsSection = getSection(page, ["Other Options For You"]);
  const ctaLabel = page?.cta?.label;
  const ctaUrl = page?.cta?.url;
  const searchPlaceholder =
    page?.metadata?.data?.searchPlaceholder || "Search SAM Global Help";

  return (
    <>
      <Seo title={`${pageTitle} | Sam Global`} description={pageDescription} />
      <FAQHeroSection title={pageTitle} description={pageDescription} />

      <section className="w-container py-14 sm:py-16 lg:py-20">
        <SectionIntro
          title={getSectionTitle(introSection) || pageTitle}
          description={introSection?.description || pageDescription}
        />
        <SearchBar
          placeholder={searchPlaceholder}
          showButtonLabel={false}
          className="mx-auto mt-6 max-w-[500px]"
        />

        {commonQuestions.length > 0 && (
          <>
            <SectionIntro
              className="mt-16"
              title={getSectionTitle(commonSection)}
              description={commonSection?.description}
            />

            <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-0">
              {commonQuestions.map((item, index) => (
                <div key={item.title} className="relative">
                  <ReasonCard item={item} showDivider={index > 0} />
                </div>
              ))}
            </div>
          </>
        )}

        {ctaLabel && ctaUrl && (
          <div className="mt-9 flex justify-center">
            <Button
              rounded
              size="lg"
              className="!bg-blue !px-8 !text-white hover:!bg-[#1b1a62]"
              onClick={() => {
                window.location.href = ctaUrl;
              }}
            >
              {ctaLabel}
            </Button>
          </div>
        )}
      </section>

      {topics.length > 0 && (
        <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F3F3FA] py-14">
          <div className="w-container">
            <SectionIntro
              title={getSectionTitle(topicsSection)}
              description={topicsSection?.description}
            />
            <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {topics.map((topic) => (
                <TopicCard key={topic.title} topic={topic} />
              ))}
            </div>
          </div>
        </section>
      )}

      {options.length > 0 && (
        <section className="w-container py-14">
          <SectionIntro
            title={getSectionTitle(optionsSection)}
            description={optionsSection?.description}
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {options.map((option) => (
              <OptionCard key={option.title} option={option} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
