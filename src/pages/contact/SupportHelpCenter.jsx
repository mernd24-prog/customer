import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import NeedHelpPanel from "../../components/ecommerce/NeedHelpPanel";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import { apiRequest } from "../../api/client";
import { endpoints } from "../../api/endpoints";
import { tokenStorage } from "../../api/tokenStorage";
import { notify } from "../../utils/notify";

import {
  SUPPORT_CONTACT_ITEMS,
  SUPPORT_BREADCRUMBS,
  SUPPORT_TOPIC_IMAGE_BY_TITLE,
  SUPPORT_FALLBACK_FAQS,
  SUPPORT_FALLBACK_TOPICS,
} from "../../data/supportPage";

const CUSTOMER_SUPPORT_CATEGORIES = [
  { value: "ORDER_ISSUE", label: "Order Issue" },
  { value: "DELIVERY_ISSUE", label: "Delivery Issue" },
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "REFUND_RETURN_ISSUE", label: "Return & Refund" },
  { value: "PRODUCT_ISSUE", label: "Product Issue" },
  { value: "ACCOUNT_ISSUE", label: "Account Issue" },
  { value: "OTHER", label: "Other" },
];

const CUSTOMER_SUPPORT_INITIAL_FORM = {
  category: "ORDER_ISSUE",
  subject: "",
  message: "",
};

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
  const section = getSection(page, [
    "Common Question",
    "Common Questions",
  ]);

  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) {
    return mapCards(points);
  }

  const rootPoints = Array.isArray(page?.points) ? page.points : [];

  const questionPoints = rootPoints.filter((item) => item?.description);

  const bodySections = parseBodySections(page?.body);

  return mapCards(
    questionPoints.length ? questionPoints : bodySections,
  ).slice(0, 6);
}

