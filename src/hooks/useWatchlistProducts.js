import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getProductId } from "../utils/ecommerce";
import { fetchProductById } from "../features/product/productSlice";

export function useWatchlistProducts({ fallback = [] } = {}) {
  const dispatch = useDispatch();
  const [hiddenFallbackIds, setHiddenFallbackIds] = useState([]);
  const wishlist = useSelector((state) => state.cart.current?.wishlist);
  const wishlistIds = useMemo(
    () => Array.from(new Set((Array.isArray(wishlist) ? wishlist : []).map((item) => getProductId(item)).filter(Boolean))),
    [wishlist],
  );
  const productEntities = useSelector((state) => state.product.entities || {});
  const allProducts = useSelector((state) => state.product.list || []);

  // Fetch products for wishlist IDs that are not in entities
  useEffect(() => {
    wishlistIds.forEach((id) => {
      if (!productEntities[id] && id) {
        dispatch(fetchProductById({ productId: id })).catch(() => {
          // Ignore errors for missing products
        });
      }
    });
  }, [wishlistIds, productEntities, dispatch]);

  const { products, isUsingFallback } = useMemo(() => {
    const matchedProducts = wishlistIds.map((id) => productEntities[id]).filter(Boolean);

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
  }, [wishlistIds, productEntities, allProducts, fallback, hiddenFallbackIds]);

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
