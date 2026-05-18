import { useMemo } from "react";
import Seo from "../../components/common/Seo";
import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import FAQSearchSection from "../../components/faq/FAQSearchBar";
import NeedHelpSection from "../../components/faq/NeedHelpSection";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";
import { faqData } from "../../data/faqData";

const normalizeFaqQuestions = (payload) => {
  const groupedQuestions = Array.isArray(payload?.groupedQuestions)
    ? payload.groupedQuestions
    : [];
  const questions = Array.isArray(payload?.questions) ? payload.questions : [];

  const source = groupedQuestions.length ? groupedQuestions : questions;
  return source.length
    ? source.map((item, index) => ({
        cmsKey: item?.cmsKey || `faq-${index}`,
        topic: item?.topic || "FAQ'S",
        question: item?.question || "",
        answer: item?.answer || "",
      })).filter((item) => item.question && item.answer)
    : faqData;
};

export default function FAQPage() {
  const { page: cmsFaqPage } = useCmsRecord("faq");
  const faqCmsData = useMemo(
    () => getCmsPayload(cmsFaqPage, null),
    [cmsFaqPage],
  );
  const faqs = useMemo(() => normalizeFaqQuestions(faqCmsData), [faqCmsData]);

  const title =
    faqCmsData?.title ||
    cmsFaqPage?.title ||
    "Frequently Asked Questions";
  const description =
    faqCmsData?.description ||
    cmsFaqPage?.excerpt ||
    "Quick answers for common shopping questions.";
  const ctaText = faqCmsData?.ctaText || "Contact Us";

  return (
    <>
      <Seo
        title={faqCmsData?.seo?.metaTitle || cmsFaqPage?.seo?.metaTitle || title}
        description={
          faqCmsData?.seo?.metaDescription ||
          cmsFaqPage?.seo?.metaDescription ||
          description
        }
      />
      <FAQHeroSection
        eyebrow={faqCmsData?.eyebrow}
        title={title}
        description={description}
      />
      <h1 className="text-3xl font-bold text-center mt-10">{title}</h1>
      <FAQSearchSection/>
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