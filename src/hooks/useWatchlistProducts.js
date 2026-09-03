import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { getProductId, normalizeWishlistItem, wishlistItemKey } from "../utils/ecommerce";

export function useWatchlistProducts({ fallback = [] } = {}) {
  const [hiddenFallbackIds, setHiddenFallbackIds] = useState([]);
  const [fetchedProducts, setFetchedProducts] = useState({});
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const wishlistIds = useMemo(
    () => Array.from(new Set((Array.isArray(wishlist) ? wishlist : []).map((item) => getProductId(item)).filter(Boolean))),
    [wishlist],
  );
  const wishlistEntries = useMemo(
    () =>
      (Array.isArray(wishlist) ? wishlist : [])
        .map(normalizeWishlistItem)
        .filter((item) => item.productId),
    [wishlist],
  );
  const productEntities = useSelector((state) => state.product.entities) || {};
  const allProducts = useSelector((state) => state.product.list) || [];

  const knownProductById = useMemo(() => {
    const entries = new Map();
    Object.values(productEntities || {}).forEach((product) => {
      const id = getProductId(product);
      if (id) entries.set(String(id), product);
    });
    (Array.isArray(allProducts) ? allProducts : []).forEach((product) => {
      const id = getProductId(product);
      if (id && !entries.has(String(id))) entries.set(String(id), product);
    });
    (Array.isArray(fallback) ? fallback : []).forEach((product) => {
      const id = getProductId(product);
      if (id && !entries.has(String(id))) entries.set(String(id), product);
    });
    return entries;
  }, [allProducts, fallback, productEntities]);

  const missingIds = useMemo(() => {
    return wishlistIds.filter(
      (id) =>
        !knownProductById.has(String(id)) &&
        !Object.prototype.hasOwnProperty.call(fetchedProducts, id),
    );
  }, [wishlistIds, knownProductById, fetchedProducts]);

  const isLoading = missingIds.length > 0;

  useEffect(() => {
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
  }, [missingIds]);

  const { products, isUsingFallback } = useMemo(() => {
    const decorate = (product, entry) => {
      if (!product) return null;
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const selectedVariant = variants.find((variant) =>
        (entry.variantId && String(variant._id || variant.id || "") === String(entry.variantId)) ||
        (entry.variantSku && String(variant.sku || "") === String(entry.variantSku))
      ) || null;
      return { ...product, selectedVariant, wishlistEntry: entry, wishlistKey: wishlistItemKey(entry) };
    };
    const matchedProducts = wishlistEntries
      .map((entry) =>
        decorate(
          knownProductById.get(String(entry.productId)) ||
            fetchedProducts[entry.productId],
          entry,
        ),
      )
      .filter(Boolean);

    if (matchedProducts.length === wishlistIds.length && matchedProducts.length > 0) {
      return { products: matchedProducts, isUsingFallback: false };
    }

    // Fallback to list if available
    const wishlistSet = new Set(wishlistIds);
    const fromList = wishlistEntries
      .map((entry) => decorate(allProducts.find((product) => getProductId(product) === entry.productId), entry))
      .filter(Boolean);

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
    wishlistEntries,
    knownProductById,
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
    isLoading,
  };
}
