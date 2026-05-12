import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import watchlistData from "../data/watchlistitem";
import { getProductId } from "../utils/ecommerce";

export function useWatchlistProducts({ fallback = watchlistData } = {}) {
  const [hiddenFallbackIds, setHiddenFallbackIds] = useState([]);
  const wishlistIds = useSelector((state) => state.cart.current?.wishlist || []);
  const allProducts = useSelector((state) => state.product.list || []);

  const { products, isUsingFallback } = useMemo(() => {
    const wishlistSet = new Set(wishlistIds);
    const matchedProducts = allProducts.filter((product) =>
      wishlistSet.has(getProductId(product)),
    );

    if (matchedProducts.length > 0) {
      return { products: matchedProducts, isUsingFallback: false };
    }

    const hiddenSet = new Set(hiddenFallbackIds);
    return {
      products: fallback.filter((product) => !hiddenSet.has(getProductId(product))),
      isUsingFallback: true,
    };
  }, [allProducts, fallback, hiddenFallbackIds, wishlistIds]);

  const hideFallbackProduct = useCallback((product) => {
    const id = getProductId(product);
    setHiddenFallbackIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }, []);

  return {
    products,
    hideFallbackProduct,
    isUsingFallback,
    wishlistIds,
  };
}
