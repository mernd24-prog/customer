import { useMemo, useState, useEffect } from "react";
import { asArray, hrefOr } from "../utils/content";
import { footerData } from "../data/footer";
import { SocialIcons } from "../components/common";
import { Link, useLocation } from "react-router-dom";
import { CUSTOMER_ROUTES } from "../constants/routes";
import { useDispatch } from "react-redux";
import { fetchBrands } from "../features/catalog/catalogSlice";
import {
  getBrandName,
  getBrandRouteKey,
  listFromPayload,
} from "../pages/brand/BrandOutletPage";

// Inline Footer Link Groups Component
function FooterLinkGroups({ groups = [], socialLinks = [] }) {
  const location = useLocation();

  if (!groups.length) return null;

  return (
    <div className="max-w-[1760px] mx-auto px-4  md:px-8">
      <div className="grid grid-cols-2 gap-6  md:gap-10 xl:gap-24 border-t border-white/25 pt-8 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {groups.map((group, groupIndex) => (
          <div key={group?.title || `group-${groupIndex}`}>
            <h2 className="mb-4 border-l-2 font-semibold text-lg md:text-2xl pl-2 border-[var(--customer-gold)] text-white">
              {group?.title}
            </h2>
            <ul className="grid gap-1  md:gap-3">
              {(Array.isArray(group?.links) ? group.links : []).map(
                (link, linkIndex) => {
                  const toPath = hrefOr(link?.href);
                  return (
                    <li key={link?.label || `link-${linkIndex}`}>
                      <Link
                        to={toPath}
                        target={link?.target}
                        rel={
                          link?.target === "_blank"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        onClick={() => {
                          if (location.pathname === toPath) {
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className="text-sm md:text-base text-white/70 text-white transition-all duration-300 ease-in-out font-medium hover:text-white"
                      >
                        {link?.label}
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 py-6">
        {socialLinks.map((social, index) => (
          <SocialIcons key={social?.label || `social-${index}`} data={social} />
        ))}
      </div>
    </div>
  );
}

export function Footer({ data = footerData }) {
  const [footerBrands, setFooterBrands] = useState([]);

  const location = useLocation();

  const dispatch = useDispatch();

  const brandLinks = useMemo(() => {
    return footerBrands.slice(0, 5).map((brand) => ({
      label: getBrandName(brand),
      href: CUSTOMER_ROUTES.brand(getBrandRouteKey(brand)),
    }));
  }, [footerBrands]);

  useEffect(() => {
    dispatch(fetchBrands({ params: { limit: 500 } }))
      .then((result) => {
        const brands = listFromPayload(result?.payload);

        const brandsWithProducts = brands.filter((brand) => {
          const count =
            brand.count ??
            brand.productCount ??
            brand.productsCount ??
            brand.product_count ??
            brand.products_count ??
            brand.counts?.products ??
            brand.meta?.productCount ??
            0;

          return Number(count) > 0;
        });

        setFooterBrands(brandsWithProducts.slice(0, 4));
      })
      .catch((err) => {
        console.error("Failed to fetch footer brands", err);
      });
  }, [dispatch]);

  const footer = data || footerData;
  const {
    copyright = footerData.copyright,
    extrapages = footerData.extrapages,
  } = footer;
  const benefits = asArray(footer.benefits);

  const resolvedLinkGroups = useMemo(() => {
    return footer.linkGroups.map((group) => {
      if (group.title === "Brands") {
        return {
          ...group,
          links: brandLinks,
        };
      }

      return group;
    });
  }, [footer.linkGroups, brandLinks]);

  const socialLinks = asArray(footer.socialLinks);
  const extraPages = asArray(extrapages);
  const appDownload = footer.appDownload || {};
  const appDownloadLinks = asArray(appDownload.links);

  return (
    <footer className="w-full   bg-[#1C1C1C] h-auto text-white">
      {benefits.length > 0 && (
        <div className="xl:px-12 bg-[#F5F8FB] border-t-2 border-[#1B1D6033]">
          <div className="flex flex-col lg:flex-row justify-between py-1">
            {benefits.map((item, index) => (
              <div
                key={item?.title || `benefit-${index}`}
                className="flex items-center gap-4 rounded-[var(--customer-radius)] px-4 py-3"
              >
                <img
                  className="h-10 w-10  shrink-0 object-contain sm:h-12 sm:w-12 2xl:h-[60px] 2xl:w-[60px]"
                  src={item?.icon}
                  alt={item?.alt || item?.title || "Benefit"}
                />
                <div>
                  <h2 className="mb-0 text-base xl:text-xl font-bold text-[#1B1D60]">
                    {item?.title}
                  </h2>
                  <p className="text-sm xl:text-lg font-light text-[#2E2E2E]">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="pt-4 sm:pt-0 flex  flex-col max-w-[1760px] mx-auto px-4 md:px-8 gap-2 md:gap-16 lg:gap-4 md:flex-row justify-between">
        <div className="flex my-2 items-center gap-3 ">
          <Link to="/">
            <img
              src="/image/png/logoWithName.png"
              alt="Sam Global"
              className="h-9 sm:h-12 lg:h-16 xl:h-[60px]  rounded object-contain"
            />
          </Link>
        </div>

        {/* App download Section */}
        {(appDownload.title || appDownloadLinks.length > 0) && (
          <div className="md:py-4 ">
            <h2 className="max-w-sm lg:!w-full text-sm font-medium text-white/85">
              {appDownload.title}
            </h2>
            <div className="my-4 flex flex-wrap gap-6 lg:my-6 ">
              {appDownloadLinks.map((app, index) => {
                const toPath = hrefOr(app?.href);
                return (
                  <Link
                    key={app?.label || `app-link-${index}`}
                    to={toPath}
                    onClick={() => {
                      if (location.pathname === toPath) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    aria-label={app?.label || "App link"}
                  >
                    <img
                      className="h-10 lg:h-[50px] w-auto"
                      src={app?.image}
                      alt={app?.alt || app?.label || "App"}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <FooterLinkGroups groups={resolvedLinkGroups} socialLinks={socialLinks} />

      <section className="bg-black py-2   ">
        <div className="flex flex-col gap-2 lg:gap-10 text-white text-xs md:text-base lg:flex-row justify-center">
          <p className="text-center ">{copyright}</p>
          <div className="flex items-center justify-center gap-2 md:gap-8">
            {extraPages.map((item, index) => {
              const toPath = hrefOr(item?.links);
              return (
                <Link
                  key={item?.labels || `extra-page-${index}`}
                  to={toPath}
                  onClick={() => {
                    if (location.pathname === toPath) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="transition-colors duration-300 hover:text-[#CE9F2D]"
                >
                  {item.labels}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </footer>
  );
}
