import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { getCmsPayload, useCmsRecord } from "../hooks/useCmsRecord";
import FooterActionLinks from "./footer/FooterActionLinks";
import FooterAppDownload from "./footer/FooterAppDownload";
import FooterBenefits from "./footer/FooterBenefits";
import FooterBottomBar from "./footer/FooterBottomBar";
import FooterLinkGroups from "./footer/FooterLinkGroups";
import { asArray, hrefOr } from "../utils/content";
import { footerData } from "../data/footer";
import { SkeletonLoader } from "../components/common";
import { SKELETON_PRESETS } from "../components/common/skeleton";

const EMPTY_FOOTER = {
  benefits: [],
  linkGroups: [],
  actionLinks: [],
  appDownload: { title: "", links: [] },
  socialLinks: [],
  copyright: "",
};

const normalizeFooterHref = (link) => {
  if (String(link?.label || "").trim().toLowerCase() === "why choose us") {
    return "/about-us#why-choose-us";
  }

  return hrefOr(link?.href || link?.url);
};

export function Footer({ data = {} }) {
  const loading = useDelayedLoading();
  const { page } = useCmsRecord("footer-links");
  const baseData = { ...footerData, ...data };
  const cmsData = getCmsPayload(page, baseData) || {};
  const footer = {
    ...EMPTY_FOOTER,
    ...baseData,
    ...cmsData,
    benefits: asArray(cmsData?.benefits || baseData?.benefits),
    linkGroups: asArray(
      cmsData?.linkGroups || cmsData?.groups || baseData?.linkGroups,
    ).map((group) => ({
      ...group,
      links: asArray(group?.links).map((link) => ({
        ...link,
        href: normalizeFooterHref(link),
      })),
    })),
    actionLinks: asArray(cmsData?.actionLinks || baseData?.actionLinks).map(
      (item) => ({
        ...item,
        href: hrefOr(item?.href || item?.url),
      }),
    ),
    appDownload: {
      title: cmsData?.appDownload?.title || baseData?.appDownload?.title || "",
      links: asArray(
        cmsData?.appDownload?.links || baseData?.appDownload?.links,
      ).map((link) => ({
        ...link,
        href: hrefOr(link?.href || link?.url),
      })),
    },
    socialLinks: asArray(cmsData?.socialLinks || baseData?.socialLinks).map(
      (item) => ({
        ...item,
        href: hrefOr(item?.href || item?.url),
      }),
    ),
  };

  return (
    <footer className="w-full bg-surface font-montserrat text-ink">
      <FooterBenefits items={footer.benefits} />

      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.FOOTER_LINKS}
          count={6}
          containerClass="w-container my-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        />
      ) : (
        <FooterLinkGroups groups={footer.linkGroups} />
      )}

      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.FOOTER_ACTIONS}
          count={4}
          containerClass="w-container grid grid-cols-1 gap-4 border-y border-accent bg-band sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          wrapperClass="flex min-h-12 items-center p-2 lg:p-8"
        />
      ) : (
        <FooterActionLinks items={footer.actionLinks} />
      )}

      <FooterAppDownload data={footer.appDownload} />
      <FooterBottomBar
        copyright={footer.copyright}
        socialLinks={footer.socialLinks}
      />
    </footer>
  );
}
