import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import Price from "./Price";
import Rating from "./Rating";
import WishlistButton from "./WishlistButton";
import {
  getProductId,
  getProductImage,
  getProductTitle,
  applyImageFallback,
} from "../../utils/ecommerce";
import { cn } from "../../utils/classNames";

export default function ProductCard({
  product,
  image: imageProp,
  title: titleProp,
  subtitle: subtitleProp,
  price: priceProp,
  oldPrice: oldPriceProp,
  rating: ratingProp,
  ratingCount: ratingCountProp,
  badge,
  brand: brandProp,
  currency,
  inStock,
  discountPercent: discountPercentProp,
  href,
  variant = "grid",
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  showActions = true,
  className = "",
}) {
  const navigate = useNavigate();
  const cardProduct = product || {};
  const id = getProductId(cardProduct);
  const title = titleProp || getProductTitle(cardProduct);
  const image = imageProp || getProductImage(cardProduct);
  const subtitle = subtitleProp || cardProduct?.description || cardProduct?.category || cardProduct?.brand || "";
  const price = priceProp ?? cardProduct?.salePrice ?? cardProduct?.price ?? 0;
  const oldPrice = oldPriceProp ?? cardProduct?.mrp ?? cardProduct?.compareAtPrice ?? 0;
  const rating = ratingProp ?? cardProduct?.rating ?? cardProduct?.averageRating ?? 0;
  const ratingCount = ratingCountProp ?? cardProduct?.ratingCount ?? cardProduct?.reviewsCount;
  const discountPercent = discountPercentProp ?? cardProduct?.discountPercent ?? 0;
  const isInStock = inStock ?? (cardProduct?.isInStock !== false);
  const brand = brandProp || cardProduct?.brand;
  const to = href || `/products/${id}`;
  const isListVariant = variant === "list" || variant === "compact";
  const badgeText = badge || (discountPercent > 0 ? `${discountPercent}% OFF` : "");

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onWishlist?.(cardProduct);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(cardProduct);
  };

  const handleBrandClick = (event) => {
    if (!brand) return;
    event.preventDefault();
    event.stopPropagation();
    navigate(`/products?brand=${encodeURIComponent(brand)}`);
  };

  const handleImageError = (event) => {
    applyImageFallback(event, title, cardProduct?.category || brand);
  };

  if (isListVariant) {
    return (
      <article className={cn("rounded-[8px] bg-white p-3 shadow-sm transition hover:shadow-xl", className)}>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
          <Link to={to} className="block overflow-hidden rounded-[8px] bg-[#FAF6EE]">
            {image ? (
              <img src={image} alt={title} className="aspect-square w-full object-cover" loading="lazy" decoding="async" onError={handleImageError} />
            ) : (
              <div className="flex aspect-square items-center justify-center text-[#CFC6B8]">
                <ShoppingCart size={42} strokeWidth={1.4} />
              </div>
            )}
          </Link>

          <Link to={to} className="min-w-0">
            {brand && (
              <button
                type="button"
                onClick={handleBrandClick}
                className="font-montserrat text-left text-[11px] font-medium uppercase text-[#787878] hover:text-[#CE9F2D]"
              >
                {brand}
              </button>
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
            <Price price={price} oldPrice={oldPrice} currency={currency || cardProduct?.currency} layout="stacked" />
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
      {badgeText && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-[#E23B3B] px-2 py-1 font-montserrat text-[11px] font-semibold text-white">
          {badgeText}
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
            <img src={image} alt={title} className="mx-auto aspect-[1/1.15] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" decoding="async" onError={handleImageError} />
          ) : (
            <div className="flex aspect-[1/1.15] items-center justify-center text-[#CFC6B8]">
              <ShoppingCart size={48} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <div className="mt-3">
          <Rating value={rating} count={ratingCount} />

          {brand && (
            <button
              type="button"
              onClick={handleBrandClick}
              className="mt-2 font-montserrat text-left text-[11px] font-medium uppercase tracking-wide text-[#787878] hover:text-[#CE9F2D]"
            >
              {brand}
            </button>
          )}

          <h3 className="mt-1 line-clamp-1 font-montserrat text-[12px] font-semibold text-[#2E2E2E] sm:text-[14px]" title={title}>
            {title}
          </h3>

          <p className="mt-1 line-clamp-2 min-h-[28px] font-montserrat text-[13px] leading-4 text-[#787878]" title={subtitle}>
            {subtitle}
          </p>

          <Price price={price} oldPrice={oldPrice} currency={currency || cardProduct?.currency} layout="pill" className="mt-3 h-[34px] w-full max-w-[160px]" />
        </div>
      </Link>
    </article>
  );
}
