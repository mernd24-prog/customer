import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { getProductId } from "../utils/ecommerce";

export function useWatchlistProducts({ fallback = [] } = {}) {
  const [hiddenFallbackIds, setHiddenFallbackIds] = useState([]);
  const [fetchedProducts, setFetchedProducts] = useState({});
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const wishlistIds = useMemo(
    () => Array.from(new Set((Array.isArray(wishlist) ? wishlist : []).map((item) => getProductId(item)).filter(Boolean))),
    [wishlist],
  );
  const productEntities = useSelector((state) => state.product.entities || {});
  const allProducts = useSelector((state) => state.product.list || []);

  useEffect(() => {
    const missingIds = wishlistIds.filter(
      (id) =>
        !productEntities[id] &&
        !Object.prototype.hasOwnProperty.call(fetchedProducts, id),
    );
    if (!missingIds.length) return undefined;

    let cancelled = false;
    Promise.allSettled(
      missingIds.map((id) =>
        apiRequest({ method: "get", url: endpoints.products.detail(id) }),
      ),
    ).then((results) => {
      if (cancelled) return;
      setFetchedProducts((current) => {
        const next = { ...current };
        results.forEach((result, index) => {
          const requestedId = missingIds[index];
          if (result.status !== "fulfilled") {
            next[requestedId] = null;
            return;
          }
          const product = result.value?.data;
          const id = getProductId(product);
          next[requestedId] = product || null;
          if (id && id !== requestedId) next[id] = product;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [wishlistIds, productEntities, fetchedProducts]);

  const { products, isUsingFallback } = useMemo(() => {
    const matchedProducts = wishlistIds
      .map((id) => productEntities[id] || fetchedProducts[id])
      .filter(Boolean);

    if (matchedProducts.length === wishlistIds.length && matchedProducts.length > 0) {
      return { products: matchedProducts, isUsingFallback: false };
    }

    // Fallback to list if available
    const wishlistSet = new Set(wishlistIds);
    const fromList = allProducts.filter((product) =>
      wishlistSet.has(getProductId(product)),
    );

    if (fromList.length > 0) {
      return { products: fromList, isUsingFallback: false };
    }

    if (fallback.length) {
      const hiddenSet = new Set(hiddenFallbackIds);
      return {
        products: fallback.filter((product) => !hiddenSet.has(getProductId(product))),
        isUsingFallback: true,
      };
    }

    return {
      products: matchedProducts,
      isUsingFallback: false,
    };
  }, [
    wishlistIds,
    productEntities,
    fetchedProducts,
    allProducts,
    fallback,
    hiddenFallbackIds,
  ]);

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
