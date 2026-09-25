import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Banknote, Clock3, Heart, ShoppingCart } from "lucide-react";

import AddToCartButton from "./AddToCartButton";
import Label from "../../../components/ui/label/Label";

import {
  IconCircleButton,
  PillButton,
} from "../../../components/ui/button/static";

import Price from "./Price";
import Rating from "./Rating";
import WishlistButton from "../../wishlist/components/WishlistButton";

import {
  getProductPublicPath,
  getProductImage,
  getProductTitle,
  getProductPrice,
  getProductMrp,
  getDefaultVariant,
  getAvailableStock,
  applyImageFallback,
  getImageFallbackSrc,
  getProductAvailableStock,
  isProductCodAvailable,
  getOptimizedCloudinaryUrl,
  generateCloudinarySrcSet,
} from "../../../utils/ecommerce";

import { cn } from "../../../utils/common";
import StarRating from "../../../components/ui/display/StarRating";

const getDealEndDateValue = (product = {}) =>
  product?.deal?.endAt ||
  product?.deal?.end_at ||
  product?.deal?.endDate ||
  product?.deal?.end_date ||
  product?.dealEndAt ||
  product?.deal_end_at ||
  product?.endAt ||
  product?.end_at ||
  product?.endDate ||
  product?.end_date ||
  product?.metadata?.dealEndAt ||
  product?.metadata?.deal_end_at ||
  "";

const formatDealEndDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

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
  target,
  variant = "grid",
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  showActions = true,
  className = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedTarget = useMemo(() => {
    if (target !== undefined) return target;

    const pathname = location.pathname || "";

    if (/^\/products\/[^/]+/.test(pathname)) {
      return "_self";
    }

    if (
      pathname === "/products" ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/brands") ||
      pathname.startsWith("/search") ||
      pathname.startsWith("/brand-outlet")
    ) {
      return "_blank";
    }

    return "_self";
  }, [target, location.pathname]);

  const cardProduct = product || {};

  const displayVariant =
    cardProduct?.selectedVariant || getDefaultVariant(cardProduct);

  const displayProduct = displayVariant
    ? { ...cardProduct, selectedVariant: displayVariant }
    : cardProduct;

  const title = titleProp || getProductTitle(cardProduct);

  const rawBrand = brandProp || cardProduct?.brand;

  const brand =
    typeof rawBrand === "object"
      ? rawBrand?.name ||
        rawBrand?.title ||
        rawBrand?.label ||
        ""
      : rawBrand || "";

  const variantImage = getProductImage(displayProduct);

  const image =
    variantImage ||
    imageProp ||
    getImageFallbackSrc(title, cardProduct?.category || brand);

  const subtitle =
    subtitleProp ||
    cardProduct?.description ||
    cardProduct?.category ||
    cardProduct?.brand ||
    "";

  const price = priceProp ?? getProductPrice(displayProduct) ?? 0;
  const oldPrice = oldPriceProp ?? getProductMrp(displayProduct) ?? 0;

  const rating =
    ratingProp ??
    cardProduct?.rating ??
    cardProduct?.averageRating ??
    0;

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

  const to =
    href ||
    getProductPublicPath(cardProduct, {
      variant: displayVariant,
    });

  const isListVariant =
    variant === "list" || variant === "compact";

  const isFeatured =
    cardProduct?.metadata?.featured === true ||
    cardProduct?.isFeatured === true ||
    cardProduct?.markAsFeatured === true;

  const dealBadge =
    cardProduct?.deal?.badge ||
    cardProduct?.metadata?.dealBadge ||
    badge ||
    null;

  const dealEndDate = formatDealEndDate(
    getDealEndDateValue(cardProduct),
  );

  const isDealProduct =
    Boolean(cardProduct?.deal?.dealId) ||
    cardProduct?.metadata?.isDealProduct === true ||
    Boolean(dealEndDate);

  const currentPriceNumber = Number(
    String(price || 0).replace(/[^\d.-]/g, ""),
  );

  const oldPriceNumber = Number(
    String(oldPrice || 0).replace(/[^\d.-]/g, ""),
  );

  const computedDiscountPercent =
    discountPercent ||
    (oldPriceNumber > currentPriceNumber &&
    currentPriceNumber > 0
      ? Math.round(
          ((oldPriceNumber - currentPriceNumber) /
            oldPriceNumber) *
            100,
        )
      : 0);

  const discountLabel = computedDiscountPercent
    ? `${computedDiscountPercent}% Off`
    : "";

  const availableStock =
    getProductAvailableStock(displayProduct);

  const codAvailable =
    isProductCodAvailable(cardProduct);

  const isInStock =
    inStock !== undefined
      ? Boolean(inStock)
      : typeof cardProduct?.inStock === "boolean"
        ? cardProduct.inStock
        : typeof cardProduct?.isInStock === "boolean"
          ? cardProduct.isInStock
          : availableStock !== null
            ? availableStock > 0
            : true;

  const [activeImageIndex, setActiveImageIndex] =
    useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const allImages = useMemo(() => {
    const list = [];

    const addImg = (img) => {
      if (!img) return;

      const url =
        typeof img === "string"
          ? img
          : img?.url ||
            img?.src ||
            img?.image ||
            img?.link ||
            "";

      if (
        url &&
        typeof url === "string" &&
        !list.includes(url)
      ) {
        list.push(url);
      }
    };

    addImg(variantImage || imageProp);

    const displayVariantImages = Array.isArray(
      displayVariant?.images,
    )
      ? displayVariant.images
      : [];

    displayVariantImages.forEach(addImg);

    if (
      !displayVariantImages.length &&
      Array.isArray(cardProduct?.images)
    ) {
      cardProduct.images.forEach(addImg);
    }

    if (Array.isArray(cardProduct?.gallery)) {
      cardProduct.gallery.forEach(addImg);
    }

    if (Array.isArray(cardProduct?.commonImages)) {
      cardProduct.commonImages.forEach(addImg);
    }

    if (Array.isArray(cardProduct?.media)) {
      cardProduct.media.forEach(addImg);
    }

    if (Array.isArray(cardProduct?.variants)) {
      cardProduct.variants.forEach((v) => {
        if ((getAvailableStock(v) ?? 0) <= 0) return;

        addImg(v?.image);

        if (Array.isArray(v?.images)) {
          v.images.forEach(addImg);
        }
      });
    }

    return list.length > 0
      ? list
      : image
        ? [image]
        : [];
  }, [
    cardProduct,
    displayProduct,
    displayVariant,
    imageProp,
    image,
    variantImage,
  ]);

  useEffect(() => {
    if (!isHovered || allImages.length <= 1) {
      setActiveImageIndex(0);
      return;
    }

    allImages.forEach((imgUrl) => {
      if (imgUrl) {
        const img = new Image();
        img.src = getOptimizedCloudinaryUrl(
          imgUrl,
          400,
        );
      }
    });

    const interval = setInterval(() => {
      setActiveImageIndex(
        (prev) => (prev + 1) % allImages.length,
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovered, allImages]);

  const activeImage =
    allImages[activeImageIndex] || image;

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onWishlist?.(displayProduct);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onAddToCart?.(displayProduct);
  };

  const handleBrandClick = (event) => {
    if (!brand) return;

    event.preventDefault();
    event.stopPropagation();

    navigate(
      `/brands/${encodeURIComponent(brand)}`,
    );
  };

  const handleImageError = (event) => {
    applyImageFallback(
      event,
      title,
      cardProduct?.category || brand,
    );
  };

  /*
   * LIST / COMPACT VARIANT
   */
  if (isListVariant) {
    return (
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "customer-card p-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[var(--customer-shadow)]",
          className,
        )}
      >
        <div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
          <Link
            to={to}
            target={
              resolvedTarget === "_self"
                ? undefined
                : resolvedTarget
            }
            rel={
              resolvedTarget === "_blank"
                ? "noopener noreferrer"
                : undefined
            }
            className="relative block overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)]"
          >
            {activeImage ? (
              <div className="group flex aspect-square w-full items-center justify-center overflow-hidden p-4">
                <img
                  src={getOptimizedCloudinaryUrl(
                    activeImage,
                    300,
                  )}
                  srcSet={generateCloudinarySrcSet(
                    activeImage,
                    [200, 300, 400],
                  )}
                  sizes="(max-width: 640px) 180px, 300px"
                  alt=""
                  width="300"
                  height="300"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />

                {isHovered &&
                  allImages.length > 1 && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1 px-2">
                      {allImages
                        .slice(0, 5)
                        .map((_, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "h-1 rounded-full shadow-sm transition-all duration-300",
                              activeImageIndex %
                                Math.min(
                                  allImages.length,
                                  5,
                                ) === idx
                                ? "w-4 bg-[#1B1D60]"
                                : "w-1.5 bg-black/30",
                            )}
                          />
                        ))}
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center text-[var(--customer-border-strong)]">
                <ShoppingCart
                  size={42}
                  strokeWidth={1.4}
                />
              </div>
            )}
          </Link>

          <Link
            to={to}
            target={
              resolvedTarget === "_self"
                ? undefined
                : resolvedTarget
            }
            rel={
              resolvedTarget === "_blank"
                ? "noopener noreferrer"
                : undefined
            }
            className="min-w-0"
          >
            {brand && (
              <button
                type="button"
                onClick={handleBrandClick}
                className="text-left text-[11px] font-medium uppercase text-[var(--customer-muted)] hover:text-[var(--customer-gold-dark)]"
              >
                {brand}
              </button>
            )}

            {isDealProduct && dealBadge && (
              <span className="mb-1 inline-flex w-fit rounded-full bg-[#1B1D60] px-2.5 py-1 text-[11px] font-semibold leading-none text-white">
                {dealBadge}
              </span>
            )}

            <h3
              className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--customer-ink)] sm:text-base"
              title={title}
            >
              {title}
            </h3>

            <p
              className="mt-2 line-clamp-2 text-sm text-[var(--customer-muted)]"
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

            {codAvailable && (
              <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Banknote size={12} />
                COD Available
              </span>
            )}
          </Link>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <Price
              price={price}
              oldPrice={oldPrice}
              currency={
                currency || cardProduct?.currency
              }
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

  /*
   * GRID VARIANT
   */
  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#CE9F2D80]/50 bg-white transition-all duration-300 ease-in-out sm:rounded-[20px]",
        className,
      )}
    >
      {/* 
        MOBILE / TABLET WISHLIST
        Visible below 1000px.
        Same heart style as your screenshot.
      */}
      {showActions && (
        <IconCircleButton
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-label={
            isWishlisted
              ? `Remove ${title} from wishlist`
              : `Add ${title} to wishlist`
          }
          onClick={handleWishlist}
          className={cn(
            "absolute right-2 top-2 z-30 flex h-8 w-8 min-w-8 items-center justify-center rounded-full border border-[#1B1D60] bg-white p-0 text-[#1B1D60] shadow-none",
            "min-[1000px]:hidden",
            isWishlisted &&
              "border-[#1B1D60]",
          )}
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            fill={
              isWishlisted
                ? "#1B1D60"
                : "none"
            }
            stroke="#1B1D60"
          />
        </IconCircleButton>
      )}

      {/* BADGES */}
      <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-3.5rem)] flex-wrap items-center gap-1 sm:left-4 sm:top-4 sm:max-w-[calc(100%-5rem)] sm:gap-2">
        {isFeatured && (
          <Label
            variant="featured"
            className="
              flex items-center justify-center
              rounded-[50px]
              bg-[#1F2430]
              bg-[linear-gradient(#CE9F2D,#CE9F2D)]
              px-2 py-0.5
              text-[10px]
              font-semibold
              text-white
              sm:px-3 sm:py-1 sm:text-[14px]
            "
          >
            Featured
          </Label>
        )}

        {discountLabel && (
          <Label
            variant="success"
            className="
              flex h-[20px] min-w-[54px]
              items-center justify-center
              rounded-[50px]
              bg-blue
              px-[8px] py-[3px]
              font-dmSans
              text-[10px]
              font-semibold
              leading-none
              tracking-[0%]
              text-white
              sm:h-[28px]
              sm:min-w-[84px]
              sm:px-[15px]
              sm:py-[5px]
              sm:text-[14px]
            "
          >
            {discountLabel}
          </Label>
        )}

        {isDealProduct && dealBadge && (
          <Label
            variant="success"
            className="
              flex h-[20px]
              items-center justify-center
              rounded-[50px]
              bg-[#1B1D60]
              px-[8px] py-[3px]
              font-dmSans
              text-[10px]
              font-semibold
              leading-none
              text-white
              sm:h-[28px]
              sm:px-[15px]
              sm:py-[5px]
              sm:text-[14px]
            "
          >
            {dealBadge}
          </Label>
        )}
      </div>

      {/* PRODUCT CONTENT */}
      <Link
        to={to}
        target={
          resolvedTarget === "_self"
            ? undefined
            : resolvedTarget
        }
        rel={
          resolvedTarget === "_blank"
            ? "noopener noreferrer"
            : undefined
        }
        className="flex min-w-0 flex-1 flex-col"
      >
        {/* IMAGE */}
        <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden rounded-t-[14px] transition-all duration-300 ease-in-out group-hover:scale-[1.01] xs:h-[190px] sm:h-[230px] sm:rounded-t-[20px] md:h-[260px]">
          {activeImage ? (
            <>
              <img
                src={getOptimizedCloudinaryUrl(
                  activeImage,
                  400,
                )}
                srcSet={generateCloudinarySrcSet(
                  activeImage,
                  [300, 400, 800],
                )}
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 400px, 800px"
                alt=""
                width="400"
                height="400"
                className="h-full w-full object-contain p-2 transition-all duration-300 ease-in-out group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
              />

              {isHovered &&
                allImages.length > 1 && (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center gap-1.5 px-2",
                      isDealProduct && dealEndDate
                        ? "bottom-8"
                        : "bottom-3",
                    )}
                  >
                    {allImages
                      .slice(0, 6)
                      .map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1 rounded-full shadow-sm transition-all duration-300",
                            activeImageIndex %
                              Math.min(
                                allImages.length,
                                6,
                              ) === idx
                              ? "w-4 bg-[#1B1D60]"
                              : "w-1.5 bg-black/30",
                          )}
                        />
                      ))}
                  </div>
                )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--customer-border-strong)]">
              <ShoppingCart
                size={48}
                strokeWidth={1.4}
              />
            </div>
          )}

          {/* DEAL END DATE */}
          {isDealProduct && dealEndDate && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex h-[26px] items-center justify-between border-t border-[#EEDFB9]/80 bg-[#FFFDF8]/95 px-2.5 shadow-[0_-2px_6px_rgba(0,0,0,0.02)] backdrop-blur-md sm:h-[29px] sm:px-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B1D60] sm:text-[13px]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                <span>Ends</span>
              </div>

              <span className="flex truncate items-center gap-1 text-xs font-bold text-[#1B1D60] sm:text-[13px]">
                <Clock3
                  size={13}
                  className="shrink-0 text-[#1B1D60]"
                />
                {dealEndDate}
              </span>
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="flex min-w-0 flex-col px-2.5 pb-1 pt-2 sm:px-4 sm:pb-2 sm:pt-3">
          <StarRating
            rating={rating}
            count={ratingCount}
          />

          {brand && (
            <div
              className="mt-1.5 truncate text-xs font-bold tracking-tight text-[#2E2E2E] sm:mt-2 sm:text-base"
              title={brand}
            >
              {brand}
            </div>
          )}

          <h3
            className={cn(
              "w-full line-clamp-1",
              brand
                ? "mb-1.5 mt-0.5 text-xs font-normal text-black sm:mb-2.5 sm:mt-1 sm:text-[16px]"
                : "my-1 text-xs font-semibold text-[#2E2E2E] sm:my-[10px] sm:text-sm",
            )}
            title={title}
          >
            {title}
          </h3>

          <Price
            price={price}
            oldPrice={oldPrice}
            currency={
              currency || cardProduct?.currency
            }
            className="my-0.5 flex flex-wrap items-baseline gap-1 sm:my-1 sm:gap-2.5"
            priceClassName="text-sm sm:text-base font-extrabold text-[#1B1D60] md:text-lg 2xl:text-[20px]"
            oldPriceClassName="text-xs sm:text-base font-semibold text-[#737373] line-through md:text-lg 2xl:text-[20px]"
          />
        </div>
      </Link>

      {/* 
        DESKTOP ACTIONS
        Hidden below 1000px.
        Visible at 1000px and above.
      */}
      {showActions && (
        <div
          className="
            mt-auto
            hidden
            w-full
            min-w-0
            items-center
            gap-3
            px-4
            pb-3
            pt-1
            min-[1000px]:flex
          "
        >
          <PillButton
            disabled={!isInStock}
            onClick={handleAddToCart}
            rightIcon={
              <ShoppingCart
                size={15}
                strokeWidth={2.4}
                className="shrink-0"
              />
            }
            className={cn(
              `
                min-w-0
                flex-1
                h-10
                gap-2
                px-4
                text-[14px]
                leading-none
                font-semibold
                whitespace-nowrap
              `,
              !isInStock &&
                "cursor-not-allowed opacity-60",
            )}
          >
            <span className="truncate">
              Add to Cart
            </span>
          </PillButton>

          {/* DESKTOP BOTTOM WISHLIST */}
          <IconCircleButton
            title={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-label={
              isWishlisted
                ? `Remove ${title} from wishlist`
                : `Add ${title} to wishlist`
            }
            onClick={handleWishlist}
            className={cn(
              `
                flex
                h-10
                w-10
                min-w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#1B1D60]
                bg-white
                p-0
                text-[#1B1D60]
              `,
              isWishlisted &&
                "border-[#1B1D60]",
            )}
          >
            <Heart
              size={19}
              fill={
                isWishlisted
                  ? "#1B1D60"
                  : "none"
              }
              stroke="#1B1D60"
              strokeWidth={1.8}
            />
          </IconCircleButton>
        </div>
      )}
    </article>
  );
}