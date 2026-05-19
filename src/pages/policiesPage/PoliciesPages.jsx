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

    return {
      title: cmsData.title || config?.fallbackTitle,

      intro: {
        heading:
          cmsData.intro?.heading || cmsData.title || config?.fallbackTitle,

        description: cmsData.intro?.description || cmsData.description || "",
      },

      sections:
        cmsData.sections?.length > 0
          ? cmsData.sections
          : [
              {
                title: cmsData.title || config?.fallbackTitle,
                description: cmsData.description || "",
                points: cmsData.points || [],
                footer: cmsData.footer || "",
              },
            ],
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
                      key={index}
                      index={index}
                      title={section.title}
                      points={section.points}
                      description={section.description}
                      footer={section.footer}
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
