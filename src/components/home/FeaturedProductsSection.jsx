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

    sm:my-8
    sm:rounded-3xl
    sm:px-5
    sm:py-2

    md:my-12

    bg-[image:var(--featured-gradient)]
  `;

  const contentClassName = `
    px-0
    pb-0
    sm:px-3
    sm:pb-2
  `;

  const headerClassName = `
    px-0
    sm:px-3
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
        className={`
          ${sectionClassName}
          max-sm:!bg-none
        `}
        style={sectionStyle}
        disablePadding={true}
        contentClassName={contentClassName}
        headerClassName={headerClassName}
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
      className={`
        ${sectionClassName}
        max-sm:!bg-none
      `}
      style={sectionStyle}
      disablePadding={true}
      contentClassName={contentClassName}
      headerClassName={headerClassName}
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