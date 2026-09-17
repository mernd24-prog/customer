import { useMemo } from "react";

import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import ApiState from "../../components/ui/ApiState";
import AppErrorBoundary from "../../components/ui/AppErrorBoundary";

import { useCmsRecord } from "../../hooks/useCmsRecord";

const FALLBACK_FAQ_PAGE = {
  title: "Frequently Asked Questions",
  description: "Helpful answers for shopping, orders, delivery, and payments.",
  sections: [
    { type: "faq-category", title: "Orders", points: [
      { title: "How do I track my order?", description: "Open My Orders to view the latest delivery status." },
      { title: "How do I cancel an order?", description: "You can cancel an eligible order from My Orders before it is shipped." },
    ] },
    { type: "faq-category", title: "Returns", points: [
      { title: "When will I receive my refund?", description: "Refunds are processed after the returned item is received and inspected." },
    ] },
  ],
};

export default function FAQPage() {
  const { page: faqPage, loading, error } = useCmsRecord("faq-details");

  const faqCmsData = faqPage || FALLBACK_FAQ_PAGE;

  const faqs = useMemo(() => {
    const sections =
      faqCmsData?.sections?.filter(
        (section) => section.type === "faq-category",
      ) || [];

    return sections.flatMap((section, sectionIndex) => {
      const topic = section.title || "FAQ";

      return (section.points || []).map((point, pointIndex) => ({
        cmsKey: point.cmsKey || `faq-${sectionIndex}-${pointIndex}`,
        topic,
        question: point.title,
        answer: point.description,
      }));
    });
  }, [faqCmsData]);

  return (
    <AppErrorBoundary>
      <ApiState
        loading={loading && !faqPage}
        error={error}
        empty={false}
        emptyTitle="FAQ Not Found"
        emptyText="Check back later for answers to frequently asked questions."
      >
        <FAQHeroSection
        eyebrow={faqCmsData?.eyebrow}
        title={faqCmsData?.title}
        description={faqCmsData?.description}
      />

      <div className="mx-auto my-16">
        <h1 className="mt-10 text-center text-3xl font-bold uppercase">
          Everything You Need To Know
        </h1>

        <p className="mx-auto text-center my-4 max-w-2xl">
          {faqCmsData?.description}
        </p>
      </div>

      <FAQContentSection faqs={faqs} />
      </ApiState>
    </AppErrorBoundary>
  );
}
