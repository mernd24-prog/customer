import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ProductCard } from "../ecommerce";
import { SkeletonLoader } from "../common/skeleton";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";

export default function HomeProductsForYouSection({
  title = "Products For You",
  actionLabel = "See all →",
  actionHref = "/products",
  limit = 8,
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const recommendationList = useSelector((s) => s.recommendation.list);
  const trendingList = useSelector((s) => s.recommendation.trendingList);
  const productList = useSelector((s) => s.product.list);
  const loading = useSelector(
    (s) =>
      s.recommendation.loadingRecommendations ||
      s.recommendation.loadingTrending ||
      s.product.loading,
  );

  const recommendations = Array.isArray(recommendationList) ? recommendationList : [];
  const trending = Array.isArray(trendingList) ? trendingList : [];
  const productsFallback = Array.isArray(productList) ? productList : [];
  const products = (
    recommendations.length
      ? recommendations
      : trending.length
        ? trending
        : productsFallback
  ).slice(0, limit);

  return (
    <section className="mt-8 rounded-[10px] bg-[#F7F6F500] p-5 sm:p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-montserrat text-[16px] font-semibold text-[#2E2E2E] sm:text-[18px]">
          {title}
        </h2>
        {actionHref && actionLabel && (
          <Link
            to={actionHref}
            className="text-sm font-medium text-[#d4a437] underline-offset-4 hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {loading && !products.length ? (
        <SkeletonLoader
          preset="PRODUCTS_FOR_YOU_CARD"
          count={limit}
          containerClass="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          wrapperClass="min-w-0 rounded-[8px] bg-white p-3 shadow-sm"
        />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
    </section>
  );
}
