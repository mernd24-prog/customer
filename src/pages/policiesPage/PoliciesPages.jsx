import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import Breadcrumbs from "../../modules/common/components/Breadcrumbs";
import PolicySection from "../../components/policy/PolicySection";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_POLICY_DATA } from "../../data/fallbackCmsData";
import PageContainer from "../../components/ui/layout/PageContainer";

function cleanPolicyText(value = "") {
  return String(value || "")
    .replace(/^\s*:\s*/, "")
    .trim();
}

const POLICY_CONFIG = {
  "shipping-delivery-policy": {
    cmsSlug: "shipping-delivery-policy",
    fallbackKey: "shipping",
  },

  "return-refund-policy": {
    cmsSlug: "return-refund-policy",
    fallbackKey: "returns",
  },

  "terms-of-use": {
    cmsSlug: "terms-of-use",
    fallbackKey: "terms",
  },
};

function normalizeSections(sections = []) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .filter(Boolean)
    .map((section, index) => ({
      ...section,

      title: cleanPolicyText(section.title),

      description: cleanPolicyText(section.description),

      points: Array.isArray(section.points)
        ? section.points
            .filter(
              (point) => point?.title || point?.description
            )
            .map((point) => ({
              ...point,
              title: cleanPolicyText(point.title),
              description: cleanPolicyText(point.description),
            }))
        : [],

      sortOrder:
        typeof section.sortOrder === "number"
          ? section.sortOrder
          : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getCmsPayload(page) {
  return (
    page?.metadata?.data ||
    page?.metadata?.content ||
    page?.data ||
    page?.content ||
    page ||
    null
  );
}

export default function PoliciesPages({ slugOverride }) {
  const { policyType } = useParams();

  const policySlug = slugOverride || policyType;
  const config = POLICY_CONFIG[policySlug];

  const { page, loading, error } = useCmsRecord(
    config?.cmsSlug || ""
  );

  const fallbackPolicy = config
    ? FALLBACK_POLICY_DATA?.[config.fallbackKey] || null
    : null;

  const policy = useMemo(() => {
    const cmsData = getCmsPayload(page);

    if (!cmsData) {
      return fallbackPolicy;
    }

    return {
      ...fallbackPolicy,
      ...cmsData,

      sections:
        Array.isArray(cmsData.sections) &&
        cmsData.sections.length > 0
          ? cmsData.sections
          : fallbackPolicy?.sections || [],
    };
  }, [page, fallbackPolicy]);

  const sections = useMemo(
    () => normalizeSections(policy?.sections),
    [policy?.sections]
  );

  const title = cleanPolicyText(
    policy?.title ||
      fallbackPolicy?.title ||
      "Policy"
  );

  const description = cleanPolicyText(
    policy?.description ||
      fallbackPolicy?.description ||
      ""
  );

  const breadcrumbs = useMemo(
    () => [
      {
        label: "Home",
        href: "/",
      },
      {
        label: title,
      },
    ],
    [title]
  );

  if (!config) {
    return (
      <>
        <Seo
          title="Policy | Sam Global"
          metaDescription="Sam Global policies and terms."
        />

        <PageContainer>
          <Breadcrumbs
            items={breadcrumbs}
            className="mb-6 flex flex-wrap items-center gap-[10px] sm:mb-8 sm:gap-[12px] lg:gap-[15px]"
          />

          <ApiState
            loading={false}
            error="Policy page not found."
            empty
            emptyTitle="Policy Not Found"
            emptyText="The requested policy page could not be found."
          />
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${title} | Sam Global`}
        metaDescription={
          description ||
          `Read the ${title} of Sam Global.`
        }
      />

      <PageContainer>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={breadcrumbs}
          className="mb-6 flex flex-wrap items-center gap-[10px] sm:mb-8 sm:gap-[12px] lg:gap-[15px]"
        />

        {/* Policy Hero */}
        <section className="relative overflow-hidden  bg-[#211B73] py-10 md:py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {title}
            </h1>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-8 md:py-10">
          <ApiState
            loading={loading && !page && !fallbackPolicy}
            error={error && !fallbackPolicy ? error : null}
            empty={!policy}
            emptyTitle="Policy Not Found"
            emptyText="This policy is currently unavailable."
          >
            {policy && (
              <div className="mx-auto max-w-6xl">
                {description && (
                  <p className="mb-7 text-[14px] leading-relaxed text-muted md:text-base">
                    {description}
                  </p>
                )}

                {sections.length > 0 ? (
                  <div className="space-y-6">
                    {sections.map((section, index) => (
                      <PolicySection
                        key={
                          section.cmsKey ||
                          section.id ||
                          `${section.title}-${index}`
                        }
                        title={section.title}
                        description={section.description}
                        points={section.points}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    This policy is currently unavailable.
                  </p>
                )}
              </div>
            )}
          </ApiState>
        </section>
      </PageContainer>
    </>
  );
}
