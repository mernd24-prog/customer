import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import { asArray, hrefOr } from "../utils/content";
import { SocialIcons } from "../components/ui";
import SkeletonBox from "../components/ui/skeleton/SkeletonBox";
import { FALLBACK_FOOTER } from "../data/fallbackCmsData";
import { useFooterData } from "./footer/useFooterData";

/* -------------------------------------------------------------------------- */
/* FooterLinkGroups — renders one column per group + social icons            */
/* -------------------------------------------------------------------------- */

function FooterLinkGroups({ groups = [], socialLinks = [], hasDynamicGroups = false }) {
  const location = useLocation();

  if (!groups.length && !socialLinks.length) return null;

  return (
    <div className="customer-container">
      {groups.length > 0 && (
        <div
          className={
            hasDynamicGroups
              ? "grid grid-cols-2 gap-6 border-t border-white/25 pt-8 md:grid-cols-3 md:gap-10 lg:grid-cols-4 xl:gap-24 2xl:grid-cols-5"
              : "grid w-full grid-cols-1 gap-6 border-t border-white/25 pt-8 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {groups.map((group, groupIndex) => {
            const links = asArray(group?.links).filter(
              (link) => link?.label && link?.href,
            );
            if (!links.length) return null;

            return (
              <div key={group?.title || `group-${groupIndex}`}>
                <h2 className="mb-4 border-l-2 border-[var(--customer-gold)] pl-2 text-lg font-semibold text-white md:text-2xl">
                  {group?.title}
                </h2>

                {group?.isLoading ? (
                  <div className="flex flex-col gap-2 py-1 md:gap-3">
                    <SkeletonBox width="75%" height="16px" className="rounded !bg-white/10" />
                    <SkeletonBox width="55%" height="16px" className="rounded !bg-white/10" />
                    <SkeletonBox width="80%" height="16px" className="rounded !bg-white/10" />
                    <SkeletonBox width="60%" height="16px" className="rounded !bg-white/10" />
                    <SkeletonBox width="45%" height="16px" className="rounded !bg-white/10" />
                  </div>
                ) : (
                  <ul className="grid gap-1 md:gap-3">
                    {links.map((link, linkIndex) => {
                      const toPath = hrefOr(link?.href);
                      const isExternal =
                        /^https?:\/\//i.test(toPath) || link?.target === "_blank";

                      return (
                        <li key={`${link?.label}-${link?.href}-${linkIndex}`}>
                          {isExternal ? (
                            <a
                              href={toPath}
                              target={link?.target || "_blank"}
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-white/70 transition-all duration-300 ease-in-out hover:text-white md:text-base"
                            >
                              {link?.label}
                            </a>
                          ) : (
                            <Link
                              to={toPath}
                              onClick={() => {
                                if (location.pathname === toPath) {
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }
                              }}
                              className="text-sm font-medium text-white/70 transition-all duration-300 ease-in-out hover:text-white md:text-base"
                            >
                              {link?.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-4 py-6">
          {socialLinks.map((social, index) => (
            <SocialIcons
              key={social?.label || social?.href || `social-${index}`}
              data={social}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer({ data }) {
  const location = useLocation();
  const { footer, resolvedLinkGroups, hasDynamicGroups } = useFooterData(
    data || FALLBACK_FOOTER,
  );

  const benefits = asArray(footer?.benefits);
  const socialLinks = asArray(footer?.socialLinks);
  const appDownload = footer?.appDownload || {};
  const appDownloadLinks = asArray(appDownload?.links);
  const extraPages = asArray(footer?.extrapages || footer?.extraPages);

  return (
    <footer className="h-auto w-full bg-[#1C1C1C] text-white">
      {/* Benefits */}

      {benefits.length > 0 && (
        <div className="border-t-2 border-[#1B1D6033] bg-[#F5F8FB]">
          <div className="customer-container flex flex-col justify-between lg:flex-row">
            {benefits.map((item, index) => (
              <div
                key={item?.title || `benefit-${index}`}
                className="my-1 flex items-center gap-3.5 py-3.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D2E2F4] bg-white p-2.5 shadow-sm sm:h-14 sm:w-14">
                  {item?.icon ? (
                    <img
                      loading="lazy"
                      width="400"
                      height="400"
                      className="h-6 w-6 shrink-0 object-contain"
                      src={item.icon}
                      alt={item?.alt || item?.title || "Benefit"}
                    />
                  ) : (
                    <span className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>

                <div>
                  <h2 className="mb-0 text-base font-bold text-[#1B1D60] xl:text-lg">
                    {item?.title}
                  </h2>
                  <p className="text-xs font-light text-[#2E2E2E] sm:text-sm xl:text-base">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logo + App Download */}

      <div className="customer-container flex flex-col justify-between gap-2 pt-4 sm:pt-0 md:flex-row md:gap-16 lg:gap-4">
        <div className="my-2 flex gap-3 md:items-center">
          <Link to="/">
            <img
              loading="lazy"
              width="290"
              height="60"
              className="h-9 w-[290px] rounded object-contain sm:h-12 lg:h-16 xl:h-[60px]"
              src={footer?.logo || "/image/webp/logoWithName.webp"}
              alt={footer?.logoAlt || "Sam Global"}
            />
          </Link>
        </div>

        {(appDownload.title || appDownloadLinks.length > 0) && (
          <div className="md:py-4">
            {appDownload.title && (
              <h2 className="max-w-sm text-sm font-medium text-white/85 lg:!w-full">
                {appDownload.title}
              </h2>
            )}

            {appDownloadLinks.length > 0 && (
              <div className="my-4 flex flex-wrap gap-6 lg:my-6">
                {appDownloadLinks.map((app, index) => {
                  if (!app?.image) return null;

                  const toPath = hrefOr(app?.href || "/mobile-app");
                  const isExternal =
                    /^https?:\/\//i.test(toPath) || app?.target === "_blank";

                  const content = (
                    <img
                      loading="lazy"
                      className="h-10 w-auto lg:h-[50px]"
                      src={app.image}
                      alt={app?.alt || app?.label || "App"}
                      width="150"
                      height="50"
                    />
                  );

                  if (isExternal) {
                    return (
                      <a
                        key={`${app?.label}-${app?.href}-${index}`}
                        href={toPath}
                        target={app?.target || "_blank"}
                        rel="noopener noreferrer"
                        aria-label={app?.label || "App link"}
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={`${app?.label}-${app?.href}-${index}`}
                      to={toPath}
                      target={app?.target}
                      rel={app?.target === "_blank" ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        if (location.pathname === toPath) {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      aria-label={app?.label || "App link"}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Links + Social */}

      <FooterLinkGroups
        groups={resolvedLinkGroups}
        socialLinks={socialLinks}
        hasDynamicGroups={hasDynamicGroups}
      />

      {/* Extra Pages */}

      {extraPages.length > 0 && (
        <div className="customer-container flex flex-wrap justify-center gap-4 pb-4 text-sm text-white/70">
          {extraPages.map((page, index) => {
            const label = page?.label || page?.title || "";
            const href = page?.href || page?.url || "";
            if (!label || !href) return null;

            const toPath = hrefOr(href);
            const isExternal =
              /^https?:\/\//i.test(toPath) || page?.target === "_blank";

            if (isExternal) {
              return (
                <a
                  key={`${label}-${href}-${index}`}
                  href={toPath}
                  target={page?.target || "_blank"}
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {label}
                </a>
              );
            }

            return (
              <Link
                key={`${label}-${href}-${index}`}
                to={toPath}
                className="hover:text-white"
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
      <section className="bg-black py-2">
        <div className="customer-container flex flex-col justify-center gap-2 text-xs text-white md:text-base lg:flex-row lg:gap-10">
          <p className="text-center">{footer?.copyright}</p>
        </div>
      </section>
    </footer>
  );
}

export { Footer };
export default Footer;