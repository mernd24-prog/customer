import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Sparkles,
  MessageSquare,
  Phone,
  Mail,
  Ticket,
} from "lucide-react";
import { useSelector } from "react-redux";

import CustomDropdown from "../../../components/ui/CustomDropdown";
import Seo from "../../../components/ui/Seo";
import PageIntroBanner from "../../../components/ui/PageIntroBanner";
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
import FAQContentSection from "../../../components/faq/FAQContentSection";
import {
  FALLBACK_SUPPORT,
  FALLBACK_CMS_DATA,
} from "../../../data/fallbackCmsData";
import {
  normalizeHelpTopics,
  normalizeContactSupport,
} from "../utils/supportUtils";

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
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold leading-none capitalize ${className}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}

export default function SupportHelpCenter() {
  const {
    page: supportPageData,
    loading: supportPageLoading,
    error: supportPageError,
  } = useCmsRecord("support-center");

  // Use the same FAQ CMS record as FAQPage.
  const {
    page: faqCmsPage,
    loading: faqLoading,
    error: faqError,
  } = useCmsRecord("faq-details");

  const { openAuthModal } = useAuthModal();
  const user = useSelector((state) => state.auth.current);

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

  // Prefer CMS data and use centralized fallback data when unavailable.
  const supportPage = supportPageData || FALLBACK_SUPPORT;

  const pageTitle = supportPage?.title || "Help & Support";

  const pageDescription =
    supportPage?.description || supportPage?.excerpt || "";

  const topics = useMemo(() => normalizeHelpTopics(supportPage), [supportPage]);

  const contactItems = useMemo(
    () => normalizeContactSupport(supportPage, { Phone, Mail, Ticket }),
    [supportPage],
  );

  // Normalize FAQ data into the structure expected by FAQContentSection.
  const faqCmsData = faqCmsPage || FALLBACK_CMS_DATA?.faq;

  const faqs = useMemo(() => {
    const sections =
      faqCmsData?.sections?.filter(
        (section) => section?.type === "faq-category",
      ) || [];

    return sections.flatMap((section, sectionIndex) => {
      const topic = section?.title || "FAQ";

      return (section?.points || [])
        .filter((point) => point?.title || point?.description)
        .map((point, pointIndex) => ({
          cmsKey: point?.cmsKey || `faq-${sectionIndex}-${pointIndex}`,
          topic,
          question: point?.title || "",
          answer: point?.description || "",
        }));
    });
  }, [faqCmsData]);

  const breadcrumbs = useMemo(() => {
    if (
      Array.isArray(supportPage?.seo?.breadcrumbs) &&
      supportPage.seo.breadcrumbs.length > 0
    ) {
      return supportPage.seo.breadcrumbs.map((breadcrumb) => ({
        label: breadcrumb.label,
        href: breadcrumb.url || breadcrumb.href,
      }));
    }

    return DEFAULT_BREADCRUMBS;
  }, [supportPage]);

  const isPageLoading = supportPageLoading && !supportPageData;
  const quickActions = topics;
  const contactSupportData = contactItems;
  const isSignedIn = Boolean(user);

  useEffect(() => {
    if (isSignedIn) {
      loadSupportQueries(selectedSupportCategory);
    }
  }, [loadSupportQueries, isSignedIn, selectedSupportCategory]);

  if (isPageLoading) {
    return (
      <>
        <Seo
          title={`${pageTitle} | Sam Global`}
          description={pageDescription}
        />

        <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
          <Breadcrumbs items={breadcrumbs} />

          <ApiState
            loading={isPageLoading}
            error={supportPageError}
            empty={!isPageLoading && !supportPageData}
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
      <Seo title={`${pageTitle} | Sam Global`} description={pageDescription} />

      <main className="main-container px-0 pb-6 pt-0  sm:pb-6 sm:pt-0 lg:px-0 lg:pb-8">
        <PageIntroBanner title={pageTitle} description={pageDescription} />

        {/* Mobile Quick Actions - Vertical List */}
        {quickActions.length > 0 && (
          <section className="mb-5  md:hidden ">
           <div className="mb-2 pt-3 pb-1 lg:mb-3 lg:py-2">
              <h2 className="text-base font-bold text-[#1B1D60]">
                Quick Actions
              </h2>
              <p className="text-xs text-[#666666]">
                Quickly find what you are looking for.
              </p>
            </div>

            <nav className="flex flex-col gap-1.5">
              {quickActions.map((topic, index) => (
                <Link
                  key={`${topic.title}-${index}`}
                  to={topic.path || "/contact-us"}
                  className="group flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-[#E5E8F0] bg-white p-2.5 transition-colors duration-200 hover:border-[#D4A12F] hover:bg-[#FFFAEF]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF5DF]">
                    <img
                      loading="lazy"
                      src={topic.image}
                      alt=""
                      className="size-6 object-contain"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-5 text-[#1B1D60]">
                      {topic.title}
                    </span>

                    {topic.description && (
                      <span className="mt-0.5 block text-xs leading-4 text-[#666666]">
                        {topic.description}
                      </span>
                    )}
                  </span>

                  <ChevronDown className="size-4 shrink-0 -rotate-90 text-[#8A8FA3] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#D4A12F]" />
                </Link>
              ))}
            </nav>
          </section>
        )}

        <StickySidebarLayout
          sidebarPosition="right"
          containerClass="flex flex-col md:flex-row gap-3 lg:gap-5 items-start"
          sidebarClass="w-full md:w-[280px] lg:w-[320px] xl:w-[340px]"
          mainContent={
            <div className="min-w-0 space-y-3 pt-2 lg:space-y-5 lg:pt-5">
              {/* Desktop Quick Actions */}
              {quickActions.length > 0 && (
                <section className=" hidden overflow-hidden rounded-lg border border-[#E7D9B8] bg-white md:block">
                  <div className="bg-[#F7EED8]  py-3">
                    <h2 className=" px-2 text-[18px] font-bold text-[#2E2E2E]">
                      Quick Actions
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-5 py-5 lg:grid-cols-5">
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

                        <span className="mt-2 max-w-[90px] text-sm font-semibold leading-[15px] text-[#2E2E2E]">
                          {topic.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ Loading State */}
              {faqLoading && !faqCmsPage && (
                <section className="overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white">
                  <div className="bg-[#F7EED8] px-5 py-3">
                    <h2 className="text-[18px] font-bold text-[#2E2E2E]">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="px-5 py-5">
                    <SkeletonLoader
                      count={5}
                      layout={[
                        {
                          type: "box",
                          width: "100%",
                          height: "24px",
                        },
                      ]}
                      wrapperClass="mb-4"
                    />
                  </div>
                </section>
              )}

              {/* FAQ Content */}
              {!faqLoading && faqs.length > 0 && (
                <FAQContentSection faqs={faqs} />
              )}

              {/* Empty FAQ State */}
              {!faqLoading && !faqError && faqs.length === 0 && (
                <section className="overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white">
                  <div className="bg-[#F7EED8] px-5 py-3">
                    <h2 className="text-[18px] font-bold text-[#2E2E2E]">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="px-5 py-6">
                    <p className="text-sm text-[#666666]">
                      No frequently asked questions are available.
                    </p>
                  </div>
                </section>
              )}
            </div>
          }
          sidebarContent={
            <div className="min-w-0 self-start space-y-3 py-3 lg:space-y-5 lg:py-5">
              {/* Contact Support */}
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

              {/* Recent Tickets */}
              <section className="rounded-lg border border-[#E7D9B8] bg-white">
                <div className="flex items-center justify-between gap-3 rounded-t-lg bg-[#F7EED8] px-5 py-4">
                  <h2 className="text-lg font-bold text-[#2E2E2E]">
                    Recent Tickets
                  </h2>

                  <CustomDropdown
                    className="w-[155px]"
                    buttonClassName="h-10 rounded-lg border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA]"
                    options={[
                      { value: "", label: "All" },
                      ...CUSTOMER_SUPPORT_CATEGORIES,
                    ]}
                    value={selectedSupportCategory}
                    onChange={setSelectedSupportCategory}
                    placeholder="All"
                  />
                </div>

                <div className="custom-scrollbar max-h-[225px] divide-y divide-[#EFE5D2] overflow-y-auto px-5">
                  {supportLoading && (
                    <div className="py-5">
                      <SkeletonLoader
                        count={3}
                        layout={[
                          {
                            type: "box",
                            width: "100%",
                            height: "24px",
                          },
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
                        className="w-full cursor-pointer rounded-lg px-2 py-4 text-left transition-colors"
                      >
                        <div className="d flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#1B1D60]">
                              {ticket.subject}
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-[#666666]">
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
        />
      </main>
    </AppErrorBoundary>
  );
}
