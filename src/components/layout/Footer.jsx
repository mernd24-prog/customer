import { SkeletonLoader, SKELETON_PRESETS } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { footerData } from "../../data/footer";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";
import FooterActionLinks from "./footer/FooterActionLinks";
import FooterAppDownload from "./footer/FooterAppDownload";
import FooterBenefits from "./footer/FooterBenefits";
import FooterBottomBar from "./footer/FooterBottomBar";
import FooterLinkGroups from "./footer/FooterLinkGroups";

export function Footer({ data = footerData }) {
  const loading = useDelayedLoading();
  const { page } = useCmsRecord("footer-links");
  const cmsData = getCmsPayload(page, data);
  const footer = {
    ...data,
    ...cmsData,
    linkGroups: (cmsData.linkGroups || cmsData.groups || data.linkGroups || []).map((group) => ({
      ...group,
      links: (group.links || []).map((link) => ({
        ...link,
        href: link.href || link.url || "#",
      })),
    })),
    socialLinks: (cmsData.socialLinks || data.socialLinks || []).map((item) => ({
      ...item,
      href: item.href || item.url || "#",
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
