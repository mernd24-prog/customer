import ProductCard from "../../modules/products/components/ProductCard";

import {
  useCartActions,
  useWishlistActions,
} from "../../modules/products/controllers/actions";
import SectionContainer from "../ui/SectionContainer";
import { getProductId } from "../../utils/ecommerce";
import { SkeletonLoader } from "../../components/ui/skeleton";

export default function FeaturedProductsSection({
  title = "Featured Products",
  actionLabel = "View Featured Products",
  actionHref = "/products",
  products = [],
  loading = false,
}) {
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
  const displayProducts = Array.isArray(products) ? products.slice(0, 5) : [];

  if (loading) {
    return (
      <SectionContainer
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
        actionStyle="icon"
        mobileActionStyle="button"
        className="rounded-3xl my-4"
        style={{
          backgroundImage: "linear-gradient(to bottom, #e1d5b4, #e2d1f0)",
        }}
        disablePadding={true}
        contentClassName=""
        headerClassName="px-1"
      >
        <SkeletonLoader
          preset="PRODUCT_CARD"
          count={5}
          containerClass="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          wrapperClass="min-w-0"
        />
      </SectionContainer>
    );
  }

  if (!displayProducts.length) {
    return null;
  }

  return (
    <SectionContainer
      title={title}
      actionLabel={actionLabel}
      actionHref={actionHref}
      actionStyle="icon"
      mobileActionStyle="button"
      className="rounded-3xl p-4  my-8"
      style={{
        backgroundImage: "linear-gradient(to bottom, #e1d5b4, #e2d1f0)",
      }}
      disablePadding={true}
      contentClassName="mt-4"
      headerClassName="px-1"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {displayProducts.map((product, index) => (
          <ProductCard
            key={getProductId(product) || `featured-product-${index}`}
            product={product}
            badge="Featured"
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            isWishlisted={isWishlisted(product)}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
