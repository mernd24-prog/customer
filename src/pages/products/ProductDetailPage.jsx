import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import QuantitySelector from "../../components/cart/QuantitySelector";
import { IoIosSearch } from "react-icons/io";
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
  Heart,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  ZoomIn,
  X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/zoom";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { ProductCard } from "../../components/ecommerce";
import { fetchProductById } from "../../features/product/productSlice";
import { fetchProductWarranty } from "../../features/warranty/warrantySlice";
import { checkServiceability } from "../../features/delivery/deliverySlice";
import { fetchDynamicPrice } from "../../features/dynamicPricing/dynamicPricingSlice";
import {
  fetchTrendingProducts,
  trackRecommendationInteraction,
} from "../../features/recommendation/recommendationSlice";
import {
  fetchRelatedProducts,
  fetchCrossSellProducts,
} from "../../features/product/relatedProductsSlice";
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
  getProductPrice,
  getProductMrp,
  getVariantPrice,
  firstMoneyValue,
  buildCartItem,
} from "../../utils/ecommerce";

import ProductReviewsSection from "../../components/ecommerce/ProductReviewsSection";
import CUSTOMER_ROUTES from "../../constants/routes";

const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";

function StarRating({ rating, count }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center  gap-2 my-2">
      <div className="flex items-center gap-1 ">
        {rating != null && (
          <span className=" text-lg  font-medium text-ink">
            {Number(rating).toFixed(1)}
          </span>
        )}
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={15}
            className={
              i < stars
                ? "fill-[#F58220] text-[#F58220]"
                : "fill-border text-border"
            }
          />
        ))}
      </div>

      {count != null && (
        <span className=" text-lg  font-medium text-[#2E2E2E]">
          ({count.toLocaleString()} reviews)
        </span>
      )}
    </div>
  );
}

