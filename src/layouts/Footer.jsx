import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { asArray, hrefOr } from "../utils/content";
import { SocialIcons } from "../components/ui";
import SkeletonBox from "../components/ui/skeleton/SkeletonBox";
import { CUSTOMER_ROUTES } from "../constants/routes";
import { getBrandProductCount } from "../utils/pages/brandUtils";
import { brandToSlug } from "../utils/ecommerce/brand";
import { useCmsRecord } from "../hooks/useCmsRecord";
import { FALLBACK_FOOTER } from "../data/fallbackCmsData";

import {
  fetchCategories,
  fetchBrands,
  setGlobalBrands,
} from "../features/catalog/catalogSlice";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const emptyArray = [];

const buildCategorySlug = (name = "category") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const getCategoryKey = (item = {}) =>
  item?.categoryKey ||
  item?.key ||
  item?.slug ||
  item?._id ||
  buildCategorySlug(item?.title || item?.name);

function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.list)) {
    return data.list;
  }

  if (Array.isArray(data.categories)) {
    return data.categories;
  }

  if (data.category && typeof data.category === "object") {
    return [data.category];
  }

  if (data.data) {
    return getCategoryListFromResponse(data.data);
  }

  return [data];
}

function getBrandListFromResponse(data) {
  const payload = data?.data ?? data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  return (
    [payload.brands, payload.items, payload.list, payload.results].find(
      Array.isArray,
    ) || []
  );
}

function getRootCategories(categories = []) {
  const byKey = new Map();

  const visit = (category, parentKey = null) => {
    if (!category || typeof category !== "object") {
      return;
    }

    const categoryKey = getCategoryKey(category);

    if (!categoryKey) {
      return;
    }

    const normalized = {
      ...category,
      categoryKey,
      parentKey: category?.parentKey ?? parentKey,
    };

    byKey.set(categoryKey, normalized);

    asArray(category?.children).forEach((child) =>
      visit(child, categoryKey),
    );

    asArray(category?.subCategories).forEach((child) =>
      visit(child, categoryKey),
    );
  };

  asArray(categories).forEach((category) =>
    visit(category, category?.parentKey ?? null),
  );

  return Array.from(byKey.values()).filter((category) => {
    const count = category?.productCount ?? category?.count;

    const hasExplicitZeroCount =
      count !== undefined &&
      count !== null &&
      count !== "" &&
      Number(count) < 1;

    return (
      (category.parentKey === null ||
        category.parentKey === undefined ||
        !byKey.has(category.parentKey) ||
        Number(category.level || 0) === 0) &&
      !hasExplicitZeroCount
    );
  });
}

/* -------------------------------------------------------------------------- */
/* CMS Helpers                                                                */
/* -------------------------------------------------------------------------- */

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
    return image.trim();
  }

  return String(
    image?.url ||
      image?.src ||
      image?.imageUrl ||
      image?.path ||
      "",
  ).trim();
}

function getCmsSection(sections, title) {
  const normalizedTitle = String(title)
    .trim()
    .toLowerCase();

  return asArray(sections).find(
    (section) =>
      String(section?.title || "")
        .trim()
        .toLowerCase() === normalizedTitle,
  );
}

function getCmsPointImage(point) {
  return getCmsImageUrl(point?.image);
}

function getCmsSectionTitle(section) {
  const title = String(section?.title || "").trim();

  if (title) {
    return title;
  }

  const type = String(section?.type || "").trim();

  if (type && type.toLowerCase() !== "content") {
    return type;
  }

  return "";
}

/* -------------------------------------------------------------------------- */
/* CMS Footer Normalization                                                   */
/* -------------------------------------------------------------------------- */

