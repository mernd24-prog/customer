import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useProducts() {
  const productState = useSelector((state) => state.product);

  return useMemo(() => {
    const data = productState?.data;
    const products = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.list)
          ? data.list
          : [];

    return {
      ...productState,
      products,
      meta: productState?.meta || data?.meta || {},
    };
  }, [productState]);
}
