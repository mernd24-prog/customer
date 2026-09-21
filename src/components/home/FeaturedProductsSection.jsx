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

  const displayProducts = Array.isArray(products)
    ? products.slice(0, 5)
    : [];

  const sectionClassName = `
    my-0
    rounded-none
    px-0
    py-0
    md:my-0
    md:rounded-none
    md:px-0
    md:py-0

    lg:my-10
    lg:rounded-3xl
    lg:px-5
    lg:py-4

    bg-transparent
    md:bg-transparent
    lg:bg-[image:var(--featured-gradient)]
  `;

  const contentClassName = `
    px-0
    pb-0
    md:px-0
    md:pb-0
    lg:px-3
    lg:pb-2
  `;

  const headerClassName = `
    px-0
    md:px-0
    lg:px-3
  `;

  const sectionStyle = {
    "--featured-gradient":
      "linear-gradient(to bottom, #e1d5b4, #e2d1f0)",
  };

  if (loading) {
    return (
      <SectionContainer
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
        actionStyle="icon"
        mobileActionStyle="button"
        className={sectionClassName}
        style={sectionStyle}
        disablePadding={true}
        contentClassName={contentClassName}
        headerClassName={headerClassName}
      >
        <SkeletonLoader
          preset="PRODUCT_CARD"
          count={5}
          containerClass="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
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
      className={sectionClassName}
      style={sectionStyle}
      disablePadding={true}
      contentClassName={contentClassName}
      headerClassName={headerClassName}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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