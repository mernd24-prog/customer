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
  import ApiState from "../../../components/ui/ApiState";
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

  const findSection = (
    sections,
    matchers,
    fallbackIndex,
  ) => {
    if (!Array.isArray(sections)) {
      return null;
    }

    return (
      sections.find((section) => {
        const type = String(
          section?.type || "",
        ).toLowerCase();

        const title = String(
          section?.title || "",
        ).toLowerCase();

        return matchers.some(
          (matcher) =>
            type === matcher ||
            title.includes(matcher),
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
  const mapSectionPoints = (
    section,
    icons,
  ) => {
    if (!Array.isArray(section?.points)) {
      return [];
    }

    return section.points
      .filter(
        (point) =>
          point?.title ||
          point?.description,
      )
      .map((point, index) => ({
        icon: icons[index % icons.length],
        title: point?.title || "",
        desc: point?.description || "",
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

    const cmsPolicy =
      getCmsPayload(policyRecord);

    const cmsPolicies =
      getCmsPayload(policiesRecord);

    const page =
      cmsPolicy ||
      cmsPolicies ||
      FALLBACK_SELLER_POLICY;

    const cmsRecord =
      policyRecord ||
      policiesRecord ||
      {};

    const loading =
      policyLoading ||
      policiesLoading;

    /* =========================================================
      HERO
    ========================================================= */

    const heroTitle =
      page?.title || "";

    const badgeText =
      page?.excerpt ||
      page?.category ||
      "";

    const heroDesc =
      page?.description ||
      getPlainText(page?.body) ||
      "";

    /*
    * Hero/banner image is still supported.
    * Only section point images have been removed.
    */
    const heroImg =
      cmsRecord?.image?.url ||
      cmsRecord?.heroImage ||
      cmsRecord?.coverImage ||
      page?.image?.url ||
      page?.heroImage ||
      page?.coverImage ||
      "";

    const primaryCtaLabel =
      page?.cta?.label ||
      "Become a Seller";

    const primaryCtaUrl =
      page?.cta?.url ||
      "/become-a-seller";

    const secondaryCtaLabel =
      "Contact Support";

    const secondaryCtaUrl =
      "/contact-us";

    /* =========================================================
      SECTIONS
    ========================================================= */

    const sections = Array.isArray(
      page?.sections,
    )
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

    /* =========================================================
      SECTION 1
    ========================================================= */

    const highlightBadge =
      section1?.cta?.label ||
      String(
        section1?.type || "",
      )
        .replace(/-/g, " ")
        .trim();

    const highlightTitle =
      section1?.title || "";

    const highlightDesc =
      section1?.description || "";

    const highlights =
      mapSectionPoints(
        section1,
        highlightIcons,
      );

    /* =========================================================
      SECTION 2
    ========================================================= */

    const respBadge =
      section2?.cta?.label ||
      String(
        section2?.type || "",
      )
        .replace(/-/g, " ")
        .trim();

    const respTitle =
      section2?.title || "";

    const respDesc =
      section2?.description || "";

    const responsibilities =
      mapSectionPoints(
        section2,
        responsibilityIcons,
      );

    /* =========================================================
      SECTION 3
    ========================================================= */

    const compBadge =
      section3?.cta?.label ||
      String(
        section3?.type || "",
      )
        .replace(/-/g, " ")
        .trim();

    const compTitle =
      section3?.title || "";

    const compDesc =
      section3?.description || "";

    const compliance =
      mapSectionPoints(
        section3,
        complianceIcons,
      );

    return (
      <div
        className="w-[100vw] overflow-x-hidden"
        style={{
          marginLeft:
            "calc(-50vw + 50%)",
        }}
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

        <ApiState
          loading={
            loading &&
            !cmsPolicy &&
            !cmsPolicies
          }
          skeletonLayout={
            SKELETON_PRESETS.POLICY_PAGE
          }
        >
          {/* =====================================================
              HERO
          ===================================================== */}

          <section className="relative isolate w-full overflow-hidden bg-[#FAF8F3]">
            {heroImg && (
              <img
                loading="lazy"
                width="400"
                height="400"
                src={heroImg}
                alt={
                  heroTitle ||
                  "Seller Policy"
                }
                className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
              />
            )}

            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FAF8F3]/95 via-[#FAF8F3]/75 to-transparent" />

            <div className="customer-container flex min-h-[570px] items-center py-16 lg:min-h-[780px] lg:py-20">
              <div className="max-w-3xl">
                {badgeText && (
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A52A]/30 bg-[#D4A52A]/15 px-4 py-2 text-sm font-medium text-[#18156D] backdrop-blur-sm">
                    <Sparkles
                      size={16}
                      className="text-[#efc75f]"
                    />

                    <span>
                      {badgeText}
                    </span>
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
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#D4A52A] px-7 font-bold text-[#18156D] transition-colors duration-200 hover:bg-[#e5b738]"
                    >
                      {primaryCtaLabel}
                    </Link>
                  )}

                  {secondaryCtaLabel && (
                    <Link
                      to={secondaryCtaUrl}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#18156D]/20 bg-white/70 px-7 font-bold text-[#18156D] backdrop-blur transition-colors duration-200 hover:bg-white"
                    >
                      {secondaryCtaLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              POLICY HIGHLIGHTS
          ===================================================== */}

          {section1 &&
            (highlights.length > 0 ||
              highlightTitle) && (
              <section className="bg-[#FAF8F3] py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6">
                  <div className="mx-auto max-w-3xl text-center">
                    {highlightBadge && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#B88400]">
                        <ShieldCheck
                          size={14}
                        />

                        {highlightBadge}
                      </span>
                    )}

                    {highlightTitle && (
                      <h2 className="mt-5 text-[24px] font-bold leading-[32px] text-[#18156D] md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                        {highlightTitle}
                      </h2>
                    )}

                    {highlightDesc && (
                      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-6 text-gray-600 md:text-[17px] md:leading-7">
                        {highlightDesc}
                      </p>
                    )}
                  </div>

                  {highlights.length > 0 && (
                    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {highlights.map(
                        (
                          item,
                          index,
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <div
                              key={
                                item.title ||
                                index
                              }
                              className="rounded-2xl border border-[#E8E1D4] bg-white p-7 shadow-sm transition-colors duration-200 hover:border-[#D4A52A]"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/10 text-[#18156D]">
                                {Icon && (
                                  <Icon
                                    size={24}
                                    strokeWidth={
                                      2
                                    }
                                  />
                                )}
                              </div>

                              {item.title && (
                                <h3 className="mt-6 text-[18px] font-bold leading-6 text-[#18156D]">
                                  {
                                    item.title
                                  }
                                </h3>
                              )}

                              {item.desc && (
                                <p className="mt-3 text-[14px] leading-6 text-gray-600 md:text-[15px]">
                                  {
                                    item.desc
                                  }
                                </p>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* =====================================================
              SELLER RESPONSIBILITIES
          ===================================================== */}

          {section2 &&
            (responsibilities.length >
              0 ||
              respTitle) && (
              <section className="bg-white py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6">
                  <div className="mx-auto max-w-3xl text-center">
                    {respBadge && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#18156D]/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#18156D]">
                        <ClipboardList
                          size={14}
                        />

                        {respBadge}
                      </span>
                    )}

                    {respTitle && (
                      <h2 className="mt-5 text-[24px] font-bold leading-[32px] text-[#18156D] md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                        {respTitle}
                      </h2>
                    )}

                    {respDesc && (
                      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-6 text-gray-600 md:text-[17px] md:leading-7">
                        {respDesc}
                      </p>
                    )}
                  </div>

                  {responsibilities.length >
                    0 && (
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {responsibilities.map(
                        (
                          item,
                          index,
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <div
                              key={
                                item.title ||
                                index
                              }
                              className="rounded-2xl border border-[#ECE7DD] bg-[#FCFBF8] p-7 transition-colors duration-200 hover:border-[#D4A52A]"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D] text-white">
                                {Icon && (
                                  <Icon
                                    size={23}
                                    strokeWidth={
                                      2
                                    }
                                  />
                                )}
                              </div>

                              {item.title && (
                                <h3 className="mt-6 text-[17px] font-bold leading-6 text-[#18156D] md:text-[18px]">
                                  {
                                    item.title
                                  }
                                </h3>
                              )}

                              {item.desc && (
                                <p className="mt-3 text-[14px] leading-6 text-gray-600">
                                  {
                                    item.desc
                                  }
                                </p>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* =====================================================
              COMPLIANCE
          ===================================================== */}

          {section3 &&
            (compliance.length > 0 ||
              compTitle) && (
              <section className="bg-[#F7F5EF] py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6">
                  <div className="mx-auto max-w-3xl text-center">
                    {compBadge && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#B88400]">
                        <BadgeCheck
                          size={14}
                        />

                        {compBadge}
                      </span>
                    )}

                    {compTitle && (
                      <h2 className="mt-5 text-[24px] font-bold leading-[32px] text-[#18156D] md:text-[30px] md:leading-[40px] lg:text-[36px] lg:leading-[46px]">
                        {compTitle}
                      </h2>
                    )}

                    {compDesc && (
                      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-6 text-gray-600 md:text-[17px] md:leading-7">
                        {compDesc}
                      </p>
                    )}
                  </div>

                  {compliance.length >
                    0 && (
                    <div className="mt-12 grid gap-6 lg:grid-cols-3">
                      {compliance.map(
                        (
                          item,
                          index,
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <div
                              key={
                                item.title ||
                                index
                              }
                              className="rounded-2xl border border-[#18156D]/10 bg-[#18156D] p-8 transition-colors duration-200 hover:bg-[#211d78]"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#F2D37A]">
                                {Icon && (
                                  <Icon
                                    size={24}
                                    strokeWidth={
                                      2
                                    }
                                  />
                                )}
                              </div>

                              {item.title && (
                                <h3 className="mt-6 text-[18px] font-bold leading-6 text-white md:text-[20px]">
                                  {
                                    item.title
                                  }
                                </h3>
                              )}

                              {item.desc && (
                                <p className="mt-3 text-[14px] leading-6 text-white/70 md:text-[15px]">
                                  {
                                    item.desc
                                  }
                                </p>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}
        </ApiState>
      </div>
    );
  }