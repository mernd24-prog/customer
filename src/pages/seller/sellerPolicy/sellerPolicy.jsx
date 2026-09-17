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

const FALLBACK_POLICY = {
  title: "Seller Policy",
  excerpt: "Seller Guidelines",
  description: "Our Seller Policy defines the standards and responsibilities that create a trusted experience for sellers and customers.",
  image: { url: "/image/png/fallback/sellerPolicy.webp" },
  cta: { label: "Become a Seller", url: "/become-a-seller" },
  sections: [
    { type: "policy-highlights", title: "Everything You Need To Sell Confidently", description: "Our marketplace policies protect sellers and strengthen customer confidence.", points: [
      { title: "Genuine Products", description: "Sell only authentic and legally sourced products." },
      { title: "Accurate Listings", description: "Provide correct titles, images, pricing and specifications." },
      { title: "Timely Shipping", description: "Dispatch orders within the promised timeline." },
    ] },
    { type: "seller-responsibilities", title: "Your Commitment Matters", description: "Follow these responsibilities to provide a trusted shopping experience.", points: [
      { title: "List Authentic Products", description: "Upload only original products with complete details." },
      { title: "Maintain Accurate Listings", description: "Keep pricing, stock and information updated." },
      { title: "Process Orders Quickly", description: "Accept, pack and dispatch every order on time." },
      { title: "Support Customers", description: "Respond professionally to customer queries and returns." },
    ] },
    { type: "account-compliance", title: "Maintain a Healthy Seller Account", description: "We monitor seller performance to ensure reliable service.", points: [
      { title: "Good Standing", description: "Maintain accurate listings, timely shipping, and quality service." },
      { title: "Performance Review", description: "Accounts are reviewed using fulfillment and satisfaction data." },
      { title: "Policy Violations", description: "Repeated violations can lead to account restrictions." },
    ] },
  ],
};

