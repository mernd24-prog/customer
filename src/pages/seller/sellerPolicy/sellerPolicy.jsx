import {
  ShieldCheck,
  PackageCheck,
  Truck,
  Wallet,
  BadgeCheck,
  FileCheck2,
  ClipboardList,
  Box,
  Headphones,
  BarChart3,
  TriangleAlert,
  Sparkles,
} from "lucide-react";
import {
  OutlineSecondaryButton,
  SolidLargeButton,
} from "../../../components/ui/button/static";
import PageHeroBanner from "../../../components/ui/banner/PageHeroBanner";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import FallbackImage from "../../../components/ui/FallbackImage";
import { SKELETON_PRESETS } from "../../../components/ui/skeleton/skeletonPresets";
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import { FALLBACK_SELLER_POLICY } from "../../../data/fallbackCmsData";

const highlightIcons = [
  ShieldCheck,
  ClipboardList,
  Truck,
  Wallet,
  BadgeCheck,
  FileCheck2,
];

const responsibilityIcons = [PackageCheck, ClipboardList, Box, Headphones];

const complianceIcons = [ShieldCheck, BarChart3, TriangleAlert];

const getCmsPayload = (page) =>
  page?.metadata?.data ||
  page?.metadata?.content ||
  page?.data ||
  page?.content ||
  page;

const getPlainText = (value = "") =>
  String(value || "")
    .replace(/<[^>]+>/g, "")
    .trim();

const findSection = (sections, matchers, fallbackIndex) => {
  if (!Array.isArray(sections)) {
    return null;
  }

  return (
    sections.find((section) => {
      const type = String(section?.type || "").toLowerCase();
      const title = String(section?.title || "").toLowerCase();

      return matchers.some(
        (matcher) => type === matcher || title.includes(matcher),
      );
    }) ||
    sections[fallbackIndex] ||
    null
  );
};

/*
 * Section cards use frontend Lucide icons.
 * No images are read from CMS/backend points.
 */
const mapSectionPoints = (section, icons) => {
  if (!Array.isArray(section?.points)) {
    return [];
  }

  return section.points
    .filter((point) => point?.title || point?.description)
    .map((point, index) => ({
      icon: icons[index % icons.length],
      title: point?.title || "",
      desc: point?.description || "",
    }));
};

