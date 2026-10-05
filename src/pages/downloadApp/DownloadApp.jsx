import { useMemo } from "react";

import Seo from "../../components/ui/Seo";
import { BENEFITS } from "../../constants/data.constant";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_FOOTER } from "../../data/fallbackCmsData";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getCmsPayload(page) {
  if (!page) {
    return null;
  }

  return (
    page?.metadata?.data ||
    page?.metadata?.content ||
    page?.metadata?.sections ||
    page?.data ||
    page?.content ||
    page?.sections ||
    page
  );
}

function getCmsImageUrl(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    const markdownMatch = image.match(/\]\((.*?)\)$/);

    return markdownMatch?.[1] || image;
  }

  const url =
    image?.url ||
    image?.src ||
    image?.imageUrl ||
    image?.path ||
    "";

  if (!url) {
    return "";
  }

  const markdownMatch = String(url).match(/\]\((.*?)\)$/);

  return markdownMatch?.[1] || url;
}

function getCmsSection(sections, title) {
  return asArray(sections).find(
    (section) =>
      String(section?.title || "")
        .trim()
        .toLowerCase() ===
      String(title)
        .trim()
        .toLowerCase(),
  );
}

/* -------------------------------------------------------------------------- */
/* Normalize App Download CMS Data                                            */
/* -------------------------------------------------------------------------- */

function normalizeAppDownloadData(page) {
  const payload = getCmsPayload(page);

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const sections = asArray(payload?.sections);

  const appSection = getCmsSection(
    sections,
    "appDownload",
  );

  if (!appSection) {
    return null;
  }

  const links = asArray(appSection?.points)
    .map((point) => ({
      label:
        point?.title ||
        point?.cta?.label ||
        "",

      href:
        point?.cta?.url ||
        point?.url ||
        "",

      image:
        getCmsImageUrl(point?.image),

      alt:
        point?.image?.alt ||
        point?.title ||
        point?.cta?.label ||
        "Download app",
    }))
    .filter(
      (item) =>
        item.label ||
        item.href ||
        item.image,
    );

  return {
    title:
      appSection?.description ||
      "",

    image:
      getCmsImageUrl(
        appSection?.image,
      ),

    links,
  };
}

/* -------------------------------------------------------------------------- */
/* Merge Backend + Fallback                                                   */
/* -------------------------------------------------------------------------- */

function getFallbackAppDownload() {
  return (
    FALLBACK_FOOTER?.appDownload || {
      title:
        "Download our app for a faster and smarter shopping experience.",

      links: [],
    }
  );
}

function mergeAppDownloadData(
  fallback,
  cmsData,
) {
  const safeFallback =
    fallback || getFallbackAppDownload();

  if (!cmsData) {
    return safeFallback;
  }

  return {
    ...safeFallback,

    /*
     * Backend description has priority.
     */
    title:
      cmsData?.title ||
      safeFallback?.title ||
      "",

    /*
     * Backend section image has priority.
     */
    image:
      cmsData?.image ||
      safeFallback?.image ||
      "",

    /*
     * Backend app links have priority.
     *
     * If backend has no points, fallback links are used.
     */
    links:
      cmsData?.links?.length > 0
        ? cmsData.links.map(
            (item, index) => ({
              ...safeFallback?.links?.[
                index
              ],

              ...item,

              href:
                item?.href ||
                safeFallback?.links?.[
                  index
                ]?.href ||
                "#",

              image:
                item?.image ||
                safeFallback?.links?.[
                  index
                ]?.image ||
                "",

              alt:
                item?.alt ||
                safeFallback?.links?.[
                  index
                ]?.alt ||
                item?.label ||
                "Download app",
            }),
          )
        : safeFallback?.links || [],
  };
}

/* -------------------------------------------------------------------------- */
/* Download App                                                               */
/* -------------------------------------------------------------------------- */

