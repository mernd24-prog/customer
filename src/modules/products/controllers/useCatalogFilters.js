import { useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getActiveFilters } from "./getActiveFilters";
import { getClearFiltersAction, parseMultiValue, serializeMultiValue } from "../../../utils/filterUtils";
import { scrollToTop } from "../../../utils/common";

export function useCatalogFilters({
  attributeFacets = [],
  absolutePriceLimits = { min: 0, max: 0 },
  brandOptions = [],
  categoryOptions = [],
  clearExceptions = ["q", "collectionIds", "category"]
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const globalBrands = useSelector((state) => state.catalog?.globalBrands) || [];
  const globalCategories = useSelector((state) => state.catalog?.globalCategories) || [];

  const updateParam = useCallback(
    (key, value) => {
      scrollToTop(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          next.delete("page");
          return next;
        });
      });
    },
    [setSearchParams],
  );

  const updateParams = useCallback(
    (entries) => {
      scrollToTop(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          entries.forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              next.set(key, value);
            } else {
              next.delete(key);
            }
          });
          next.delete("page");
          return next;
        });
      });
    },
    [setSearchParams],
  );

  const handlePriceChange = useCallback(
    ({ minPrice, maxPrice }) => {
      scrollToTop(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (minPrice != null) next.set("minPrice", String(minPrice));
          else next.delete("minPrice");
          if (maxPrice != null) next.set("maxPrice", String(maxPrice));
          else next.delete("maxPrice");
          next.delete("page");
          return next;
        });
      });
    },
    [setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    scrollToTop(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams();
        clearExceptions.forEach((exception) => {
          if (prev.has(exception)) next.set(exception, prev.get(exception));
        });
        return next;
      });
    });
  }, [setSearchParams, clearExceptions]);

  const removeFilter = useCallback(
    (key, filter) => {
      if (filter?.href) {
        navigate(filter.href);
        return;
      }
      
      scrollToTop(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (filter?.type === "price" || key === "price") {
            next.delete("minPrice");
            next.delete("maxPrice");
          } else if (filter?.type && filter.value !== undefined) {
            const paramKey =
              filter.type === "attribute" ? filter.attributeKey : filter.type;
            const currentValues = parseMultiValue(next.get(paramKey));
            const nextValues = currentValues.filter(
              (v) => String(v) !== String(filter.value),
            );
            if (nextValues.length > 0) {
              next.set(paramKey, serializeMultiValue(nextValues));
            } else {
              next.delete(paramKey);
            }
          } else {
            next.delete(key);
          }
          next.delete("page");
          return next;
        });
      });
    },
    [setSearchParams, navigate],
  );

  const mergedBrandOptions = useMemo(() => {
    const map = new Map();
    (globalBrands || []).forEach((b) => {
      const id = String(b?._id || b?.id || b?.value || "");
      const slug = String(b?.slug || "");
      const name = b?.name || b?.label || b?.title || b?.brandName || "";
      if (id && name) {
        map.set(id, { value: id, label: name, ...b });
      }
      if (slug && name) {
        map.set(slug, { value: slug, label: name, ...b });
      }
    });
    (brandOptions || []).forEach((b) => {
      const id = String(b?.value ?? b?.id ?? b?._id ?? "");
      const slug = String(b?.slug || "");
      const name = b?.label || b?.name || b?.title || b?.brandName || "";
      const isIdLabel = name && /^[a-f\d]{24}$/i.test(name.trim());
      if (id) {
        const existing = map.get(id);
        const resolvedLabel = !isIdLabel && name ? name : (existing?.label || name || id);
        map.set(id, { ...(existing || {}), ...b, value: id, label: resolvedLabel });
      }
      if (slug) {
        const existing = map.get(slug);
        const resolvedLabel = !isIdLabel && name ? name : (existing?.label || name || slug);
        map.set(slug, { ...(existing || {}), ...b, value: slug, label: resolvedLabel });
      }
    });
    return Array.from(map.values());
  }, [brandOptions, globalBrands]);

  const mergedCategoryOptions = useMemo(() => {
    const list = [...(categoryOptions || [])];
    const seen = new Set(list.map((c) => String(c?.value ?? c?.id ?? c?._id ?? c?.slug ?? "")));
    const flattenCategories = (cats = []) => {
      cats.forEach((c) => {
        const key = String(c?.slug || c?._id || c?.id || c?.value || "");
        const label = c?.name || c?.title || c?.label || key;
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({ value: key, label, ...c });
        }
        if (Array.isArray(c?.children) && c.children.length) {
          flattenCategories(c.children);
        }
      });
    };
    flattenCategories(globalCategories);
    return list;
  }, [categoryOptions, globalCategories]);

  const activeFilters = getActiveFilters(
    searchParams,
    attributeFacets,
    absolutePriceLimits,
    { brandOptions: mergedBrandOptions, categoryOptions: mergedCategoryOptions },
  );

  const clearFiltersAction = useMemo(
    () =>
      getClearFiltersAction(activeFilters, searchParams, handleClearFilters, clearExceptions),
    [activeFilters, searchParams, handleClearFilters, clearExceptions],
  );

  return {
    searchParams,
    setSearchParams,
    updateParam,
    updateParams,
    handlePriceChange,
    removeFilter,
    handleClearFilters,
    activeFilters,
    clearFiltersAction,
  };
}
