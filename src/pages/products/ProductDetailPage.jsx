import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import QuantitySelector from "../../pages/cart/components/QuantitySelector";
import { IoIosSearch } from "react-icons/io";
import Rating from "../../components/ecommerce/Rating";
import { Banknote, Heart, Share2, Truck, ZoomIn, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode } from "swiper/modules";
import { Star } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/zoom";
import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import { fetchProductById } from "../../features/product/productSlice";
import { fetchProductWarranty } from "../../features/warranty/warrantySlice";
import { fetchDynamicPrice } from "../../features/dynamicPricing/dynamicPricingSlice";
import {
  fetchRecommendations,
  trackRecommendationInteraction,
} from "../../features/recommendation/recommendationSlice";
import {
  fetchRelatedProducts,
  fetchCrossSellProducts,
} from "../../features/product/relatedProductsSlice";
import { trackAnalyticsEvent } from "../../features/analytics/analyticsSlice";
import { useProductActions } from "../../hooks/useProductActions";
import {
  addRecentlyViewed,
  getRecentlyViewed,
} from "../../utils/recentlyViewed";
import { tokenStorage } from "../../api/tokenStorage";
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
  isProductCodAvailable,
  getAvailableStock,
} from "../../utils/ecommerce";
import { formatPageTitle } from "../../utils/common";
import ProductReviewsSection from "../../components/ecommerce/ProductReviewsSection";
import CUSTOMER_ROUTES from "../../constants/routes";
import {
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../constants";
import GuestOtpAuthModal from "../../components/ui/overlay/GuestOtpAuthModal";
import StarRating from "./components/starRating";
import ShareProductPopover from "./components/socialMediaShare";
import ProductPriceBlock from "./components/oldAndNewPrice";
import ProductStockStatus from "./components/stockStatus";
import SizeChartSidebar from "./components/SizeChartSidebar";
import ShowMoreText, { getShowMoreText } from "../../utils/showMore";
import { PRODUCT_DETAIL_SKELETON } from "../../components/ui/skeleton/layouts";

import ImageGallery from "./components/ImageGallery";
import DeliveryChecker from "./components/DeliveryChecker";
import VariantSelector from "./components/VariantSelector";
import ProductActionButtons from "./components/ProductActionButtons";
import ProductInfoSection from "./sections/ProductInfoSection";
import ProductRecommendationSection from "./sections/ProductRecommendationSection";
import {
  getActiveDealPrice,
  getActiveDealOriginalPrice,
} from "../../utils/pages/productUtils";
export default function ProductDetailPage() {
  const { productId: rawParamId } = useParams();
  const productId = rawParamId ? String(rawParamId).split(":")[0] : "";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const productState = useSelector((s) => s.product);
  const currentProduct = productState.current;
  const product =
    String(getProductId(currentProduct) || "") === String(productId || "")
      ? currentProduct
      : null;
  const loadedProductId = getProductId(product);

  const warrantyState = useSelector((s) => s.warranty);
  const dynamicState = useSelector((s) => s.dynamicPricing);
  const relatedState = useSelector((s) => s.relatedProducts);
  const crossSellState = useSelector((s) => s.relatedProducts);
  const recommendationState = useSelector((s) => s.recommendation);
  const user = useSelector((s) => s.auth.current);
  const userId = user?.id || user?._id || user?.userId || user?.email;
  const isLoggedIn = Boolean(
    userId && (tokenStorage.getAccessToken() || tokenStorage.getRefreshToken()),
  );

  const warranty = warrantyState.current;
  const recommendedProducts = (recommendationState?.list || []).filter(
    (p) => String(getProductId(p) || "") !== String(productId || ""),
  );

  const dynamicPrice =
    String(dynamicState.current?.productId || "") === String(productId || "")
      ? firstMoneyValue(dynamicState.current?.price)
      : undefined;

  //const allProducts = Array.isArray(productState.list) ? productState.list : [];

  const relatedProducts = relatedState.relatedByProduct[productId]?.items || [];

  const crossSellProducts =
    crossSellState.crossSellByProduct[productId]?.items || [];

  const [quantity, setQuantity] = useState(1);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const [shareOpen, setShareOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("details");
  const [recentlyViewedList, setRecentlyViewedList] = useState([]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [showGuestOtpModal, setShowGuestOtpModal] = useState(false);

  useEffect(() => {
    setActiveInfoTab(
      product?.commonImages?.length ? "common-images" : "details",
    );
  }, [product?._id, product?.id, product?.commonImages?.length]);

  const sideEffectsRanFor = useRef(null);
  const dynamicPriceRequestKey = useRef(null);

  useEffect(() => {
    dispatch(fetchProductById({ productId }));
    dispatch(fetchProductWarranty({ productId })).catch(() => {});
    dispatch(fetchRelatedProducts({ productId })).catch(() => {});
    dispatch(fetchCrossSellProducts({ productId })).catch(() => {});
    sideEffectsRanFor.current = null;
    setDeliveryResult(null);
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product) return;

    if (sideEffectsRanFor.current === productId) return;
    sideEffectsRanFor.current = productId;

    dispatch(
      fetchRecommendations({
        category: product.category,
        period: "week",
        limit: 8,
      }),
    ).catch(() => {});

    if (isLoggedIn) {
      dispatch(
        trackAnalyticsEvent({
          eventName: "product_view",
          metadata: { productId },
        }),
      ).catch(() => {});

      dispatch(
        trackRecommendationInteraction({
          productId,
          interactionType: "viewed",
        }),
      ).catch(() => {});
    }
  }, [dispatch, isLoggedIn, product, productId]);

  useEffect(() => {
    if (!isLoggedIn || !product) {
      setRecentlyViewedList([]);
      return;
    }

    addRecentlyViewed(product);
    setRecentlyViewedList(
      getRecentlyViewed().filter(
        (p) => String(getProductId(p)) !== String(productId),
      ),
    );
  }, [isLoggedIn, product, productId]);

  useEffect(() => {
    if (!loadedProductId || String(loadedProductId) !== String(productId)) {
      return;
    }

    const requestKey = `${productId}:${quantity}`;

    if (dynamicPriceRequestKey.current === requestKey) return;

    dynamicPriceRequestKey.current = requestKey;

    dispatch(fetchDynamicPrice({ productId, quantity })).catch(() => {});
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
    ).catch(() => {});
  }, [
    dispatch,
    loadedProductId,
    productId,
    quantity,
    selectedVariantKey,
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

    const pathVariantKey =
      rawParamId && rawParamId.includes(":") ? rawParamId.split(":")[1] : null;

    const paramVariantKey =
      searchParams.get("variant") ||
      searchParams.get("variantId") ||
      searchParams.get("sku") ||
      pathVariantKey;

    const storedVariantKey = productId
      ? window.sessionStorage.getItem(`selected_variant_${productId}`)
      : null;

    const targetKey = paramVariantKey || storedVariantKey;

    let targetVariant = null;
    if (targetKey) {
      targetVariant = variants.find(
        (v) =>
          String(v._id || "") === String(targetKey) ||
          String(v.id || "") === String(targetKey) ||
          String(v.sku || "") === String(targetKey) ||
          String(v.code || "") === String(targetKey),
      );
    }

    const defaultVariant =
      variants.find((variant) => variant.isDefault) || variants[0];

    setSelectedVariant((current) => {
      if (targetVariant) {
        return targetVariant;
      }
      if (
        current &&
        variants.some(
          (variant) =>
            (variant._id || variant.sku) === (current._id || current.sku),
        )
      ) {
        return current;
      }
      return defaultVariant;
    });
  }, [variants, searchParams, productId, rawParamId]);

  useEffect(() => {
    if (!selectedVariant || !productId) return;
    const variantKey =
      selectedVariant._id || selectedVariant.id || selectedVariant.sku;
    if (!variantKey) return;

    window.sessionStorage.setItem(`selected_variant_${productId}`, variantKey);

    const currentParam = searchParams.get("variant");
    if (currentParam !== String(variantKey)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("variant", variantKey);
          return next;
        },
        { replace: true },
      );
    }
  }, [selectedVariant, productId, searchParams, setSearchParams]);

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
  const activeDealPrice = getActiveDealPrice(product);
  const activeDealOriginalPrice = getActiveDealOriginalPrice(product);
  const activeDealBadge =
    product?.deal?.badge ||
    product?.metadata?.dealBadge ||
    (activeDealPrice ? "Deal" : "");

  const baseDisplayPrice = firstMoneyValue(
    activeDealPrice,
    selectedVariantPrice,
    productPrice,
  );

  const safeDynamicPrice =
    dynamicPrice &&
    baseDisplayPrice &&
    dynamicPrice >= baseDisplayPrice * 0.5 &&
    dynamicPrice <= baseDisplayPrice * 2
      ? dynamicPrice
      : undefined;

  const price = firstMoneyValue(
    activeDealPrice,
    activeDealPrice ? undefined : safeDynamicPrice,
    activeDealPrice ? undefined : selectedVariantPrice,
    productPrice,
  );

  const mrp = firstMoneyValue(
    activeDealPrice ? activeDealOriginalPrice : undefined,
    activeDealPrice ? undefined : getProductMrp(selectedVariant),
    getProductMrp(product),
  );

  const currency = selectedVariant?.currency || product?.currency || "INR";
  const shipping = product?.shipping || {};
  const shippingEtaMin = shipping.estimatedDaysMin ?? shipping.processingDays;
  const shippingEtaMax = shipping.estimatedDaysMax ?? shipping.processingDays;
  const shippingEtaText = [shippingEtaMin, shippingEtaMax]
    .filter((value) => value !== null && value !== undefined)
    .join("–");
  const staticIsFree = Boolean(shipping.freeShipping);
  const staticCharge = Number(
    shipping.shippingCharge ?? shipping.additionalCost ?? 0,
  );
  const productCodAvailable = isProductCodAvailable(product);
  const productCodDisabled =
    !productCodAvailable &&
    (shipping.codAvailable === false ||
      product?.metadata?.codAvailable === false ||
      product?.codAvailable === false);

  const discount =
    mrp && price && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const fallbackProductImage =
    getProductImage(product) ||
    getImageFallbackSrc(getProductTitle(product), product?.category);

  const variantImages = Array.isArray(selectedVariant?.images)
    ? selectedVariant.images
    : [];
  const commonImages = Array.isArray(product?.commonImages)
    ? product.commonImages
    : Array.isArray(product?.catalogImages)
      ? product.catalogImages
      : [];
  const productImages = Array.isArray(product?.images)
    ? product.images
    : product?.imageUrl
      ? [product.imageUrl]
      : [];

  const rawMergedImages = (
    variantImages.length > 0
      ? [...variantImages, ...commonImages]
      : [...productImages, ...commonImages]
  ).filter(Boolean);

  const images = Array.from(
    new Set(
      rawMergedImages.map((img) => getImageUrlFromValue(img)).filter(Boolean),
    ),
  );
  if (!images.length && fallbackProductImage) {
    images.push(getImageUrlFromValue(fallbackProductImage));
  }
  const productVideo = Array.isArray(product?.videos)
    ? product.videos.find(Boolean)
    : product?.video || "";

  const attributes = product?.attributes || product?.specifications || {};

  const availableStock =
    getAvailableStock(selectedVariant) ?? getAvailableStock(product);

  const inStock =
    availableStock != null
      ? availableStock > 0
      : typeof product?.inStock === "boolean"
        ? product.inStock
        : true;

  const quantityAtStockLimit =
    availableStock != null && quantity >= availableStock;
  const quantityStockMessage = !inStock
    ? "Out Of Stock"
    : quantityAtStockLimit
      ? `Only ${availableStock} in stock`
      : "";

  useEffect(() => {
    setQuantity((currentQuantity) =>
      availableStock == null
        ? currentQuantity
        : Math.max(1, Math.min(currentQuantity, availableStock)),
    );
  }, [availableStock, selectedVariantKey]);

  const categoryLabel = product?.category
    ? (product.category || "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const rawDetails = {
    Brand: product?.brand,
    Category: categoryLabel,
    ...attributes,
  };

  const detailRows = Object.values(
    Object.entries(rawDetails).reduce((acc, [key, value]) => {
      if (value != null && value !== "") {
        const normalizedKey = key.toLowerCase().trim();
        if (!acc[normalizedKey]) {
          acc[normalizedKey] = [key, value];
        }
      }
      return acc;
    }, {}),
  );

  const productTitle = getProductTitle(product);

  const { preview: productTitlePreview, isTruncated: isProductTitleTruncated } =
    getShowMoreText(productTitle, {
      mode: "characters",
      limit: 35,
    });

  const infoTabs = [
    ...(product?.commonImages?.length
      ? [{ key: "common-images", label: " Catalogue Images" }]
      : []),
    { key: "details", label: "Product Details" },
    { key: "description", label: "Description" },
    { key: "warranty", label: "Warranty" },
    { key: "seller", label: "Seller Information" },
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
        <ApiState
          loading={productState.loading && !product}
          error={productState.error}
          empty={!product && !productState.loading}
          skeletonLayout={PRODUCT_DETAIL_SKELETON}
          skeletonContainerClass="bg-transparent px-4 sm:px-6 lg:px-8 py-8"
          emptyTitle="Product coming soon"
          emptyText="This product page is being prepared or is temporarily unavailable."
        >
          {product && (
            <>
              <nav className="mt-8 flex flex-wrap items-center gap-1 text-sm text-[#2E2E2E] lg:mt-12 lg:text-lg">
                <Link
                  to="/"
                  className="font-medium text-[#2E2E2E] transition-all duration-300 ease-in-out hover:text-ink"
                >
                  Home
                </Link>

                <span>{">"}</span>

                {product?.parentCategory && (
                  <>
                    <Link
                      to={CUSTOMER_ROUTES.category(product.parentCategory)}
                      className="capitalize transition-all duration-300 ease-in-out hover:text-ink"
                    >
                      {(product.parentCategory || "").replace(/-/g, " ")}
                    </Link>

                    <span>{">"}</span>
                  </>
                )}

                {product?.category &&
                  product.category !== product.parentCategory && (
                    <>
                      <Link
                        to={CUSTOMER_ROUTES.category(product.category)}
                        className="font-medium capitalize text-[#2E2E2E] transition-all duration-300 ease-in-out hover:text-ink"
                      >
                        {(product.category || "").replace(/-/g, " ")}
                      </Link>

                      <span>{">"}</span>
                    </>
                  )}

                <span title={productTitle} className="font-medium text-gold">
                  {isProductTitleTruncated
                    ? `${productTitlePreview}...`
                    : productTitle}
                </span>
              </nav>
              <div className="grid min-w-0 mt-8 lg:mt-14 items-start gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(40px,1.16fr)] md:gap-10">
                <div className="min-w-0">
                  <ImageGallery
                    images={images}
                    video={productVideo}
                    fallbackLabel={getProductTitle(product)}
                    isWishlisted={isWishlisted({ ...product, selectedVariant })}
                    onWishlist={() =>
                      toggleWishlist({ ...product, selectedVariant })
                    }
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
                    <div className="min-w-0 w-full">
                      <h1 className="break-words block text-lg font-bold text-[#1B1D60] md:text-xl lg:text-[22px] leading-snug">
                        <ShowMoreText
                          text={getProductTitle(product)}
                          mode="lines"
                          limit={1}
                          buttonClassName="ml-1 text-sm font-semibold text-black/50 hover:underline"
                        />
                      </h1>
                    </div>
                  </div>

                  {Number(product.rating || 0) > 0 && (
                    <div className="flex items-center mt-1">
                      <span className="mr-3 font-dm-sans text-[12px] font-medium leading-[100%] tracking-[0px] align-middle text-[#2E2E2E] sm:text-[13px] lg:text-[14px]">
                        {Number(product.rating || 0).toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const stars = Math.round(
                            Math.max(
                              0,
                              Math.min(Number(product.rating || 0), 5),
                            ),
                          );
                          return (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < stars
                                  ? "fill-[#F58220] text-[#F58220]"
                                  : "fill-border text-border"
                              }
                            />
                          );
                        })}
                      </div>
                      <span className="ml-3 font-dm-sans text-[12px] font-medium leading-[100%] tracking-[0px] align-middle text-[#2E2E2E] sm:text-[13px] lg:text-[14px]">
                        ({product.reviewCount || product.ratingCount || "0"})
                      </span>
                    </div>
                  )}

                  <ProductStockStatus
                    inStock={inStock}
                    selectedVariant={selectedVariant}
                    product={product}
                    availableStock={availableStock}
                  />

                  <ProductPriceBlock
                    price={price}
                    mrp={mrp}
                    priceClassName="text-h3"
                    mrpClassName="text-h3"
                    discountClassName="text-xs"
                    currency={currency}
                    discount={discount}
                    safeDynamicPrice={safeDynamicPrice}
                    dynamicState={dynamicState}
                    dealBadge={activeDealBadge}
                  />

                  <div className="my-4">
                    <div className="w-full md:w-fit">
                      <QuantitySelector
                        quantity={quantity}
                        onIncrease={() =>
                          setQuantity((currentQuantity) => {
                            if (!inStock || quantityAtStockLimit) {
                              return currentQuantity;
                            }
                            return currentQuantity + 1;
                          })
                        }
                        onDecrease={() =>
                          setQuantity((currentQuantity) =>
                            Math.max(1, currentQuantity - 1),
                          )
                        }
                        max={availableStock ?? undefined}
                        increaseDisabled={!inStock || quantityAtStockLimit}
                        increaseDisabledLabel={
                          quantityStockMessage || undefined
                        }
                      />
                      {quantityStockMessage ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {quantityStockMessage}
                        </p>
                      ) : null}

                      {/* Delivery Checker link directly below Quantity Selector */}
                      <DeliveryChecker
                        productId={productId}
                        product={product}
                        onResultChange={setDeliveryResult}
                      />
                    </div>
                  </div>

                  {!deliveryResult && (
                    <div className="flex flex-wrap items-center gap-2">
                      {shippingEtaText && (
                        <span className="inline-flex items-center rounded-full border border-border bg-cream px-2.5 py-1 text-[11px] font-medium text-muted">
                          Ships in {shippingEtaText} Days
                        </span>
                      )}
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
                      {productCodAvailable && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <Banknote size={11} /> COD Available
                        </span>
                      )}
                      {productCodDisabled && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                          Cod Not Available
                        </span>
                      )}
                    </div>
                  )}

                  {variants.length > 0 && variantOptions.length > 0 && (
                    <VariantSelector
                      variantOptions={variantOptions}
                      selectedAttributes={selectedAttributes}
                      findVariantForSelection={findVariantForSelection}
                      setSelectedVariant={setSelectedVariant}
                      product={product}
                      onSizeChartClick={() => setIsSizeChartOpen(true)}
                    />
                  )}

                  <ProductActionButtons
                    inStock={inStock}
                    product={product}
                    selectedVariant={selectedVariant}
                    quantity={quantity}
                    addToCart={addToCart}
                    onBuyNow={(buyNowItem) => {
                      window.sessionStorage.setItem(
                        BUY_NOW_STORAGE_KEY,
                        JSON.stringify([buyNowItem]),
                      );
                      window.sessionStorage.removeItem(
                        SELECTED_CHECKOUT_STORAGE_KEY,
                      );
                      if (!isLoggedIn) {
                        setShowGuestOtpModal(true);
                      } else {
                        navigate("/checkout");
                      }
                    }}
                  />
                </div>
              </div>

              {/* <ProductFeatureGrid /> */}

              <ProductInfoSection
                infoTabs={infoTabs}
                activeInfoTab={activeInfoTab}
                setActiveInfoTab={setActiveInfoTab}
                detailRows={detailRows}
                warranty={warranty}
                product={product}
              />

              <ProductReviewsSection productId={productId} product={product} />

              {recommendedProducts.length > 0 && (
                <ProductRecommendationSection
                  title="Recommended For You"
                  linkText="View all →"
                  products={recommendedProducts}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                  className="mt-12"
                />
              )}

              {/* <ProductRecommendationSection
                title="Related Products"
                linkText="View all →"
                products={relatedProducts}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
                className="mt-12"
              /> */}

              <ProductRecommendationSection
                title="Complete the Look"
                linkText="Explore more →"
                products={crossSellProducts}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
                className="mt-10"
              />

              {/* {isLoggedIn && (
                <ProductRecommendationSection
                  title="Recently Viewed"
                  linkText="View history →"
                  products={recentlyViewedList}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                  className="mt-10"
                />
              )} */}
            </>
          )}
        </ApiState>
      </div>

      <GuestOtpAuthModal
        open={showGuestOtpModal}
        onClose={() => setShowGuestOtpModal(false)}
        onSuccess={() => {
          setShowGuestOtpModal(false);
          navigate("/checkout");
        }}
      />
      {product && (
        <SizeChartSidebar
          isOpen={isSizeChartOpen}
          onClose={() => setIsSizeChartOpen(false)}
          productName={getProductTitle(product)}
        />
      )}
    </>
  );
}
