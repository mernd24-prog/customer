import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SkeletonLoader from "../common/skeleton/SkeletonLoader";
import { ProductCard } from "../ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";

export default function HomeProductsForYouSection({
  title = "Featured Products",
  actionLabel = "View Featured Products",
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
    <section className="mt-8 rounded-[var(--customer-radius)] bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="customer-section-title font-montserrat text-[18px] sm:text-[20px]">
          {title}
        </h2>
        {actionHref && actionLabel && (
          <Link
            to={actionHref}
            className="rounded-full border border-[var(--customer-border)] px-3 py-1.5 text-xs font-semibold text-[var(--customer-navy)] hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold-soft)]"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {loading && !products.length ? (
        <SkeletonLoader
          preset="PRODUCTS_FOR_YOU_CARD"
          count={limit}
          containerClass="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
          wrapperClass="customer-card min-w-0 p-3"
        />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
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
