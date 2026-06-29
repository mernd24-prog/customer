import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import Label from "../common/label/Label";
import {
  IconCircleButton,
  PillButton,
} from "../dynamicComponent/button/static";
import Price from "./Price";
import Rating from "./Rating";
import WishlistButton from "./WishlistButton";
import {
  getProductId,
  getProductImage,
  getProductTitle,
  applyImageFallback,
} from "../../utils/ecommerce";
import { cn } from "../../lib/utils";
import StarRating from "../../pages/products/components/starRating";

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
  const subtitle =
    subtitleProp ||
    cardProduct?.description ||
    cardProduct?.category ||
    cardProduct?.brand ||
    "";
  const price = priceProp ?? cardProduct?.salePrice ?? cardProduct?.price ?? 0;
  const oldPrice =
    oldPriceProp ?? cardProduct?.mrp ?? cardProduct?.compareAtPrice ?? 0;
  const rating =
    ratingProp ?? cardProduct?.rating ?? cardProduct?.averageRating ?? 0;
  const ratingCount =
    ratingCountProp ??
    cardProduct?.ratingCount ??
    cardProduct?.reviewsCount ??
    cardProduct?.reviewCount ??
    cardProduct?.totalReviews ??
    cardProduct?.totalReviewCount ??
    0;
  const discountPercent =
    discountPercentProp ?? cardProduct?.discountPercent ?? 0;
  const brand = brandProp || cardProduct?.brand;
  const to = href || `/products/${id}`;
  const isListVariant = variant === "list" || variant === "compact";
  const isFeatured =
    cardProduct?.metadata?.featured === true ||
    cardProduct?.isFeatured === true ||
    cardProduct?.markAsFeatured === true;

  badge || (discountPercent > 0 ? `${discountPercent}% OFF` : "");
  const currentPriceNumber = Number(String(price || 0).replace(/[^\d.-]/g, ""));
  const oldPriceNumber = Number(String(oldPrice || 0).replace(/[^\d.-]/g, ""));
  const computedDiscountPercent =
    discountPercent ||
    (oldPriceNumber > currentPriceNumber && currentPriceNumber > 0
      ? Math.round(
          ((oldPriceNumber - currentPriceNumber) / oldPriceNumber) * 100,
        )
      : 0);
  const discountLabel = computedDiscountPercent
    ? `${computedDiscountPercent}% Off`
    : "";

  const stockValues = [
    cardProduct?.stock,
    cardProduct?.quantity,
    cardProduct?.inventory,
    cardProduct?.availableStock,
    cardProduct?.totalStock,
  ].filter((value) => value != null && value !== "");
  const variantStockValues = Array.isArray(cardProduct?.variants)
    ? cardProduct.variants
        .map((variant) => variant?.stock)
        .filter((value) => value != null && value !== "")
    : [];
  const hasStockQuantity =
    stockValues.length > 0 || variantStockValues.length > 0;
  const stockQty = [...stockValues, ...variantStockValues].reduce(
    (total, value) => total + (Number(value) || 0),
    0,
  );

  const isInStock =
    inStock !== undefined
      ? Boolean(inStock)
      : typeof cardProduct?.inStock === "boolean"
        ? cardProduct.inStock
        : typeof cardProduct?.isInStock === "boolean"
          ? cardProduct.isInStock
          : hasStockQuantity
            ? stockQty > 0
            : true;

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
      <article
        className={cn(
          "customer-card p-3 transition-all   duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[var(--customer-shadow)]",
          className,
        )}
      >
        <div className="grid gap-4   sm:grid-cols-[180px_1fr_auto]   sm:items-center">
          <Link
            to={to}
            className="block overflow-hidden  rounded-[var(--customer-radius)] bg-[var(--customer-cream)]"
          >
            {image ? (
              <div className="group  flex aspect-square w-full items-center justify-center overflow-hidden p-4">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-contain  transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />
              </div>
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
                className=" text-left text-[11px]  font-medium uppercase text-[var(--customer-muted)] hover:text-[var(--customer-gold-dark)]"
              >
                {brand}
              </button>
            )}
            <h3
              className="mt-1 line-clamp-2  text-sm font-semibold text-[var(--customer-ink)] sm:text-base"
              title={title}
            >
              {title}
            </h3>
            <p
              className="mt-2 line-clamp-2  text-sm text-[var(--customer-muted)]"
              title={subtitle}
            >
              {subtitle}
            </p>
            <Rating
              value={rating}
              count={ratingCount}
              showValue
              className="mt-3"
            />
          </Link>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <Price
              price={price}
              oldPrice={oldPrice}
              currency={currency || cardProduct?.currency}
              layout="stacked"
            />
            {showActions && (
              <div className="flex gap-2">
                <WishlistButton
                  active={isWishlisted}
                  label={title}
                  onClick={handleWishlist}
                />
                <AddToCartButton
                  compact
                  disabled={!isInStock}
                  label={`Add ${title} to cart`}
                  onClick={handleAddToCart}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        ` ${!isInStock ? "opacity-50 " : ""} group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#CE9F2D80]/50 bg-white transition-all duration-300 ease-in-out `,
        className,
      )}
    >
      {!isInStock && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <span className="rounded-full border border-red-800 bg-white px-3 py-1 text-sm font-bold text-red-800 shadow-lg">
            Out of Stock
          </span>
        </div>
      )}

      <div className="absolute  left-4 top-4 z-20 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2">
        {isFeatured && (
          <Label
            variant="featured"
            className="
              flex  items-center justify-center
              rounded-[50px]
              bg-[#CE9F2D]
              text-[12px] font-semibold
              text-white
              sm:text-[14px]
            "
          >
            Featured
          </Label>
        )}
        {discountLabel && (
          <Label
            variant="success"
            className="
              flex h-[24px] min-w-[72px] items-center justify-center
              rounded-[50px]
              bg-[#E8F5E8]
              px-[12px] py-[5px]
              font-dmSans
              text-[12px] font-semibold
              leading-none
              tracking-[0%]
              text-[#228B22]
              sm:h-[28px] sm:min-w-[84px]
              sm:px-[15px]
              sm:text-[14px]
              "
          >
            {discountLabel}
          </Label>
        )}
      </div>

      <Link to={to} className="flex flex-1 flex-col">
        <div className="flex justify-center overflow-hidden  h-[260px] items-center   w-auto rounded-t-[20px]  transition-all duration-300 ease-in-out group-hover:scale-[1.01]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-auto object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--customer-border-strong)]">
              <ShoppingCart size={48} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-4 lg:pt-6">
          <StarRating rating={rating} count={ratingCount} />

          <h3
            className=" w-full truncate text-[20px] font-semibold text-[#2E2E2E] sm:text-[18px]  lg:text-[20px]"
            title={title}
          >
            {title}
          </h3>

          <Price
            price={price}
            oldPrice={oldPrice}
            currency={currency || cardProduct?.currency}
            className="mb-0 gap-3 my-2 lg:my-4"
            priceClassName="text-[20px] font-extrabold text-[#1B1D60] sm:text-[18px] lg:text-[24px]"
            oldPriceClassName="text-[20px] font-semibold text-[#949494] line-through sm:text-[18px] lg:text-[24px]"
          />
        </div>
      </Link>

      {showActions && (
        <div className="mt-auto  flex items-center gap-8  px-4 pb-4">
          <PillButton
            disabled={!isInStock}
            onClick={handleAddToCart}
            rightIcon={<ShoppingCart size={19} strokeWidth={2.4} />}
            className={cn(
              "w-full   gap-[15px] text-[15px]  font-semibold focus-visible:outline-[#1B1D60]",
              !isInStock && "cursor-not-allowed opacity-60",
            )}
          >
            Add to Cart
          </PillButton>
          <IconCircleButton
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={
              isWishlisted
                ? `Remove ${title} from wishlist`
                : `Add ${title} to wishlist`
            }
            onClick={handleWishlist}
            className={cn(
              "hover:border-[#CE9F2D]",
              isWishlisted
                ? "border-[#FF3D31] text-[#FF3D31]"
                : "border-[#CE9F2D] text-[##CE9F2D]",
            )}
          >
            <Heart
              size={19}
              fill={isWishlisted ? "#FF3D31" : "none"}
              stroke={isWishlisted ? "#FF3D31" : " #CE9F2D"}
            />
          </IconCircleButton>
        </div>
      )}
    </article>
  );
}