function normalizeFooterCmsData(page) {
  const payload = getCmsPayload(page);

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const sections = asArray(payload?.sections);

  const footerLinksSection = getCmsSection(
    sections,
    "footer-links",
  );

  const appSection = getCmsSection(
    sections,
    "appDownload",
  );

  const copyrightSection = getCmsSection(
    sections,
    "copyright",
  );

  /* ------------------------------------------------------------------------ */
  /* Single Footer Logo                                                       */
  /* ------------------------------------------------------------------------ */

  const logo =
    getCmsImageUrl(appSection?.image) ||
    getCmsImageUrl(payload?.image);

  /* ------------------------------------------------------------------------ */
  /* Benefits                                                                 */
  /* ------------------------------------------------------------------------ */

  const benefits = asArray(
    footerLinksSection?.points,
  )
    .map((point) => {
      const title = String(
        point?.title || "",
      ).trim();

      const description = String(
        point?.description || "",
      ).trim();

      const icon = getCmsPointImage(point);

      if (!title && !description && !icon) {
        return null;
      }

      return {
        title,
        description,
        icon,
        alt:
          point?.image?.alt ||
          title ||
          "Benefit",
      };
    })
    .filter(Boolean);

  /* ------------------------------------------------------------------------ */
  /* CMS Link Groups                                                          */
  /* ------------------------------------------------------------------------ */

  const ignoredSectionTitles = new Set([
    "footer-links",
    "appdownload",
    "copyright",
  ]);

  const linkGroups = sections
    .map((section) => {
      const normalizedTitle = String(
        section?.title || "",
      )
        .trim()
        .toLowerCase();

      if (
        ignoredSectionTitles.has(
          normalizedTitle,
        )
      ) {
        return null;
      }

      /*
       * Sell has:
       *
       * type: "Sell"
       * title: ""
       *
       * Therefore use title first and type as fallback.
       */
      const title = getCmsSectionTitle(section);

      if (!title) {
        return null;
      }

      const links = asArray(section?.points)
        .map((point) => {
          const label = String(
            point?.cta?.label ||
              point?.title ||
              "",
          ).trim();

          const href = String(
            point?.cta?.url ||
              point?.url ||
              "",
          ).trim();

          if (!label || !href) {
            return null;
          }

          return {
            label,
            href,
            target:
              point?.cta?.target ||
              point?.target ||
              "_self",
          };
        })
        .filter(Boolean);

      if (!links.length) {
        return null;
      }

      return {
        title,
        links,
      };
    })
    .filter(Boolean);

  /* ------------------------------------------------------------------------ */
  /* App Download                                                             */
  /* ------------------------------------------------------------------------ */

  const appLinks = asArray(
    appSection?.points,
  )
    .map((point) => {
      const image = getCmsPointImage(point);

      const label = String(
        point?.title ||
          point?.cta?.label ||
          "",
      ).trim();

      const href = String(
        point?.cta?.url ||
          point?.url ||
          "/mobile-app",
      ).trim();

      if (!image && !label) {
        return null;
      }

      return {
        label,
        href,
        image,
        alt:
          point?.image?.alt ||
          label ||
          "App",
        target:
          point?.cta?.target ||
          point?.target ||
          "_self",
      };
    })
    .filter(Boolean);

  /* ------------------------------------------------------------------------ */
  /* Social Links                                                             */
  /* ------------------------------------------------------------------------ */

  const socialNames = [
    "instagram",
    "facebook",
    "youtube",
    "twitter",
    "linkedin",
    "pinterest",
  ];

  const socialLinks = asArray(
    copyrightSection?.points,
  )
    .map((point) => {
      const title = String(
        point?.title ||
          point?.cta?.label ||
          "",
      )
        .trim()
        .toLowerCase();

      const isSocial = socialNames.some(
        (name) => title.includes(name),
      );

      if (!isSocial) {
        return null;
      }

      const icon = getCmsPointImage(point);

      return {
        label: String(
          point?.cta?.label ||
            point?.title ||
            "",
        ).trim(),

        href: String(
          point?.cta?.url ||
            point?.url ||
            "",
        ).trim(),

        icon,

        alt:
          point?.image?.alt ||
          point?.cta?.label ||
          point?.title ||
          "Social media",

        target:
          point?.cta?.target ||
          point?.target ||
          "_blank",
      };
    })
    .filter(
      (item) =>
        item?.label ||
        item?.href ||
        item?.icon,
    );

  /* ------------------------------------------------------------------------ */
  /* Copyright                                                                */
  /* ------------------------------------------------------------------------ */

  const copyright = String(
    copyrightSection?.description ||
      payload?.copyright ||
      "",
  ).trim();

  return {
    logo,
    benefits,
    linkGroups,

    appDownload: {
      title: String(
        appSection?.description || "",
      ).trim(),
      links: appLinks,
    },

    copyright,
    socialLinks,
  };
}

/* -------------------------------------------------------------------------- */
/* Merge Helpers                                                              */
/* -------------------------------------------------------------------------- */

