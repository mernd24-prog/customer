import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useCategories() {
  const catalogState = useSelector((state) => state.catalog);

  return useMemo(() => {
    const data = catalogState?.data;
    const categories = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];

    return {
      ...catalogState,
      categories,
    };
  }, [catalogState]);
}
