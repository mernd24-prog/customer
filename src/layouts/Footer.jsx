import { useMemo } from "react";
import { useSelector } from "react-redux";
import { asArray, hrefOr } from "../utils/content";
import { footerData } from "../data/footer";
import { SocialIcons } from "../components/common";
import { Link } from "react-router-dom";
import { CUSTOMER_ROUTES } from "../constants/routes";

const buildCategorySlug = (name = "category") =>
  String(name).trim().toLowerCase().replace(/\s+/g, "-");

const getCategoryKey = (item = {}) =>
  item?.categoryKey ||
  item?.key ||
  item?.slug ||
  buildCategorySlug(item?.title || item?.name);

const normalizeForMatch = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const getMatchTokens = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

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

function findCategoryForFooterLink(link, categories) {
  const labelKey = normalizeForMatch(link?.label);
  const labelTokens = getMatchTokens(link?.label);
  if (!labelKey) return null;

  return categories.find((category) => {
    const rawValues = [
      category?.title,
      category?.name,
      category?.label,
      category?.categoryKey,
      category?.key,
      category?.slug,
    ];
    const values = rawValues.map(normalizeForMatch);
    const tokens = rawValues.flatMap(getMatchTokens);

    return (
      values.some((value) => value === labelKey) ||
      labelTokens.some((labelToken) =>
        tokens.some(
          (token) =>
            token === labelToken ||
            token === `${labelToken}s` ||
            `${token}s` === labelToken ||
            token.startsWith(labelToken),
        ),
      )
    );
  });
}

function resolveFooterLinkGroups(groups, categories) {
  if (!categories.length) return groups;

  return groups.map((group) => {
    if (String(group?.title || "").toLowerCase() !== "buy") return group;

    return {
      ...group,
      links: asArray(group?.links).map((link) => {
        const category = findCategoryForFooterLink(link, categories);
        const categoryKey = category ? getCategoryKey(category) : "";

        return categoryKey
          ? { ...link, href: CUSTOMER_ROUTES.category(categoryKey) }
          : link;
      }),
    };
  });
}

// Inline Footer Link Groups Component
function FooterLinkGroups({ groups = [], socialLinks = [] }) {
  if (!groups.length) return null;

  return (
    <div className="max-w-[1760px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-2 gap-6 border-t border-white/25 pt-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {groups.map((group, groupIndex) => (
          <div key={group?.title || `group-${groupIndex}`}>
            <h2 className="mb-4 border-l-2 font-semibold text-lg md:text-2xl pl-2 border-[var(--customer-gold)] text-white">
              {group?.title}
            </h2>
            <ul className="grid gap-1 md:gap-3">
              {(Array.isArray(group?.links) ? group.links : []).map(
                (link, linkIndex) => (
                  <li key={link?.label || `link-${linkIndex}`}>
                    <Link
                      to={hrefOr(link?.href)}
                      className="text-sm md:text-base text-white/70 text-white transition-all duration-300 ease-in-out font-medium hover:text-white"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 py-6 lg:py-10">
        {socialLinks.map((social, index) => (
          <SocialIcons key={social?.label || `social-${index}`} data={social} />
        ))}
      </div>
    </div>
  );
}

export function Footer({ data = footerData }) {
  const catalogCategoryList = useSelector((state) => state.catalog.list || []);
  const footer = data || footerData;
  const {
    copyright = footerData.copyright,
    extrapages = footerData.extrapages,
  } = footer;
  const benefits = asArray(footer.benefits);
  const linkGroups = asArray(footer.linkGroups);
  const catalogCategories = useMemo(
    () => getRootCategories(getCategoryListFromResponse(catalogCategoryList)),
    [catalogCategoryList],
  );
  const resolvedLinkGroups = useMemo(
    () => resolveFooterLinkGroups(linkGroups, catalogCategories),
    [catalogCategories, linkGroups],
  );
  const socialLinks = asArray(footer.socialLinks);
  const extraPages = asArray(extrapages);
  const appDownload = footer.appDownload || {};
  const appDownloadLinks = asArray(appDownload.links);

  return (
    <footer className="w-full   bg-[#1C1C1C] h-auto text-white">
      {benefits.length > 0 && (
        <div className="xl:px-12 bg-[#F5F8FB] border-t-2 border-[#1B1D6033]">
          <div className="flex flex-col lg:flex-row justify-between py-3">
            {benefits.map((item, index) => (
              <div
                key={item?.title || `benefit-${index}`}
                className="flex items-center gap-4 rounded-[var(--customer-radius)] px-4 py-3"
              >
                <img
                  className="h-10 w-10  shrink-0 object-contain sm:h-12 sm:w-12 2xl:h-[75px] 2xl:w-[75px]"
                  src={item?.icon}
                  alt={item?.alt || item?.title || "Benefit"}
                />
                <div>
                  <h2 className="mb-0 text-lg xl:text-2xl font-bold text-[#1B1D60]">
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
      <div className="pt-8 flex flex-col max-w-[1760px] mx-auto px-4 md:px-8 gap-2 md:gap-16 lg:gap-4 md:flex-row justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/image/png/logoWithName.png"
            alt="Sam Global"
            className="h-9 sm:h-12 lg:h-16 xl:h-20 rounded object-contain"
          />
        </div>

        {/* App download Section */}
        {(appDownload.title || appDownloadLinks.length > 0) && (
          <div className="md:py-6">
            <h2 className="max-w-sm lg:!w-full text-sm font-medium text-white/85">
              {appDownload.title}
            </h2>
            <div className="my-4 flex flex-wrap gap-6 lg:my-6">
              {appDownloadLinks.map((app, index) => (
                <Link
                  key={app?.label || `app-link-${index}`}
                  to={hrefOr(app?.href)}
                  aria-label={app?.label || "App link"}
                >
                  <img
                    className="h-10 lg:h-[60px] w-auto"
                    src={app?.image}
                    alt={app?.alt || app?.label || "App"}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <FooterLinkGroups groups={resolvedLinkGroups} socialLinks={socialLinks} />

      {/* Bottom Section with copyright and extra pages */}
      <section className="bg-black py-4   ">
        <div className="flex flex-col gap-2 lg:gap-10 text-white text-xs md:text-base lg:flex-row justify-center">
          <p className="text-center">{copyright}</p>
          <div className="flex items-center justify-center gap-2 md:gap-8">
            {extraPages.map((item, index) => (
              <a
                key={item?.labels || `extra-page-${index}`}
                href={hrefOr(item?.links)}
                className=""
              >
                {item.labels}
              </a>
            ))}
          </div>
        </div>
      </section>
    </footer>
  );
}