export default function SellerPolicy() {
  const { page: policyRecord, loading: loading1 } =
    useCmsRecord("seller-policy");
  const { page: policiesRecord, loading: loading2 } =
    useCmsRecord("seller-policies");
  const page = policyRecord || policiesRecord;
  const loading = loading1 || loading2;

  const cmsPage = page || FALLBACK_POLICY;

  // Hero section mappings from dynamic CMS data
  const heroTitle = cmsPage?.title || "";
  const badgeText = cmsPage?.excerpt || cmsPage?.category || "";
  const heroDesc =
    cmsPage?.description ||
    (cmsPage?.body ? cmsPage.body.replace(/<[^>]+>/g, "").trim() : "");
  const heroImg = cmsPage?.image?.url || cmsPage?.heroImage || cmsPage?.coverImage || "";
  const primaryCtaLabel = cmsPage?.cta?.label || "Become a Seller";
  const primaryCtaUrl = cmsPage?.cta?.url || "/become-a-seller";
  const secondaryCtaLabel = "Contact Support";
  const secondaryCtaUrl = "/contact-us";

  // Section 1: Policy Guidelines / Highlights
  const section1 =
    cmsPage?.sections?.find(
      (s) =>
        s.type === "policy-guidelines" ||
        s.type === "policy-highlights" ||
        s.title?.toLowerCase().includes("confidently") ||
        s.title?.toLowerCase().includes("guidelines") ||
        s.title?.toLowerCase().includes("highlights"),
    ) || cmsPage?.sections?.[0];

  const highlightBadge =
    section1?.cta?.label ||
    (section1?.type ? section1.type.replace(/-/g, " ") : "");
  const highlightTitle = section1?.title || "";
  const highlightDesc = section1?.description || "";

  const highlights = Array.isArray(section1?.points)
    ? section1.points.map((point, index) => ({
        icon: highlightIcons[index % highlightIcons.length],
        title: point.title || "",
        desc: point.description || "",
        image: point.image?.url || null,
      }))
    : [];

  // Section 2: Seller Responsibilities
  const section2 =
    cmsPage?.sections?.find(
      (s) =>
        s.type === "seller-responsibilities" ||
        s.type === "responsibilities" ||
        s.title?.toLowerCase().includes("commitment") ||
        s.title?.toLowerCase().includes("responsibilities"),
    ) || cmsPage?.sections?.[1];

  const respBadge =
    section2?.cta?.label ||
    (section2?.type ? section2.type.replace(/-/g, " ") : "");
  const respTitle = section2?.title || "";
  const respDesc = section2?.description || "";

  const responsibilities = Array.isArray(section2?.points)
    ? section2.points.map((point, index) => ({
        icon: responsibilityIcons[index % responsibilityIcons.length],
        title: point.title || "",
        desc: point.description || "",
        image: point.image?.url || null,
      }))
    : [];

  const section3 =
    cmsPage?.sections?.find(
      (s) =>
        s.type === "account-compliance" ||
        s.type === "compliance" ||
        s.title?.toLowerCase().includes("compliance") ||
        s.title?.toLowerCase().includes("healthy") ||
        s.title?.toLowerCase().includes("account"),
    ) || cmsPage?.sections?.[2];

  const compBadge =
    section3?.cta?.label ||
    (section3?.type ? section3.type.replace(/-/g, " ") : "");
  const compTitle = section3?.title || "";
  const compDesc = section3?.description || "";

  const compliance = Array.isArray(section3?.points)
    ? section3.points.map((point, index) => ({
        icon: complianceIcons[index % complianceIcons.length],
        title: point.title || "",
        desc: point.description || "",
        image: point.image?.url || null,
      }))
    : [];

  return (
    <div
      className="w-[100vw] overflow-x-hidden"
      style={{ marginLeft: "calc(-50vw + 50%)" }}
    >
      <Seo
        title={
          cmsPage?.seo?.metaTitle ||
          (heroTitle
            ? `${heroTitle} - Sam Global`
            : "Seller Policy - Sam Global")
        }
        metaDescription={
          cmsPage?.seo?.metaDescription ||
          heroDesc ||
          "Read our Seller Policy to understand the guidelines, responsibilities, and standards for selling on our platform."
        }
      />

      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden w-full bg-[#FAF8F3]">
        {/* Background Image */}
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

        {/* Content Overlay */}
        <div className="customer-container flex min-h-[570px] items-center py-16 lg:min-h-[780px] lg:py-20">
          <div className="max-w-3xl">
            {badgeText && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A52A]/30 bg-[#D4A52A]/15 px-4 py-2 text-sm font-medium text-[#18156D] backdrop-blur-sm">
                <Sparkles size={16} className="text-[#efc75f]" />
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#18156D]/20 bg-white/70 px-7 font-bold text-[#18156D] transition hover:-translate-y-0.5 backdrop-blur"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= POLICY HIGHLIGHTS ================= */}
      {section1 && (highlights.length > 0 || highlightTitle) && (
        <section className="py-8 bg-[#FAF8F3]">
          <div className="max-w-7xl mx-auto px-8 py-8">
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
                            src={item.image}
                            alt={item.title}
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
      {section2 && (responsibilities.length > 0 || respTitle) && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
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
                      {/* Top Accent */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D4A52A] via-[#F2D37A] to-[#D4A52A]" />

                      {/* Icon */}
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/8 text-[#18156D] transition-colors duration-300 group-hover:bg-[#18156D] group-hover:text-white">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            Icon && <Icon size={20} strokeWidth={2.2} />
                          )}
                        </div>
                      </div>

                      {/* Content */}
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

                      {/* Bottom Divider */}
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
      {section3 && (compliance.length > 0 || compTitle) && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
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
                      className="group rounded-[28px] border border-[#ECE7DD] p-8 transition-all duration-500 ease-in-out hover:-translate-y-1.5 hover:border-[#18156D] hover:bg-[#18156D] cursor-pointer"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/10 text-[#18156D] transition-all duration-500 ease-in-out group-hover:bg-white/10 group-hover:text-white">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
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
