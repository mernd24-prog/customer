import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import QuantitySelector from "../../components/cart/QuantitySelector";
import { IoIosSearch } from "react-icons/io";
import {
  Heart,
  RefreshCw,
  Share2,
  ShieldCheck,
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
  getProductId,
  getImageFallbackSrc,
  getProductImage,
  getProductTitle,
  getProductPrice,
  getProductMrp,
  getVariantPrice,
  getImageUrlFromValue,
  firstMoneyValue,
  buildCartItem,
} from "../../utils/ecommerce";
import { formatPageTitle } from "../../lib/utils";
import ProductReviewsSection from "../../components/ecommerce/ProductReviewsSection";
import CUSTOMER_ROUTES from "../../constants/routes";
import StarRating from "./components/starRating";
import ShareProductPopover from "./components/socialMediaShare";
import ProductPriceBlock from "./components/oldAndNewPrice";
import ProductStockStatus from "./components/stockStatus";

const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";

const isImageSource = (src) => {
  if (!src || typeof src !== "string") return false;
  const value = src.trim();
  if (!value || value.startsWith("#")) return false;

  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:") ||
    /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(value)
  );
};

const firstImageSource = (...values) =>
  values.map(getImageUrlFromValue).find(isImageSource) || "";

const getColorSwatchImage = ({
  option,
  value,
  matchingVariant,
  product,
  index,
}) =>
  firstImageSource(
    option?.images?.[value],
    option?.imageUrls?.[value],
    option?.valueImages?.[value],
    option?.valueImageUrls?.[value],
    option?.valueCodes?.[value],
    matchingVariant?.images,
    matchingVariant?.imageUrl,
    matchingVariant?.image,
    matchingVariant?.thumbnail,
    product?.images?.[index],
  );

function IconActionButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center bg-[#F5F8FB] rounded-full border border-blue/60    hover:scale-110  sm:h-12 sm:w-12 ${className}`}
      title={title}
    >
      {children}
    </button>
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
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseLeave = () => {
    setZoomPos({ x: 50, y: 50 });

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
      className={`flex min-w-0 flex-col gap-4  overflow-hidden ${isModal ? "h-full w-full" : "h-auto w-full xl:h-[560px] 2xl:h-[620px]"
        }`}
    >
      <div className="flex min-w-0 flex-col gap-6 overflow-hidden xl:h-full xl:flex-row">
        <div className="order-2 h-[90px]   w-full shrink-0 overflow-hidden xl:order-1 xl:h-full xl:w-[85px]">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={20}
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
                className="!h-[90px] !w-[90px] xl:!h-[90px]  xl:!w-[85px]"
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
                  className={`h-full w-full overflow-hidden rounded-[15px]  border   transition-colors duration-200 ${activeIndex === i
                      ? "border-gold shadow-sm bg-gradient-to-t from-[#1B1D60]/65 to-transparent"
                      : "border-border"
                    }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full p-2  w-full object-contain"
                    onError={(event) =>
                      applyImageFallback(event, fallbackLabel, "product")
                    }
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div
          className={`relative order-1 min-w-0  overflow-hidden border border-gold rounded-[20px]  bg-transparent xl:order-2 ${isModal ? "h-full" : "aspect-auto lg:h-[500px] xl:h-full w-full"
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
            className="h-full w-full bg-transparent"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i} className="!h-full bg-transparent">
                <div
                  className={`relative   h-full w-full overflow-hidden bg-transparent ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleImageClick}
                >
                  <img
                    src={img}
                    alt=""
                    draggable={false}
                    className={`h-full w-full select-none  object-contain transition-transform duration-300 ease-out ${isZoomed
                        ? isModal
                          ? "scale-[2.0]"
                          : "scale-[1.9]"
                        : "scale-95"
                      }`}
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      willChange: "transform",
                    }}
                    onError={(event) =>
                      applyImageFallback(event, fallbackLabel, "product")
                    }
                  />
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
    <div className="relative w-full  min-w-0 overflow-hidden">
      <ProductGallery images={images} fallbackLabel={fallbackLabel} />

      <div className="absolute right-3  top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
        <IconActionButton
          title="Zoom image"
          onClick={() => {
            if (onModalOpen) onModalOpen();
            setIsModalOpen(true);
          }}
          className="hidden text-ink md:flex"
        >
          <ZoomIn size={18} />
        </IconActionButton>

        <IconActionButton
          title="Add to Wishlist"
          onClick={onWishlist}
          className={isWishlisted ? "text-red-500" : "text-ink"}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </IconActionButton>

        <div ref={shareRef} className="relative">
          <IconActionButton
            title="Share Product"
            onClick={onShareToggle}
            className="text-navy"
          >
            <Share2 size={18} />
          </IconActionButton>

          {shareOpen && <ShareProductPopover productTitle={productTitle} />}
        </div>
      </div>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-4 animate-fadeIn sm:p-6">
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

            <div className="flex h-[90vh]  w-full max-w-[1200px] items-center justify-center bg-white">
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

function DeliveryChecker({ productId, shipping = {} }) {
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

  const sellerDelivery = result?.deliveryChargeBreakup?.sellers?.[0] || {};
  const eta =
    sellerDelivery.estimatedDeliveryDays ||
    result?.estimatedDeliveryDays ||
    null;
  const etaText = eta
    ? [eta.minDays, eta.maxDays]
      .filter((v) => v !== null && v !== undefined)
      .join("–")
    : "";
  const deliveryCharge = Number(
    result?.sellerDeliveryChargeAmount ?? sellerDelivery.chargeAmount ?? 0,
  );
  const resultCodAvailable = result?.codAvailable;

  // Static info from product.shipping (shown before pincode check)
  const staticIsFree = Boolean(shipping.freeShipping);
  const staticCharge = Number(
    shipping.shippingCharge ?? shipping.additionalCost ?? 0,
  );
  const staticEtaMin = shipping.estimatedDaysMin ?? shipping.processingDays;
  const staticEtaMax = shipping.estimatedDaysMax ?? shipping.processingDays;
  const productCodDisabled = shipping.codAvailable === false;

  return (
    <div className="space-y-3">
      {/* Pincode check label */}
      <div className="flex max-w-[360px] flex-wrap items-center gap-2">
        <span className="text-base lg:text-[20px] font-semibold text-ink">
          Check Delivery
        </span>

        {!result && (
          <>
            {staticIsFree ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Truck size={11} /> Free Shipping
              </span>
            ) : staticCharge > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-cream px-2.5 py-1 text-[11px] font-medium text-muted">
                <Truck size={11} />
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(staticCharge)}{" "}
                Delivery
              </span>
            ) : null}
            {(staticEtaMin || staticEtaMax) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-cream px-2.5 py-1 text-[11px] font-medium text-muted">
                Ships in{" "}
                {[staticEtaMin, staticEtaMax].filter(Boolean).join("–")} days
              </span>
            )}
            {productCodDisabled && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                COD not available
              </span>
            )}
          </>
        )}
      </div>

      <form
        onSubmit={check}
        className="flex h-[50px] w-full max-w-[360px] overflow-hidden rounded-full border border-[#1B1D604D]"
      >
        <input
          type="text"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit pincode"
          className="flex-1 min-w-0 bg-transparent border border-none focus:outline-none px-8 text-sm text-[#4E4E4E] "
        />
        <button
          type="submit"
          disabled={loading}
          className="flex w-14 shrink-0 items-center justify-center bg-navy text-white disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <IoIosSearch className="text-xl" />
          )}
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="space-y-1.5">
          {result.serviceable ? (
            <p className="text-sm font-medium text-emerald-700">
              ✓ Deliverable to {pincode}
              {etaText ? ` · Ships in ${etaText} days` : ""}
              {deliveryCharge > 0
                ? ` · ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(deliveryCharge)} delivery`
                : " · Free delivery"}
            </p>
          ) : (
            <p className="text-sm font-medium text-red-600">
              ✗ Delivery not available to {pincode}.
            </p>
          )}
          {result.serviceable && resultCodAvailable !== undefined && (
            <p
              className={`text-xs font-medium ${resultCodAvailable ? "text-emerald-600" : "text-red-500"}`}
            >
              {resultCodAvailable
                ? "✓ Cash on Delivery available"
                : "✗ COD not available for this pincode"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function VariantSelector({
  variantOptions,
  selectedAttributes,
  findVariantForSelection,
  setSelectedVariant,
  product,
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {variantOptions.map((option) => (
        <div
          key={option.slug}
          className={
            option.displayType === "color_swatch"
              ? "order-2 w-full"
              : "order-1 flex-none"
          }
        >
          <p
            className={`mb-3 font-semibold capitalize text-ink ${option.displayType === "color_swatch" ? "text-xl" : "text-[20px]"
              }`}
          >
            {option.displayType === "color_swatch" ? "Colour" : option.name}:
          </p>

          <div className="flex  w-fit flex-wrap gap-4">
            {option.values.map((value, valueIndex) => {
              const isSelected =
                String(selectedAttributes[option.slug]) === String(value);

              const matchingVariant = findVariantForSelection(
                option.slug,
                value,
              );

              const disabled = !matchingVariant;

              const swatchImage =
                option.displayType === "color_swatch"
                  ? getColorSwatchImage({
                    option,
                    value,
                    matchingVariant,
                    product,
                    index: valueIndex,
                  })
                  : "";

              if (option.displayType === "color_swatch") {
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      matchingVariant && setSelectedVariant(matchingVariant)
                    }
                    className={`h-[80px]  w-[80px] overflow-hidden rounded-xl border bg-white transition-all duration-300 ease-in-out  sm:h-[95px] sm:w-[95px] ${isSelected
                        ? "border border-gold bg-gradient-to-t from-[#1B1D60]/65 to-transparent"
                        : "border border-gold/20 "
                      }`}
                    title={value}
                  >
                    <img
                      src={swatchImage}
                      alt={`${value} colour`}
                      className="h-full w-full object-contain p-3"
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
                    matchingVariant && setSelectedVariant(matchingVariant)
                  }
                  className={`min-h-10  min-w-12 rounded-[8px]  px-3 py-1 text-xs font-bold transition-all duration-300  ease-in-out disabled:cursor-not-allowed disabled:opacity-40  ${isSelected
                      ? "border border-gold bg-gradient-to-t from-[#1B1D60]/25 to-transparent"
                      : "border border-gold/20 "
                    }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductActionButtons({
  inStock,
  product,
  selectedVariant,
  quantity,
  addToCart,
  navigate,
}) {
  return (
    <div className="mt-2  grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        disabled={!inStock}
        onClick={() => {
          addToCart({ ...product, selectedVariant }, quantity);
        }}
        className="py-3 w-full rounded-[10px] bg-gold text-base font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
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
        className="py-3 w-full rounded-[10px] border border-navy text-base font-semibold text-navy transition-all duration-300 ease-in-out hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy It Now
      </button>
    </div>
  );
}

function ProductFeatureGrid() {
  const features = [
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
  ];

  return (
    <div className="mt-8 lg:mt-16 grid grid-cols-1 gap-4  lg:gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((item) => (
        <div
          key={item.label}
          className="flex py-2  lg:py-5  flex-col items-center justify-center gap-2 rounded-xl border border-[#E7D9B8] bg-[#FFFDF8]  text-center"
        >
          <span className="flex w-10 h-10 md:h-16  md:w-16 items-center justify-center my-2 rounded-full border border-[#E7D9B8] bg-[#FFF8E8]">
            {item.icon}
          </span>

          <p className="text-base  md:text-2xl font-bold text-navy">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function InfoTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex overflow-x-auto border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`min-w-max px-5  lg:py-4 py-2 text-base lg:text-[24px] font-medium ${activeTab === tab.key
              ? "border-b-2 border-navy font-semibold bg-gradient-to-t from-[#1B1D6033] to-transparent text-navy"
              : "text-[#2E2E2E]"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function InfoCard({ title, children, roundedClass = "rounded-[8px]" }) {
  return (
    <div
      className={`mt-5 overflow-hidden ${roundedClass} border border-[#E7D9B8] bg-white`}
    >
      <div className="bg-[#CE9F2D33] px-4 py-6">
        <h2 className="text-sm md:text-xl font-bold text-[#2E2E2E]">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function DetailRows({
  rows,
  children,
  rowClassName = "grid grid-cols-1 gap-1 px-4 py-3 d text-sm md:text-lg sm:grid-cols-[220px_minmax(0,1fr)]",
  labelClassName = "font-medium text-ink",
  valueClassName = "text-left font-bold text-navy md:text-right",
}) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([key, value]) => (
        <div key={key} className={rowClassName}>
          <dt className={labelClassName}>{formatPageTitle(key)}</dt>
          <dd className={valueClassName}>
            {Array.isArray(value) ? value.join(", ") : String(value)}
          </dd>
        </div>
      ))}

      {children}
    </dl>
  );
}

function ProductInfoSection({
  infoTabs,
  activeInfoTab,
  setActiveInfoTab,
  detailRows,
  warranty,
  product,
  attributes,
}) {
  return (
    <div className="relative  z-10  mt-8 lg:mt-24 bg-white">
      <InfoTabs
        tabs={infoTabs}
        activeTab={activeInfoTab}
        onChange={setActiveInfoTab}
      />

      {activeInfoTab === "details" && detailRows.length > 0 && (
        <InfoCard title="Product Details" roundedClass="rounded-xl">
          <DetailRows
            rows={detailRows
              .slice(0, 8)
              .map(([key, value]) => [formatPageTitle(key), value])}
            rowClassName="grid grid-cols-1 gap-1 px-4 py-4 text-[16px] sm:grid-cols-[220px_minmax(0,1fr)]"
            labelClassName="font-medium text-[#2E2E2E]"
            valueClassName="text-left font-bold text-navy sm:text-right"
          >
            {warranty && (
              <div className="grid grid-cols-1 gap-1 px-4 py-3  text-[16px] sm:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-medium text-ink">
                  {" "}
                  {formatPageTitle("warranty")}
                </dt>
                <dd className="text-left font-bold text-[#1B1D60] sm:text-right">
                  {formatPageTitle(
                    warranty.period ||
                    warranty.duration ||
                    warranty.type ||
                    "Warranty available"
                  )}
                  {warranty.coverage && ` · ${formatPageTitle(warranty.coverage)}`}
                </dd>
              </div>
            )}
          </DetailRows>
        </InfoCard>
      )}

      {activeInfoTab === "description" && (
        <InfoCard title="Description">
          <p className="px-4 py-4 text-sm lg:text-lg  text-black/90 whitespace-pre-line">
            {formatPageTitle(product.description) || "No description available."}
          </p>
        </InfoCard>
      )}

      {activeInfoTab === "specification" && (
        <InfoCard title="Specification">
          <dl className="divide-y divide-border">
            {Object.entries(attributes).length > 0 ? (
              Object.entries(attributes).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-1  gap-1 px-4 py-3 text-sm md:text-lg sm:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <dt className="font-medium text-ink">
                    {" "}
                    {formatPageTitle(key)}
                  </dt>
                  <dd className="text-left font-bold text-navy md:text-right">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </dd>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm lg:text-lg  text-black/90 whitespace-pre-line">
                No specifications available.
              </div>
            )}
          </dl>
        </InfoCard>
      )}

      {activeInfoTab === "seller" && (
        <InfoCard title="Seller Info">
          {product.seller ? (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft font-bold text-gold-dark">
                {(product.seller.name || "S")[0].toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">
                  {product.seller.name || product.seller.storeName || "Seller"}
                </p>

                {product.seller.rating && (
                  <StarRating rating={product.seller.rating} />
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 text-sm lg:text-lg   text-black/90 whitespace-pre-line">
              Seller information is not available.
            </div>
          )}
        </InfoCard>
      )}
    </div>
  );
}

function ProductRecommendationSection({
  title,
  linkText,
  products,
  addToCart,
  toggleWishlist,
  isWishlisted,
  className = "mt-12 ",
}) {
  if (!products.length) return null;

  return (
    <section className={`relative z-10 ${className} bg-white`}>
      <div className="section-head mb-6">
        <h2 className="text-base lg:text-[28px] font-bold text-[#3E4093]">
          {title}
        </h2>

        <Link
          to="/products"
          className="text-sm font-medium text-gold hover:text-gold-dark transition-all duration-300 ease-in-out"
        >
          {linkText}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
        {products.slice(0, 4).map((p) => (
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

  const sideEffectsRanFor = useRef(null);
  const dynamicPriceRequestKey = useRef(null);

  useEffect(() => {
    dispatch(fetchProductById({ productId }));
    sideEffectsRanFor.current = null;
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product) return;

    if (sideEffectsRanFor.current === productId) return;
    sideEffectsRanFor.current = productId;

    addRecentlyViewed(product);

    dispatch(fetchProductWarranty({ productId })).catch(() => { });
    dispatch(fetchRelatedProducts({ productId })).catch(() => { });
    dispatch(fetchCrossSellProducts({ productId })).catch(() => { });
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => { });

    dispatch(
      trackAnalyticsEvent({
        eventName: "product_view",
        metadata: { productId },
      }),
    ).catch(() => { });

    dispatch(
      trackRecommendationInteraction({
        productId,
        interactionType: "viewed",
      }),
    ).catch(() => { });
  }, [dispatch, product, productId]);

  useEffect(() => {
    if (!loadedProductId || String(loadedProductId) !== String(productId)) {
      return;
    }

    const requestKey = `${productId}:${quantity}`;

    if (dynamicPriceRequestKey.current === requestKey) return;

    dynamicPriceRequestKey.current = requestKey;

    dispatch(fetchDynamicPrice({ productId, quantity })).catch(() => { });
  }, [dispatch, loadedProductId, productId, quantity]);

  const selectedVariantKey = selectedVariant?._id || selectedVariant?.sku || "";

  useEffect(() => {
    if (!loadedProductId || String(loadedProductId) !== String(productId)) {
      return;
    }

    const requestKey = `${productId}:${selectedVariantKey}:${quantity}`;

    if (dynamicPriceRequestKey.current === requestKey) return;

    dynamicPriceRequestKey.current = requestKey;

    dispatch(
      fetchDynamicPrice({
        productId,
        variantId: selectedVariant?._id,
        sku: selectedVariant?.sku,
        quantity,
      }),
    ).catch(() => { });
  }, [
    dispatch,
    loadedProductId,
    productId,
    quantity,
    selectedVariant?._id,
    selectedVariant?.sku,
  ]);

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
    const nextSelection = {
      ...selectedAttributes,
      [axis]: value,
    };

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
    selectedVariantPrice,
    safeDynamicPrice,
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
        <nav className=" flex  mt-8 lg:mt-12 flex-wrap items-center gap-1 text-sm lg:text-lg text-[#2E2E2E]">
          <Link
            to="/"
            className="hover:text-ink font-medium text-[#2E2E2E] transition-all duration-300 ease-in-out"
          >
            Home
          </Link>

          <span>{">"}</span>

          {product?.parentCategory && (
            <>
              <Link
                to={CUSTOMER_ROUTES.category(product.parentCategory)}
                className="capitalize hover:text-ink transition-all duration-300 ease-in-out"
              >
                {(product.parentCategory || "").replace(/-/g, " ")}
              </Link>
              <span>{">"}</span>
            </>
          )}

          {product?.category && product.category !== product.parentCategory && (
            <>
              <Link
                to={CUSTOMER_ROUTES.category(product.category)}
                className="capitalize font-medium text-[#2E2E2E] hover:text-ink transition-all duration-300 ease-in-out"
              >
                {(product.category || "").replace(/-/g, " ")}
              </Link>
              <span>{">"}</span>
            </>
          )}

          <span className="line-clamp-1 font-medium text-gold">
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
              <div className="grid min-w-0 mt-8 lg:mt-14 items-start gap-2 xl:grid-cols-[minmax(0,0.94fr)_minmax(40px,1.16fr)] md:gap-10">
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
                      <h1 className="break-words text-[15px] font-semibold  text-ink sm:text-[17px] lg:text-[26px]">
                        {getProductTitle(product)}
                      </h1>
                    </div>
                  </div>

                  {(product.rating != null || product.reviewCount != null) && (
                    <StarRating
                      rating={product.rating}
                      count={product.reviewCount || product.ratingCount}
                    />
                  )}

                  <ProductStockStatus
                    inStock={inStock}
                    selectedVariant={selectedVariant}
                    product={product}
                  />

                  <ProductPriceBlock
                    price={price}
                    mrp={mrp}
                    currency={currency}
                    discount={discount}
                    safeDynamicPrice={safeDynamicPrice}
                    dynamicState={dynamicState}
                  />

                  <div className="flex my-4  flex-col md:flex-row gap-6  ">
                    <div className="w-full  md:w-fit">
                      <QuantitySelector
                        quantity={quantity}
                        onIncrease={() => setQuantity((q) => q + 1)}
                        onDecrease={() =>
                          setQuantity((q) => Math.max(1, q - 1))
                        }
                      />
                    </div>

                    <DeliveryChecker
                      productId={productId}
                      shipping={product?.shipping || {}}
                    />
                  </div>

                  {variants.length > 0 && variantOptions.length > 0 && (
                    <VariantSelector
                      variantOptions={variantOptions}
                      selectedAttributes={selectedAttributes}
                      findVariantForSelection={findVariantForSelection}
                      setSelectedVariant={setSelectedVariant}
                      product={product}
                    />
                  )}

                  <ProductActionButtons
                    inStock={inStock}
                    product={product}
                    selectedVariant={selectedVariant}
                    quantity={quantity}
                    addToCart={addToCart}
                    navigate={navigate}
                  />
                </div>
              </div>

              <ProductFeatureGrid />

              <ProductInfoSection
                infoTabs={infoTabs}
                activeInfoTab={activeInfoTab}
                setActiveInfoTab={setActiveInfoTab}
                detailRows={detailRows}
                warranty={warranty}
                product={product}
                attributes={attributes}
              />

              <div className="my-4 ">
                <ProductReviewsSection
                  productId={productId}
                  product={product}
                />
              </div>

              <ProductRecommendationSection
                title="You May Also Like"
                linkText="View all →"
                products={relatedProducts}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
                className="mt-12"
              />

              <ProductRecommendationSection
                title="Complete the Look"
                linkText="Explore more →"
                products={crossSellProducts}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
                className="mt-10"
              />
            </>
          )}
        </ApiState>
      </div>
    </>
  );
}
