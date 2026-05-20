import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/common/Seo";
import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import FAQSearchSection from "../../components/faq/FAQSearchBar";
import NeedHelpSection from "../../components/faq/NeedHelpSection";
import { getCmsPayload } from "../../hooks/useCmsRecord";
import { fetchCmsPages } from "../../features/cms/cmsSlice";

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
  const dispatch = useDispatch();
  const cmsList = useSelector((s) => s.cms.list);

  useEffect(() => {
    dispatch(fetchCmsPages({ pageType: "faq", limit: 100 })).catch(() => {});
  }, [dispatch]);

  const faqEntries = useMemo(
    () => (Array.isArray(cmsList) ? cmsList : []).filter((item) => item?.pageType === "faq"),
    [cmsList],
  );

  const faqs = useMemo(() => {
    if (!faqEntries.length) return [];
    return faqEntries
      .map((item, index) => ({
        cmsKey: item?.slug || `faq-${index}`,
        topic: item?.metadata?.topic || "FAQ'S",
        question: item?.title || "",
        answer: item?.body || item?.description || "",
      }))
      .filter((item) => item.question && item.answer);
  }, [faqEntries]);

  const title = "Frequently Asked Questions";
  const description =
    "Quick answers for common shopping questions.";
  const ctaText = "Contact Support";

  const faqCmsData = useMemo(() => {
    const page = faqEntries[0] || null;
    return getCmsPayload(page, null);
  }, [faqEntries]);
  const seoTitle =
    faqCmsData?.seo?.metaTitle ||
    faqEntries[0]?.metadata?.seoTitle ||
    title;
  const seoDescription =
    faqCmsData?.seo?.metaDescription ||
    faqEntries[0]?.metadata?.seoDescription ||
    "Quick answers for common shopping questions.";

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} />
      <FAQHeroSection
        eyebrow={faqCmsData?.eyebrow}
        title={title}
        description={description}
      />
      <h1 className="text-3xl font-bold text-center mt-10 uppercase">FAQ'S</h1>
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
