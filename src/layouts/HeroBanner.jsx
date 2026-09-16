import React, { memo, useMemo } from "react";
import { useCmsRecord } from "../hooks/useCmsRecord";
import HeroSwiper from "./HeroSwiper";

function mapCmsToSlides(cmsPage) {
  if (!cmsPage) return null;
  const sections =
    cmsPage?.sections?.length
      ? cmsPage.sections
      : cmsPage?.metadata?.data?.sections?.length
        ? cmsPage.metadata.data.sections
        : null;

  if (!sections) return null;

  return sections
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((section, i) => {

      const rawTitle = section.title || cmsPage.title || "";
      const titleParts = rawTitle.split(/\\n|\n|<br\s*\/?>/i);
      const title = titleParts[0]?.trim() || "";
      const highlight = titleParts[1]?.trim() || "";
      const badge =
        section.points?.[0]?.title ||
        section.excerpt ||
        "";
      const primaryButton = section.cta?.label || "Shop Now";
      const primaryLink =
        section.cta?.url?.trim() || "/products";
      const secondaryCta = section.points?.[1]?.cta || section.points?.[0]?.cta;
      const secondaryButton =
        secondaryCta?.label?.trim()
          ? secondaryCta.label
          : "Explore Categories";
      const secondaryLink =
        secondaryCta?.url?.trim() || "/categories";

      const image =
        section.image?.url ||
        cmsPage.image?.url ||
        cmsPage.heroImage ||
        cmsPage.coverImage ||
        "";

      return {
        id: section._id || `slide-${i}`,
        image,
        badge,
        title,
        highlight,
        description: section.description || "",
        primaryButton,
        primaryLink,
        secondaryButton,
        secondaryLink,
      };
    })
    .filter((s) => s.image || s.title);
}

const HeroBanner = memo(() => {
  const { page: heroBannerPage } = useCmsRecord("Hero Banner");
  const cmsSlides = useMemo(
    () => mapCmsToSlides(heroBannerPage),
    [heroBannerPage],
  );

  if (!cmsSlides || cmsSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[480px] w-screen items-center overflow-hidden bg-[#1B1D60] sm:h-[520px] md:h-[620px] lg:h-[650px]">
      <HeroSwiper slides={cmsSlides} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/20 to-transparent z-20" />
      <div className="pointer-events-none absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-[var(--customer-gold)]/10 blur-[80px] z-20" />
    </section>
  );
});

HeroBanner.displayName = "HeroBanner";
export default HeroBanner;
