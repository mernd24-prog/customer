import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import NeedHelpPanel from "../../components/ecommerce/NeedHelpPanel";
import { useCmsRecord } from "../../hooks/useCmsRecord";

import {
  SUPPORT_CONTACT_ITEMS,
  SUPPORT_BREADCRUMBS,
  SUPPORT_TOPIC_IMAGE_BY_TITLE,
  SUPPORT_FALLBACK_FAQS,
  SUPPORT_FALLBACK_TOPICS,
} from "../../data/supportPage";

function getTopicImage(title = "") {
  const normalized = title.toLowerCase();

  const match = Object.entries(SUPPORT_TOPIC_IMAGE_BY_TITLE).find(([key]) =>
    normalized.includes(key),
  );

  return match?.[1] || "/image/png/default-topic.png";
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

function mapCards(items = []) {
  return items
    .filter((item) => item?.title)
    .map((item) => ({
      title: item.title,
      description: item.description,
      image: getTopicImage(item.title),
      path: item.path || "/contact",
    }));
}

function normalizeHelpTopics(page) {
  const section = getSection(page, ["All Help Topics"]);

  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) {
    return mapCards(points);
  }

  const rootPoints = Array.isArray(page?.points) ? page.points : [];

  return mapCards(rootPoints.filter((item) => !item?.description)).slice(0, 8);
}

function normalizeCommonQuestions(page) {
  const section = getSection(page, ["Common Question", "Common Questions"]);

  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) {
    return mapCards(points);
  }

  const rootPoints = Array.isArray(page?.points) ? page.points : [];

  const questionPoints = rootPoints.filter((item) => item?.description);

  const bodySections = parseBodySections(page?.body);

  return mapCards(questionPoints.length ? questionPoints : bodySections).slice(
    0,
    6,
  );
}

export default function SupportHelpCenter() {
  const { page, loading } = useCmsRecord("support-center");

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Mobile Quick Actions dropdown state
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const pageTitle = page?.title || "";

  const pageDescription = page?.description || page?.excerpt || "";

  const topics = useMemo(() => normalizeHelpTopics(page), [page]);

  const commonQuestions = useMemo(() => normalizeCommonQuestions(page), [page]);

  const isPageLoading = loading && !page;

  const faqData =
    commonQuestions.length > 0 ? commonQuestions : SUPPORT_FALLBACK_FAQS;

  const quickActions =
    topics.length > 0 ? topics.slice(0, 6) : SUPPORT_FALLBACK_TOPICS;

  if (isPageLoading) {
    return (
      <>
        <Seo
          title={`${pageTitle || "Customer Support"} | Sam Global`}
          description={pageDescription}
        />

        <section className="w-container py-8 sm:py-10">
          <div className="py-4">
            <Breadcrumbs items={SUPPORT_BREADCRUMBS} />
          </div>

          <h1 className="mb-8 text-heading-sm font-bold text-ink sm:text-heading-md">
            {pageTitle || "Customer Support"}
          </h1>

          <ApiState
            loading={isPageLoading}
            empty={!isPageLoading && !page}
            emptyTitle="Customer Support"
            emptyText="Help topics and support options will appear here."
          />
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${pageTitle || "Customer Support"} | Sam Global`}
        description={pageDescription}
      />

      <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
        {/* Breadcrumb */}
        <Breadcrumbs items={SUPPORT_BREADCRUMBS} />

        {/* Page Heading */}
        <div className="mb-7 mt-4 sm:mt-5">
          <h1 className="text-[26px] font-bold leading-tight text-[#3E4093] sm:text-[30px] lg:text-[32px]">
            Help & Support
          </h1>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-5">
            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <>
                {/* MOBILE / SMALL VIEW */}
                <section className="relative md:hidden">
                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setIsQuickActionsOpen((open) => !open)
                    }
                    aria-expanded={isQuickActionsOpen}
                    className="flex w-full items-center justify-between rounded-[14px] border border-[#D7A522] bg-white px-4 py-3 text-left font-semibold text-[#2E2E2E]"
                  >
                    <span>Quick Actions</span>

                    <ChevronDown
                      className={`size-5 shrink-0 transition-transform duration-200 ${
                        isQuickActionsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Content */}
                  {isQuickActionsOpen && (
                    <nav className="absolute left-0 top-[calc(100%+6px)] z-30 flex w-full flex-col overflow-hidden rounded-[14px] border border-[#D7A522] bg-white shadow-lg">
                      {quickActions.map((topic, index) => (
                        <Link
                          key={`${topic.title}-${index}`}
                          to={topic.path || "/contact"}
                          onClick={() => setIsQuickActionsOpen(false)}
                          className="flex w-full items-center gap-3 border-b border-[#04258626] p-2 text-[#2E2E2E] hover:!bg-transparent hover:!text-[#2E2E2E] last:border-b-0"
                        >
                          {/* Icon */}
                          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC82E]">
                            <img
                              src={topic.image}
                              alt=""
                              className="size-5 object-contain"
                            />
                          </span>

                          {/* Text */}
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-semibold">
                              {topic.title}
                            </span>

                            {topic.description && (
                              <span className="mt-0.5 block text-xs text-[#4E4E4E]">
                                {topic.description}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </nav>
                  )}
                </section>

                {/* TABLET / DESKTOP VIEW */}
                <section className="hidden overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white md:block">
                  {/* Header */}
                  <div className="bg-[#F7EED8] px-4 py-3 sm:px-5">
                    <h2 className="text-[16px] font-bold text-[#2E2E2E] sm:text-[18px]">
                      Quick Actions
                    </h2>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-4 py-5 sm:px-5 lg:grid-cols-6">
                    {quickActions.map((topic, index) => (
                      <Link
                        key={`${topic.title}-${index}`}
                        to={topic.path || "/contact"}
                        className="group flex min-w-0 flex-col items-center text-center"
                      >
                        <div className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full bg-[#F5C72E] transition-transform duration-200 group-hover:scale-105 sm:h-[64px] sm:w-[64px]">
                          <img
                            src={topic.image}
                            alt={topic.title}
                            className="h-[36px] w-[36px] object-contain sm:h-[40px] sm:w-[40px]"
                          />
                        </div>

                        <span className="mt-2 max-w-[90px] text-[12px] font-semibold leading-[15px] text-[#2E2E2E] sm:text-[13px]">
                          {topic.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* FAQ */}
            <section className="overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white">
              {/* Header */}
              <div className="bg-[#F7EED8] px-4 py-3 sm:px-5">
                <h2 className="text-[16px] font-bold text-[#2E2E2E] sm:text-[18px]">
                  Frequently Asked Questions
                </h2>
              </div>

              {/* FAQ Items */}
              <div className="px-4 sm:px-5">
                {faqData.slice(0, 6).map((faq, index) => {
                  const isOpen = openFaqIndex === index;

                  return (
                    <div
                      key={`${faq.title || faq.question}-${index}`}
                      className="border-b border-[#EFE5D2] last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqIndex(isOpen ? null : index)
                        }
                        className="flex w-full items-center justify-between gap-4 py-4 text-left focus:outline-none"
                      >
                        <span className="text-[15px] font-medium text-[#2E2E2E] sm:text-[18px] lg:text-[17px]">
                          {faq.title || faq.question}
                        </span>

                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-[#25247B] transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "max-h-96 pb-4 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="pr-6 text-[13px] leading-5 text-[#666666]">
                          {faq.description || faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="min-w-0">
            <NeedHelpPanel
              title="Contact Support"
              items={SUPPORT_CONTACT_ITEMS}
              headerStyle="colored"
            />
          </div>
        </div>
      </main>
    </>
  );
}