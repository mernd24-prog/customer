import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import Price from "./Price";
import Rating from "./Rating";
import WishlistButton from "./WishlistButton";
import {
  getProductId,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";
import { cn } from "../../utils/classNames";

export default function ProductCard({
  product,
  href,
  variant = "grid",
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  showActions = true,
  className = "",
}) {
  const id = getProductId(product);
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const subtitle = product?.description || product?.category || product?.brand || "";
  const price = product?.salePrice || product?.price || 0;
  const oldPrice = product?.mrp || product?.compareAtPrice || 0;
  const rating = product?.rating || product?.averageRating || 0;
  const ratingCount = product?.ratingCount || product?.reviewsCount;
  const discountPercent = product?.discountPercent || 0;
  const isInStock = product?.isInStock !== false;
  const brand = product?.brand;
  const to = href || `/products/${id}`;
  const isListVariant = variant === "list" || variant === "compact";

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onWishlist?.(product);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(product);
  };

  if (isListVariant) {
    return (
      <article className={cn("rounded-[8px] bg-white p-3 shadow-sm transition hover:shadow-xl", className)}>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
          <Link to={to} className="block overflow-hidden rounded-[8px] bg-[#FAF6EE]">
            {image ? (
              <img src={image} alt={title} className="aspect-square w-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-[#CFC6B8]">
                <ShoppingCart size={42} strokeWidth={1.4} />
              </div>
            )}
          </Link>

          <Link to={to} className="min-w-0">
            {brand && (
              <p className="font-montserrat text-[11px] font-medium uppercase text-[#787878]">
                {brand}
              </p>
            )}
            <h3 className="mt-1 line-clamp-2 font-montserrat text-sm font-semibold text-[#2E2E2E] sm:text-base" title={title}>
              {title}
            </h3>
            <p className="mt-2 line-clamp-2 font-montserrat text-sm text-[#787878]" title={subtitle}>
              {subtitle}
            </p>
            <Rating value={rating} count={ratingCount} showValue className="mt-3" />
          </Link>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <Price price={price} oldPrice={oldPrice} currency={product?.currency} layout="stacked" />
            {showActions && (
              <div className="flex gap-2">
                <WishlistButton active={isWishlisted} label={title} onClick={handleWishlist} />
                <AddToCartButton compact disabled={!isInStock} label={`Add ${title} to cart`} onClick={handleAddToCart} />
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group relative min-w-0 rounded-[8px] bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:px-4 sm:pb-5 sm:pt-5", className)}>
      {discountPercent > 0 && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-[#E23B3B] px-2 py-1 font-montserrat text-[11px] font-semibold text-white">
          {discountPercent}% OFF
        </span>
      )}

      {!isInStock && (
        <span className="absolute right-5 top-5 z-10 rounded-full bg-black/70 px-2 py-1 font-montserrat text-[11px] font-semibold text-white">
          Out of stock
        </span>
      )}

      {showActions && (
        <div className="absolute right-5 top-5 z-20 flex gap-2 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100">
          <WishlistButton active={isWishlisted} label={title} onClick={handleWishlist} />
          <AddToCartButton compact disabled={!isInStock} label={`Add ${title} to cart`} onClick={handleAddToCart} />
        </div>
      )}

      <Link to={to} className="block">
        <div className="overflow-hidden rounded-[8px] bg-[#FAF6EE]">
          {image ? (
            <img src={image} alt={title} className="mx-auto aspect-[1/1.15] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
          ) : (
            <div className="flex aspect-[1/1.15] items-center justify-center text-[#CFC6B8]">
              <ShoppingCart size={48} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <div className="mt-3">
          <Rating value={rating} count={ratingCount} />

          {brand && (
            <p className="mt-2 font-montserrat text-[11px] font-medium uppercase tracking-wide text-[#787878]">
              {brand}
            </p>
          )}

          <h3 className="mt-1 line-clamp-1 font-montserrat text-[12px] font-semibold text-[#2E2E2E] sm:text-[14px]" title={title}>
            {title}
          </h3>

          <p className="mt-1 line-clamp-2 min-h-[28px] font-montserrat text-[13px] leading-4 text-[#787878]" title={subtitle}>
            {subtitle}
          </p>

          <Price price={price} oldPrice={oldPrice} currency={product?.currency} layout="pill" className="mt-3 h-[34px] w-full max-w-[160px]" />
        </div>
      </Link>
    </article>
  );
}
