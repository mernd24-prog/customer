import { useMemo } from "react";

import Seo from "../../components/ui/Seo";
import PageIntroBanner from "../../components/ui/PageIntroBanner";
import Loader from "../../components/ui/Loader";
import FAQContentSection from "../../components/faq/FAQContentSection";
import Breadcrumbs from "../../modules/common/components/Breadcrumbs";
import PageContainer from "../../components/ui/layout/PageContainer";

import { useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_CMS_DATA } from "../../data/fallbackCmsData";

const FALLBACK_FAQ_TITLE = "Frequently Asked Questions";

const FALLBACK_FAQ_DESCRIPTION =
  "Everything you need to know about shopping, orders, payments, returns, and more.";

export default function FAQPage() {
  const {
    page: cmsPage,
    loading: cmsLoading,
    error: cmsError,
  } = useCmsRecord("faq-details");

  const faqCmsData = cmsPage || FALLBACK_CMS_DATA?.faq;

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


  if (cmsLoading && !cmsPage) {
    return (
      <>
        <Seo
          title={`${FALLBACK_FAQ_TITLE} | Sam Global`}
          metaDescription={FALLBACK_FAQ_DESCRIPTION}
        />

        <div className="flex min-h-[70vh] w-full items-center justify-center">
          <Loader size="xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${faqTitle} | Sam Global`}
        metaDescription={faqDescription}
      />

      <PageIntroBanner title={faqTitle} description={faqDescription} />

      {/* Breadcrumb + FAQ content */}
      <section className="w-full pt-3 pb-10 md:pb-12">
        <PageContainer>


          {cmsError && !cmsPage && !faqCmsData ? (
            <div className="flex min-h-[35vh] items-center justify-center text-center">
              <div>
                <h2 className="text-xl font-bold text-[#201b78]">
                  FAQ Not Found
                </h2>

                <p className="mt-2 text-sm text-muted">
                  Check back later for answers to frequently asked questions.
                </p>
              </div>
            </div>
          ) : (
            <FAQContentSection faqs={faqs} />
          )}
        </PageContainer>
      </section>
    </>
  );
}