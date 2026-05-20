import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";

import PolicyHeader from "../../components/policy/PolicyHeader";
import PolicyIntro from "../../components/policy/PolicyIntro";
import PolicySection from "../../components/policy/PolicySection";

const policyConfig = {
  "/refund-policy": {
    slug: "refund-policy",
    fallbackTitle: "Refund Policy",
    emptyText: "The refund policy is currently unavailable.",
    description: "Learn about our return and refund policies.",
  },

  "/shipping-policy": {
    slug: "shipping-policy",
    fallbackTitle: "Shipping Policy",
    emptyText: "The shipping policy is currently unavailable.",
    description: "Learn about our shipping times, costs, and delivery methods.",
  },

  "/terms-of-use": {
    slug: "terms-of-use",
    fallbackTitle: "Terms Of Use",
    emptyText: "The terms of use are currently unavailable.",
    description: "Read our terms and conditions.",
  },

  "/features": {
    slug: "features",
    fallbackTitle: "Features",
    emptyText: "Features are currently unavailable.",
    description: "Core platform features for customers.",
  },
};

const PolicyPage = () => {
  const location = useLocation();

  const config = policyConfig[location.pathname];

  const { page: cmsPolicy, loading } = useCmsRecord(config?.slug);

  const cmsData = useMemo(() => getCmsPayload(cmsPolicy, null), [cmsPolicy]);
  const data = useMemo(() => {
    if (!cmsData) return null;

    const sections =
      Array.isArray(cmsData.sections) && cmsData.sections.length > 0
        ? cmsData.sections
          .filter(
            (section) =>
              section?.title ||
              section?.description ||
              section?.points?.length > 0
          )
          .map((section) => ({
            type: section.type || "content",
            title: section.title || "",
            description: section.description || "",
            points: Array.isArray(section.points)
              ? section.points.map((point) => ({
                title: point.title || "",
                description: point.description || "",
                image: point.image || null,
                cta: point.cta || null,
                sortOrder: point.sortOrder || 0,
              }))
              : [],
            image: section.image || null,
            gallery: section.gallery || [],
            cta: section.cta || null,
            footer: section.footer || "",
            sortOrder: section.sortOrder || 0,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder)
        : [
          {
            title: cmsData.title || config?.fallbackTitle,
            description: cmsData.description || cmsData.excerpt || "",
            points: cmsData.points || [],
            footer: cmsData.footer || "",
          },
        ];

    return {
      title: cmsData.title || config?.fallbackTitle,

      intro: {
        heading:
          cmsData.intro?.heading ||
          cmsData.metadata?.data?.intro?.heading ||
          cmsData.title ||
          config?.fallbackTitle,

        description:
          cmsData.intro?.description ||
          cmsData.metadata?.data?.intro?.description ||
          cmsData.description ||
          cmsData.excerpt ||
          "",
      },

      sections,
    };
  }, [cmsData, config]);

  const pageTitle = `${data?.title || config?.fallbackTitle} | Sam Global`;

  const pageDescription = data?.intro?.description || config?.description;

  return (
    <main className="w-full bg-white font-montserrat pb-20">
      <Seo title={pageTitle} description={pageDescription} />

      <ApiState
        loading={loading && !cmsData}
        error={null}
        empty={!cmsData && !loading}
        emptyTitle="Content Not Found"
        emptyText={config?.emptyText}
      >
        {data && (
          <>
            <PolicyHeader title={data.title} />

            <div className="w-full px-8 md:px-12 lg:px-16 mt-12 md:mt-16 max-w-[1648px] mx-auto">
              <PolicyIntro
                heading={data.intro?.heading}
                description={data.intro?.description}
              />

              {data.sections?.length > 0 && (
                <div className="space-y-10 md:space-y-12">
                  {data.sections.map((section, index) => (
                    <PolicySection
                      key={`${section.type}-${index}`}
                      index={index}
                      title={section.title}
                      description={section.description}
                      points={section.points}
                      footer={section.footer}
                      image={section.image}
                      gallery={section.gallery}
                      cta={section.cta}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </ApiState>
    </main>
  );
};

export default PolicyPage;