function formatSupportCategory(category = "") {
  return String(category || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSupportDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeSupportQueries(result) {
  const items = Array.isArray(result?.items)
    ? result.items
    : Array.isArray(result)
      ? result
      : [];

  return items.map((item) => ({
    id: item.queryId || item.id,
    subject: item.subject || "Support request",
    category: item.category || "OTHER",
    categoryLabel: formatSupportCategory(item.category || "OTHER"),
    status: item.status || "pending",
    updatedAt: formatSupportDate(item.updatedAt || item.createdAt),
  }));
}

function SupportStatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const className =
    normalized === "resolved" || normalized === "closed"
      ? "bg-[#E8F8F5] text-[#117A65]"
      : normalized === "in_progress"
        ? "bg-[#EEF2FF] text-[#3E4093]"
        : "bg-[#FEF9E7] text-[#B7950B]";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${className}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}

export default function SupportHelpCenter() {
  const { page, loading } = useCmsRecord("support-center");

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const [selectedSupportCategory, setSelectedSupportCategory] =
    useState("");

  const [supportForm, setSupportForm] = useState(
    CUSTOMER_SUPPORT_INITIAL_FORM,
  );

  const [supportQueries, setSupportQueries] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportError, setSupportError] = useState("");

  const pageTitle = page?.title || "";
  const pageDescription = page?.description || page?.excerpt || "";

  const topics = useMemo(
    () => normalizeHelpTopics(page),
    [page],
  );

  const commonQuestions = useMemo(
    () => normalizeCommonQuestions(page),
    [page],
  );

  const isPageLoading = loading && !page;

  const faqData =
    commonQuestions.length > 0
      ? commonQuestions
      : SUPPORT_FALLBACK_FAQS;

  const quickActions =
    topics.length > 0
      ? topics.slice(0, 6)
      : SUPPORT_FALLBACK_TOPICS;

  const isSignedIn = Boolean(tokenStorage.getAccessToken());

  const loadSupportQueries = useCallback(async () => {
    if (!isSignedIn) {
      setSupportQueries([]);
      setSupportError("");
      return;
    }

    setSupportLoading(true);
    setSupportError("");

    try {
      const result = await apiRequest({
        method: "get",
        url: endpoints.support.queries,
        params: {
          limit: 5,
          ...(selectedSupportCategory
            ? { category: selectedSupportCategory }
            : {}),
        },
      });

      setSupportQueries(normalizeSupportQueries(result.data));
    } catch (error) {
      setSupportError(
        error?.message || "Unable to load support tickets.",
      );
    } finally {
      setSupportLoading(false);
    }
  }, [isSignedIn, selectedSupportCategory]);

  useEffect(() => {
    loadSupportQueries();
  }, [loadSupportQueries]);

  const handleSupportFieldChange = (event) => {
    const { name, value } = event.target;

    setSupportForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();

    if (!isSignedIn) {
      notify.info("Please login to chat with support.");
      return;
    }

    const subject = supportForm.subject.trim();
    const message = supportForm.message.trim();

    if (subject.length < 5) {
      notify.warning(
        "Please enter a subject with at least 5 characters.",
      );
      return;
    }

    if (message.length < 10) {
      notify.warning(
        "Please describe your issue in at least 10 characters.",
      );
      return;
    }

    setSupportSubmitting(true);

    try {
      await apiRequest({
        method: "post",
        url: endpoints.support.queries,
        data: {
          category: supportForm.category,
          subject,
          message,
          metadata: {
            source: "customer_support_center",
            channel: "chat",
          },
        },
      });

      notify.success("Support message sent successfully.");

      setSupportForm(CUSTOMER_SUPPORT_INITIAL_FORM);
      setSelectedSupportCategory("");

      await loadSupportQueries();
    } catch (error) {
      notify.error(
        error?.message || "Failed to send support message.",
      );
    } finally {
      setSupportSubmitting(false);
    }
  };

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
        <Breadcrumbs items={SUPPORT_BREADCRUMBS} />

        <div className="mb-7 mt-4 sm:mt-5">
          <h1 className="text-[26px] font-bold leading-tight text-[#3E4093] sm:text-[30px] lg:text-[32px]">
            Help & Support
          </h1>
        </div>

        {/* =====================================================
            MOBILE QUICK ACTIONS
            Separate from desktop grid
        ====================================================== */}
        {quickActions.length > 0 && (
          <section className="relative mb-5 md:hidden">
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

            {isQuickActionsOpen && (
              <nav className="absolute left-0 top-[calc(100%+6px)] z-30 flex w-full flex-col overflow-hidden rounded-[14px] border border-[#D7A522] bg-white shadow-lg">
                {quickActions.map((topic, index) => (
                  <Link
                    key={`${topic.title}-${index}`}
                    to={topic.path || "/contact"}
                    onClick={() => setIsQuickActionsOpen(false)}
                    className="flex w-full items-center gap-3 border-b border-[#04258626] p-2 text-[#2E2E2E] last:border-b-0"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC82E]">
                      <img
                        src={topic.image}
                        alt=""
                        className="size-5 object-contain"
                      />
                    </span>

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
        )}

        {/* =====================================================
            DESKTOP MAIN GRID
            Both columns start EXACTLY same row
        ====================================================== */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] items-start">

          {/* ================= LEFT COLUMN ================= */}
          <div className="min-w-0 space-y-5">

            {/* DESKTOP QUICK ACTIONS */}
            {quickActions.length > 0 && (
              <section className="hidden overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white md:block">
                <div className="bg-[#F7EED8] px-5 py-3">
                  <h2 className="text-[18px] font-bold text-[#2E2E2E]">
                    Quick Actions
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-5 py-5 lg:grid-cols-6">
                  {quickActions.map((topic, index) => (
                    <Link
                      key={`${topic.title}-${index}`}
                      to={topic.path || "/contact"}
                      className="group flex min-w-0 flex-col items-center text-center"
                    >
                      <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-[#F5C72E] transition-transform duration-200 group-hover:scale-105">
                        <img
                          src={topic.image}
                          alt={topic.title}
                          className="h-[40px] w-[40px] object-contain"
                        />
                      </div>

                      <span className="mt-2 max-w-[90px] text-[13px] font-semibold leading-[15px] text-[#2E2E2E]">
                        {topic.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            <section className="overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white">
              <div className="bg-[#F7EED8] px-5 py-3">
                <h2 className="text-[18px] font-bold text-[#2E2E2E]">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="px-5">
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
                          setOpenFaqIndex(
                            isOpen ? null : index,
                          )
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

          {/* ================= RIGHT COLUMN ================= */}
          <div className="min-w-0 self-start space-y-5">

            {/* SAME ROW AS QUICK ACTIONS */}
            <NeedHelpPanel
              title="Contact Support"
              items={SUPPORT_CONTACT_ITEMS}
              headerStyle="colored"
            />

            {/* CHAT WITH SUPPORT */}
            <section
              id="support-chat"
              className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white"
            >
              <div className="bg-[#F7EED8] px-5 py-4">
                <h2 className="text-lg font-bold text-[#2E2E2E]">
                  Chat With Support
                </h2>
              </div>

              <form
                onSubmit={handleSupportSubmit}
                className="space-y-4 px-5 py-5"
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
                    Category
                  </span>

                  <select
                    name="category"
                    value={supportForm.category}
                    onChange={handleSupportFieldChange}
                    className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-white px-3 text-sm text-[#2E2E2E] outline-none focus:border-[#3E4093]"
                  >
                    {CUSTOMER_SUPPORT_CATEGORIES.map(
                      (category) => (
                        <option
                          key={category.value}
                          value={category.value}
                        >
                          {category.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
                    Subject
                  </span>

                  <input
                    name="subject"
                    value={supportForm.subject}
                    onChange={handleSupportFieldChange}
                    placeholder="Example: Refund not received"
                    className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#9A9A9A] focus:border-[#3E4093]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
                    Message
                  </span>

                  <textarea
                    name="message"
                    value={supportForm.message}
                    onChange={handleSupportFieldChange}
                    rows={4}
                    placeholder="Write your issue here..."
                    className="w-full resize-none rounded-lg border border-[#E7D9B8] bg-white px-3 py-3 text-sm leading-5 text-[#2E2E2E] outline-none placeholder:text-[#9A9A9A] focus:border-[#3E4093]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={supportSubmitting}
                  className="h-11 w-full rounded-lg bg-[#3E4093] text-sm font-bold text-white transition hover:bg-[#303176] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {supportSubmitting
                    ? "Sending..."
                    : "Send Message"}
                </button>

                {!isSignedIn && (
                  <p className="text-center text-xs font-medium text-[#666666]">
                    Login is required to send a support message.
                  </p>
                )}
              </form>
            </section>

            {/* RECENT TICKETS */}
            <section className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white">
              <div className="flex items-center justify-between gap-3 bg-[#F7EED8] px-5 py-4">
                <h2 className="text-lg font-bold text-[#2E2E2E]">
                  Recent Tickets
                </h2>

                <select
                  value={selectedSupportCategory}
                  onChange={(event) =>
                    setSelectedSupportCategory(
                      event.target.value,
                    )
                  }
                  className="h-9 rounded-lg border border-[#E7D9B8] bg-white px-2 text-xs font-semibold text-[#2E2E2E] outline-none"
                >
                  <option value="">All</option>

                  {CUSTOMER_SUPPORT_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="divide-y divide-[#EFE5D2] px-5">
                {supportLoading && (
                  <p className="py-5 text-sm font-medium text-[#666666]">
                    Loading tickets...
                  </p>
                )}

                {!supportLoading && supportError && (
                  <p className="py-5 text-sm font-medium text-[#CB4335]">
                    {supportError}
                  </p>
                )}

                {!supportLoading &&
                  !supportError &&
                  supportQueries.length === 0 && (
                    <p className="py-5 text-sm font-medium text-[#666666]">
                      {isSignedIn
                        ? "No support tickets found."
                        : "Login to view your tickets."}
                    </p>
                  )}

                {!supportLoading &&
                  !supportError &&
                  supportQueries.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#1B1D60]">
                            {ticket.subject}
                          </p>

                          <p className="mt-1 text-xs font-medium text-[#666666]">
                            {ticket.id} ·{" "}
                            {ticket.categoryLabel} ·{" "}
                            {ticket.updatedAt}
                          </p>
                        </div>

                        <SupportStatusBadge
                          status={ticket.status}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}