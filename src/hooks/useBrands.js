import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useBrands() {
  const catalogState = useSelector((state) => state.catalog);

  return useMemo(() => {
    const data = catalogState?.data;
    const brands = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.list)
          ? data.list
          : [];

    return {
      ...catalogState,
      brands,
    };
  }, [catalogState]);
}