function mergeFooterBenefits(
  fallbackBenefits = [],
  cmsBenefits = [],
) {
  if (!cmsBenefits.length) {
    return fallbackBenefits;
  }

  return cmsBenefits.map(
    (cmsItem, index) => {
      const fallbackItem =
        fallbackBenefits[index] || {};

      return {
        ...fallbackItem,
        ...cmsItem,

        title:
          cmsItem?.title ||
          fallbackItem?.title ||
          "",

        description:
          cmsItem?.description ||
          fallbackItem?.description ||
          "",

        icon:
          cmsItem?.icon ||
          fallbackItem?.icon ||
          "",

        alt:
          cmsItem?.alt ||
          fallbackItem?.alt ||
          "Benefit",
      };
    },
  );
}

function mergeAppLinks(
  fallbackLinks = [],
  cmsLinks = [],
) {
  if (!cmsLinks.length) {
    return fallbackLinks;
  }

  return cmsLinks.map(
    (cmsItem, index) => {
      const fallbackItem =
        fallbackLinks[index] || {};

      return {
        ...fallbackItem,
        ...cmsItem,

        label:
          cmsItem?.label ||
          fallbackItem?.label ||
          "",

        href:
          cmsItem?.href ||
          fallbackItem?.href ||
          "/mobile-app",

        image:
          cmsItem?.image ||
          fallbackItem?.image ||
          "",

        alt:
          cmsItem?.alt ||
          fallbackItem?.alt ||
          cmsItem?.label ||
          fallbackItem?.label ||
          "App",

        target:
          cmsItem?.target ||
          fallbackItem?.target ||
          "_self",
      };
    },
  );
}

function mergeSocialLinks(
  fallbackLinks = [],
  cmsLinks = [],
) {
  if (!cmsLinks.length) {
    return fallbackLinks;
  }

  return cmsLinks.map(
    (cmsItem, index) => {
      const fallbackItem =
        fallbackLinks[index] || {};

      return {
        ...fallbackItem,
        ...cmsItem,

        label:
          cmsItem?.label ||
          fallbackItem?.label ||
          "",

        href:
          cmsItem?.href ||
          fallbackItem?.href ||
          "#",

        icon:
          cmsItem?.icon ||
          fallbackItem?.icon ||
          "",

        alt:
          cmsItem?.alt ||
          fallbackItem?.alt ||
          cmsItem?.label ||
          fallbackItem?.label ||
          "Social media",

        target:
          cmsItem?.target ||
          fallbackItem?.target ||
          "_blank",
      };
    },
  );
}

function mergeLinkGroups(
  fallbackGroups = [],
  cmsGroups = [],
) {
  if (!cmsGroups.length) {
    return fallbackGroups;
  }

  return cmsGroups.map(
    (cmsGroup, groupIndex) => {
      const cmsTitle = String(
        cmsGroup?.title || "",
      )
        .trim()
        .toLowerCase();

      const fallbackGroup =
        fallbackGroups.find(
          (group) =>
            String(group?.title || "")
              .trim()
              .toLowerCase() === cmsTitle,
        ) ||
        fallbackGroups[groupIndex] ||
        {};

      const fallbackLinks =
        asArray(fallbackGroup?.links);

      const cmsLinks =
        asArray(cmsGroup?.links);

      const mergedLinks = cmsLinks.map(
        (cmsLink, linkIndex) => {
          const fallbackLink =
            fallbackLinks[linkIndex] || {};

          return {
            ...fallbackLink,
            ...cmsLink,

            label:
              cmsLink?.label ||
              fallbackLink?.label ||
              "",

            href:
              cmsLink?.href ||
              fallbackLink?.href ||
              "",

            target:
              cmsLink?.target ||
              fallbackLink?.target ||
              "_self",
          };
        },
      );

      return {
        ...fallbackGroup,
        ...cmsGroup,

        title:
          cmsGroup?.title ||
          fallbackGroup?.title ||
          "",

        links:
          mergedLinks.length > 0
            ? mergedLinks
            : fallbackLinks,
      };
    },
  );
}

