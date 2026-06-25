import ResponsiveGrid from "../common/display/ResponsiveGrid";
import ProductCard from "./ProductCard";
import { getProductId } from "../../utils/ecommerce";

export default function ProductGrid({
  products = [],
  variant = "grid",
  cardVariant,
  onAddToCart,
  onWishlist,
  isWishlisted,
  getKey = getProductId,
  renderProduct,
  className = "",
}) {
  const gridVariant =
    variant === "list" || cardVariant === "list" ? "list" : "products";
  const resolvedCardVariant = cardVariant || variant;

  return (
    <ResponsiveGrid variant={gridVariant} className={`${className} `}>
      {products.map((product, index) =>
        renderProduct ? (
          renderProduct(product)
        ) : (
          <ProductCard
            key={`${getKey(product) ?? "product "}-${index} `}
            product={product}
            variant={resolvedCardVariant}
            onAddToCart={onAddToCart}
            onWishlist={onWishlist}
            isWishlisted={isWishlisted?.(product)}
          />
        ),
      )}
    </ResponsiveGrid>
  );
}
