import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SkeletonLoader from "../ui/skeleton/SkeletonLoader";
import { ProductCard } from "../ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";
import SectionContainer from "../ui/SectionContainer";
import { fetchProducts } from "../../features/product/productSlice";

export default function HomeProductsForYouSection({
  title = "Featured Products",
  description = "",
  actionLabel = "View Featured Products",
  actionHref = "/products",
  limit = 10,
}) {
  const dispatch = useDispatch();
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const recommendationList = useSelector((s) => s.recommendation.list);
  const trendingList = useSelector((s) => s.recommendation.trendingList);

  const [localProducts, setLocalProducts] = useState([]);
  const hasFetchedRef = useRef(false);
  const [localLoading, setLocalLoading] = useState(true);

  const loading = useSelector(
    (s) =>
      s.recommendation.loadingRecommendations ||
      s.recommendation.loadingTrending,
  ) || localLoading;

  const recommendations = Array.isArray(recommendationList)
    ? recommendationList
    : [];
  const trending = Array.isArray(trendingList) ? trendingList : [];

  useEffect(() => {
    if (recommendations.length || trending.length) {
      setLocalLoading(false);
      return;
    }
    if (hasFetchedRef.current && localProducts.length > 0) {
      setLocalLoading(false);
      return;
    }
    hasFetchedRef.current = true;
    setLocalLoading(true);
    dispatch(fetchProducts({ limit, page: 1, sort: "newest" }))
      .unwrap()
      .then((result) => {
        const data = result?.data || {};
        const list =
          data.hits ||
          data.products ||
          data.results ||
          data.items ||
          data.list ||
          (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          setLocalProducts(list);
        }
      })
      .catch(() => {})
      .finally(() => setLocalLoading(false));
  }, [dispatch, limit, recommendations.length, trending.length]);

  const products = (
    recommendations.length
      ? recommendations
      : trending.length
        ? trending
        : localProducts
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
          containerClass="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
          wrapperClass="customer-card min-w-0 p-3"
        />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