function mergeFooterData(
  fallback,
  cmsData,
) {
  const safeFallback =
    fallback || FALLBACK_FOOTER;

  if (!cmsData) {
    return safeFallback;
  }

  return {
    ...safeFallback,

    logo:
      cmsData?.logo ||
      safeFallback?.logo ||
      "",

    benefits: mergeFooterBenefits(
      asArray(safeFallback?.benefits),
      asArray(cmsData?.benefits),
    ),

    linkGroups: mergeLinkGroups(
      asArray(safeFallback?.linkGroups),
      asArray(cmsData?.linkGroups),
    ),

    appDownload: {
      ...safeFallback?.appDownload,

      title:
        cmsData?.appDownload?.title ||
        safeFallback?.appDownload?.title ||
        "",

      links: mergeAppLinks(
        asArray(
          safeFallback?.appDownload?.links,
        ),
        asArray(
          cmsData?.appDownload?.links,
        ),
      ),
    },

    copyright:
      cmsData?.copyright ||
      safeFallback?.copyright ||
      "",

    socialLinks: mergeSocialLinks(
      asArray(
        safeFallback?.socialLinks,
      ),
      asArray(
        cmsData?.socialLinks,
      ),
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Footer Link Groups                                                         */
/* -------------------------------------------------------------------------- */

function FooterLinkGroups({
  groups = [],
  socialLinks = [],
  hasDynamicGroups = false,
}) {
  const location = useLocation();

  if (!groups.length && !socialLinks.length) {
    return null;
  }

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
          {groups.map(
            (group, groupIndex) => {
              const links = asArray(
                group?.links,
              ).filter(
                (link) =>
                  link?.label &&
                  link?.href,
              );

              if (!links.length) {
                return null;
              }

              return (
                <div
                  key={
                    group?.title ||
                    `group-${groupIndex}`
                  }
                >
                  <h2 className="mb-4 border-l-2 border-[var(--customer-gold)] pl-2 text-lg font-semibold text-white md:text-2xl">
                    {group?.title}
                  </h2>

                  {group?.isLoading ? (
                    <div className="flex flex-col gap-2 py-1 md:gap-3">
                      <SkeletonBox
                        width="75%"
                        height="16px"
                        className="rounded !bg-white/10"
                      />
                      <SkeletonBox
                        width="55%"
                        height="16px"
                        className="rounded !bg-white/10"
                      />
                      <SkeletonBox
                        width="80%"
                        height="16px"
                        className="rounded !bg-white/10"
                      />
                      <SkeletonBox
                        width="60%"
                        height="16px"
                        className="rounded !bg-white/10"
                      />
                      <SkeletonBox
                        width="45%"
                        height="16px"
                        className="rounded !bg-white/10"
                      />
                    </div>
                  ) : (
                    <ul className="grid gap-1 md:gap-3">
                      {links.map(
                        (link, linkIndex) => {
                          const toPath =
                            hrefOr(
                              link?.href,
                            );

                          const isExternal =
                            /^https?:\/\//i.test(
                              toPath,
                            ) ||
                            link?.target ===
                              "_blank";

                          return (
                            <li
                              key={`${link?.label}-${link?.href}-${linkIndex}`}
                            >
                              {isExternal ? (
                                <a
                                  href={toPath}
                                  target={
                                    link?.target ||
                                    "_blank"
                                  }
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-white/70 transition-all duration-300 ease-in-out hover:text-white md:text-base"
                                >
                                  {
                                    link?.label
                                  }
                                </a>
                              ) : (
                                <Link
                                  to={toPath}
                                  onClick={() => {
                                    if (
                                      location.pathname ===
                                      toPath
                                    ) {
                                      window.scrollTo({
                                        top: 0,
                                        behavior:
                                          "smooth",
                                      });
                                    }
                                  }}
                                  className="text-sm font-medium text-white/70 transition-all duration-300 ease-in-out hover:text-white md:text-base"
                                >
                                  {
                                    link?.label
                                  }
                                </Link>
                              )}
                            </li>
                          );
                        },
                      )}
                    </ul>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-4 py-6">
          {socialLinks.map(
            (social, index) => (
              <SocialIcons
                key={
                  social?.label ||
                  social?.href ||
                  `social-${index}`
                }
                data={social}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer({ data }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const { page: cmsFooterPage } =
    useCmsRecord("footerdata");

  const catalogCategoryList = useSelector(
    (state) =>
      state.catalog?.globalCategories ||
      state.catalog?.list ||
      emptyArray,
  );

  const globalBrands = useSelector(
    (state) =>
      state.catalog?.globalBrands ||
      emptyArray,
  );

  /* ------------------------------------------------------------------------ */
  /* Categories                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const categoryList =
      getCategoryListFromResponse(
        catalogCategoryList,
      );

    if (!categoryList.length) {
      dispatch(
        fetchCategories({
          tree: false,
          limit: 500,
        }),
      );
    }
  }, [
    dispatch,
    catalogCategoryList,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Brands                                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (asArray(globalBrands).length) {
      return;
    }

    dispatch(
      fetchBrands({
        limit: 100,
        active: true,
      }),
    )
      .unwrap()
      .then((result) => {
        const brands =
          getBrandListFromResponse(
            result,
          );

        const brandsWithProducts =
          brands
            .filter((brand) => {
              const count =
                getBrandProductCount(
                  brand,
                );

              return (
                count === undefined ||
                Number(count) >= 1
              );
            })
            .slice(0, 5);

        dispatch(
          setGlobalBrands(
            brandsWithProducts,
          ),
        );
      })
      .catch(() => {});
  }, [
    dispatch,
    globalBrands,
  ]);

  /* ------------------------------------------------------------------------ */
  /* CMS Footer                                                               */
  /* ------------------------------------------------------------------------ */

  const cmsFooterData = useMemo(
    () =>
      normalizeFooterCmsData(
        cmsFooterPage,
      ),
    [cmsFooterPage],
  );

  const footer = useMemo(() => {
    const fallbackFooter =
      data || FALLBACK_FOOTER;

    return mergeFooterData(
      fallbackFooter,
      cmsFooterData,
    );
  }, [
    data,
    cmsFooterData,
  ]);

  const benefits = asArray(
    footer?.benefits,
  );

  const socialLinks = asArray(
    footer?.socialLinks,
  );

  const appDownload =
    footer?.appDownload || {};

  const appDownloadLinks = asArray(
    appDownload?.links,
  );

  /* ------------------------------------------------------------------------ */
  /* Dynamic Categories                                                       */
  /* ------------------------------------------------------------------------ */

  const catalogCategories = useMemo(
    () =>
      getRootCategories(
        getCategoryListFromResponse(
          catalogCategoryList,
        ),
      ),
    [catalogCategoryList],
  );

  const apiCategoryLinks = useMemo(
    () =>
      catalogCategories
        .filter((category) => {
          const count =
            category?.productCount ??
            category?.count;

          return (
            count === undefined ||
            count === null ||
            count === "" ||
            Number(count) > 0
          );
        })
        .slice(0, 5)
        .map((cat) => {
          const categoryKey =
            getCategoryKey(cat);

          if (!categoryKey) {
            return null;
          }

          return {
            label:
              cat?.title ||
              cat?.name ||
              cat?.label ||
              categoryKey,

            href:
              typeof CUSTOMER_ROUTES.category ===
              "function"
                ? CUSTOMER_ROUTES.category(
                    categoryKey,
                  )
                : `${CUSTOMER_ROUTES.PRODUCTS}?category=${encodeURIComponent(
                    categoryKey,
                  )}`,

            target: "_self",
          };
        })
        .filter(Boolean),
    [catalogCategories],
  );

  /* ------------------------------------------------------------------------ */
  /* Dynamic Brands                                                           */
  /* ------------------------------------------------------------------------ */

  const apiBrandLinks = useMemo(
    () =>
      asArray(globalBrands)
        .slice(0, 5)
        .map((brand) => {
          const name =
            typeof brand === "string"
              ? brand
              : brand?.name ||
                brand?.label ||
                brand?.value ||
                brand?.title ||
                "";

          const safeName = String(
            name,
          ).trim();

          if (!safeName) {
            return null;
          }

          const existingSlug =
            typeof brand === "object"
              ? brand?.slug ||
                brand?.code ||
                ""
              : "";

          const slug =
            String(
              existingSlug ||
                brandToSlug(
                  safeName,
                ) ||
                "",
            ).trim();

          if (!slug) {
            return null;
          }

          return {
            label: safeName,

            href:
              typeof CUSTOMER_ROUTES.brand ===
              "function"
                ? CUSTOMER_ROUTES.brand(slug)
                : `${CUSTOMER_ROUTES.PRODUCTS}?brand=${encodeURIComponent(
                    slug,
                  )}`,

            target: "_self",
          };
        })
        .filter(Boolean),
    [globalBrands],
  );

  /* ------------------------------------------------------------------------ */
  /* Footer Link Groups                                                       */
  /* ------------------------------------------------------------------------ */

  const staticGroups = asArray(
    footer?.linkGroups,
  );

  const resolvedLinkGroups = useMemo(() => {
    const groups = [];

    if (apiCategoryLinks.length > 0) {
      groups.push({
        title: "Categories",
        links: apiCategoryLinks,
      });
    }

    if (apiBrandLinks.length > 0) {
      groups.push({
        title: "Brands",
        links: apiBrandLinks,
      });
    }

    staticGroups.forEach((group) => {
      if (!group?.title) {
        return;
      }

      const links = asArray(
        group?.links,
      ).filter(
        (link) =>
          link?.label &&
          link?.href,
      );

      if (!links.length) {
        return;
      }

      groups.push({
        ...group,
        links,
      });
    });

    return groups;
  }, [
    apiCategoryLinks,
    apiBrandLinks,
    staticGroups,
  ]);

  const hasDynamicGroups =
    apiCategoryLinks.length > 0 ||
    apiBrandLinks.length > 0;

  return (
    <footer className="h-auto w-full bg-[#1C1C1C] text-white">
      {/* Benefits */}

      {benefits.length > 0 && (
        <div className="border-t-2 border-[#1B1D6033] bg-[#F5F8FB]">
          <div className="customer-container flex flex-col justify-between lg:flex-row">
            {benefits.map((item, index) => (
              <div
                key={
                  item?.title ||
                  `benefit-${index}`
                }
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
                      alt={
                        item?.alt ||
                        item?.title ||
                        "Benefit"
                      }
                    />
                  ) : (
                    <span
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
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
              src={
                footer?.logo ||
                "/image/webp/logoWithName.webp"
              }
              alt={
                footer?.logoAlt ||
                "Sam Global"
              }
            />
          </Link>
        </div>

        {(appDownload.title ||
          appDownloadLinks.length > 0) && (
          <div className="md:py-4">
            {appDownload.title && (
              <h2 className="max-w-sm text-sm font-medium text-white/85 lg:!w-full">
                {appDownload.title}
              </h2>
            )}

            {appDownloadLinks.length > 0 && (
              <div className="my-4 flex flex-wrap gap-6 lg:my-6">
                {appDownloadLinks.map(
                  (app, index) => {
                    if (!app?.image) {
                      return null;
                    }

                    const toPath =
                      hrefOr(
                        app?.href ||
                          "/mobile-app",
                      );

                    const isExternal =
                      /^https?:\/\//i.test(
                        toPath,
                      ) ||
                      app?.target ===
                        "_blank";

                    const content = (
                      <img
                        loading="lazy"
                        className="h-10 w-auto lg:h-[50px]"
                        src={app.image}
                        alt={
                          app?.alt ||
                          app?.label ||
                          "App"
                        }
                        width="150"
                        height="50"
                      />
                    );

                    if (isExternal) {
                      return (
                        <a
                          key={`${app?.label}-${app?.href}-${index}`}
                          href={toPath}
                          target={
                            app?.target ||
                            "_blank"
                          }
                          rel="noopener noreferrer"
                          aria-label={
                            app?.label ||
                            "App link"
                          }
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={`${app?.label}-${app?.href}-${index}`}
                        to={toPath}
                        target={
                          app?.target
                        }
                        rel={
                          app?.target ===
                          "_blank"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        onClick={() => {
                          if (
                            location.pathname ===
                            toPath
                          ) {
                            window.scrollTo({
                              top: 0,
                              behavior:
                                "smooth",
                            });
                          }
                        }}
                        aria-label={
                          app?.label ||
                          "App link"
                        }
                      >
                        {content}
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Links + Social */}

      <FooterLinkGroups
        groups={resolvedLinkGroups}
        socialLinks={socialLinks}
        hasDynamicGroups={
          hasDynamicGroups
        }
      />

      {/* Copyright */}

      <section className="bg-black py-2">
        <div className="customer-container flex flex-col justify-center gap-2 text-xs text-white md:text-base lg:flex-row lg:gap-10">
          <p className="text-center">
            {footer?.copyright}
          </p>
        </div>
      </section>
    </footer>
  );
}

export { Footer };
export default Footer;