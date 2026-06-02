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
  if (
    String(link?.label || "")
      .trim()
      .toLowerCase() === "why choose us"
  ) {
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
    <footer className=" w-full bg-[#1C1C1C]   text-white">
      <div className=" xl:px-12 bg-[#F5F8FB] border-t-2  border-[#1B1D6033]">
        <FooterBenefits items={footer.benefits} />
      </div>
      <div className="pt-8 flex flex-col customer-container gap-2 md:gap-4  md:flex-row justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/image/svg/logoWithName.svg"
            alt="Sam Global"
            className="h-12 lg:h-16 lg:h-18 rounded p-1"
          />
        </div>

        <div>
          {" "}
          <FooterAppDownload data={footer.appDownload} />
        </div>
      </div>

      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.FOOTER_LINKS}
          count={6}
          containerClass="w-container my-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        />
      ) : (
        <FooterLinkGroups
          groups={footer.linkGroups}
          socialLinks={footer.socialLinks}
        />
      )}

      <FooterBottomBar
        copyright={footer.copyright}
        socialLinks={footer.socialLinks}
      />
    </footer>
  );
}
