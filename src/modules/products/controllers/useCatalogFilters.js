import { useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getActiveFilters } from "./getActiveFilters";
import { getClearFiltersAction, parseMultiValue, serializeMultiValue } from "../../../utils/filterUtils";
import { scrollToTop } from "../../../utils/common";

export function useCatalogFilters({
  attributeFacets = [],
  absolutePriceLimits = { min: 0, max: 0 },
  clearExceptions = ["q", "collectionIds", "category"]
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const updateParam = useCallback(
    (key, value) => {
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
    },
    [setSearchParams],
  );

  const updateParams = useCallback(
    (entries) => {
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
    },
    [setSearchParams],
  );

  const handlePriceChange = useCallback(
    ({ minPrice, maxPrice }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (minPrice != null) next.set("minPrice", String(minPrice));
        else next.delete("minPrice");
        if (maxPrice != null) next.set("maxPrice", String(maxPrice));
        else next.delete("maxPrice");
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      clearExceptions.forEach((exception) => {
        if (prev.has(exception)) next.set(exception, prev.get(exception));
      });
      return next;
    });
    scrollToTop();
  }, [setSearchParams, clearExceptions]);

  const removeFilter = useCallback(
    (key, filter) => {
      if (filter?.href) {
        navigate(filter.href);
        return;
      }
      
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
      scrollToTop();
    },
    [setSearchParams, navigate],
  );

  const activeFilters = getActiveFilters(searchParams, attributeFacets, absolutePriceLimits);

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
