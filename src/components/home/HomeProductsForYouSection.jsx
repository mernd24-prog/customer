import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../product/ProductCard";
import ProductsForYouCard from "../../components/ui/ProductsForYouCard";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";

export default function HomeProductsForYouSection() {
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

  const recommendations = Array.isArray(recommendationList)
    ? recommendationList
    : [];
  const trending = Array.isArray(trendingList) ? trendingList : [];
  const productsFallback = Array.isArray(productList) ? productList : [];
  const products = (
    recommendations.length
      ? recommendations
      : trending.length
        ? trending
        : productsFallback
  ).slice(0, 8);

  return (
    <>
      <section className="mt-8 rounded-[10px] bg-[#F7F6F500] p-5 sm:p-4 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-montserrat text-[16px] font-semibold text-[#2E2E2E] sm:text-[18px]">
            Products For You
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium text-[#d4a437] underline-offset-4 hover:underline"
          >
            See all →
          </Link>
        </div>

        {loading && !products.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductsForYouCard key={i} loading />
            ))}
          </div>
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
    </>
  );
}
