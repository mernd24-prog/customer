import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export default function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const removeFilter = useCallback((key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else {
        next.delete(key);
      }
      next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    searchParams,
    setSearchParams,
    updateFilter,
    removeFilter,
    clearFilters,
  };
}