export default function SellerPolicy() {
  const { page: policyRecord, loading: policyLoading } =
    useCmsRecord("seller-policy");

  const { page: policiesRecord, loading: policiesLoading } =
    useCmsRecord("seller-policies");

  const cmsPolicy = getCmsPayload(policyRecord);
  const cmsPolicies = getCmsPayload(policiesRecord);

  const page = cmsPolicy || cmsPolicies || FALLBACK_SELLER_POLICY;

  const cmsRecord = policyRecord || policiesRecord || {};

  const loading = policyLoading || policiesLoading;

  /* =========================================================
     HERO
  ========================================================= */

  const heroTitle = page?.title || "";

  const badgeText = page?.excerpt || page?.category || "";

  const heroDesc = page?.description || getPlainText(page?.body) || "";

  const heroImg =
    cmsRecord?.image?.url ||
    cmsRecord?.heroImage ||
    cmsRecord?.coverImage ||
    page?.image?.url ||
    page?.heroImage ||
    page?.coverImage ||
    FALLBACK_SELLER_POLICY.image.url;

  const primaryCtaLabel = page?.cta?.label || "Become a Seller";

  const primaryCtaUrl = page?.cta?.url || "/become-a-seller";

  const secondaryCtaLabel = "Contact Support";

  const secondaryCtaUrl = "/contact-us";

  /* =========================================================
     SECTIONS
  ========================================================= */

  const sections = Array.isArray(page?.sections) ? page.sections : [];

  const section1 = findSection(
    sections,
    [
      "policy-guidelines",
      "policy-highlights",
      "confidently",
      "guidelines",
      "highlights",
    ],
    0,
  );

  const section2 = findSection(
    sections,
    ["seller-responsibilities", "responsibilities", "commitment"],
    1,
  );

  const section3 = findSection(
    sections,
    ["account-compliance", "compliance", "healthy", "account"],
    2,
  );

  const highlightBadge =
    section1?.cta?.label ||
    String(section1?.type || "")
      .replace(/-/g, " ")
      .trim();

  const highlightTitle = section1?.title || "";

  const highlightDesc = section1?.description || "";

  const highlights = mapSectionPoints(section1, highlightIcons);

  const respBadge =
    section2?.cta?.label ||
    String(section2?.type || "")
      .replace(/-/g, " ")
      .trim();

  const respTitle = section2?.title || "";

  const respDesc = section2?.description || "";

  const responsibilities = mapSectionPoints(section2, responsibilityIcons);


  const compBadge =
    section3?.cta?.label ||
    String(section3?.type || "")
      .replace(/-/g, " ")
      .trim();

  const compTitle = section3?.title || "";

  const compDesc = section3?.description || "";

  const compliance = mapSectionPoints(section3, complianceIcons);

  return (
    <div className="full-banner overflow-hidden bg-white">
      <Seo
        title={
          page?.seo?.metaTitle ||
          (heroTitle
            ? `${heroTitle} - Sam Global`
            : "Seller Policy - Sam Global")
        }
        metaDescription={
          page?.seo?.metaDescription ||
          heroDesc ||
          "Read our Seller Policy to understand the guidelines, responsibilities, and standards for selling on our platform."
        }
      />

      <ApiState
        loading={loading && !cmsPolicy && !cmsPolicies}
        skeletonLayout={SKELETON_PRESETS.POLICY_PAGE}
      >
        <PageHeroBanner
          image={heroImg}
          badge={
            badgeText && (
              <>
                <Sparkles size={16} className="text-[#efc75f]" />
                <span>{badgeText}</span>
              </>
            )
          }
          title={heroTitle}
          description={heroDesc}
          theme="cream"
          actions={
            <>
              {primaryCtaLabel && (
                <SolidLargeButton
                  to={primaryCtaUrl}
                  className="h-[42px] min-w-[138px] px-4 text-sm font-bold whitespace-nowrap sm:h-[48px] sm:min-w-[158px] sm:px-6 sm:text-[15px]"
                >
                  {primaryCtaLabel}
                </SolidLargeButton>
              )}

              {secondaryCtaLabel && (
                <OutlineSecondaryButton
                  to={secondaryCtaUrl}
                  className="h-[42px] min-w-[130px] px-4 text-sm font-semibold whitespace-nowrap text-[#18156D] sm:h-[48px] sm:min-w-[150px] sm:px-6 sm:text-[15px]"
                >
                  {secondaryCtaLabel}
                </OutlineSecondaryButton>
              )}
            </>
          }
        />

        {section1 && (highlights.length > 0 || highlightTitle) && (
          <section className="bg-[#FAF8F3] py-12 sm:py-16 lg:py-24">
            <div className="customer-container">
              <div className="mx-auto max-w-3xl text-center">
                {highlightBadge && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#F5E9C6] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#B88400] sm:px-4 sm:py-2">
                    <ShieldCheck size={14} />

                    {highlightBadge}
                  </span>
                )}

                {highlightTitle && (
                  <h2 className="mt-4 text-[24px] font-bold leading-[32px] text-[#18156D] sm:mt-5 md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                    {highlightTitle}
                  </h2>
                )}

                {highlightDesc && (
                  <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-gray-600 sm:mt-4 md:text-[17px] md:leading-7">
                    {highlightDesc}
                  </p>
                )}
              </div>

              {highlights.length > 0 && (
                <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {highlights.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title || index}
                        className="flex h-full items-start gap-4 rounded-lg border border-[#E8E1D4] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-[#D4A52A] sm:p-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#18156D]/10 text-[#18156D] sm:h-12 sm:w-12">
                          {Icon && <Icon size={23} strokeWidth={2} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          {item.title && (
                            <h3 className="text-[16px] font-bold leading-6 text-[#18156D] sm:text-[17px]">
                              {item.title}
                            </h3>
                          )}

                          {item.desc && (
                            <p className="mt-2 text-base leading-5 text-gray-600 sm:leading-6">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

  

        {section2 && (responsibilities.length > 0 || respTitle) && (
          <section className="bg-white py-12 sm:py-16 lg:py-24">
            <div className="customer-container">
              <div className="mx-auto max-w-3xl text-center">
                {respBadge && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#18156D]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#18156D] sm:px-4 sm:py-2">
                    <ClipboardList size={14}  />

                    {respBadge}
                  </span>
                )}

                {respTitle && (
                  <h2 className="mt-4 text-[24px] font-bold leading-[32px] text-[#18156D] sm:mt-5 md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                    {respTitle}
                  </h2>
                )}

                {respDesc && (
                  <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-gray-600 sm:mt-4 md:text-[17px] md:leading-7">
                    {respDesc}
                  </p>
                )}
              </div>

              {responsibilities.length > 0 && (
                <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {responsibilities.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title || index}
                        className="flex h-full items-start gap-4 rounded-lg border border-[#ECE7DD] bg-[#FCFBF8] p-4 transition-colors duration-200 hover:border-[#D4A52A] sm:p-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#18156D] text-white sm:h-12 sm:w-12">
                          {Icon && <Icon size={22} strokeWidth={2} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          {item.title && (
                            <h3 className="text-[16px] font-bold leading-6 text-[#18156D] sm:text-[17px]">
                              {item.title}
                            </h3>
                          )}

                          {item.desc && (
                            <p className="mt-2 text-base leading-5 text-gray-600 sm:leading-6">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}


        {section3 && (compliance.length > 0 || compTitle) && (
          <section className="bg-[#F7F5EF] py-12 sm:py-16 lg:py-24">
            <div className="customer-container">
              <div className="mx-auto max-w-3xl text-center">
                {compBadge && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#F5E9C6] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#B88400] sm:px-4 sm:py-2">
                    <BadgeCheck size={14} />

                    {compBadge}
                  </span>
                )}

                {compTitle && (
                  <h2 className="mt-4 text-[24px] font-bold leading-[32px] text-[#18156D] sm:mt-5 md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                    {compTitle}
                  </h2>
                )}

                {compDesc && (
                  <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-gray-600 sm:mt-4 md:text-[17px] md:leading-7">
                    {compDesc}
                  </p>
                )}
              </div>

              {compliance.length > 0 && (
                <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3">
                  {compliance.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title || index}
                        className="flex h-full items-start gap-4 rounded-lg border border-white/10 bg-[#18156D] p-4 transition-colors duration-200 hover:bg-[#211d78] sm:p-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#F2D37A] sm:h-12 sm:w-12">
                          {Icon && <Icon size={23} strokeWidth={2} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          {item.title && (
                            <h3 className="text-[16px] font-bold leading-6 text-white sm:text-[17px]">
                              {item.title}
                            </h3>
                          )}

                          {item.desc && (
                            <p className="mt-2 text-base leading-5 text-white/70 sm:leading-6">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </ApiState>
    </div>
  );
}