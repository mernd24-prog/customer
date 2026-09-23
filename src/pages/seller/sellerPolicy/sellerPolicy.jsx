import { Link } from "react-router-dom";
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

import Seo from "../../../components/ui/Seo";
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

const responsibilityIcons = [
  PackageCheck,
  ClipboardList,
  Box,
  Headphones,
];

const complianceIcons = [
  ShieldCheck,
  BarChart3,
  TriangleAlert,
];

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
        (matcher) =>
          type === matcher ||
          title.includes(matcher),
      );
    }) || sections[fallbackIndex] || null
  );
};

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
      image: point?.image?.url || point?.image || null,
    }));
};

export default function SellerPolicy() {
  const {
    page: policyRecord,
    loading: policyLoading,
  } = useCmsRecord("seller-policy");

  const {
    page: policiesRecord,
    loading: policiesLoading,
  } = useCmsRecord("seller-policies");

  const cmsPolicy = getCmsPayload(policyRecord);
  const cmsPolicies = getCmsPayload(policiesRecord);

  const page =
    cmsPolicy ||
    cmsPolicies ||
    FALLBACK_SELLER_POLICY;

  const loading = policyLoading || policiesLoading;

  const heroTitle = page?.title || "";
  const badgeText = page?.excerpt || page?.category || "";

  const heroDesc =
    page?.description ||
    getPlainText(page?.body) ||
    "";

  const heroImg =
    page?.image?.url ||
    page?.heroImage ||
    page?.coverImage ||
    "";

  const primaryCtaLabel =
    page?.cta?.label || "Become a Seller";

  const primaryCtaUrl =
    page?.cta?.url || "/become-a-seller";

  const secondaryCtaLabel = "Contact Support";
  const secondaryCtaUrl = "/contact-us";

  const sections = Array.isArray(page?.sections)
    ? page.sections
    : [];

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
    [
      "seller-responsibilities",
      "responsibilities",
      "commitment",
    ],
    1,
  );

  const section3 = findSection(
    sections,
    [
      "account-compliance",
      "compliance",
      "healthy",
      "account",
    ],
    2,
  );

  const highlightBadge =
    section1?.cta?.label ||
    String(section1?.type || "")
      .replace(/-/g, " ")
      .trim();

  const highlightTitle = section1?.title || "";
  const highlightDesc = section1?.description || "";

  const highlights = mapSectionPoints(
    section1,
    highlightIcons,
  );

  const respBadge =
    section2?.cta?.label ||
    String(section2?.type || "")
      .replace(/-/g, " ")
      .trim();

  const respTitle = section2?.title || "";
  const respDesc = section2?.description || "";

  const responsibilities = mapSectionPoints(
    section2,
    responsibilityIcons,
  );

  const compBadge =
    section3?.cta?.label ||
    String(section3?.type || "")
      .replace(/-/g, " ")
      .trim();

  const compTitle = section3?.title || "";
  const compDesc = section3?.description || "";

  const compliance = mapSectionPoints(
    section3,
    complianceIcons,
  );

  return (
    <div
      className="w-[100vw] overflow-x-hidden"
      style={{ marginLeft: "calc(-50vw + 50%)" }}
    >
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

      {/* ================= HERO ================= */}
      <section className="relative isolate w-full overflow-hidden bg-[#FAF8F3]">
        {heroImg && (
          <img
            loading="lazy"
            width="400"
            height="400"
            src={heroImg}
            alt={heroTitle || "Seller Policy"}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
          />
        )}

        <div className="customer-container flex min-h-[570px] items-center py-16 lg:min-h-[780px] lg:py-20">
          <div className="max-w-3xl">
            {badgeText && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A52A]/30 bg-[#D4A52A]/15 px-4 py-2 text-sm font-medium text-[#18156D] backdrop-blur-sm">
                <Sparkles
                  size={16}
                  className="text-[#efc75f]"
                />
                <span>{badgeText}</span>
              </div>
            )}

            {heroTitle && (
              <h1 className="banner-heading font-bold text-[#18156D]">
                {heroTitle}
              </h1>
            )}

            {heroDesc && (
              <p className="mt-6 max-w-xl text-base text-gray-700 sm:text-lg">
                {heroDesc}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCtaLabel && (
                <Link
                  to={primaryCtaUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#D4A52A] px-7 font-bold text-[#18156D] transition hover:-translate-y-0.5 hover:bg-[#e5b738]"
                >
                  {primaryCtaLabel}
                </Link>
              )}

              {secondaryCtaLabel && (
                <Link
                  to={secondaryCtaUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#18156D]/20 bg-white/70 px-7 font-bold text-[#18156D] backdrop-blur transition hover:-translate-y-0.5"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= POLICY HIGHLIGHTS ================= */}
      {section1 &&
        (highlights.length > 0 || highlightTitle) && (
          <section className="bg-[#FAF8F3] py-8">
            <div className="mx-auto max-w-7xl px-8 py-8">
              <div className="text-center">
                {highlightBadge && (
                  <span className="rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#B88400]">
                    {highlightBadge}
                  </span>
                )}

                {highlightTitle && (
                  <h2 className="mt-5 text-[20px] font-bold leading-[28px] tracking-[-0.01em] text-[#18156D] md:text-[24px] md:leading-[32px] lg:text-[28px] lg:leading-[36px]">
                    {highlightTitle}
                  </h2>
                )}

                {highlightDesc && (
                  <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[22px] text-gray-600 md:text-[18px] md:leading-[28px]">
                    {highlightDesc}
                  </p>
                )}
              </div>

              {highlights.length > 0 && (
                <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {highlights.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title || index}
                        className="group rounded-3xl bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#18156D]/10 text-[#18156D]">
                          {item.image ? (
                            <img
                              loading="lazy"
                              width="28"
                              height="28"
                              src={item.image}
                              alt={item.title || ""}
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            Icon && <Icon size={28} />
                          )}
                        </div>

                        {item.title && (
                          <h3 className="mt-6 text-[16px] font-bold leading-tight text-[#18156D] md:text-[18px] lg:text-[20px]">
                            {item.title}
                          </h3>
                        )}

                        {item.desc && (
                          <p className="mt-3 text-[14px] leading-[22px] text-gray-600 md:text-[16px] md:leading-[26px]">
                            {item.desc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

      {/* ================= RESPONSIBILITIES ================= */}
      {section2 &&
        (responsibilities.length > 0 || respTitle) && (
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center">
                {respBadge && (
                  <span className="inline-flex rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C59A22]">
                    {respBadge}
                  </span>
                )}

                {respTitle && (
                  <h2 className="mt-5 text-[20px] font-bold leading-[28px] tracking-[-0.01em] text-[#18156D] md:text-[24px] md:leading-[32px] lg:text-[28px] lg:leading-[36px]">
                    {respTitle}
                  </h2>
                )}

                {respDesc && (
                  <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[22px] text-gray-600 md:text-[18px] md:leading-[28px]">
                    {respDesc}
                  </p>
                )}
              </div>

              {responsibilities.length > 0 && (
                <div className="mt-14 grid gap-7 lg:grid-cols-4">
                  {responsibilities.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title || index}
                        className="group relative overflow-hidden rounded-[28px] border border-[#ECE7DD] bg-gradient-to-b from-white to-[#FCFBF8] p-7 transition-all duration-300 hover:border-[#D4A52A]"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D4A52A] via-[#F2D37A] to-[#D4A52A]" />

                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/8 text-[#18156D] transition-colors duration-300 group-hover:bg-[#18156D] group-hover:text-white">
                            {item.image ? (
                              <img
                                loading="lazy"
                                width="24"
                                height="24"
                                src={item.image}
                                alt={item.title || ""}
                                className="h-6 w-6 object-contain"
                              />
                            ) : (
                              Icon && (
                                <Icon
                                  size={20}
                                  strokeWidth={2.2}
                                />
                              )
                            )}
                          </div>
                        </div>

                        {item.title && (
                          <h3 className="mt-6 text-[16px] font-bold leading-tight text-[#18156D] md:text-[18px] lg:text-[20px]">
                            {item.title}
                          </h3>
                        )}

                        {item.desc && (
                          <p className="mt-3 text-[14px] leading-[22px] text-gray-600 md:text-[16px] md:leading-[26px]">
                            {item.desc}
                          </p>
                        )}

                        <div className="mt-6 h-px w-full bg-[#EFE8DA]" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

      {/* ================= COMPLIANCE ================= */}
      {section3 &&
        (compliance.length > 0 || compTitle) && (
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center">
                {compBadge && (
                  <span className="inline-flex rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C59A22]">
                    {compBadge}
                  </span>
                )}

                {compTitle && (
                  <h2 className="mt-5 text-[20px] font-bold leading-[28px] tracking-[-0.01em] text-[#18156D] md:text-[24px] md:leading-[32px] lg:text-[28px] lg:leading-[36px]">
                    {compTitle}
                  </h2>
                )}

                {compDesc && (
                  <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[22px] text-gray-600 md:text-[18px] md:leading-[28px]">
                    {compDesc}
                  </p>
                )}
              </div>

              {compliance.length > 0 && (
                <div className="mt-14 grid gap-8 lg:grid-cols-3">
                  {compliance.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title || index}
                        className="group cursor-pointer rounded-[28px] border border-[#ECE7DD] p-8 transition-all duration-500 ease-in-out hover:-translate-y-1.5 hover:border-[#18156D] hover:bg-[#18156D]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/10 text-[#18156D] transition-all duration-500 ease-in-out group-hover:bg-white/10 group-hover:text-white">
                          {item.image ? (
                            <img
                              loading="lazy"
                              width="24"
                              height="24"
                              src={item.image}
                              alt={item.title || ""}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            Icon && <Icon size={22} />
                          )}
                        </div>

                        {item.title && (
                          <h3 className="mt-6 text-[18px] font-bold leading-tight text-[#18156D] transition-colors duration-500 ease-in-out group-hover:text-white md:text-[20px] lg:text-[24px]">
                            {item.title}
                          </h3>
                        )}

                        {item.desc && (
                          <p className="mt-4 text-[14px] leading-[22px] text-gray-600 transition-colors duration-500 ease-in-out group-hover:text-white/80 md:text-[16px] md:leading-[26px]">
                            {item.desc}
                          </p>
                        )}

                        <div className="mt-8 h-1 w-16 rounded-full bg-[#D4A52A]/30 transition-all duration-500 ease-in-out group-hover:w-20 group-hover:bg-[#D4A52A]" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
    </div>
  );
}
