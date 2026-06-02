import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import Label from "../common/label/Label";
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
  const currentPriceNumber = Number(String(price || 0).replace(/[^\d.-]/g, ""));
  const oldPriceNumber = Number(String(oldPrice || 0).replace(/[^\d.-]/g, ""));
  const computedDiscountPercent =
    discountPercent ||
    (oldPriceNumber > currentPriceNumber && currentPriceNumber > 0
      ? Math.round(((oldPriceNumber - currentPriceNumber) / oldPriceNumber) * 100)
      : 0);
  const discountLabel = computedDiscountPercent
    ? `${computedDiscountPercent}% Off`
    : "";
  const roundedRating = Math.round(Math.max(0, Math.min(Number(rating || 0), 5)));

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
    navigate(`/brands/${encodeURIComponent(brand)}`);
  };

  const handleImageError = (event) => {
    applyImageFallback(event, title, cardProduct?.category || brand);
  };

  if (isListVariant) {
    return (
      <article className={cn("customer-card p-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[var(--customer-shadow)]", className)}>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
          <Link to={to} className="block overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)]">
            {image ? (
              <img src={image} alt={title} className="aspect-square w-full object-cover" loading="lazy" decoding="async" onError={handleImageError} />
            ) : (
              <div className="flex aspect-square items-center justify-center text-[var(--customer-border-strong)]">
                <ShoppingCart size={42} strokeWidth={1.4} />
              </div>
            )}
          </Link>

          <Link to={to} className="min-w-0">
            {brand && (
              <button
                type="button"
                onClick={handleBrandClick}
                className=" text-left text-[11px] font-medium uppercase text-[var(--customer-muted)] hover:text-[var(--customer-gold-dark)]"
              >
                {brand}
              </button>
            )}
            <h3 className="mt-1 line-clamp-2  text-sm font-semibold text-[var(--customer-ink)] sm:text-base" title={title}>
              {title}
            </h3>
            <p className="mt-2 line-clamp-2  text-sm text-[var(--customer-muted)]" title={subtitle}>
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
    <article className={cn("group relative min-w-0 overflow-hidden rounded-[24px] border border-[#CE9F2D66] bg-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,24,39,0.12)]", className)}>
      <div className="absolute left-4 top-4 z-20 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2">
        <Label variant="featured" className="px-4 py-1.5 text-[13px] font-bold leading-none lg:text-[14px]">
          {badgeText || "Featured"}
        </Label>
        {discountLabel && (
          <Label variant="success" className="px-4 py-1.5 text-[13px] font-bold leading-none text-[#148022] lg:text-[14px]">
            {discountLabel}
          </Label>
        )}
      </div>

      {!isInStock && (
        <Label variant="bestseller" className="absolute right-4 top-[58px] z-20 px-3 py-1 text-[11px] lg:text-[12px]">
          Out of stock
        </Label>
      )}

      <Link to={to} className="block">
        <div className="overflow-hidden bg-[var(--customer-cream)]">
          {image ? (
            <img src={image} alt={title} className="mx-auto aspect-[1.28/1] w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.02]" loading="lazy" decoding="async" onError={handleImageError} />
          ) : (
            <div className="flex aspect-[1.28/1] items-center justify-center text-[var(--customer-border-strong)]">
              <ShoppingCart size={48} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div
            className="flex items-center gap-2  text-[14px] font-medium text-[#242424] my-[6px]"
            aria-label={`${rating || 0} out of 5 stars`}
          >
            <span className="font-['DM_Sans'] text-[14px] font-medium leading-[100%] text-[#2E2E2E]">
              {Number(rating || 0).toFixed(1)}
            </span>
            <span className="flex h-[14px] w-[84px] items-center gap-0.5 text-[#F58220]">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={
                    index < roundedRating
                      ? "fill-[#F58220] text-[#F58220]"
                      : "fill-[#E5E7EB] text-[#E5E7EB]"
                  }
                />
              ))}
            </span>
            <span className="font-['DM_Sans'] text-[14px] font-medium leading-[100%] text-[#2E2E2E]">
              {"(2.4k)"}
            </span>
            {ratingCount != null && <span>({ratingCount})</span>}
          </div>

          <h3
            className="mt-4 line-clamp-1 max-w-[297px] font-['Sans'] text-[18px] font-semibold leading-[100%] text-[#2E2E2E]"
            title={title}
          >
            {title}
          </h3>

          <Price
            price={price}
            oldPrice={oldPrice}
            currency={currency || cardProduct?.currency}
            className="mt-4 gap-3"
            priceClassName=" text-[21px] font-extrabold leading-[100%] text-[#1B1D60] "
            oldPriceClassName="text-[21px] font-semibold leading-[100%] text-[#949494] line-through align-middle"
          />
        </div>
      </Link>

      {showActions && (
        <div className="flex items-center gap-4 sm:gap-6 md:gap-6 lg:gap-10 px-5 pb-6 sm:px-6">
          <button
            type="button"
            disabled={!isInStock}
            onClick={handleAddToCart}
            className={cn(
              "inline-flex h-[40px] w-[197px] items-center justify-center gap-[15px] rounded-[25px] bg-[#CE9F2D] px-[25px] py-[10px] font-['DM_Sans'] text-[15px] font-semibold leading-[100%] text-white transition-all duration-300 ease-in-out hover:bg-[#bd9025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B1D60]",
              !isInStock && "cursor-not-allowed opacity-60"
            )}
          >
            Add to Cart
            <ShoppingCart size={19} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={
              isWishlisted
                ? `Remove ${title} from wishlist`
                : `Add ${title} to wishlist`
            }
            onClick={handleWishlist}
            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[25px] border border-[#1B1D6099] bg-[#1B1D600D] text-[#1B1D60] p-[10px] transition-all duration-300 ease-in-out hover:border-[#CE9F2D] hover:text-[#CE9F2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B1D60]"
          >
            <Heart
              size={19}
              fill={isWishlisted ? "#CE9F2D" : "none"}
              stroke={isWishlisted ? "#CE9F2D" : "currentColor"}
            />
          </button>
        </div>
      )}
    </article>
  );
}