export default function DownloadApp() {
  const { page: cmsFooterPage } =
    useCmsRecord("footerdata");

  /* ------------------------------------------------------------------------ */
  /* CMS App Download Data                                                    */
  /* ------------------------------------------------------------------------ */

  const cmsAppDownload = useMemo(
    () =>
      normalizeAppDownloadData(
        cmsFooterPage,
      ),
    [cmsFooterPage],
  );

  /* ------------------------------------------------------------------------ */
  /* Final App Download Data                                                  */
  /* ------------------------------------------------------------------------ */

  const appDownload = useMemo(
    () =>
      mergeAppDownloadData(
        FALLBACK_FOOTER?.appDownload,
        cmsAppDownload,
      ),
    [cmsAppDownload],
  );

  const appLinks = asArray(
    appDownload?.links,
  );

  return (
    <>
      <Seo
        title="Download the Sam Global App"
        description="Download the Sam Global app for faster shopping, secure checkout, genuine products, and easy returns."
        path="/mobile-app"
      />

      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--customer-surface-soft)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] overflow-hidden bg-gradient-to-br from-[var(--customer-navy)] via-[#111653] to-[var(--customer-navy-dark)] text-white shadow-[0_18px_45px_rgba(3,1,77,0.16)]">
          <div className="relative grid min-h-[520px] grid-cols-1 items-center gap-2 px-5 py-10 sm:gap-12 sm:px-8 md:min-h-[600px] lg:grid-cols-[1fr_0.82fr] lg:px-20 lg:py-6 xl:min-h-[700px]">
            <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Logo */}
              <div className="flex gap-3">
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src="/image/png/logoWithWhiteText.png"
                  alt="Sam Global"
                  className="h-28 w-auto object-contain sm:h-32"
                />
              </div>

              <h1 className="max-w-[760px] text-xl font-bold sm:text-5xl xl:text-6xl">
                India's Smart Shopping App
              </h1>

              {/* Backend appDownload.description */}
              <p className="mt-4 max-w-[620px] text-base font-medium text-white/90 sm:text-2xl">
                {appDownload?.title ||
                  "Download our app for a faster and smarter shopping experience."}
              </p>

              {/* Benefits */}
              <div className="mt-6 grid w-full max-w-[760px] grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3">
                {BENEFITS.map(
                  ({
                    label,
                    icon: Icon,
                  }) => (
                    <div
                      key={label}
                      className="flex min-h-[58px] items-center justify-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.08] px-3 py-3 text-xs font-medium text-white sm:justify-start xl:text-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--customer-gold)] text-[var(--customer-navy)] xl:h-10 xl:w-10">
                        <Icon
                          size={18}
                          strokeWidth={2.4}
                        />
                      </span>

                      <span>
                        {label}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* App Store Links */}
              {appLinks.length > 0 && (
                <div className="mt-8 flex w-full flex-row items-center justify-center gap-2 sm:mt-12 xl:gap-4 lg:justify-start">
                  {appLinks.map(
                    (link, index) => {
                      if (!link?.href) {
                        return null;
                      }

                      return (
                        <a
                          key={
                            link?.label ||
                            link?.href ||
                            `app-link-${index}`
                          }
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={
                            link?.label ||
                            "Download app"
                          }
                          className="flex h-[58px] w-[205px] items-center justify-center rounded-[8px] border border-white/20 bg-black px-4 shadow-lg"
                        >
                          {link?.image ? (
                            <img
                              loading="lazy"
                              width="400"
                              height="400"
                              src={link.image}
                              alt={
                                link?.alt ||
                                link?.label ||
                                "Download app"
                              }
                              className="max-h-11 w-full object-contain"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {link?.label}
                            </span>
                          )}
                        </a>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            {/* App Preview */}
            <div className="relative z-10 flex items-end justify-center self-end lg:h-full lg:justify-end">
              <img
                loading="lazy"
                width="400"
                height="400"
                src="/image/png/downloadApp.png"
                alt="Sam Global Mobile App Preview"
                className="w-full max-w-[330px] object-contain sm:max-w-[430px] lg:max-w-[520px] xl:max-w-[570px]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

