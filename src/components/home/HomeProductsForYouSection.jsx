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
    dispatch(fetchProducts({ limit, page: 1, sort: "newest", view: "cards" }))
      .unwrap()
      .then((result) => {
        setLocalProducts(getProductListFromResponse(result));
        const pagination = getPagination(
          result,
          getProductListFromResponse(result),
        );
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

    dispatch(fetchProducts({ limit, page: nextPage, sort: "newest", view: "cards" }))
      .unwrap()
      .then((result) => {
        const newProducts = getProductListFromResponse(result);
        setLocalProducts((prev) => {
          const seen = new Set(prev.map((p) => getProductId(p)));
          const uniqueNew = newProducts.filter(
            (p) => !seen.has(getProductId(p)),
          );
          return [...prev, ...uniqueNew];
        });
        const pagination = getPagination(result, newProducts);
        setTotalPages(pagination.totalPages || 1);
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [dispatch, limit, page, totalPages, isLoadingMore]);


  const rawProducts = localProducts.length
    ? localProducts
    : reduxProducts.length
      ? reduxProducts.slice(0, limit)
      : trending.length
        ? trending.slice(0, limit)
        : recommendations.length
          ? recommendations.slice(0, limit)
          : fallback.slice(0, limit);

  const products = rawProducts;

  if (loading && !products.length) {
    return (
      <SectionContainer
        title={title}
        subtitle={description}
        actionHref={actionHref}
        actionLabel={actionLabel}
        actionStyle="icon"
        mobileActionStyle="none"
        className="mb-8"
        disablePadding={true}
      >
        <SkeletonLoader
          preset="PRODUCT_CARD"
          count={limit}
          containerClass="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          wrapperClass="customer-card min-w-0 p-3"
        />
      </SectionContainer>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <SectionContainer
      title={title}
      subtitle={description}
      actionHref={actionHref}
      actionLabel={actionLabel}
      actionStyle="icon"
      mobileActionStyle="none"
      className="mb-8"
      disablePadding={true}
    >
      <div>
        <div className="grid grid-cols-2 gap-3 my-4 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={loadNextPage}
              disabled={isLoadingMore}
              className="inline-flex h-[42px] px-6 items-center justify-center gap-2 rounded-[10px] border border-[#3E4093] bg-transparent text-sm lg:text-base font-semibold text-[#3E4093] transition-all duration-300 hover:bg-[#3E4093] hover:text-white hover:border-[#3E4093] hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load More</span>
              )}
            </button>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
