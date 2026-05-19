import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  EmailShareButton,
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";
import {
  ChevronRight,
  Heart,
  MapPin,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  ZoomIn,
  X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/zoom";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ProductCard from "../../components/product/ProductCard";
import { fetchProductById } from "../../features/product/productSlice";
import { fetchProductWarranty } from "../../features/warranty/warrantySlice";
import { checkServiceability } from "../../features/delivery/deliverySlice";
import { fetchDynamicPrice } from "../../features/dynamicPricing/dynamicPricingSlice";
import {
  fetchTrendingProducts,
  trackRecommendationInteraction,
} from "../../features/recommendation/recommendationSlice";
import { trackAnalyticsEvent } from "../../features/analytics/analyticsSlice";
import { useProductActions } from "../../hooks/useProductActions";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import {
  applyImageFallback,
  formatMoney,
  getProductId,
  getImageFallbackSrc,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";

function StarRating({ rating, count }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={15}
            className={
              i < stars
                ? "fill-[#CE9F2D] text-[#CE9F2D]"
                : "fill-[#E0E0E0] text-[#E0E0E0]"
            }
          />
        ))}
      </div>
      {rating != null && (
        <span className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count != null && (
        <span className="font-montserrat text-xs text-[#A6A6A6]">
          ({count.toLocaleString()} reviews)
        </span>
      )}
    </div>
  );
}

