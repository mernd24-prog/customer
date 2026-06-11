import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { useCmsRecord } from "../../hooks/useCmsRecord";

import PolicyHeader from "../../components/policy/PolicyHeader";
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
    fallbackTitle: "Shipping & Delivery",
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

const emptyPolicyConfig = {};

function cleanPolicyText(value = "") {
  return String(value || "")
    .replace(/^\s*:\s*/, "")
    .trim();
}

const PolicyPage = ({ slugOverride = "" }) => {
  const location = useLocation();

  const config = policyConfig[location.pathname] || emptyPolicyConfig;
  const {
    description: configDescription,
    emptyText,
    fallbackTitle,
    slug,
  } = config;
  const cmsSlug = slugOverride || slug;

  const { page: cmsPolicy, loading } = useCmsRecord(cmsSlug);

  const sections = useMemo(() => {
    if (!cmsPolicy) return null;

    const sectionList = Array.isArray(cmsPolicy?.metadata?.data?.sections)
      ? cmsPolicy.metadata.data.sections
      : [];

    return sectionList
      .filter(
        (section) =>
          section?.title || section?.description || section?.points?.length > 0,
      )
      .map((section) => ({
        type: section.type || "content",
        title: section.title || "",
        description: section.description || "",
        points: Array.isArray(section.points)
          ? section.points.map((point) => ({
              title: cleanPolicyText(point.title),
              description: cleanPolicyText(point.description),
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
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [cmsPolicy]);

  const data = useMemo(() => {
    if (!sections) return null;

    return {
      title: fallbackTitle,
      sections,
    };
  }, [sections, fallbackTitle]);

  const pageTitle = `${data?.title || fallbackTitle} | Sam Global`;

  const pageDescription = data?.sections?.[0]?.description || configDescription;

  return (
    <main className="w-full bg-white  pb-20">
      <Seo title={pageTitle} description={pageDescription} />

      <ApiState
        loading={loading && !sections}
        error={null}
        empty={!sections?.length && !loading}
        emptyTitle="Coming soon"
        emptyText={emptyText || "This policy page is being prepared."}
      >
        {data && (
          <>
            <PolicyHeader title={data.title} />

            <div className="mx-auto mt-10 w-full   md:mt-12 md:px-12">
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
