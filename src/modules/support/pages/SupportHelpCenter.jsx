import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  Phone,
  Mail,
  Ticket,
} from "lucide-react";
import CustomDropdown from "../../../components/ui/CustomDropdown";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import NeedHelpPanel from "../components/NeedHelpPanel";
import StickySidebarLayout from "../../../components/ui/layout/StickySidebarLayout";
import { useSupportController } from "../controllers/useSupportController";
import { SUPPORT_PAGE_SKELETON } from "../../../components/ui/skeleton/layouts";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import { SkeletonLoader } from "../../../components/ui/skeleton";
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import { useAuthModal } from "../../auth/context/AuthModalContext";
import { useSelector } from "react-redux";

const DEFAULT_BREADCRUMBS = [
  { label: "Home", href: "/" },
  { label: "Help & Support" },
];

const CUSTOMER_SUPPORT_CATEGORIES = [
  { value: "ORDER_ISSUE", label: "Order Issue" },
  { value: "DELIVERY_ISSUE", label: "Delivery Issue" },
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "REFUND_RETURN_ISSUE", label: "Return & Refund" },
  { value: "PRODUCT_ISSUE", label: "Product Issue" },
  { value: "ACCOUNT_ISSUE", label: "Account Issue" },
  { value: "OTHER", label: "Other" },
];

import {
  normalizeHelpTopics,
  normalizeCommonQuestions,
  normalizeContactSupport,
  normalizeSupportQueries,
} from "../utils/supportUtils";

function SupportStatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const className =
    normalized === "resolved" || normalized === "closed"
      ? "border border-emerald-300/60 bg-emerald-50 text-emerald-700"
      : normalized === "in_progress"
        ? "border border-sky-300/60 bg-sky-50 text-sky-700"
        : "border border-amber-300/60 bg-amber-50 text-amber-800";

  return (
    <span
      className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-semibold leading-none capitalize ${className}`}
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
  const [helpPanelExpandedIndex, setHelpPanelExpandedIndex] = useState(null);

  const {
    supportQueries,
    supportLoading,
    supportError,
    loadSupportQueries,
    handleOpenRaiseTicketModal,
  } = useSupportController();

  const pageTitle = page?.title || "";
  const pageDescription = page?.description || page?.excerpt || "";

  const topics = useMemo(() => normalizeHelpTopics(page), [page]);

  const commonQuestions = useMemo(() => normalizeCommonQuestions(page), [page]);

  const contactItems = useMemo(
    () => normalizeContactSupport(page, { Phone, Mail, Ticket }),
    [page]
  );

  const breadcrumbs = useMemo(() => {
    if (Array.isArray(page?.seo?.breadcrumbs) && page.seo.breadcrumbs.length > 0) {
      return page.seo.breadcrumbs.map((b) => ({
        label: b.label,
        href: b.url || b.href,
      }));
    }
    return DEFAULT_BREADCRUMBS;
  }, [page]);

  const isPageLoading = loading && !page;

  const faqData = commonQuestions;
  const quickActions = topics;
  const contactSupportData = contactItems;

  const isSignedIn = Boolean(user);

  useEffect(() => {
    if (isSignedIn) {
      loadSupportQueries(selectedSupportCategory);
    }
  }, [loadSupportQueries, isSignedIn, selectedSupportCategory]);

  // Form state and submission are now isolated in RaiseTicketModal

  if (isPageLoading) {
    return (
      <>
        <Seo
          title={`${pageTitle || "Customer Support"} | Sam Global`}
          description={pageDescription}
        />

        <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
          <Breadcrumbs items={breadcrumbs} />
          {/* <div className="mb-7 mt-4 sm:mt-5">
            <h1 className="text-[26px] font-bold leading-tight text-[#3E4093] sm:text-[30px] lg:text-[32px]">
              {pageTitle || "Help & Support"}
            </h1>
          </div> */}

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
    <AppErrorBoundary>
      <Seo
        title={`${pageTitle || "Customer Support"} | Sam Global`}
        description={pageDescription}
      />

      <main className="main-container  sm:px-6 sm:py-6 lg:px-0 lg:py-8">
        <Breadcrumbs items={breadcrumbs} />
        {/* <div className="mb-7 mt-4 sm:mt-5">
          <h1 className="text-[26px] font-bold leading-tight text-[#3E4093] sm:text-[30px] lg:text-[32px]">
            {pageTitle || "Help & Support"}
          </h1>
        </div> */}
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
                    to={topic.path || "/contact-us"}
                    onClick={() => setIsQuickActionsOpen(false)}
                    className="flex w-full items-center gap-3 border-b border-[#04258626] p-2 text-[#2E2E2E] last:border-b-0"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC82E]">
                      <img
                        loading="lazy"
                        width="400"
                        height="400"
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
              {/* AI Support Assistant Banner */}
              <section className="mt-5 relative overflow-hidden rounded-xl border border-[#1B1D60]/10 bg-[#17145F] p-5 sm:p-6 text-white shadow-sm">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#efc75f] backdrop-blur-sm">
                      <Sparkles size={20} className="text-[#efc75f]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                          Instant AI Help Assistant
                        </h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          24/7 Live
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-200 leading-relaxed max-w-xl">
                        Have a question about your order, returns, or store
                        policies? Ask our AI assistant for instant, grounded
                        answers.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-ai-chat"));
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#CE9F2D] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#B88B22] active:bg-[#A3781A] shadow-xs cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>Ask AI Now</span>
                  </button>
                </div>
              </section>

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
                        to={topic.path || "/contact-us"}
                        className="group flex min-w-0 flex-col items-center text-center"
                      >
                        <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-[#F5C72E] transition-transform duration-200 group-hover:scale-105">
                          <img
                            loading="lazy"
                            width="400"
                            height="400"
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
              {faqData.length > 0 && (
                <section className="overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white">
                  <div className="bg-[#F7EED8] px-5 py-3">
                    <h2 className="text-[18px] font-bold text-[#2E2E2E]">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="px-5">
                    {faqData.slice(0, 10).map((faq, index) => {
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
              )}
            </div>
          }
          sidebarContent={
            <div className="min-w-0 self-start space-y-5">
              {/* SAME ROW AS QUICK ACTIONS */}
              {contactSupportData.length > 0 && (
                <NeedHelpPanel
                  title="Contact Support"
                  expandedIndex={helpPanelExpandedIndex}
                  onExpandedIndexChange={setHelpPanelExpandedIndex}
                  items={contactSupportData.map((item) => {
                    const titleLower = (item.title || "").toLowerCase();
                    const pathLower = (item.path || "").toLowerCase();
                    const isTicket =
                      titleLower.includes("ticket") ||
                      pathLower.includes("ticket") ||
                      item.description?.toLowerCase().includes("ticket");

                    if (isTicket) {
                      return {
                        ...item,
                        onClick: () => {
                          if (!user) {
                            openAuthModal();
                          } else {
                            handleOpenRaiseTicketModal();
                          }
                        },
                      };
                    }
                    return item;
                  })}
                  headerStyle="colored"
                />
              )}
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
                    <div className="py-5">
                      <SkeletonLoader
                        count={3}
                        layout={[
                          { type: "box", width: "100%", height: "24px" },
                          {
                            type: "box",
                            width: "60%",
                            height: "16px",
                            className: "mt-2",
                          },
                        ]}
                        wrapperClass="mb-4"
                      />
                    </div>
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
                      <Link
                        key={ticket.id}
                        to={`/support/tickets/${encodeURIComponent(ticket.id)}`}
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
                      </Link>
                    ))}
                </div>
              </section>
            </div>
          }
        />{" "}
      </main>
    </AppErrorBoundary>
  );
}
