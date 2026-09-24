import { useMemo } from "react";

import FAQContentSection from "../../components/faq/FAQContentSection";
import ApiState from "../../components/ui/ApiState";
import { SKELETON_PRESETS } from "../../components/ui/skeleton/skeletonPresets";
import AppErrorBoundary from "../../components/ui/AppErrorBoundary";
import Breadcrumbs from "../../modules/common/components/Breadcrumbs";
import PageContainer from "../../components/ui/layout/PageContainer";

import { useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_CMS_DATA } from "../../data/fallbackCmsData";

const FALLBACK_FAQ_TITLE =
  "Frequently Asked Questions";

const FALLBACK_FAQ_DESCRIPTION =
  "Everything you need to know about shopping, orders, payments, returns, and more.";

const DEFAULT_BREADCRUMBS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "FAQ",
  },
];

export default function FAQPage() {
  const {
    page: cmsPage,
    loading: cmsLoading,
    error: cmsError,
  } = useCmsRecord("faq-details");

  const faqCmsData =
    cmsPage || FALLBACK_CMS_DATA?.faq;

  const faqs = useMemo(() => {
    const sections =
      faqCmsData?.sections?.filter(
        (section) =>
          section?.type === "faq-category",
      ) || [];

    return sections.flatMap(
      (section, sectionIndex) => {
        const topic =
          section?.title || "FAQ";

        return (section?.points || [])
          .filter(
            (point) =>
              point?.title ||
              point?.description,
          )
          .map((point, pointIndex) => ({
            cmsKey:
              point?.cmsKey ||
              `faq-${sectionIndex}-${pointIndex}`,
            topic,
            question:
              point?.title || "",
            answer:
              point?.description || "",
          }));
      },
    );
  }, [faqCmsData]);

  /*
   * CMS data has priority.
   */
  const faqTitle =
    cmsPage?.title ||
    cmsPage?.metadata?.data?.title ||
    faqCmsData?.title ||
    FALLBACK_FAQ_TITLE;

  const faqDescription =
    cmsPage?.description ||
    cmsPage?.metadata?.data?.description ||
    faqCmsData?.description ||
    faqCmsData?.excerpt ||
    FALLBACK_FAQ_DESCRIPTION;

  return (
    <AppErrorBoundary>
      <PageContainer>
        {/* Breadcrumbs - same as Policies */}
        <Breadcrumbs
          items={DEFAULT_BREADCRUMBS}
          className="mb-6 flex flex-wrap items-center gap-[10px] sm:mb-8 sm:gap-[12px] lg:gap-[15px]"
        />

        <ApiState
          loading={cmsLoading && !cmsPage}
          error={cmsPage ? cmsError : null}
          empty={false}
          emptyTitle="FAQ Not Found"
          emptyText="Check back later for answers to frequently asked questions."
          skeletonLayout={SKELETON_PRESETS.POLICY_PAGE}
        >
          {/* FAQ Hero - same height/style as Policies,
              but text aligned left */}
          <section className="relative overflow-hidden bg-[#211B73] py-10 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  {faqTitle}
                </h1>

                {faqDescription && (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
                    {faqDescription}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* FAQ Content - same spacing as Policies */}
          <section className="py-8 md:py-10">
            <div className="mx-auto max-w-6xl">
              <FAQContentSection faqs={faqs} />
            </div>
          </section>
        </ApiState>
      </PageContainer>
    </AppErrorBoundary>
  );
}
