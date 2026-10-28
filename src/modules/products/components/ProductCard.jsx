import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Banknote, Clock3, Heart, ShoppingCart } from "lucide-react";

import AddToCartButton from "./AddToCartButton";
import Label from "../../../components/ui/label/Label";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import {
  IconCircleButton,
  PillButton,
} from "../../../components/ui/button/static";

import Price from "./Price";
import Rating from "./Rating";
import WishlistButton from "../../wishlist/components/WishlistButton";
import { capitalizeFirst } from "../../../utils/stringUtils";

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
  getProductBrandName,
  getProductCategoryName,
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

  const resolvedTitle = titleProp || getProductTitle(cardProduct);
  const title =
    resolvedTitle && resolvedTitle !== "Untitled product"
      ? resolvedTitle
      : "Product details coming soon";

  const rawBrand = brandProp || getProductBrandName(cardProduct);

  const brand =
    typeof rawBrand === "object"
      ? rawBrand?.name || rawBrand?.title || rawBrand?.label || ""
      : rawBrand || "";

  const categoryName = getProductCategoryName(cardProduct);
  const cardEyebrow = brand || categoryName || "";

  const variantImage = getProductImage(displayProduct);

  const image =
    variantImage ||
    imageProp ||
    getImageFallbackSrc(title, cardProduct?.category || brand);

  const subtitle =
    subtitleProp ||
    cardProduct?.description ||
    getProductCategoryName(cardProduct) ||
    getProductBrandName(cardProduct) ||
    "";

  const price = priceProp ?? getProductPrice(displayProduct);
  const oldPrice = oldPriceProp ?? getProductMrp(displayProduct);

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

  const to =
    href ||
    getProductPublicPath(cardProduct, {
      variant: displayVariant,
    });

  const isListVariant = variant === "list" || variant === "compact";

  const isFeatured =
    cardProduct?.metadata?.featured === true ||
    cardProduct?.isFeatured === true ||
    cardProduct?.markAsFeatured === true;

  const dealBadge =
    cardProduct?.deal?.badge ||
    cardProduct?.metadata?.dealBadge ||
    badge ||
    null;

  const dealEndDate = formatDealEndDate(getDealEndDateValue(cardProduct));

  const isDealProduct =
    Boolean(cardProduct?.deal?.dealId) ||
    cardProduct?.metadata?.isDealProduct === true ||
    Boolean(dealEndDate);

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

  const availableStock = getProductAvailableStock(displayProduct);

  const codAvailable = isProductCodAvailable(cardProduct);

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

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const swiperRef = useRef(null);

  const allImages = useMemo(() => {
    const list = [];

    const addImg = (img) => {
      if (!img) return;

      const url =
        typeof img === "string"
          ? img
          : img?.url || img?.src || img?.image || img?.link || "";

      if (url && typeof url === "string" && !list.includes(url)) {
        list.push(url);
      }
    };

    addImg(variantImage || imageProp);

    const displayVariantImages = Array.isArray(displayVariant?.images)
      ? displayVariant.images
      : [];

    displayVariantImages.forEach(addImg);

    if (!displayVariantImages.length && Array.isArray(cardProduct?.images)) {
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

    return list.length > 0 ? list : image ? [image] : [];
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
      // Reset to first slide smoothly when not hovered
      swiperRef.current?.slideTo(0, 300);
      setActiveImageIndex(0);
      return;
    }

    // Preload all images
    allImages.forEach((imgUrl) => {
      if (imgUrl) {
        const img = new Image();
        img.src = getOptimizedCloudinaryUrl(imgUrl, 400);
      }
    });

    // Advance slides using slideNext() on an interval
    const interval = setInterval(() => {
      swiperRef.current?.slideNext(400);
    }, 1300);

    return () => clearInterval(interval);
  }, [isHovered, allImages]);

  const activeImage = allImages[activeImageIndex] || image;

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

    navigate(`/brands/${encodeURIComponent(brand)}`);
  };

  const handleImageError = (event) => {
    applyImageFallback(event, title, cardProduct?.category || brand);
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
            target={resolvedTarget === "_self" ? undefined : resolvedTarget}
            rel={
              resolvedTarget === "_blank" ? "noopener noreferrer" : undefined
            }
            className="relative block overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)]"
          >
            {activeImage ? (
              <div className="group flex aspect-square w-full items-center justify-center overflow-hidden p-4">
                <img
                  src={getOptimizedCloudinaryUrl(activeImage, 300)}
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

                {isHovered && allImages.length > 1 && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1 px-2">
                    {allImages.slice(0, 5).map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1 rounded-full shadow-sm transition-all duration-300",
                          activeImageIndex % Math.min(allImages.length, 5) ===
                            idx
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
                <ShoppingCart size={42} strokeWidth={1.4} />
              </div>
            )}
          </Link>

          <Link
            to={to}
            target={resolvedTarget === "_self" ? undefined : resolvedTarget}
            rel={
              resolvedTarget === "_blank" ? "noopener noreferrer" : undefined
            }
            className="min-w-0"
          >
            {brand ? (
              <button
                type="button"
                onClick={handleBrandClick}
                className="text-left text-caption font-medium uppercase text-[var(--customer-muted)] hover:text-[var(--customer-gold-dark)]"
              >
                {capitalizeFirst(brand)}
              </button>
            ) : (
              <span className="text-caption font-medium uppercase tracking-wide text-muted">
                {capitalizeFirst(cardEyebrow)}
              </span>
            )}

            {isDealProduct && dealBadge && (
              <span className="mb-1 inline-flex w-fit rounded-full bg-[#1B1D60] px-2.5 py-1 text-caption font-semibold leading-none text-white">
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
              emptyLabel="New"
              className="mt-3"
            />

            {codAvailable && (
              <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-caption font-semibold text-emerald-700">
                <Banknote size={12} />
                COD Available
              </span>
            )}
          </Link>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <Price
              price={price}
              oldPrice={oldPrice}
              currency={currency || cardProduct?.currency}
              layout="stacked"
              emptyLabel="Price unavailable"
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
      className={cn(
        "customer-card customer-card--interactive group relative flex min-w-0 flex-col overflow-hidden rounded-xl border-border bg-white",
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
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={
            isWishlisted
              ? `Remove ${title} from wishlist`
              : `Add ${title} to wishlist`
          }
          onClick={handleWishlist}
          className={cn(
            "absolute right-2 top-2 z-30 flex h-8 w-8 min-w-8 items-center justify-center rounded-full border border-[#1B1D60] bg-white p-0 text-navy shadow-none",
            "min-[1000px]:hidden",
            isWishlisted && "border-[#1B1D60]",
          )}
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            fill={isWishlisted ? "#1B1D60" : "none"}
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
              rounded-xl
              bg-[#1F2430]
              bg-[linear-gradient(#CE9F2D,#CE9F2D)]
              px-2 py-0.5
              text-micro
              font-semibold
              text-white
              sm:px-3 sm:py-1 sm:text-sm
            "
          >
            Featured
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
              text-micro
              font-semibold
              leading-none
              text-white
              sm:h-[28px]
              sm:px-[15px]
              sm:py-[5px]
              sm:text-sm
            "
          >
            {dealBadge}
          </Label>
        )}
      </div>

      {/* PRODUCT CONTENT */}
      <Link
        to={to}
        target={resolvedTarget === "_self" ? undefined : resolvedTarget}
        rel={resolvedTarget === "_blank" ? "noopener noreferrer" : undefined}
        className="flex min-w-0 flex-1 flex-col"
      >
        {/* IMAGE */}
        <div
          className="relative aspect-square w-full cursor-pointer overflow-hidden border-b border-border/70 bg-[var(--customer-surface-soft)]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {allImages.length > 0 ? (
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              speed={500}
              loop={allImages.length > 1}
              allowTouchMove={allImages.length > 1}
              simulateTouch
              grabCursor={false}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setActiveImageIndex(swiper.realIndex);
              }}
              className="h-full w-full"
              style={{ cursor: "pointer" }}
            >
              {allImages.map((image, idx) => (
                <SwiperSlide key={`${image}-${idx}`}>
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src={getOptimizedCloudinaryUrl(image, 400)}
                      srcSet={generateCloudinarySrcSet(image, [300, 400, 800])}
                      sizes="(max-width: 640px) 250px, (max-width: 1024px) 400px, 800px"
                      alt=""
                      width="400"
                      height="400"
                      className="h-full w-full object-contain object-center p-2"
                      loading={idx === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onError={handleImageError}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--customer-border-strong)]">
              <ShoppingCart size={48} strokeWidth={1.4} />
            </div>
          )}

          {/* IMAGE INDICATORS */}
          {isHovered && allImages.length > 1 && (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center gap-1.5 px-2",
                isDealProduct && dealEndDate ? "bottom-8" : "bottom-3",
              )}
            >
              {allImages.slice(0, 6).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 rounded-full shadow-sm transition-all duration-300",
                    activeImageIndex % Math.min(allImages.length, 6) === idx
                      ? "w-4 bg-[#1B1D60]"
                      : "w-1.5 bg-black/30",
                  )}
                />
              ))}
            </div>
          )}

          {rating > 0 && (
            <div
              className={cn(
                "absolute left-2 z-20 rounded-md bg-white/95 shadow-sm backdrop-blur-sm sm:left-3",
                isDealProduct && dealEndDate
                  ? "bottom-7 sm:bottom-9"
                  : "bottom-2 sm:bottom-3",
              )}
            >
              <StarRating rating={rating} count={ratingCount} />
            </div>
          )}

          {/* DEAL END DATE */}
          {isDealProduct && dealEndDate && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex h-[19px] items-center justify-between gap-1 bg-[#FFFDF8]/95 px-1.5 shadow-[0_-2px_6px_rgba(0,0,0,0.02)] sm:h-[29px] sm:px-3">
              <div className="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-navy sm:gap-1.5 sm:text-label">
                <span className="relative flex h-1.5 w-1.5 shrink-0 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                </span>
                <span>Ends</span>
              </div>

              <span className="flex min-w-0 items-center gap-0.5 whitespace-nowrap text-[9px] font-bold text-navy sm:gap-1 sm:text-label">
                <Clock3
                  size={11}
                  className="shrink-0 sm:h-[13px] sm:w-[13px]"
                />
                <span className="truncate">{dealEndDate}</span>
              </span>
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="flex min-h-[104px] min-w-0 flex-col px-3 pb-2.5 pt-3 sm:min-h-[126px] sm:px-4 sm:pb-3 sm:pt-3.5">
          {cardEyebrow && (
            <div
              className="mb-1 truncate text-caption font-semibold uppercase tracking-[0.04em] text-muted sm:text-xs"
              title={cardEyebrow}
            >
              {capitalizeFirst(cardEyebrow)}
            </div>
          )}

          <h3
            className="line-clamp-2 min-h-10 w-full text-label font-semibold leading-5 text-ink sm:min-h-11 sm:text-body sm:leading-[22px]"
            title={title}
          >
            {title}
          </h3>
          {/* FLIPKART-STYLE PRICE AND DISCOUNT */}
          <div className="mt-auto flex min-h-7 min-w-0 flex-wrap items-end gap-x-1.5 gap-y-1 pt-2 sm:min-h-8 sm:gap-x-2">
            <Price
              price={price}
              oldPrice={oldPrice}
              currency={currency || cardProduct?.currency}
              className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 sm:gap-x-2"
              priceClassName="text-base font-extrabold text-ink sm:text-lg"
              oldPriceClassName="text-xs font-normal text-muted line-through sm:text-sm"
              emptyLabel="Currently unavailable"
            />

            {discountLabel && (
              <span className="whitespace-nowrap text-caption font-bold text-emerald-700 sm:text-sm">
                {computedDiscountPercent}% off
              </span>
            )}
          </div>
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
              <ShoppingCart size={15} strokeWidth={2.4} className="shrink-0" />
            }
            className={cn(
              `
                min-w-0
                flex-1
                h-10
                gap-2
                px-4
                text-base
                leading-none
                font-semibold
                whitespace-nowrap
                rounded-lg
              `,
              !isInStock && "cursor-not-allowed opacity-60",
            )}
          >
            <span className="truncate">
              {isInStock ? "Add to Cart" : "Out of stock"}
            </span>
          </PillButton>

          {/* DESKTOP BOTTOM WISHLIST */}
          <IconCircleButton
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={
              isWishlisted
                ? `Remove ${title} from wishlist`
                : `Add ${title} to wishlist`
            }
            onClick={handleWishlist}
            className={cn(
              `
                flex
                h-8
                w-8
                min-w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#1B1D60]
                bg-white
                p-0
                text-navy
              `,
              isWishlisted && "border-[#1B1D60]",
            )}
          >
            <Heart
              size={19}
              fill={isWishlisted ? "#1B1D60" : "none"}
              stroke="#1B1D60"
              strokeWidth={1.8}
            />
          </IconCircleButton>
        </div>
      )}
    </article>
  );
}
