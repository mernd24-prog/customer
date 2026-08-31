import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SkeletonLoader from "../ui/skeleton/SkeletonLoader";
import ProductCard from "../../modules/products/components/ProductCard";

import { useCartActions, useWishlistActions } from "../../modules/products/controllers/actions";
import {
  getProductId,
  getProductListFromResponse,
} from "../../utils/ecommerce";
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

  const loading = localLoading || loadingRecommendations;

  const recommendations = Array.isArray(recommendationList)
    ? recommendationList
    : [];
  const trending = Array.isArray(trendingList) ? trendingList : [];
  const reduxProducts = Array.isArray(productList) ? productList : [];
  const fallback = Array.isArray(fallbackProducts) ? fallbackProducts : [];

  useEffect(() => {
    if (hasFetchedRef.current) {
      setLocalLoading(false);
      return;
    }
    hasFetchedRef.current = true;
    setLocalLoading(true);
    dispatch(fetchProducts({ limit, page: 1, sort: "newest" }))
      .unwrap()
      .then((result) => {
        setLocalProducts(getProductListFromResponse(result));
      })
      .catch(() => {})
      .finally(() => setLocalLoading(false));
  }, [dispatch, limit]);

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
  ).slice(0, limit);

  return (
    <SectionContainer
      title={title}
      subtitle={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
    >
      {loading && !products.length ? (
        <SkeletonLoader
          preset="PRODUCTS_FOR_YOU_CARD"
          count={limit}
          containerClass="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          wrapperClass="customer-card min-w-0 p-3"
        />
      ) : products.length > 0 ? (
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
      ) : null}
    </SectionContainer>
  );
}
