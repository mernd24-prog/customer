/**
 * useFooterData.js
 *
 * Fetches, memoizes, and assembles all data the Footer needs.
 * Returns a single `footer` object plus `hasDynamicGroups`.
 */

import { useMemo } from "react";
import { SELLER_LOGIN_URL } from "../../config/seller";
import { useSelector } from "react-redux";

import { useCmsRecord } from "../../hooks/useCmsRecord";
import { CUSTOMER_ROUTES } from "../../constants/routes";
import {
  getBrandName,
  getBrandRouteKey,
} from "../../utils/pages/brandUtils";
import { brandToSlug } from "../../utils/ecommerce/brand";
import { asArray } from "../../utils/content";
import {
  getCategoryListFromResponse,
  getRootCategories,
  getCategoryKey,
  normalizeText,
  normalizeFooterCmsData,
  mergeFooterData,
} from "./footerUtils";

const emptyArray = [];

const uniqueLinks = (links = []) => {
  const seen = new Set();

  return links.filter((link) => {
    const key = normalizeText(link?.label || link?.href);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function useFooterData(fallbackData) {
  const catalogCategoryList = useSelector(
    (state) => state.catalog?.globalCategories || emptyArray,
  );
  const globalBrands = useSelector(
    (state) => state.catalog?.globalBrands || emptyArray,
  );

  /* ---- CMS footer ---- */
  const { page: cmsFooterPage } = useCmsRecord("footerdata");

  const cmsFooterData = useMemo(
    () => normalizeFooterCmsData(cmsFooterPage),
    [cmsFooterPage],
  );

  const footer = useMemo(
    () => mergeFooterData(fallbackData, cmsFooterData),
    [fallbackData, cmsFooterData],
  );

  /* ---- Dynamic category links ---- */
  const catalogCategories = useMemo(
    () => getRootCategories(getCategoryListFromResponse(catalogCategoryList)),
    [catalogCategoryList],
  );

  const apiCategoryLinks = useMemo(() => {
    const links = catalogCategories
      .filter((category) => {
        const count = category?.productCount ?? category?.count;
        return Number(count) > 0;
      })
      .map((cat) => {
        const categoryKey = getCategoryKey(cat);
        if (!categoryKey) return null;
        return {
          label: cat?.title || cat?.name || cat?.label || categoryKey,
          href:
            typeof CUSTOMER_ROUTES.category === "function"
              ? CUSTOMER_ROUTES.category(categoryKey)
              : `${CUSTOMER_ROUTES.PRODUCTS}?category=${encodeURIComponent(categoryKey)}`,
          target: "_self",
        };
      })
      .filter(Boolean);

    return uniqueLinks(links).slice(0, 5);
  }, [catalogCategories]);

  const categoryNames = useMemo(
    () => new Set(apiCategoryLinks.map((link) => normalizeText(link.label))),
    [apiCategoryLinks],
  );

  /* ---- Dynamic brand links ---- */
  const apiBrandLinks = useMemo(() => {
    const links = asArray(globalBrands)
      .map((brand) => {
        const name =
          typeof brand === "string"
            ? brand
            : getBrandName(brand) ||
              brand?.name ||
              brand?.label ||
              brand?.value ||
              brand?.title ||
              "";
        const safeName = String(name).trim();
        if (!safeName || categoryNames.has(normalizeText(safeName))) {
          return null;
        }

        const existingSlug =
          typeof brand === "object"
            ? getBrandRouteKey(brand) || brand?.slug || brand?.code || ""
            : "";
        const slug = String(existingSlug || brandToSlug(safeName) || "").trim();
        if (!slug) return null;

        return {
          label: safeName,
          href:
            typeof CUSTOMER_ROUTES.brand === "function"
              ? CUSTOMER_ROUTES.brand(slug)
              : `${CUSTOMER_ROUTES.PRODUCTS}?brand=${encodeURIComponent(slug)}`,
          target: "_self",
        };
      })
      .filter(Boolean);

    return uniqueLinks(links).slice(0, 5);
  }, [categoryNames, globalBrands]);

  /* ---- Resolved link groups (dynamic first, static deduped) ---- */
  const staticGroups = asArray(footer?.linkGroups);

  const resolvedLinkGroups = useMemo(() => {
    const groups = [];
    const seenLinks = new Set();

    const dedupeAcrossGroups = (links = []) =>
      links.filter((link) => {
        const href = normalizeText(link?.href);
        const label = normalizeText(link?.label);
        const key = href || label;

        if (!key || seenLinks.has(key)) return false;
        seenLinks.add(key);
        return true;
      });

    if (apiCategoryLinks.length > 0) {
      groups.push({
        title: "Categories",
        links: dedupeAcrossGroups(apiCategoryLinks),
      });
    }
    if (apiBrandLinks.length > 0) {
      groups.push({
        title: "Brands",
        links: dedupeAcrossGroups(apiBrandLinks),
      });
    }

    const removeCategoryGroup = apiCategoryLinks.length > 0;
    const removeBrandGroup = apiBrandLinks.length > 0;

    staticGroups.forEach((group) => {
      if (!group?.title) return;
      const normalizedTitle = normalizeText(group.title);
      if (
        removeCategoryGroup &&
        (normalizedTitle === "categories" || normalizedTitle === "buy")
      ) {
        return;
      }
      if (removeBrandGroup && normalizedTitle === "brands") return;

      const links = asArray(group?.links).map((link) =>
        normalizeText(link?.label) === "seller dashboard"
          ? { ...link, href: SELLER_LOGIN_URL }
          : link,
      ).filter(
        (link) => link?.label && link?.href,
      );
      if (!links.length) return;

      groups.push({ ...group, links });
    });

    return groups;
  }, [apiCategoryLinks, apiBrandLinks, staticGroups]);

  const hasDynamicGroups =
    apiCategoryLinks.length > 0 || apiBrandLinks.length > 0;

  return { footer, resolvedLinkGroups, hasDynamicGroups };
}
