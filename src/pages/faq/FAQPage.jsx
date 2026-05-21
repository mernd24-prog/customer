import { useMemo } from "react";

import Seo from "../../components/common/Seo";
import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import FAQSearchSection from "../../components/faq/FAQSearchBar";
import NeedHelpSection from "../../components/faq/NeedHelpSection";

import {
  useCmsRecord,
  getCmsPayload,
} from "../../hooks/useCmsRecord";

export default function FAQPage() {
  // Fetch FAQ CMS Page By Slug
  const { page: faqPage } = useCmsRecord("faq");

  const faqCmsData = useMemo(
    () => getCmsPayload(faqPage, null),
    [faqPage]
  );

  // FAQ Questions
  const faqs = useMemo(() => {
  const sections =
    faqPage?.data?.sections ||
    faqCmsData?.sections ||
    [];

  return sections.flatMap(
    (section, sectionIndex) => {
      const topic =
        section?.title || "FAQ'S";

      const points = Array.isArray(
        section?.points
      )
        ? section.points
        : [];

      return points
        .map((point, pointIndex) => ({
          cmsKey:
            point?.cmsKey ||
            `faq-${sectionIndex}-${pointIndex}`,

          topic,

          question:
            point?.title || "",

          answer:
            point?.description || "",
        }))
        .filter(
          (item) =>
            item.question &&
            item.answer
        );
    }
  );
}, [faqPage, faqCmsData]);

  const title =
    faqCmsData?.title ||
    "Frequently Asked Questions";

  const description =
    faqCmsData?.description ||
    "Quick answers for common shopping questions.";
  const ctaText = "Contact Support";

  const seoTitle =
    faqPage?.metadata?.seoTitle ||
    title;

  const seoDescription =
    faqPage?.metadata?.seoDescription ||
    description;



  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
      />

      <FAQHeroSection
        eyebrow={faqCmsData?.eyebrow}
        title={title}
        description={description}
      />

      <h1 className="text-3xl font-bold text-center mt-10 uppercase">
         {faqPage?.excerpt}
      </h1>

      <FAQSearchSection />

      <FAQContentSection faqs={faqs} />

      <NeedHelpSection
        heading1="Need More Help?"
        heading2="We’re here for you."
        description="Get the help you need from our automated assistant, or contact an agent"
        buttonText={ctaText}
      />
    </>
  );
}