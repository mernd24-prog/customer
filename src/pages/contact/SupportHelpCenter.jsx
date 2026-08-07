import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronDown } from "lucide-react";
import BaseModal from "../../components/common/overlay/BaseModal";
import CustomDropdown from "../../components/ui/CustomDropdown";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import NeedHelpPanel from "../../components/ecommerce/NeedHelpPanel";
import StickySidebarLayout from "../../components/common/layouts/StickySidebarLayout";
import SupportTicketSidebar from "./components/SupportTicketSidebar";
import { SUPPORT_PAGE_SKELETON } from "../../components/common/skeleton/layouts";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import { apiRequest } from "../../api/client";
import { endpoints } from "../../api/endpoints";
import { notify } from "../../utils/notify";
import { useAuthModal } from "../../context/AuthModalContext";
import { useSelector } from "react-redux";
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
    message: item.message || "",
    category: item.category || "OTHER",
    categoryLabel: formatSupportCategory(item.category || "OTHER"),
    status: item.status || "pending",
    createdAt: formatSupportDate(item.createdAt),
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
  const { openAuthModal } = useAuthModal();
  const user = useSelector((state) => state.auth.current);

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const [selectedSupportCategory, setSelectedSupportCategory] = useState("");

  const [supportForm, setSupportForm] = useState(CUSTOMER_SUPPORT_INITIAL_FORM);

  const [supportQueries, setSupportQueries] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [helpPanelExpandedIndex, setHelpPanelExpandedIndex] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);

  const pageTitle = page?.title || "";
  const pageDescription = page?.description || page?.excerpt || "";

  const topics = useMemo(() => normalizeHelpTopics(page), [page]);

  const commonQuestions = useMemo(() => normalizeCommonQuestions(page), [page]);

  const isPageLoading = loading && !page;

  const faqData =
    commonQuestions.length > 0 ? commonQuestions : SUPPORT_FALLBACK_FAQS;

  const quickActions =
    topics.length > 0 ? topics.slice(0, 6) : SUPPORT_FALLBACK_TOPICS;

  const isSignedIn = Boolean(user);

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
      setSupportError(error?.message || "Unable to load support tickets.");
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
  notify.error("Please login to raise a support ticket.");
  return;
}

    const subject = supportForm.subject.trim();
    const message = supportForm.message.trim();

    if (subject.length < 5) {
      notify.warning("Please enter a subject with at least 5 characters.");
      return;
    }

    if (message.length < 10) {
      notify.warning("Please describe your issue in at least 10 characters.");
      return;
    }

    setSupportSubmitting(true);

    try {
      const response = await apiRequest({
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

      const ticketId = response?.data?.queryId || response?.data?.id || "";
      setSubmittedTicketId(ticketId);

      setSupportForm(CUSTOMER_SUPPORT_INITIAL_FORM);
      setSelectedSupportCategory("");
      setHelpPanelExpandedIndex(null);
      setShowRaiseTicketModal(false);
      setShowSuccessModal(true);

      await loadSupportQueries();
    } catch (error) {
      notify.error(error?.message || "Failed to send support message.");
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

        <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
          <Breadcrumbs items={SUPPORT_BREADCRUMBS} />
          <div className="mb-7 mt-4 sm:mt-5">
            <h1 className="text-[26px] font-bold leading-tight text-[#3E4093] sm:text-[30px] lg:text-[32px]">
              {pageTitle || "Help & Support"}
            </h1>
          </div>

          <ApiState
            loading={isPageLoading}
            empty={!isPageLoading && !page}
            emptyTitle="Customer Support"
            emptyText="Help topics and support options will appear here."
            skeletonLayout={SUPPORT_PAGE_SKELETON}
            skeletonContainerClass="w-full"
          />
        </main>
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
              onClick={() => setIsQuickActionsOpen((open) => !open)}
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
        <StickySidebarLayout
          sidebarPosition="right"
          containerClass="flex flex-col md:flex-row gap-5 items-start"
          sidebarClass="w-full md:w-[280px] lg:w-[320px] xl:w-[340px]"
          mainContent={
            <div className="min-w-0 space-y-5">
              {/* DESKTOP QUICK ACTIONS */}
              {quickActions.length > 0 && (
                <section className="hidden overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white md:block">
                  <div className="bg-[#F7EED8] px-5  py-3">
                    <h2 className="text-[18px] font-bold text-[#2E2E2E]">
                      Quick Actions
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-5  py-5 lg:grid-cols-5">
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
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
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
          }
          sidebarContent={
            <div className="min-w-0 self-start space-y-5">
              {/* SAME ROW AS QUICK ACTIONS */}
              <NeedHelpPanel
                title="Contact Support"
                expandedIndex={helpPanelExpandedIndex}
                onExpandedIndexChange={setHelpPanelExpandedIndex}
                items={SUPPORT_CONTACT_ITEMS.map((item) => {
                  if (item.title === "Raise a Ticket") {
                    return {
                      ...item,
                      onClick: () => {
                        if (!user) {
                          openAuthModal();
                        } else {
                          setShowRaiseTicketModal(true);
                        }
                      },
                    };
                  }
                  return item;
                })}
                headerStyle="colored"
              />

              {/* RECENT TICKETS */}
              <section className="rounded-xl border border-[#E7D9B8] bg-white">
                <div className="flex items-center justify-between gap-3 rounded-t-[11px] bg-[#F7EED8] px-5 py-4">
                  <h2 className="text-lg font-bold text-[#2E2E2E]">
                    Recent Tickets
                  </h2>

                  <CustomDropdown
                    className="w-[190px]"
                    buttonClassName="h-10 rounded-[10px] border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA]"
                    options={[
                      { value: "", label: "All" },
                      ...CUSTOMER_SUPPORT_CATEGORIES,
                    ]}
                    value={selectedSupportCategory}
                    onChange={(val) => setSelectedSupportCategory(val)}
                    placeholder="All"
                  />
                </div>

                <div className="divide-y divide-[#EFE5D2] px-5 max-h-[225px] overflow-y-auto custom-scrollbar">
                  {supportLoading && (
                    <p className="py-5 text-sm font-medium text-[#666666]">
                      Loading Tickets...
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
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="w-full py-4 text-left  transition-colors cursor-pointer px-2 -mx-2 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className=" text-sm font-bold text-[#1B1D60] truncate">
                              {ticket.subject}
                            </p>

                            <p className="mt-1 text-xs font-medium text-[#666666] truncate">
                              {ticket.categoryLabel} · {ticket.updatedAt}
                            </p>
                          </div>

                          <SupportStatusBadge status={ticket.status} />
                        </div>
                      </button>
                    ))}
                </div>
              </section>
            </div>
          }
        />{" "}
      </main>

      {showRaiseTicketModal && (
        <BaseModal
          onClose={() => setShowRaiseTicketModal(false)}
          maxWidth="max-w-md"
        >
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#1B1D60] mb-5">
              Raise a Ticket
            </h3>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <CustomDropdown
                label="Category"
                options={CUSTOMER_SUPPORT_CATEGORIES}
                value={supportForm.category}
                onChange={(val) =>
                  setSupportForm((prev) => ({
                    ...prev,
                    category: val,
                  }))
                }
                placeholder="Select Category"
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
                  Subject
                </span>

                <input
                  name="subject"
                  value={supportForm.subject}
                  onChange={handleSupportFieldChange}
                  placeholder="Example: Refund Not Received"
                  className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-white px-3 text-sm text-[#2E2E2E] focus:outline-none placeholder:text-[#9A9A9A] focus:border-[#CE9F2D]"
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
                  placeholder="Write Your Issue Here..."
                  className="w-full resize-none rounded-lg border border-[#E7D9B8] bg-white px-3 py-3 text-sm leading-5 text-[#2E2E2E] placeholder:text-[#9A9A9A] focus:border-[#CE9F2D] focus:outline-none focus:ring-0 focus:shadow-none"
                />
              </label>

              <button
                type="submit"
                disabled={supportSubmitting}
                className="h-11 w-full rounded-lg bg-[#CE9F2D] text-sm font-bold text-white transition hover:bg-[#C9961F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {supportSubmitting ? "Sending..." : "Send Message"}
              </button>

              {!isSignedIn && (
                <p className="text-center text-xs font-medium text-[#666666]">
                  Login Is Required to Send a Support Message.
                </p>
              )}
            </form>
          </div>
        </BaseModal>
      )}

      {showSuccessModal && (
        <BaseModal
          onClose={() => setShowSuccessModal(false)}
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8F5] text-[#117A65] mb-5">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-bold text-[#1B1D60] mb-2">
              Ticket Raised Successfully!
            </h3>

            <p className="text-sm text-[#4E4E4E] leading-relaxed mb-6">
              Thank you for contacting us. Your ticket has been logged and our
              support team will get back to you shortly.
              {submittedTicketId && (
                <span className="block mt-2 font-semibold text-[#3E4093]">
                  Ticket ID: #{submittedTicketId}
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full h-11 rounded-lg bg-[#CE9F2D] text-sm font-bold text-white transition hover:bg-[#C9961F] active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </BaseModal>
      )}

      <SupportTicketSidebar
        isOpen={!!selectedTicket}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </>
  );
}
