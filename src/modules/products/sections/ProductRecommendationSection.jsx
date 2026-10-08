import ProductCard from "../../../modules/products/components/ProductCard";
import { getProductId } from "../../../utils/ecommerce";
import SectionContainer from "../../../components/ui/SectionContainer";

export default function ProductRecommendationSection({
  title,
  products = [],
  addToCart,
  toggleWishlist,
  isWishlisted,
  limit = 5,
  className = "mt-12",
}) {
  if (!products.length) return null;

  return (
    <SectionContainer
      title={title}
      actionLabel="Explore more"
      actionHref="/products"
      actionStyle="icon"
      className={className}
      disablePadding={true}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ">
        {products.slice(0, limit).map((p) => (
          <ProductCard
            key={getProductId(p)}
            product={p}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            isWishlisted={isWishlisted(p)}
          />
        ))}
      </div>
    </SectionContainer>
  );
}