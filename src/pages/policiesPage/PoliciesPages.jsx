import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { useCmsRecord } from "../../hooks/useCmsRecord";

import PolicyHeader from "../../components/policy/PolicyHeader";
import PolicySection from "../../components/policy/PolicySection";

function cleanPolicyText(value = "") {
  return String(value || "")
    .replace(/^\s*:\s*/, "")
    .trim();
}

const PolicyPage = ({ slugOverride = "" }) => {
  const { slug } = useParams();
  const cmsSlug = slugOverride || slug || "";

  const { page: cmsPolicy, loading } = useCmsRecord(cmsSlug);

  const title = cmsPolicy?.metadata?.data?.title || "";
  const description = cmsPolicy?.metadata?.data?.description || "";

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

  const emptyText = "";

  const data = useMemo(() => {
    if (!sections) return null;
    return {
      title: title,
      sections,
    };
  }, [sections, title]);

  return (
    <main className="w-full bg-white  pb-20">
      <Seo title={title} description={description} />

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
