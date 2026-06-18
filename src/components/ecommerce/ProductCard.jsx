import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
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
    ratingCountProp ?? cardProduct?.ratingCount ?? cardProduct?.reviewsCount;
  const discountPercent =
    discountPercentProp ?? cardProduct?.discountPercent ?? 0;
  const brand = brandProp || cardProduct?.brand;
  const to = href || `/products/${id}`;
  const isListVariant = variant === "list" || variant === "compact";
  const badgeText =
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
  const roundedRating = Math.round(
    Math.max(0, Math.min(Number(rating || 0), 5)),
  );

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
        <div className="grid gap-4   sm:grid-cols-[180px_1fr_auto]  sm:items-center">
          <Link
            to={to}
            className="block overflow-hidden  rounded-[var(--customer-radius)] bg-[var(--customer-cream)]"
          >
            {image ? (
              <div className="group flex aspect-square w-full items-center justify-center overflow-hidden p-4">
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
                className=" text-left text-[11px] font-medium uppercase text-[var(--customer-muted)] hover:text-[var(--customer-gold-dark)]"
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
        ` ${!isInStock ? "opacity-50 " : ""}  group relative min-w-0 overflow-hidden  rounded-[20px] border border-[#CE9F2D66]/50 bg-white transition-all duration-300 ease-in-out hover:shadow-[0_16px_40px_rgba(17,24,39,0.12)]`,
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
          {badgeText || "Featured"}
        </Label>
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

      <Link to={to} className="block">
        <div className="overflow-hidden bg-[var(--customer-cream)]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="mx-auto aspect-[1.28/1] w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <div className="flex aspect-[1.28/1] items-center justify-center text-[var(--customer-border-strong)]">
              <ShoppingCart size={48} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <div className="px-4 pb-4 pt-6">
          <div
            className="flex items-center gap-2  text-[14px] font-medium text-[#242424] my-[6px]"
            aria-label={`${rating || 0} out of 5 stars`}
          >
            <span className=" text-[14px]  font-medium  text-[#2E2E2E]">
              {Number(rating || 0).toFixed(1)}
            </span>
            <span className="flex  h-[14px] w-[84px] items-center gap-0.5 text-[#F58220]">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={
                    index < roundedRating
                      ? "fill-[#F58220] text-[#F58220]"
                      : "fill-[#E5E7EB] text-[#E5E7EB]"
                  }
                />
              ))}
            </span>
            <span className=" text-[16px] font-medium  text-[#2E2E2E]">
              {"(2.4k)"}
            </span>
            {ratingCount != null && <span>({ratingCount})</span>}
          </div>

          <h3
            className="mt-4  text-[14px] font-semibold    text-[#2E2E2E] sm:text-[18px] lg:text-[20px]"
            title={title}
          >
            {title}
          </h3>

          <Price
            price={price}
            oldPrice={oldPrice}
            currency={currency || cardProduct?.currency}
            className="my-3 gap-3"
            priceClassName=" text-[16px] font-extrabold   text-[#1B1D60] sm:text-[18px] lg:text-[22px]"
            oldPriceClassName=" text-[16px] font-semibold  text-[#949494] line-through sm:text-[18px] lg:text-[22px]"
          />
        </div>
      </Link>

      {showActions && (
        <div className="flex  items-center gap-8 my-4 px-2">
          <PillButton
            disabled={!isInStock}
            onClick={handleAddToCart}
            rightIcon={<ShoppingCart size={19} strokeWidth={2.4} />}
            className={cn(
              "w-full gap-[15px]  text-[15px] font-semibold  focus-visible:outline-[#1B1D60]",
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
              "focus-visible:outline-none",
              isWishlisted
                ? "border-[#1B1D60] text-[#1B1D60] hover:border-[#1B1D60] hover:text-[#1B1D60]"
                : "border-[#1B1D60] text-[#1B1D60] hover:border-[#1B1D60] hover:text-[#1B1D60]",
            )}
          >
            <Heart
              size={19}
              fill={isWishlisted ? "#1B1D60" : "none"}
              stroke={isWishlisted ? "#1B1D60" : " #1B1D60"}
            />
          </IconCircleButton>
        </div>
      )}
    </article>
  );
}
