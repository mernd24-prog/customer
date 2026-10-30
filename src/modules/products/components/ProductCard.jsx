import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Banknote, Clock3, Heart, ShoppingCart, Star } from "lucide-react";

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

const formatRatingCount = (count) => {
  const value = Number(count);
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}m`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return value.toLocaleString();
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

  const rawBrand = brandProp || getProductBrandName(cardProduct);

  const brand =
    typeof rawBrand === "object"
      ? rawBrand?.name || rawBrand?.title || rawBrand?.label || ""
      : rawBrand || "";

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

  const price = priceProp ?? getProductPrice(displayProduct) ?? 0;
  const oldPrice = oldPriceProp ?? getProductMrp(displayProduct) ?? 0;

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
            {brand && (
              <button
                type="button"
                onClick={handleBrandClick}
                className="text-left text-xs font-medium uppercase text-[var(--customer-muted)] hover:text-[var(--customer-gold-dark)]"
              >
                {capitalizeFirst(brand)}
              </button>
            )}

            {isDealProduct && dealBadge && (
              <span className="mb-1 inline-flex w-fit rounded-full bg-[#1B1D60] px-2.5 py-1 text-xs font-semibold leading-none text-white">
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
              <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
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
   * GRID VARIANT (The Bear House Inspired: Minimal, Elegant & Perfectly Proportioned)
   */
  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#EAE2D3] bg-white transition-all duration-300 hover:border-[#CE9F2D] hover:shadow-[0_4px_16px_rgba(27,29,96,0.08)]",
        isFeatured && "border-[#CE9F2D]/60 shadow-[0_2px_8px_rgba(206,159,45,0.08)]",
        className,
      )}
    >
      {/* WISHLIST BUTTON (Top-Right: Minimal, elegant, The Bear House style) */}
      {showActions && (
        <button
          type="button"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={
            isWishlisted
              ? `Remove ${title} from wishlist`
              : `Add ${title} to wishlist`
          }
          onClick={handleWishlist}
          className={cn(
            "absolute right-2 top-2 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-xs border border-black/5 transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white",
            isWishlisted
              ? "text-rose-500 bg-rose-50/90 border-rose-200"
              : "text-[#1B1D60] hover:text-rose-500",
          )}
        >
          <Heart
            size={15}
            strokeWidth={1.8}
            fill={isWishlisted ? "#e11d48" : "none"}
            stroke={isWishlisted ? "#e11d48" : "currentColor"}
            className="transition-colors duration-200"
          />
        </button>
      )}

      {/* BADGES (Top-Left: Subtle geometric tag) */}
      <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-3rem)] flex-wrap items-center gap-1">
        {isFeatured && (
          <span className="rounded bg-[#CE9F2D] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs sm:text-xs">
            Featured
          </span>
        )}

        {isDealProduct && dealBadge && (
          <span className="rounded bg-[#1B1D60] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs sm:text-xs">
            {dealBadge}
          </span>
        )}
      </div>

      {/* PRODUCT CONTENT */}
      <Link
        to={to}
        target={resolvedTarget === "_self" ? undefined : resolvedTarget}
        rel={resolvedTarget === "_blank" ? "noopener noreferrer" : undefined}
        className="flex min-w-0 flex-1 flex-col"
      >
        {/* IMAGE CONTAINER (The Bear House Portrait Aspect Ratio, clean, fixed & elegant) */}
        <div
          className=" relative aspect-[4/5] max-h-[290px] sm:max-h-[330px] w-full cursor-pointer overflow-hidden rounded-t-lg bg-[#FAF8F5]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {allImages.length > 0 ? (
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              speed={400}
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
                  <div className="h-full w-full overflow-hidden">
                    <img
                      src={getOptimizedCloudinaryUrl(image, 500)}
                      srcSet={generateCloudinarySrcSet(image, [300, 500, 700])}
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 600px"
                      alt=""
                      width="350"
                      height="350"
                      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform"
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
              <ShoppingCart size={40} strokeWidth={1.4} />
            </div>
          )}

          {/* FLOATING RATING BADGE (Minimal clean pill on bottom-left) */}
          {rating > 0 && (
            <div
              className={cn(
                "absolute left-2 z-20 flex items-center gap-0.5 rounded bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-xs font-bold text-slate-800 shadow-xs border border-black/5",
                isDealProduct && dealEndDate ? "bottom-7" : "bottom-2",
              )}
            >
              <Star size={10} className="fill-[#CE9F2D] text-[#CE9F2D]" />
              <span>{Number(rating).toFixed(1)}</span>
              {ratingCount > 0 && (
                <span className="text-xs font-normal text-slate-500">
                  ({formatRatingCount(ratingCount)})
                </span>
              )}
            </div>
          )}

          {/* IMAGE INDICATORS (Dots on hover for multi-image items) */}
          {isHovered && allImages.length > 1 && (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center gap-1 px-2",
                isDealProduct && dealEndDate ? "bottom-7" : "bottom-2",
              )}
            >
              {allImages.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 rounded-full shadow-xs transition-all duration-300",
                    activeImageIndex % Math.min(allImages.length, 5) === idx
                      ? "w-3 bg-[#1B1D60]"
                      : "w-1 bg-black/25",
                  )}
                />
              ))}
            </div>
          )}

          {/* DEAL END DATE */}
          {isDealProduct && dealEndDate && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex h-[20px] items-center justify-between gap-1 bg-[#FFFDF8]/95 px-2 shadow-xs sm:h-[22px]">
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1B1D60]">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>Ends</span>
              </div>

              <span className="flex min-w-0 items-center gap-0.5 whitespace-nowrap text-xs font-bold text-[#1B1D60]">
                <Clock3 size={10} className="shrink-0" />
                <span className="truncate">{dealEndDate}</span>
              </span>
            </div>
          )}
        </div>

        {/* PRODUCT INFO (The Bear House style: Clean, tight, perfectly aligned) */}
        <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-2 ">
          {/* BRAND */}
          {brand ? (
            <button
              type="button"
              onClick={handleBrandClick}
              className="max-w-full w-fit text-left truncate text-sm sm:text-sm font-bold uppercase tracking-wider text-[#CE9F2D] hover:text-[#B8860B] transition-colors"
              title={brand}
            >
              {capitalizeFirst(brand)}
            </button>
          ) : (
            <div className="h-[15px]" />
          )}

          <h3
            className="mt-1 truncate text-sm sm:text-sm font-medium text-[#171A3A] transition-colors"
            title={title}
          >
            {title}
          </h3>

          {/* PRICE & DISCOUNT */}
          <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <Price
              price={price}
              oldPrice={oldPrice}
              currency={currency || cardProduct?.currency}
              className="flex min-w-0 flex-wrap items-baseline gap-x-1.5"
              priceClassName="text-sm sm:text-base font-bold text-[#1B1D60]"
              oldPriceClassName="text-xs sm:text-sm font-normal text-slate-400 line-through"
            />

            {discountLabel && (
              <span className="whitespace-nowrap text-xs sm:text-sm font-semibold text-emerald-600">
                ({computedDiscountPercent}% off)
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
