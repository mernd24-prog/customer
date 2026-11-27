
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Seo from "../../components/ui/Seo";
import PageIntroBanner from "../../components/ui/PageIntroBanner";
import ApiState from "../../components/ui/ApiState";
import { SKELETON_PRESETS } from "../../components/ui/skeleton/skeletonPresets";
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
  "privacy-policy": {
    cmsSlug: "privacy-policy",
    fallbackKey: "privacy",
  },
  "cookie-policy": {
    cmsSlug: "cookie-policy",
    fallbackKey: "cookies",
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
            .filter((point) => point?.title || point?.description)
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

  const { page, loading, error } = useCmsRecord(config?.cmsSlug || "");

  const fallbackPolicy = config
    ? FALLBACK_POLICY_DATA?.[config.fallbackKey] || null
    : null;

  const policy = useMemo(() => {
    const payload = getCmsPayload(page);
    const cmsData = typeof payload === "string" ? { body: payload } : payload;

    if (!cmsData) {
      return fallbackPolicy;
    }

    return {
      ...fallbackPolicy,
      ...page,
      ...cmsData,
      sections:
        Array.isArray(cmsData.sections) && cmsData.sections.length > 0
          ? cmsData.sections
          : fallbackPolicy?.sections || [],
    };
  }, [page, fallbackPolicy]);

  const sections = useMemo(
    () => normalizeSections(policy?.sections),
    [policy?.sections]
  );

  const title = cleanPolicyText(
    policy?.title || fallbackPolicy?.title || "Policy"
  );
  const body = typeof policy?.body === "string" ? policy.body.trim() : "";

  const description = cleanPolicyText(
    policy?.description ||
      policy?.excerpt ||
      fallbackPolicy?.description ||
      fallbackPolicy?.excerpt ||
      ""
  );

  if (!config) {
    return (
      <>
        <Seo
          title="Policy | Sam Global"
          metaDescription="Sam Global policies and terms."
        />

        <PageContainer>
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
        metaDescription={description || `Read the ${title} of Sam Global.`}
      />

      <PageIntroBanner title={title} description={description} />

      <section className="w-full min-w-0 pt-4 pb-8 sm:pt-5 sm:pb-10 md:pt-6 md:pb-8">
        <PageContainer>
          <ApiState
            loading={loading && !page && !fallbackPolicy}
            error={error && !fallbackPolicy ? error : null}
            empty={!policy}
            emptyTitle="Policy Not Found"
            emptyText="This policy is currently unavailable."
            skeletonLayout={SKELETON_PRESETS.POLICY_PAGE}
          >
            {policy && (
              <div className="w-full min-w-0">
                {description && (
                  <p
                    className="mb-5 break-words text-[14px] leading-[1.75] text-muted sm:mb-6 sm:text-[15px] md:mb-8 md:text-[16px]"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}

                {body ? (
                  <div
                    className="cms-content break-words text-[14px] leading-[1.75] text-muted sm:text-[15px] md:text-[16px] [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-gold [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                ) : sections.length > 0 ? (
                  <div className="space-y-5 sm:space-y-6 md:space-y-8">
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
                  <p className="text-[14px] leading-relaxed text-muted sm:text-[15px]">
                    This policy is currently unavailable.
                  </p>
                )}
              </div>
            )}
          </ApiState>
        </PageContainer>
      </section>
    </>
  );
}
