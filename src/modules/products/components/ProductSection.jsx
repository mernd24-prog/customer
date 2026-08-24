import SectionHeader from "./SectionHeader";
import ProductGrid from "./ProductGrid";

export default function ProductSection({
  title,
  subtitle,
  action,
  products = [],
  cardVariant = "grid",
  onAddToCart,
  onWishlist,
  isWishlisted,
  className = "",
  gridClassName = "",
}) {
  return (
    <section className={className}>
      {(title || subtitle || action) && (
        <SectionHeader title={title} subtitle={subtitle} action={action} />
      )}
      <ProductGrid
        products={products}
        variant={cardVariant}
        onAddToCart={onAddToCart}
        onWishlist={onWishlist}
        isWishlisted={isWishlisted}
        className={gridClassName}
      />
    </section>
  );
}
