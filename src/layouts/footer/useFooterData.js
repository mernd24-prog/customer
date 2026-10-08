/**
 * useFooterData.js
 *
 * Fetches, memoizes, and assembles all data the Footer needs.
 * Returns a single `footer` object plus `hasDynamicGroups`.
 */

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useCmsRecord } from "../../hooks/useCmsRecord";
import {
  fetchCategories,
  fetchBrands,
  setGlobalBrands,
} from "../../features/catalog/catalogSlice";
import { CUSTOMER_ROUTES } from "../../constants/routes";
import {
  getBrandName,
  getBrandProductCount,
  getBrandRouteKey,
} from "../../utils/pages/brandUtils";
import { brandToSlug } from "../../utils/ecommerce/brand";
import { asArray } from "../../utils/content";
import {
  getCategoryListFromResponse,
  getBrandListFromResponse,
  getRootCategories,
  getCategoryKey,
  normalizeText,
  normalizeFooterCmsData,
  mergeFooterData,
} from "./footerUtils";

const emptyArray = [];

export function useFooterData(fallbackData) {
  const dispatch = useDispatch();
  const catalogCategoryList = useSelector(
    (state) => state.catalog?.globalCategories || state.catalog?.list || emptyArray,
  );
  const globalBrands = useSelector(
    (state) => state.catalog?.globalBrands || emptyArray,
  );
  useEffect(() => {
    const categoryList = getCategoryListFromResponse(catalogCategoryList);
    if (!categoryList.length) {
      dispatch(fetchCategories({ tree: false, limit: 500 }));
    }
  }, [dispatch, catalogCategoryList]);
  useEffect(() => {
    if (asArray(globalBrands).length) return;

    dispatch(fetchBrands({ limit: 100, active: true, hasProducts: true }))
      .unwrap()
      .then((result) => {
        const brands = getBrandListFromResponse(result);
        const brandsWithProducts = brands
          .filter((brand) => {
            const count = getBrandProductCount(brand);
            return count === undefined || Number(count) >= 1;
          })
          .slice(0, 5);
        dispatch(setGlobalBrands(brandsWithProducts));
      })
      .catch(() => {});
  }, [dispatch, globalBrands]);

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

  const apiCategoryLinks = useMemo(
    () =>
      catalogCategories
        .filter((category) => {
          const count = category?.productCount ?? category?.count;
          return (
            count === undefined || count === null || count === "" || Number(count) > 0
          );
        })
        .slice(0, 5)
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
        .filter(Boolean),
    [catalogCategories],
  );

  /* ---- Dynamic brand links ---- */
  const apiBrandLinks = useMemo(
    () =>
      asArray(globalBrands)
        .slice(0, 5)
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
          if (!safeName) return null;

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
        .filter(Boolean),
    [globalBrands],
  );

  /* ---- Resolved link groups (dynamic first, static deduped) ---- */
  const staticGroups = asArray(footer?.linkGroups);

  const resolvedLinkGroups = useMemo(() => {
    const groups = [];

    if (apiCategoryLinks.length > 0) {
      groups.push({ title: "Categories", links: apiCategoryLinks });
    }
    if (apiBrandLinks.length > 0) {
      groups.push({ title: "Brands", links: apiBrandLinks });
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

      const links = asArray(group?.links).filter(
        (link) => link?.label && link?.href,
      );
      if (!links.length) return;

      groups.push({ ...group, links });
    });

    return groups;
  }, [apiCategoryLinks, apiBrandLinks, staticGroups]);

  const hasDynamicGroups = apiCategoryLinks.length > 0 || apiBrandLinks.length > 0;

  return { footer, resolvedLinkGroups, hasDynamicGroups };
}
