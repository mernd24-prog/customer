import { useMemo } from "react";

import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import ApiState from "../../components/ui/ApiState";
import AppErrorBoundary from "../../components/ui/AppErrorBoundary";

import { useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_CMS_DATA } from "../../data/fallbackCmsData";

export default function FAQPage() {
  const { page: faqPage, loading, error } =
    useCmsRecord("faq-details");

  const faqCmsData = faqPage || FALLBACK_CMS_DATA.faq;

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
          cmsKey:
            point?.cmsKey ||
            `faq-${sectionIndex}-${pointIndex}`,
          topic,
          question: point?.title || "",
          answer: point?.description || "",
        }));
    });
  }, [faqCmsData]);

  return (
    <AppErrorBoundary>
      <ApiState
        loading={loading && !faqPage}
        error={faqPage ? error : null}
        empty={false}
        emptyTitle="FAQ Not Found"
        emptyText="Check back later for answers to frequently asked questions."
      >
        <FAQHeroSection
          eyebrow={
            faqCmsData?.eyebrow ||
            faqCmsData?.excerpt ||
            "Everything You Need To Know"
          }
          title={
            faqCmsData?.title ||
            "Frequently Asked Questions"
          }
          description={faqCmsData?.description || ""}
        />

        {/* Keep spacing between hero and FAQ content */}
        <div className="mt-16">
          <FAQContentSection faqs={faqs} />
        </div>
      </ApiState>
    </AppErrorBoundary>
  );
}