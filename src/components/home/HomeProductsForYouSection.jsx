import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SkeletonLoader from "../ui/skeleton/SkeletonLoader";
import ProductCard from "../../modules/products/components/ProductCard";

import {
  useCartActions,
  useWishlistActions,
} from "../../modules/products/controllers/actions";
import {
  getProductId,
  getProductListFromResponse,
} from "../../utils/ecommerce";
import { getPagination } from "../../utils/filterUtils";
import SectionContainer from "../ui/SectionContainer";
import { fetchProducts } from "../../modules/products/slices/productSlice";

export default function HomeProductsForYouSection({
  title = "Featured Products",
  description = "",
  actionLabel = "View Featured Products",
  actionHref = "/products",
  limit = 10,
  fallbackProducts = [],
}) {
  const dispatch = useDispatch();
  const [localProducts, setLocalProducts] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const hasFetchedRef = useRef(false);
  const sentinelRef = useRef(null);

  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
  const recommendationList = useSelector((s) => s.recommendation.list);
  const trendingList = useSelector((s) => s.recommendation.trendingList);
  const productList = useSelector((s) => s.product.list);

  const loadingRecommendations = useSelector(
    (s) =>
      s.recommendation.loadingRecommendations ||
      s.recommendation.loadingTrending,
  );

  const fallback =
    fallbackProducts?.length > 0 ? fallbackProducts : productList;
  const recommendations =
    recommendationList?.length > 0 ? recommendationList : [];
  const trending = trendingList?.length > 0 ? trendingList : [];
  const reduxProducts = productList?.length > 0 ? productList : [];

  const loading = localLoading || loadingRecommendations;

  useEffect(() => {
    if (hasFetchedRef.current) return;
    setLocalLoading(true);
    hasFetchedRef.current = true;
    dispatch(fetchProducts({ limit, page: 1, sort: "newest" }))
      .unwrap()
      .then((result) => {
        setLocalProducts(getProductListFromResponse(result));
        const pagination = getPagination(result, getProductListFromResponse(result));
        setTotalPages(pagination.totalPages || 1);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setLocalLoading(false));
  }, [dispatch, limit]);

  const loadNextPage = useCallback(() => {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    dispatch(fetchProducts({ limit, page: nextPage, sort: "newest" }))
      .unwrap()
      .then((result) => {
        const newProducts = getProductListFromResponse(result);
        setLocalProducts((prev) => {
          const seen = new Set(prev.map(p => getProductId(p)));
          const uniqueNew = newProducts.filter(p => !seen.has(getProductId(p)));
          return [...prev, ...uniqueNew];
        });
        const pagination = getPagination(result, newProducts);
        setTotalPages(pagination.totalPages || 1);
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [dispatch, limit, page, totalPages, isLoadingMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || page >= totalPages) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [page, totalPages, loadNextPage]);

  const products = (
    localProducts.length
      ? localProducts
      : reduxProducts.length
        ? reduxProducts
        : trending.length
          ? trending
          : recommendations.length
            ? recommendations
            : fallback
  );

  return (
    <SectionContainer
      title={title}
      subtitle={description}
      actionHref="/products"
      actionStyle="icon"
      mobileActionStyle="none"
      className="mb-8"
      disablePadding={true}
    >
      <div>
        {loading && !products.length ? (
          <SkeletonLoader
            preset="PRODUCT_CARD"
            count={limit}
            containerClass="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            wrapperClass="customer-card min-w-0 p-3"
          />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard
                  key={getProductId(product)}
                  product={product}
                  onAddToCart={addToCart}
                  onWishlist={toggleWishlist}
                  isWishlisted={isWishlisted(product)}
                />
              ))}
            </div>
            {page < totalPages && (
              <div ref={sentinelRef} className="h-10 mt-8 flex items-center justify-center">
                {isLoadingMore && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </SectionContainer>
  );
}
