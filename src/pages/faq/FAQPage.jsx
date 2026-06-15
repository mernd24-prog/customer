import { useMemo, useState } from "react";

import Seo from "../../components/common/Seo";
import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import FAQSearchSection from "../../components/faq/FAQSearchBar";
import NeedHelpSection from "../../components/faq/NeedHelpSection";

import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";

export default function FAQPage() {
  const { page: faqPage } = useCmsRecord("faq-details");

  console.log("Details of the FAQ", faqPage);
  const [searchQuery, setSearchQuery] = useState("");

  const faqCmsData = useMemo(() => {
    return getCmsPayload(faqPage, null);
  }, [faqPage]);

  const faqs = useMemo(() => {
    const sections = faqCmsData?.sections || [];

    return sections.flatMap((section, sectionIndex) => {
      const topic = section?.title || "FAQ";

      const points = Array.isArray(section?.points) ? section.points : [];

      return points
        .map((point, pointIndex) => ({
          cmsKey: point?.cmsKey || `faq-${sectionIndex}-${pointIndex}`,
          topic,
          question: point?.title || "",
          answer: point?.description || "",
        }))
        .filter((item) => item.question && item.answer);
    });
  }, [faqCmsData]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.topic.toLowerCase().includes(query),
    );
  }, [faqs, searchQuery]);

  const title = faqCmsData?.title || "Frequently Asked Questions";

  const description =
    faqCmsData?.description || "Quick answers for common shopping questions.";

  const excerpt = faqCmsData?.excerpt || "FAQ";

  const ctaText = faqCmsData?.cta?.label || "Contact Support";

  const seoTitle = faqCmsData?.seo?.metaTitle || title;

  const seoDescription = faqCmsData?.seo?.metaDescription || description;

  const needHelpSection = faqCmsData?.sections?.find((section) =>
    section?.title?.toLowerCase().includes("need more help"),
  );

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} />

      <FAQHeroSection
        eyebrow={faqCmsData?.eyebrow}
        title={title}
        description={description}
        image={faqCmsData?.heroImage || faqCmsData?.coverImage}
      />

      <h1 className="mt-10 text-center text-3xl font-bold uppercase">
        {excerpt}
      </h1>

      <FAQSearchSection
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <FAQContentSection faqs={filteredFaqs} />

      <NeedHelpSection
        heading1={needHelpSection?.title || "Need More Help?"}
        description={
          needHelpSection?.description ||
          "Get the help you need from our automated assistant, or contact an agent"
        }
        buttonText={ctaText}
      />
    </>
  );
}
