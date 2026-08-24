import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asArray, hrefOr } from "../utils/content";
import { footerData } from "../data/footer";
import { SocialIcons } from "../components/ui";
import { Link, useLocation } from "react-router-dom";
import { CUSTOMER_ROUTES } from "../constants/routes";
import { fetchCategories, fetchBrands } from "../features/catalog/catalogSlice";
import { brandToSlug } from "../utils/ecommerce/brand";

// ─── helpers ──────────────────────────────────────────────────────────────────

const buildCategorySlug = (name = "category") =>
  String(name).trim().toLowerCase().replace(/\s+/g, "-");

const getCategoryKey = (item = {}) =>
  item?.categoryKey ||
  item?.key ||
  item?.slug ||
  buildCategorySlug(item?.title || item?.name);

function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  if (data?.category && typeof data.category === "object")
    return [data.category];
  if (data?.data) return getCategoryListFromResponse(data.data);
  return [data];
}

function getRootCategories(categories = []) {
  const byKey = new Map();

  const visit = (category, parentKey = null) => {
    if (!category || typeof category !== "object") return;
    const categoryKey = getCategoryKey(category);
    if (!categoryKey) return;
    const normalized = {
      ...category,
      categoryKey,
      parentKey: category?.parentKey ?? parentKey,
    };
    byKey.set(categoryKey, normalized);
    asArray(category?.children).forEach((child) => visit(child, categoryKey));
    asArray(category?.subCategories).forEach((child) =>
      visit(child, categoryKey),
    );
  };

  asArray(categories).forEach((category) =>
    visit(category, category?.parentKey ?? null),
  );

  return Array.from(byKey.values()).filter(
    (category) =>
      category.parentKey === null ||
      category.parentKey === undefined ||
      !byKey.has(category.parentKey) ||
      Number(category?.level ?? 0) === 0,
  );
}

// ─── FooterLinkGroups ─────────────────────────────────────────────────────────

