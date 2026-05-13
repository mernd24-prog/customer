import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { getProductId } from "../utils/ecommerce";

export function useWatchlistProducts({ fallback = [] } = {}) {
  const [hiddenFallbackIds, setHiddenFallbackIds] = useState([]);
  const wishlistIds = useSelector((state) =>
    (state.cart.current?.wishlist || []).map((item) => getProductId(item)),
  );
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
    const syntheticFromWishlist = wishlistIds
      .map((id) => ({ _id: id, title: `Saved item ${id}`, image: "" }))
      .filter((product) => !hiddenSet.has(getProductId(product)));

    if (fallback.length) {
      return {
        products: fallback.filter((product) => !hiddenSet.has(getProductId(product))),
        isUsingFallback: true,
      };
    }

    return {
      products: syntheticFromWishlist,
      isUsingFallback: false,
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
