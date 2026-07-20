import { useMemo } from "react";

import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";

import { useCmsRecord } from "../../hooks/useCmsRecord";

export default function FAQPage() {
  const { page: faqPage } = useCmsRecord("faq-details");

  const faqCmsData = faqPage || {};

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
    <>
      {/* <Seo title={seoTitle} description={seoDescription} /> */}

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
    </>
  );
}
