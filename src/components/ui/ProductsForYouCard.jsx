import { SkeletonLoader } from "../common/skeleton";
import ProductCard from "../ecommerce/ProductCard";

export default function ProductsForYouCard({
  image,
  title,
  subtitle,
  price,
  oldPrice,
  rating = 3,
  loading = false,
  link = "/",
  variant = "grid",
}) {
  const isListVariant = variant === "list" || variant === "compact";

  if (loading) {
    return (
      <SkeletonLoader
        preset={
          isListVariant ? "PRODUCTS_FOR_YOU_LIST_CARD" : "PRODUCTS_FOR_YOU_CARD"
        }
        wrapperClass={
          isListVariant
            ? "min-w-0 bg-white"
            : "min-w-0 rounded-[8px] bg-white p-3 shadow-sm"
        }
        containerClass=""
      />
    );
  }

  return (
    <ProductCard
      href={link}
      variant={variant}
      showActions={false}
      product={{
        id: link,
        title,
        description: subtitle,
        image,
        price,
        mrp: oldPrice,
        rating,
      }}
    />
  );
}
