import { SkeletonLoader, SKELETON_PRESETS } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";
import FooterActionLinks from "./footer/FooterActionLinks";
import FooterAppDownload from "./footer/FooterAppDownload";
import FooterBenefits from "./footer/FooterBenefits";
import FooterBottomBar from "./footer/FooterBottomBar";
import FooterLinkGroups from "./footer/FooterLinkGroups";
import { asArray, hrefOr } from "../../utils/content";

const EMPTY_FOOTER = {
  benefits: [],
  linkGroups: [],
  actionLinks: [],
  appDownload: { title: "", links: [] },
  socialLinks: [],
  copyright: "",
};

export function Footer() {
  const loading = useDelayedLoading();
  const { page } = useCmsRecord("footer-links");
  const cmsData = getCmsPayload(page);

  const footer = {
    ...EMPTY_FOOTER,
    ...cmsData,
    benefits: asArray(cmsData?.benefits),
    linkGroups: asArray(cmsData?.linkGroups || cmsData?.groups).map(
      (group) => ({
        ...group,
        links: asArray(group?.links).map((link) => ({
          ...link,
          href: hrefOr(link?.href || link?.url),
        })),
      }),
    ),
    actionLinks: asArray(cmsData?.actionLinks).map((item) => ({
      ...item,
      href: hrefOr(item?.href || item?.url),
    })),
    appDownload: {
      title: cmsData?.appDownload?.title || "",
      links: asArray(cmsData?.appDownload?.links).map((link) => ({
        ...link,
        href: hrefOr(link?.href || link?.url),
      })),
    },
    socialLinks: asArray(cmsData?.socialLinks).map((item) => ({
      ...item,
      href: hrefOr(item?.href || item?.url),
    })),
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