function ProductGallery({ images, isModal = false, fallbackLabel = "Product" }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLarge, setIsLarge] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const nextIsLarge = window.innerWidth >= 1024;
      setIsLarge(nextIsLarge);

      if (!nextIsLarge) {
        setIsZoomed(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e) => {
    if (!isLarge && !isModal) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });

    if (!isModal && !isZoomed) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isModal) {
      setIsZoomed(false);
    }
  };

  const handleImageClick = () => {
    if (isModal) {
      setIsZoomed((prev) => !prev);
      return;
    }

    if (mainSwiper) {
      if (mainSwiper.activeIndex === images.length - 1) {
        mainSwiper.slideTo(0);
      } else {
        mainSwiper.slideNext();
      }
    }
  };

  return (
    <div
      className={`flex min-w-0 flex-col gap-4 overflow-hidden ${
        isModal ? "h-full w-full" : "h-auto w-full lg:h-[620px]"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
        {/* Thumbnail */}
        <div className="order-2 lg:order-1 h-[90px] lg:h-full lg:w-[90px] overflow-hidden shrink-0">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode
            watchSlidesProgress
            direction={isLarge ? "vertical" : "horizontal"}
            modules={[FreeMode, Thumbs]}
            className="h-full"
          >
            {images.map((img, i) => (
              <SwiperSlide
                key={i}
                className="!w-[78px] lg:!w-full lg:!h-[90px]"
              >
                <button
                  type="button"
                  className={`w-full h-full overflow-hidden rounded-xl border-2 bg-white transition-all duration-300 ${
                    activeIndex === i
                      ? "border-[#CE9F2D] shadow-md"
                      : "border-[#ece7dc]"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain p-1"
                    onError={(event) => applyImageFallback(event, fallbackLabel, "product")}
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Main Image */}
        <div
          className={`relative order-1 lg:order-2 flex-1 overflow-hidden rounded-2xl border border-[#ece7dc] bg-[#fafafa] ${
            isModal ? "h-full" : "aspect-square lg:aspect-auto"
          }`}
        >
          <Swiper
            onSwiper={setMainSwiper}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.activeIndex);
              setIsZoomed(false);
            }}
            spaceBetween={10}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[Thumbs, FreeMode]}
            className="h-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div
                  className={`relative h-full w-full overflow-hidden ${
                    isModal
                      ? isZoomed
                        ? "cursor-zoom-out"
                        : "cursor-zoom-in"
                      : "cursor-crosshair"
                  }`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleImageClick}
                >
                  <img
                    src={img}
                    alt=""
                    draggable={false}
                    className={`h-full w-full object-contain transition-transform duration-300 ease-out select-none ${
                      isZoomed
                        ? isModal
                          ? "scale-[2]"
                          : "scale-[2]"
                        : "scale-100"
                    }`}
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      willChange: "transform",
                    }}
                    onError={(event) => applyImageFallback(event, fallbackLabel, "product")}
                  />

                  {/* Premium Overlay */}
                  {!isZoomed && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

function ImageGallery({
  images,
  fallbackLabel,
  isWishlisted,
  onWishlist,
  onModalOpen,
  onModalClose,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <ProductGallery images={images} fallbackLabel={fallbackLabel} />

      {/* Actions */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={() => {
            if (onModalOpen) onModalOpen();
            setIsModalOpen(true);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#2c2c2c] shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:h-10 sm:w-10"
          title="Zoom image"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={onWishlist}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:h-10 sm:w-10 ${isWishlisted ? "text-red-500" : "text-[#2c2c2c]"}`}
          title="Add to Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-4 animate-fadeIn sm:p-6">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              if (onModalClose) onModalClose();
            }}
            className="absolute top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
          >
            <X size={28} />
          </button>

          <div className="flex h-[90vh] w-full max-w-[1200px] items-center justify-center">
            <ProductGallery images={images} isModal={true} fallbackLabel={fallbackLabel} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function DeliveryChecker({ productId }) {
  const dispatch = useDispatch();
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async (e) => {
    e.preventDefault();
    const pin = pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const action = await dispatch(
        checkServiceability({ pincode: pin, productId }),
      );
      setResult(action?.payload?.data || action?.payload);
    } catch {
      setError("Could not check delivery. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="mb-3 flex items-center gap-2">
        <MapPin size={16} className="text-[#CE9F2D]" />
        <span className="font-montserrat text-sm  font-semibold text-[#2E2E2E]">
          Check Delivery
        </span>
      </div>
      <form onSubmit={check} className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit pincode"
          className="flex-1 rounded-[6px] border border-[#cfc6b8] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="button px-4 py-2 text-sm"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {result && (
        <p
          className={`mt-2 font-montserrat text-sm font-medium ${result.serviceable ? "success" : "text-red-600"}`}
        >
          {result.serviceable
            ? `✓ Delivery by ${result.estimatedDelivery || result.estimatedDate || "2–5 business days"}`
            : "Delivery not available to this pincode."}
        </p>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productState = useSelector((s) => s.product);
  const product = productState.current;
  // console.log("DEBUG: Product API Response:", product);
  const warrantyState = useSelector((s) => s.warranty);
  const dynamicState = useSelector((s) => s.dynamicPricing);
  const relatedList = useSelector((s) => s.recommendation.trendingList);

  const warranty = warrantyState.current;
  const dynamicPrice = dynamicState.current?.price;
  const relatedProducts = Array.isArray(relatedList)
    ? relatedList.slice(0, 4)
    : [];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => {
    dispatch(fetchProductById({ productId }));
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product);
    dispatch(fetchProductWarranty({ productId })).catch(() => {});
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => {});
    dispatch(
      trackAnalyticsEvent({
        eventName: "product_view",
        metadata: { productId },
      }),
    ).catch(() => {});
    dispatch(
      trackRecommendationInteraction({ productId, interactionType: "viewed" }),
    ).catch(() => {});
  }, [dispatch, product, productId]);

  useEffect(() => {
    if (!product) return;
    dispatch(fetchDynamicPrice({ productId, quantity })).catch(() => {});
  }, [dispatch, product, productId, quantity]);

  const price = dynamicPrice ?? product?.price ?? product?.sellingPrice;
  const mrp = product?.mrp ?? product?.originalPrice;
  const discount =
    mrp && price && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const fallbackProductImage = getProductImage(product) || getImageFallbackSrc(getProductTitle(product), product?.category);
  const images = product?.images?.length
    ? product.images
    : product?.imageUrl
      ? [product.imageUrl]
      : fallbackProductImage
        ? [fallbackProductImage]
        : [];
  const variants = product?.variants || [];
  const attributes = product?.attributes || product?.specifications || {};
  const inStock =
    typeof product?.inStock === "boolean"
      ? product.inStock
      : product?.stock != null
        ? product.stock > 0
        : true;
  const detailRows = Object.entries({
    Brand: product?.brand,
    Category: product?.category,
    ...attributes,
  }).filter(([, value]) => value != null && value !== "");

  return (
    <>
      <Seo
        title={`${getProductTitle(product) || "Product"} | Sam Global`}
        description={
          product?.description?.slice(0, 160) ||
          "Shop this product at Sam Global."
        }
      />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-1 font-montserrat text-xs text-[#A6A6A6]">
          <Link to="/" className="hover:text-[#2E2E2E] transition">
            Home
          </Link>
          <span>/</span>
          {product?.category && (
            <>
              <Link
                to={`/categories/${product.category}`}
                className="capitalize hover:text-[#2E2E2E] transition"
              >
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#2E2E2E] line-clamp-1">
            {getProductTitle(product) || "Product"}
          </span>
        </nav>

        <ApiState
          loading={productState.loading && !product}
          error={productState.error}
          empty={!product && !productState.loading}
          emptyTitle="Product not found"
          emptyText="This product may no longer be available."
          onRetry={() => dispatch(fetchProductById({ productId }))}
        >
          {product && (
            <>
              {/* ── Main detail layout ── */}
              <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="min-w-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:self-start">
                  <ImageGallery
                    images={images}
                    fallbackLabel={getProductTitle(product)}
                    isWishlisted={isWishlisted(product)}
                    onWishlist={() => toggleWishlist(product)}
                    onModalOpen={() => {
                      setShareOpen(false);
                      setZoomOpen(true);
                    }}
                    onModalClose={() => setZoomOpen(false)}
                  />
                </div>

                {/* Right: panel */}
                <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6">
                  {/* Brand + share */}
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      {product.brand && (
                        <p className="font-montserrat text-xs font-semibold uppercase tracking-wider text-[#A26D27]">
                          {product.brand}
                        </p>
                      )}
                      <h1 className="mt-1 break-words font-montserrat text-[20px] font-bold leading-snug text-[#2E2E2E] sm:text-[24px] lg:text-[26px]">
                        {getProductTitle(product)}
                      </h1>
                    </div>
                    <div className="relative shrink-0">
                      {!zoomOpen && (
                        <>
                          {/* Share Trigger */}
                          <button
                            type="button"
                            onClick={() => setShareOpen((prev) => !prev)}
                            className="icon-button"
                            title="Share Product"
                          >
                            <Share2 size={16} />
                          </button>

                          {/* Share Popup */}
                          {shareOpen && (
                            <div className="absolute right-0 top-12 z-50 w-[260px] rounded-2xl border border-[#ece7dc] bg-white p-4 shadow-2xl">
                              <div className="mb-3">
                                <h3 className="font-montserrat text-sm font-bold text-[#2E2E2E]">
                                  Share Product
                                </h3>

                                <p className="mt-1 text-xs text-[#787878]">
                                  Share this product with friends
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <WhatsappShareButton
                                  url={window.location.href}
                                  title={getProductTitle(product)}
                                >
                                  <WhatsappIcon size={42} round />
                                </WhatsappShareButton>

                                <FacebookShareButton
                                  url={window.location.href}
                                  quote={getProductTitle(product)}
                                >
                                  <FacebookIcon size={42} round />
                                </FacebookShareButton>

                                <TwitterShareButton
                                  url={window.location.href}
                                  title={getProductTitle(product)}
                                >
                                  <TwitterIcon size={42} round />
                                </TwitterShareButton>

                                <TelegramShareButton
                                  url={window.location.href}
                                  title={getProductTitle(product)}
                                >
                                  <TelegramIcon size={42} round />
                                </TelegramShareButton>

                                <LinkedinShareButton
                                  url={window.location.href}
                                  title={getProductTitle(product)}
                                >
                                  <LinkedinIcon size={42} round />
                                </LinkedinShareButton>

                                <EmailShareButton
                                  url={window.location.href}
                                  subject={getProductTitle(product)}
                                  body={`Check this product:\n${window.location.href}`}
                                >
                                  <EmailIcon size={42} round />
                                </EmailShareButton>
                              </div>

                              {/* Copy Link */}
                              <button
                                type="button"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(
                                    window.location.href,
                                  );

                                  alert("Link copied!");
                                }}
                                className="mt-4 w-full rounded-full bg-[#CE9F2D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b88d28]"
                              >
                                Copy Link
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {(product.rating != null || product.reviewCount != null) && (
                    <StarRating
                      rating={product.rating}
                      count={product.reviewCount || product.ratingCount}
                    />
                  )}

                  {/* Price */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-montserrat text-[18px] font-bold leading-none text-[#2E2E2E] sm:text-[20px]">
                      {formatMoney(price)}
                    </span>
                    {mrp && mrp > price && (
                      <span className="font-montserrat text-sm text-[#A6A6A6] line-through">
                        {formatMoney(mrp)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="rounded-[4px] bg-[#3B388C] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase text-white">
                        Sale {discount}%
                      </span>
                    )}
                  </div>

                  {dynamicState.current?.loyalty && (
                    <p className="inline-block w-fit rounded-full bg-[#F5ECDD] px-3 py-1 font-montserrat text-xs font-semibold text-[#A26D27]">
                      ✦ Loyalty price applied
                    </p>
                  )}

                  {inStock ? (
                    <div className="flex items-center gap-2">
                      <div className="relative z-0 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                      <p className="font-montserrat text-sm font-semibold text-[#10B981]">
                        {product?.stock || 52} in stock
                      </p>
                    </div>
                  ) : (
                    <p className="font-montserrat text-sm font-semibold text-red-500">
                      Out of stock
                    </p>
                  )}

                  {/* Variants - Split into Size and Color if possible */}
                  {variants.length > 0 && (
                    <div className="flex flex-col gap-6">
                      {/* Size Selection */}
                      <div>
                        <p className="mb-2 font-montserrat text-sm font-semibold text-[#2E2E2E]">
                          Size:{" "}
                          <span className="text-[#CE9F2D] font-bold">
                            {selectedVariant?.title?.split(" / ")[0] ||
                              selectedVariant?.name ||
                              "Select"}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            ...new Set(
                              variants.map(
                                (v) =>
                                  (v.title || v.name || "").split(" / ")[0],
                              ),
                            ),
                          ].map((size, i) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const found = variants.find((v) =>
                                  (v.title || v.name || "").startsWith(size),
                                );
                                if (found) setSelectedVariant(found);
                              }}
                              className={`min-w-[45px] h-[45px] rounded-[6px] border px-3 py-1 font-montserrat text-sm font-bold transition-all ${
                                (
                                  selectedVariant?.title ||
                                  selectedVariant?.name ||
                                  ""
                                ).startsWith(size)
                                  ? "border-[#CE9F2D] bg-[#CE9F2D] text-white shadow-md"
                                  : "border-[#cfc6b8] text-[#2E2E2E] hover:border-[#CE9F2D] bg-white"
                              }`}
                            >
                              {size || `V${i + 1}`}
                            </button>
                          ))}
                          <button className="ml-2 font-montserrat text-xs font-semibold text-[#2E2E2E] flex items-center gap-1 hover:underline group">
                            Size Chart{" "}
                            <ChevronRight
                              size={12}
                              className="rotate-90 transition-transform group-hover:translate-y-0.5"
                            />
                          </button>
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div>
                        <p className="mb-2 font-montserrat text-sm font-semibold text-[#2E2E2E]">
                          Color:{" "}
                          <span className="text-[#3730A3] font-bold">
                            {selectedVariant?.title?.split(" / ")[1] ||
                              "Default"}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {[
                            ...new Set(
                              variants
                                .map(
                                  (v) =>
                                    (v.title || v.name || "").split(" / ")[1],
                                )
                                .filter(Boolean),
                            ),
                          ].map((color) => {
                            const colorMap = {
                              Black: "#1A1919",
                              Navy: "#0F1121",
                              White: "#FFFFFF",
                              Beige: "#E8D9CC",
                              Coffee: "#7A5C4A",
                              Espresso: "#4B3621",
                              Olive: "#556B2F",
                            };
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  const size = (
                                    selectedVariant?.title ||
                                    selectedVariant?.name ||
                                    ""
                                  ).split(" / ")[0];
                                  const found =
                                    variants.find(
                                      (v) =>
                                        (v.title || v.name || "").includes(
                                          color,
                                        ) &&
                                        (v.title || v.name || "").startsWith(
                                          size,
                                        ),
                                    ) ||
                                    variants.find((v) =>
                                      (v.title || v.name || "").includes(color),
                                    );
                                  if (found) setSelectedVariant(found);
                                }}
                                className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                                  (
                                    selectedVariant?.title ||
                                    selectedVariant?.name ||
                                    ""
                                  ).includes(color)
                                    ? "border-[#CE9F2D] scale-110 shadow-md"
                                    : "border-transparent hover:border-[#cfc6b8]"
                                }`}
                                title={color}
                              >
                                <div
                                  className="w-full h-full rounded-full border border-gray-200"
                                  style={{
                                    backgroundColor: colorMap[color] || "#ddd",
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex flex-col gap-2">
                    <span className="font-montserrat text-xs font-semibold text-[#A6A6A6] uppercase tracking-wider">
                      Quantity
                    </span>
                    <div className="flex w-full max-w-[220px] items-center overflow-hidden rounded-full border border-[#cfc6b8] bg-white sm:w-fit">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center text-[#2c2c2c] transition hover:bg-[#FAF6EE] disabled:opacity-40 text-xl"
                      >
                        −
                      </button>
                      <span className="flex min-w-[60px] items-center justify-center font-montserrat text-base font-bold text-[#2c2c2c]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="flex h-10 w-10 items-center justify-center text-[#2c2c2c] transition hover:bg-[#FAF6EE] text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => {
                        addToCart(product, quantity);
                        navigate("/cart");
                      }}
                      className="w-full h-[54px] rounded-full bg-[#CE9F2D] text-white font-montserrat font-bold text-base shadow-lg hover:bg-[#b88d28] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add To Cart
                    </button>
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => {
                        addToCart(product, quantity);
                        navigate("/checkout");
                      }}
                      className="w-full h-[54px] rounded-full border-2 border-[#CE9F2D] text-[#CE9F2D] font-montserrat font-bold text-base hover:bg-[#FAF6EE] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy It Now
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      {
                        icon: <Truck size={20} className="text-[#CE9F2D]" />,
                        label: "Free Delivery",
                        desc: "On all orders",
                      },
                      {
                        icon: (
                          <RefreshCw size={20} className="text-[#CE9F2D]" />
                        ),
                        label: "Easy Returns",
                        desc: "30-day window",
                      },
                      {
                        icon: (
                          <ShieldCheck size={20} className="text-[#CE9F2D]" />
                        ),
                        label: "Secure Pay",
                        desc: "100% protected",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-row sm:flex-col items-center sm:text-center gap-3 p-3 rounded-xl bg-[#FAF6EE] border border-[#e7dfd1]"
                      >
                        <div className="shrink-0">{item.icon}</div>
                        <div>
                          <p className="font-montserrat text-xs font-bold text-[#2E2E2E]">
                            {item.label}
                          </p>
                          <p className="font-montserrat text-[10px] text-[#A6A6A6] mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery check */}
                  <DeliveryChecker productId={productId} />

                  {/* Warranty */}
                  {warranty && (
                    <div className="panel flex items-start gap-3">
                      <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-green"
                      />
                      <div>
                        <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
                          Warranty Included
                        </p>
                        <p className="mt-0.5 font-montserrat text-xs text-[#787878]">
                          {warranty.period ||
                            warranty.duration ||
                            warranty.type ||
                            "Warranty available"}
                          {warranty.coverage && ` · ${warranty.coverage}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailRows.length > 0 && (
                    <div className="border-t border-[#e7dfd1] pt-4">
                      <details open className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between font-montserrat text-base font-bold text-[#2E2E2E]">
                          Details
                          <span className="text-xl leading-none group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <div className="mt-3 grid gap-2">
                          {detailRows.slice(0, 8).map(([key, value]) => (
                            <div
                              key={key}
                              className="grid grid-cols-1 gap-1 font-montserrat text-[12px] sm:grid-cols-[118px_1fr] sm:gap-3"
                            >
                              <dt className="font-semibold capitalize text-[#2E2E2E]">
                                {key}
                              </dt>
                              <dd className="text-[#787878]">
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : String(value)}
                              </dd>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Info tabs below ── */}
              <div className="mt-10 grid gap-6">
                {product.description && (
                  <div className="panel">
                    <h2 className="mb-3 font-montserrat text-[18px] font-bold text-[#2E2E2E]">
                      Description
                    </h2>
                    <p className="font-montserrat text-sm leading-7 text-[#787878] whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {Object.keys(attributes).length > 0 && (
                  <div className="panel">
                    <h2 className="mb-4 font-montserrat text-[18px] font-bold text-[#2E2E2E]">
                      Specifications
                    </h2>
                    <div className="grid grid-cols-1 gap-y-0 sm:grid-cols-2">
                      {Object.entries(attributes).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex gap-4 border-b border-[#e7dfd1] py-2.5 last:border-0"
                        >
                          <dt className="w-36 shrink-0 font-montserrat text-xs font-semibold uppercase tracking-wide text-[#A6A6A6]">
                            {key}
                          </dt>
                          <dd className="font-montserrat text-sm text-[#2E2E2E]">
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.seller && (
                  <div className="panel">
                    <h2 className="mb-3 font-montserrat text-[18px] font-bold text-[#2E2E2E]">
                      Sold By
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5ECDD] font-montserrat font-bold text-[#A26D27]">
                        {(product.seller.name || "S")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
                          {product.seller.name ||
                            product.seller.storeName ||
                            "Seller"}
                        </p>
                        {product.seller.rating && (
                          <StarRating rating={product.seller.rating} />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Related products ── */}
              {relatedProducts.length > 0 && (
                <section className="mt-12">
                  <div className="section-head mb-6">
                    <h2 className="font-montserrat text-[22px] font-bold text-[#2E2E2E]">
                      You May Also Like
                    </h2>
                    <Link
                      to="/products"
                      className="font-montserrat text-sm font-medium text-[#CE9F2D] hover:text-[#a76616] transition"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {relatedProducts.map((p) => (
                      <ProductCard
                        key={getProductId(p)}
                        product={p}
                        onAddToCart={addToCart}
                        onWishlist={toggleWishlist}
                        isWishlisted={isWishlisted(p)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </ApiState>
      </div>
    </>
  );
}