function ProductGallery({
  images,
  isModal = false,
  fallbackLabel = "Product",
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLarge, setIsLarge] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      const nextIsLarge = window.innerWidth >= 1280;
      setIsLarge(nextIsLarge);

      if (!nextIsLarge) {
        setIsZoomed(false);
      }
    };

    handleResize();
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
  };

  const handleMouseLeave = () => {
    if (!isModal) {
      setIsZoomed(false);
    }
  };

  const handleImageClick = (e) => {
    if (!isLarge && !isModal) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });

    setIsZoomed((prev) => !prev);
  };

  return (
    <div
      className={`flex min-w-0 flex-col gap-4 overflow-hidden ${
        isModal ? "h-full w-full" : "h-auto w-full   xl:h-[400px]"
      }`}
    >
      <div className="flex h-full min-w-0 flex-col gap-4 overflow-hidden xl:flex-row">
        {/* Thumbnail */}
        <div className="order-2 h-[90px]  w-full shrink-0 overflow-hidden xl:order-1 xl:h-full xl:w-[70px]">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode
            watchSlidesProgress
            direction={isLarge ? "vertical" : "horizontal"}
            modules={[FreeMode, Thumbs]}
            className="h-full w-full"
          >
            {images.map((img, i) => (
              <SwiperSlide
                key={i}
                className="!h-[64px] !w-[64px] xl:!h-[70px] xl:!w-full"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(i);
                    mainSwiper?.slideTo(i);
                  }}
                  onMouseEnter={() => {
                    if (!isLarge) return;
                    setActiveIndex(i);
                    mainSwiper?.slideTo(i);
                  }}
                  className={`h-full w-full overflow-hidden rounded-[8px] border bg-white transition-colors duration-200 ${
                    activeIndex === i
                      ? "border-gold shadow-sm"
                      : "border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) =>
                      applyImageFallback(event, fallbackLabel, "product")
                    }
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Main Image */}
        <div
          className={`relative order-1 min-w-0 flex-1 overflow-hidden rounded-[10px] border border-[#E7D9B8] bg-white xl:order-2 ${
            isModal
              ? "h-full"
              : " max-h-[340px] sm:max-h-[380px] md:max-h-[430px]  xl:h-full xl:max-h-none"
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
            className="h-full w-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div
                  className={`relative h-full w-full overflow-hidden ${
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
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
                          ? "scale-[2.2]"
                          : "scale-[2.6]"
                        : "scale-100"
                    }`}
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      willChange: "transform",
                    }}
                    onError={(event) =>
                      applyImageFallback(event, fallbackLabel, "product")
                    }
                  />

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
  productTitle,
  shareOpen,
  onShareToggle,
  onShareClose,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shareRef = useRef(null);

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

  useEffect(() => {
    if (!shareOpen) return undefined;

    const handlePointerDown = (event) => {
      if (shareRef.current?.contains(event.target)) return;
      onShareClose?.();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onShareClose, shareOpen]);

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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-110 hover:bg-white sm:h-10 sm:w-10"
          title="Zoom image"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={onWishlist}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-110 hover:bg-white sm:h-10 sm:w-10 ${isWishlisted ? "text-red-500" : "text-ink"}`}
          title="Add to Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <div ref={shareRef} className="relative">
          <button
            type="button"
            onClick={onShareToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-110 hover:bg-white sm:h-10 sm:w-10"
            title="Share Product"
          >
            <Share2 size={18} />
          </button>

          {shareOpen && (
            <div className="absolute right-0 top-12 z-50 w-[230px] max-w-[calc(100vw-24px)] rounded-[var(--customer-radius)] border border-border bg-white p-3 shadow-2xl sm:w-[260px] sm:p-4 md:w-[280px]">
              <div className="mb-3">
                <h3 className="text-[13px] font-bold text-ink sm:text-sm">
                  Share Product
                </h3>
                <p className="mt-1 text-[11px] text-muted sm:text-xs">
                  Share this product with friends
                </p>
              </div>

              <div className="grid grid-cols-3 place-items-center gap-2 sm:gap-3">
                <WhatsappShareButton
                  url={window.location.href}
                  title={productTitle}
                >
                  <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
                    <WhatsappIcon size={42} round />
                  </span>
                </WhatsappShareButton>

                <FacebookShareButton
                  url={window.location.href}
                  quote={productTitle}
                >
                  <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
                    <FacebookIcon size={42} round />
                  </span>
                </FacebookShareButton>

                <TwitterShareButton
                  url={window.location.href}
                  title={productTitle}
                >
                  <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
                    <TwitterIcon size={42} round />
                  </span>
                </TwitterShareButton>

                <TelegramShareButton
                  url={window.location.href}
                  title={productTitle}
                >
                  <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
                    <TelegramIcon size={42} round />
                  </span>
                </TelegramShareButton>

                <LinkedinShareButton
                  url={window.location.href}
                  title={productTitle}
                >
                  <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
                    <LinkedinIcon size={42} round />
                  </span>
                </LinkedinShareButton>

                <EmailShareButton
                  url={window.location.href}
                  subject={productTitle}
                  body={`Check this product:\n${window.location.href}`}
                >
                  <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
                    <EmailIcon size={42} round />
                  </span>
                </EmailShareButton>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }}
                className="mt-4 w-full rounded-full bg-gold px-3 py-2 text-[12px] font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark sm:px-4 sm:text-sm"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 p-4 animate-fadeIn sm:p-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                if (onModalClose) onModalClose();
              }}
              className="absolute top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300 ease-in-out"
            >
              <X size={28} />
            </button>

            <div className="flex h-[90vh] w-full max-w-[1200px] items-center justify-center">
              <ProductGallery
                images={images}
                isModal={true}
                fallbackLabel={fallbackLabel}
              />
            </div>
          </div>,
          document.body,
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
    <div>
      <div>
        <span className="text-lg font-semibold text-ink">Check Delivery</span>
      </div>
      <form onSubmit={check} className="flex h-10   w-full max-w-[280px] gap-0">
        <input
          type="text"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit pincode"
          className="focus:outline-none  rounded-l-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex w-12 items-center  justify-center rounded-r-full bg-navy text-xs font-semibold text-white"
        >
          <IoIosSearch className="text-xl" />
        </button>
      </form>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {result && (
        <p
          className={`mt-2  text-sm font-medium ${result.serviceable ? "success" : "text-red-600"}`}
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
  const loadedProductId = getProductId(product);

  const warrantyState = useSelector((s) => s.warranty);
  const dynamicState = useSelector((s) => s.dynamicPricing);
  const relatedState = useSelector((s) => s.relatedProducts);
  const crossSellState = useSelector((s) => s.relatedProducts);

  const warranty = warrantyState.current;
  const dynamicPrice =
    String(dynamicState.current?.productId || "") === String(productId || "")
      ? firstMoneyValue(dynamicState.current?.price)
      : undefined;
  const relatedProducts = relatedState.relatedByProduct[productId]?.items || [];
  const crossSellProducts =
    crossSellState.crossSellByProduct[productId]?.items || [];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const [shareOpen, setShareOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("details");
  // Track which productId has already had its one-shot side effects run
  const sideEffectsRanFor = useRef(null);
  const dynamicPriceRequestKey = useRef(null);

  useEffect(() => {
    dispatch(fetchProductById({ productId }));
    // Reset the guard so side effects re-run when navigating to a different product
    sideEffectsRanFor.current = null;
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product) return;
    // Guard: only run once per productId regardless of how many times product state changes
    if (sideEffectsRanFor.current === productId) return;
    sideEffectsRanFor.current = productId;

    addRecentlyViewed(product);
    dispatch(fetchProductWarranty({ productId })).catch(() => {});
    dispatch(fetchRelatedProducts({ productId })).catch(() => {});
    dispatch(fetchCrossSellProducts({ productId })).catch(() => {});
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
    if (!loadedProductId || String(loadedProductId) !== String(productId))
      return;
    const requestKey = `${productId}:${quantity}`;
    if (dynamicPriceRequestKey.current === requestKey) return;
    dynamicPriceRequestKey.current = requestKey;
    dispatch(fetchDynamicPrice({ productId, quantity })).catch(() => {});
  }, [dispatch, loadedProductId, productId, quantity]);

  const variants = useMemo(() => product?.variants || [], [product?.variants]);
  const variantOptions = useMemo(() => {
    const configuredOptions = Array.isArray(product?.options)
      ? product.options
      : [];
    if (configuredOptions.length) {
      return configuredOptions
        .map((option) => ({
          ...option,
          slug:
            option.slug ||
            String(option.name || "")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_+|_+$/g, ""),
          values: Array.from(new Set((option.values || []).filter(Boolean))),
        }))
        .filter((option) => option.slug && option.values.length);
    }

    const axisMap = new Map();
    variants.forEach((variant) => {
      Object.entries(variant.attributes || {}).forEach(([key, value]) => {
        if (!axisMap.has(key)) axisMap.set(key, new Set());
        axisMap.get(key).add(String(value));
      });
    });

    return Array.from(axisMap.entries()).map(([slug, values]) => ({
      name: slug.replace(/_/g, " "),
      slug,
      values: Array.from(values),
      displayType: slug.includes("color") ? "color_swatch" : "button",
      valueCodes: {},
    }));
  }, [product?.options, variants]);

  useEffect(() => {
    if (!variants.length) {
      setSelectedVariant(null);
      return;
    }
    const defaultVariant =
      variants.find((variant) => variant.isDefault) || variants[0];
    setSelectedVariant((current) =>
      current &&
      variants.some(
        (variant) =>
          (variant._id || variant.sku) === (current._id || current.sku),
      )
        ? current
        : defaultVariant,
    );
  }, [variants]);

  const selectedAttributes = selectedVariant?.attributes || {};
  const findVariantForSelection = (axis, value) => {
    const nextSelection = { ...selectedAttributes, [axis]: value };
    return (
      variants.find((variant) =>
        Object.entries(nextSelection).every(
          ([key, selectedValue]) =>
            String(variant.attributes?.[key]) === String(selectedValue),
        ),
      ) ||
      variants.find(
        (variant) => String(variant.attributes?.[axis]) === String(value),
      )
    );
  };

  const selectedVariantPrice = getVariantPrice(selectedVariant);
  const productPrice = getProductPrice(product);
  const baseDisplayPrice = firstMoneyValue(selectedVariantPrice, productPrice);
  const safeDynamicPrice =
    dynamicPrice &&
    baseDisplayPrice &&
    dynamicPrice >= baseDisplayPrice * 0.5 &&
    dynamicPrice <= baseDisplayPrice * 2
      ? dynamicPrice
      : undefined;
  const price = firstMoneyValue(
    safeDynamicPrice,
    selectedVariantPrice,
    productPrice,
  );
  const mrp = firstMoneyValue(
    getProductMrp(selectedVariant),
    getProductMrp(product),
  );
  const currency = selectedVariant?.currency || product?.currency || "INR";
  const discount =
    mrp && price && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const fallbackProductImage =
    getProductImage(product) ||
    getImageFallbackSrc(getProductTitle(product), product?.category);
  const variantImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : [];
  const images = variantImages.length
    ? variantImages
    : product?.images?.length
      ? product.images
      : product?.imageUrl
        ? [product.imageUrl]
        : fallbackProductImage
          ? [fallbackProductImage]
          : [];
  const attributes = product?.attributes || product?.specifications || {};
  const inStock =
    selectedVariant?.stock != null
      ? selectedVariant.stock > 0
      : typeof product?.inStock === "boolean"
        ? product.inStock
        : product?.stock != null
          ? product.stock > 0
          : true;
  const categoryLabel = product?.category
    ? (product.category || "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
  const detailRows = Object.entries({
    Brand: product?.brand,
    Category: categoryLabel,
    ...attributes,
  }).filter(([, value]) => value != null && value !== "");
  const infoTabs = [
    { key: "details", label: "Product Details" },
    { key: "description", label: "Description" },
    { key: "specification", label: "Specification" },
    { key: "seller", label: "Seller Info" },
  ];

  return (
    <>
      <Seo
        title={product?.title}
        metaDescription={product?.seo?.metaDescription}
        keywords={product?.seo?.keywords || []}
        image={product?.seo?.ogImage}
      />

      <div className=" ">
        <nav className=" flex  my-6 flex-wrap items-center gap-1 text-lg text-[#2E2E2E]">
          <Link
            to="/"
            className="hover:text-ink text-[#2E2E2E] transition-all duration-300 ease-in-out"
          >
            Home
          </Link>
          <span>/</span>
          {product?.parentCategory && (
            <>
              <Link
                to={CUSTOMER_ROUTES.category(product.parentCategory)}
                className="capitalize hover:text-ink transition-all duration-300 ease-in-out"
              >
                {(product.parentCategory || "").replace(/-/g, " ")}
              </Link>
              <span>/</span>
            </>
          )}
          {product?.category && product.category !== product.parentCategory && (
            <>
              <Link
                to={CUSTOMER_ROUTES.category(product.category)}
                className="capitalize text-[#2E2E2E] hover:text-ink transition-all duration-300 ease-in-out"
              >
                {(product.category || "").replace(/-/g, " ")}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="line-clamp-1  text-gold-dark">
            {getProductTitle(product) || "Product"}
          </span>
        </nav>

        <ApiState
          loading={productState.loading && !product}
          error={productState.error}
          empty={!product && !productState.loading}
          emptyTitle="Product coming soon"
          emptyText="This product page is being prepared or is temporarily unavailable."
        >
          {product && (
            <>
              <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(420px,1.16fr)] lg:gap-7">
                <div className="min-w-0">
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
                    productTitle={getProductTitle(product)}
                    shareOpen={!zoomOpen && shareOpen}
                    onShareToggle={() => setShareOpen((prev) => !prev)}
                    onShareClose={() => setShareOpen(false)}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex min-w-0 items-start justify-between gap-3 ">
                    <div className="min-w-0">
                      {/* {product.brand && (
                        <p className="text-[11px] d font-semibold uppercase tracking-normal text-gold-dark">
                          {product.brand}
                        </p>
	                      )} */}
                      <h1 className="break-words text-[15px] font-semibold  text-ink sm:text-[17px] lg:text-2xl">
                        {/* {getProductTitle(product)} */}
                        OnePlus 15 | 12GB+256GB | Infinite Black | India's First
                        Snapdragon® 8 Elite Gen 5 | 7300mAh Battery |
                        Personalised AI | Game-Changing 165Hz Display | Triple
                        50MP Camera with 4K 120fps Dolby Vision
                      </h1>
                    </div>
                  </div>

                  {(product.rating != null || product.reviewCount != null) && (
                    <StarRating
                      rating={product.rating}
                      count={product.reviewCount || product.ratingCount}
                    />
                  )}

                  <div className="flex flex-wrap my-2 items-center gap-3">
                    <span className="text-[28px] font-bold leading-none text-navy">
                      {formatMoney(price, currency)}
                    </span>
                    {mrp && mrp > price && (
                      <span className="text-[20px] font-semibold text-gray line-through">
                        {formatMoney(mrp, currency)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="rounded-full bg-[#FF3D31] px-3 py-1 text-[14px] font-bold uppercase text-white">
                        {discount}% Off
                      </span>
                    )}
                  </div>

                  {safeDynamicPrice && dynamicState.current?.loyalty && (
                    <p className="inline-block w-fit  rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-dark">
                      ✦ Loyalty price applied
                    </p>
                  )}

                  {inStock ? (
                    <div className="flex items-center gap-2">
                      <div className="relative z-0 w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                      <p className="text-[12px] font-bold text-success">
                        {selectedVariant?.stock ?? product?.stock ?? 52} in
                        stock
                      </p>
                    </div>
                  ) : (
                    <p className="text-[12px] font-semibold text-red-500">
                      Out of stock
                    </p>
                  )}

                  <div className="flex my-4 flex-row gap-4 items-center ">
                    <div>
                      <QuantitySelector
                        quantity={quantity}
                        onIncrease={() => setQuantity((q) => q + 1)}
                        onDecrease={() =>
                          setQuantity((q) => Math.max(1, q - 1))
                        }
                      />
                    </div>

                    <DeliveryChecker productId={productId} />
                  </div>

                  {variants.length > 0 && variantOptions.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {variantOptions.map((option) => (
                        <div key={option.slug}>
                          <p className="mb-2 text-[11px] font-semibold capitalize text-ink">
                            {option.name}:
                          </p>
                          <div className="flex  flex-wrap gap-2">
                            {option.values.map((value) => {
                              const isSelected =
                                String(selectedAttributes[option.slug]) ===
                                String(value);
                              const matchingVariant = findVariantForSelection(
                                option.slug,
                                value,
                              );
                              const disabled = !matchingVariant;
                              const swatchValue = option.valueCodes?.[value];

                              if (option.displayType === "color_swatch") {
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                      matchingVariant &&
                                      setSelectedVariant(matchingVariant)
                                    }
                                    className={`h-12  w-12 rounded-[8px] border p-1 transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? "border-gold bg-[#EEE7FF] shadow-sm" : "border-[#E7D9B8] bg-white hover:border-gold"}`}
                                    title={value}
                                  >
                                    <span
                                      className="block h-full w-full rounded-[6px] border border-gray-200"
                                      style={{
                                        backgroundColor:
                                          swatchValue?.startsWith("#")
                                            ? swatchValue
                                            : value,
                                      }}
                                    />
                                  </button>
                                );
                              }

                              return (
                                <button
                                  key={value}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() =>
                                    matchingVariant &&
                                    setSelectedVariant(matchingVariant)
                                  }
                                  className={`min-h-10 min-w-12 rounded-[8px] border px-3 py-1 text-xs font-bold transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? "border-gold  bg-[#EEE7FF] text-navy shadow-sm" : "border-[#E7D9B8] bg-white text-ink hover:border-gold"}`}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-1  grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => {
                        addToCart({ ...product, selectedVariant }, quantity);
                      }}
                      className="py-3 w-full rounded-xl bg-gold text-base font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add To Cart
                    </button>
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => {
                        const buyNowItem = buildCartItem(
                          { ...product, selectedVariant },
                          quantity,
                        );
                        window.sessionStorage.setItem(
                          BUY_NOW_STORAGE_KEY,
                          JSON.stringify([buyNowItem]),
                        );
                        navigate("/checkout");
                      }}
                      className="py-3 w-full rounded-xl border border-navy text-base font-semibold text-navy transition-all duration-300 ease-in-out hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Buy It Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: <ShieldCheck size={20} className="text-gold" />,
                    label: "100% Secure Payments",
                  },
                  {
                    icon: <Truck size={20} className="text-gold font-medium" />,
                    label: "Free Shipping",
                  },
                  {
                    icon: <RefreshCw size={20} className="text-gold" />,
                    label: "Easy Returns",
                  },
                  {
                    icon: <ShieldCheck size={20} className="text-gold" />,
                    label: "24/7 Support",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex  py-5  flex-col items-center justify-center gap-2 rounded-[10px] border border-[#E7D9B8] bg-[#FFFDF8] text-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7D9B8] bg-[#FFF8E8]">
                      {item.icon}
                    </span>
                    <p className="text-[18px] font-bold text-navy">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative  z-10 mt-9 bg-white">
                <div className="flex overflow-x-auto border-b border-border">
                  {infoTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveInfoTab(tab.key)}
                      className={`min-w-max px-5 py-4 text-[18px] font-medium ${
                        activeInfoTab === tab.key
                          ? "border-b-2 border-navy bg-gradient-to-t from-[#1B1D6033] to-transparent text-navy"
                          : "text-[#2E2E2E]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeInfoTab === "details" && detailRows.length > 0 && (
                  <div className="mt-5  overflow-hidden rounded-[8px] border border-[#E7D9B8] bg-white">
                    <div className="bg-[#CE9F2D33] px-4 py-3">
                      <h2 className="text-xl font-bold text-[#2E2E2E]">
                        Product Details
                      </h2>
                    </div>
                    <dl className="divide-y divide-border">
                      {detailRows.slice(0, 8).map(([key, value]) => (
                        <div
                          key={key}
                          className="grid grid-cols-1 gap-1 px-4 py-3 text-[16px] sm:grid-cols-[220px_minmax(0,1fr)]"
                        >
                          <dt className="font-medium text-ink">{key}</dt>
                          <dd className="text-left font-bold text-navy sm:text-right">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                          </dd>
                        </div>
                      ))}
                      {warranty && (
                        <div className="grid grid-cols-1 gap-1 px-4 py-3 text-[16px] sm:grid-cols-[220px_minmax(0,1fr)]">
                          <dt className="font-medium text-ink">Warranty</dt>
                          <dd className="text-left font-bold text-[#1B1D60] sm:text-right">
                            {warranty.period ||
                              warranty.duration ||
                              warranty.type ||
                              "Warranty available"}
                            {warranty.coverage && ` · ${warranty.coverage}`}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {activeInfoTab === "description" && (
                  <div className="mt-5 overflow-hidden rounded-[8px] border border-[#E7D9B8] bg-white">
                    <div className="bg-[var(--customer-cream)] px-4 py-3">
                      <h2 className="text-[15px] font-bold text-ink">
                        Description
                      </h2>
                    </div>
                    <p className="px-4 py-4 text-lg  text-black/90 whitespace-pre-line">
                      {product.description || "No description available."}
                    </p>
                  </div>
                )}

                {activeInfoTab === "specification" && (
                  <div className="mt-5 overflow-hidden rounded-[8px] border border-[#E7D9B8] bg-white">
                    <div className="bg-[var(--customer-cream)] px-4 py-3">
                      <h2 className="text-[15px] font-bold text-ink">
                        Specification
                      </h2>
                    </div>
                    <dl className="divide-y divide-border">
                      {Object.entries(attributes).length > 0 ? (
                        Object.entries(attributes).map(([key, value]) => (
                          <div
                            key={key}
                            className="grid grid-cols-1 gap-1 px-4 py-3 text-[12px] sm:grid-cols-[220px_minmax(0,1fr)]"
                          >
                            <dt className="font-medium text-ink">{key}</dt>
                            <dd className="text-left font-bold text-navy sm:text-right">
                              {Array.isArray(value)
                                ? value.join(", ")
                                : String(value)}
                            </dd>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-lg  text-black/90 whitespace-pre-line">
                          No specifications available.
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {activeInfoTab === "seller" && (
                  <div className="mt-5 overflow-hidden rounded-[8px] border border-[#E7D9B8] bg-white">
                    <div className="bg-[var(--customer-cream)] px-4 py-3">
                      <h2 className="text-[15px] font-bold text-ink">
                        Seller Info
                      </h2>
                    </div>
                    {product.seller ? (
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft font-bold text-gold-dark">
                          {(product.seller.name || "S")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {product.seller.name ||
                              product.seller.storeName ||
                              "Seller"}
                          </p>
                          {product.seller.rating && (
                            <StarRating rating={product.seller.rating} />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-lg  text-black/90 whitespace-pre-line">
                        Seller information is not available.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="my-4">
                <ProductReviewsSection
                  productId={productId}
                  product={product}
                />
              </div>

              {relatedProducts.length > 0 && (
                <section className="relative z-10 mt-12 bg-white">
                  <div className="section-head mb-6">
                    <h2 className="text-[28px] font-bold text-[#3E4093]">
                      You May Also Like
                    </h2>
                    <Link
                      to="/products"
                      className="text-sm font-medium text-gold hover:text-gold-dark transition-all duration-300 ease-in-out"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {relatedProducts.slice(0, 4).map((p) => (
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

              {crossSellProducts.length > 0 && (
                <section className="relative z-10 mt-10 bg-white">
                  <div className="section-head mb-6">
                    <h2 className="text-[28px] font-bold text-[#3E4093]">
                      Complete the Look
                    </h2>
                    <Link
                      to="/products"
                      className="text-sm font-medium text-gold hover:text-gold-dark transition-all duration-300 ease-in-out"
                    >
                      Explore more →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {crossSellProducts.slice(0, 4).map((p) => (
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