function FooterLinkGroups({ groups = [], socialLinks = [] }) {
  const location = useLocation();

  if (!groups.length) return null;

  return (
    <div className="customer-container">
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

// ─── Footer ───────────────────────────────────────────────────────────────────

const emptyArray = [];

export function Footer({ data = footerData }) {
  const dispatch = useDispatch();
  const location = useLocation();

  // ── Redux state ─────────────────────────────────────────────────────────────
  const catalogCategoryList = useSelector(
    (state) =>
      state.catalog.globalCategories || state.catalog.list || emptyArray,
  );
  const globalBrands = useSelector(
    (state) => state.catalog.globalBrands || emptyArray,
  );

  // ── Fetch if not yet loaded ──────────────────────────────────────────────────
  useEffect(() => {
    const categoryList = getCategoryListFromResponse(catalogCategoryList);
    if (!categoryList.length) {
      dispatch(fetchCategories()).catch(() => {});
    }
  }, [dispatch, catalogCategoryList]);

  useEffect(() => {
    if (!globalBrands.length) {
      dispatch(fetchBrands()).catch(() => {});
    }
  }, [dispatch, globalBrands.length]);

  // ── Static footer data ───────────────────────────────────────────────────────
  const footer = data || footerData;
  const {
    copyright = footerData.copyright,
    extrapages = footerData.extrapages,
  } = footer;
  const benefits = asArray(footer.benefits);
  const socialLinks = asArray(footer.socialLinks);
  const extraPages = asArray(extrapages);
  const appDownload = footer.appDownload || {};
  const appDownloadLinks = asArray(appDownload.links);

  // ── Derive API-based catalog categories (root only) ──────────────────────────
  const catalogCategories = useMemo(
    () => getRootCategories(getCategoryListFromResponse(catalogCategoryList)),
    [catalogCategoryList],
  );

  // ── Build dynamic "Categories" column from API (max 5) ─────────────────────────
  const apiCategoryLinks = useMemo(
    () =>
      catalogCategories.slice(0, 5).map((cat) => ({
        label: cat?.title || cat?.name || getCategoryKey(cat),
        href: CUSTOMER_ROUTES.category(getCategoryKey(cat)),
      })),
    [catalogCategories],
  );

  // ── Build dynamic "Brands" column from API (max 5) ──────────────────────────────
  const apiBrandLinks = useMemo(
    () =>
      asArray(globalBrands)
        .slice(0, 5)
        .map((brand) => {
          const name = brand?.name || brand?.label || brand?.value || "";
          const slug = brand?.slug || brand?.code || brandToSlug(name);
          return {
            label: name,
            href: CUSTOMER_ROUTES.brand(slug),
          };
        }),
    [globalBrands],
  );

  // ── Assemble link groups with enforced column order ──────────────────────────
  // Col 1: Categories (API)  Col 2: Brands (API)  Col 3+: remaining static groups
  const staticGroups = asArray(footer.linkGroups);

  const resolvedLinkGroups = useMemo(() => {
    // Static groups that are NOT Buy/Brands (those are replaced by API data)
    const REPLACED_TITLES = new Set(["buy", "brands"]);
    const remainingStatic = staticGroups.filter(
      (g) => !REPLACED_TITLES.has(String(g?.title || "").toLowerCase()),
    );

    // Col 1 – Categories from API (fallback: empty group so heading still shows)
    const categoriesGroup = {
      title: "Categories",
      links: apiCategoryLinks,
    };

    // Col 2 – Brands from API (fallback: empty group)
    const brandsGroup = {
      title: "Brands",
      links: apiBrandLinks,
    };

    // Final order: Categories → Brands → Sell → About SAM → Help & Contact …
    return [categoriesGroup, brandsGroup, ...remainingStatic];
  }, [staticGroups, apiCategoryLinks, apiBrandLinks]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <footer className="w-full   bg-[#1C1C1C] h-auto text-white">
      {benefits.length > 0 && (
        <div className="bg-[#F5F8FB] border-t-2 border-[#1B1D6033]">
          <div className="flex flex-col lg:flex-row justify-between customer-container">
            {benefits.map((item, index) => (
              <div
                key={item?.title || `benefit-${index}`}
                className="flex items-center gap-3.5 py-3.5 my-1"
              >
                <div className="flex h-11 w-11 sm:h-14 sm:w-14  items-center justify-center rounded-full border border-[#D2E2F4] bg-white p-2.5 shadow-sm">
                  <img loading="lazy" width="400" height="400"
                    className="h-6 w-6  shrink-0 object-contain"
                    src={item?.icon}
                    alt={item?.alt || item?.title || "Benefit"}
                  />
                </div>
                <div>
                  <h2 className="mb-0 text-base xl:text-lg font-bold text-[#1B1D60]">
                    {item?.title}
                  </h2>
                  <p className="text-xs sm:text-sm xl:text-base font-light text-[#2E2E2E]">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="customer-container pt-4 sm:pt-0 flex flex-col gap-2 md:gap-16 lg:gap-4 md:flex-row justify-between">
        <div className="flex my-2  md:items-center gap-3 ">
          <Link to="/">
            <picture>
              <source
                srcSet="/image/webp/logoWithName-small.webp 1x, /image/webp/logoWithName.webp 2x"
                type="image/webp"
              />
              <img
                src="/image/webp/logoWithName.webp"
                alt="Sam Global"
                width="290"
                height="50"
                loading="lazy"
                className="h-9 sm:h-12 lg:h-16 xl:h-[60px] w-[290px] rounded object-contain"
              />
            </picture>
          </Link>
        </div>

        {/* App download Section */}
        {(appDownload.title || appDownloadLinks.length > 0) && (
          <div className="md:py-4 ">
            <h2 className="max-w-sm lg:!w-full text-sm font-medium text-white/85">
              {appDownload.title}
            </h2>
            <div className="my-4  flex flex-wrap gap-6 lg:my-6 ">
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
                    <img loading="lazy"
                      className="h-10 lg:h-[50px] w-auto"
                      src={app?.image}
                      alt={app?.alt || app?.label || "App"}
                      width="150"
                      height="50"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <FooterLinkGroups groups={resolvedLinkGroups} socialLinks={socialLinks} />

      <section className="bg-black py-2">
        <div className="customer-container flex flex-col gap-2 lg:gap-10 text-white text-xs md:text-base lg:flex-row justify-center">
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
