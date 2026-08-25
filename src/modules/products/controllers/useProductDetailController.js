import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../slices/productSlice";
import { fetchProductWarranty } from "../../../features/warranty/warrantySlice";
import { fetchDynamicPrice } from "../../../features/dynamicPricing/dynamicPricingSlice";
import {
  fetchRecommendations,
  trackRecommendationInteraction,
} from "../../../features/recommendation/recommendationSlice";
import {
  fetchRelatedProducts,
  fetchCrossSellProducts,
} from "../slices/relatedProductsSlice";
import { trackAnalyticsEvent } from "../../../features/analytics/analyticsSlice";
import { addRecentlyViewed, getRecentlyViewed } from "../../../utils/recentlyViewed";
import { tokenStorage } from "../../../api/tokenStorage";
import { getProductId } from "../../../utils/ecommerce";
import {
  applyImageFallback,
  getImageFallbackSrc,
  getProductImage,
  getProductTitle,
  composeProductVariantTitle,
  getProductPrice,
  getProductMrp,
  getVariantPrice,
  getImageUrlFromValue,
  firstMoneyValue,
  buildCartItem,
  isProductCodAvailable
} from "../../../utils/ecommerce";
import {
  getActiveDealPrice,
  getActiveDealOriginalPrice,
} from "../../../utils/pages/productUtils";
import { getShowMoreText } from "../../../utils/showMore";


import { useProductDetailPricing } from "./useProductDetailPricing";
import { useProductDetailImages } from "./useProductDetailImages";
import { useProductDetailVariants } from "./useProductDetailVariants";
import { useSearchParams } from "react-router-dom";

export function useProductDetailController(productId, rawParamId) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract Global State
  const productState = useSelector((s) => s.product);
  const currentProduct = productState.current;
  const product = String(getProductId(currentProduct) || "") === String(productId || "") ? currentProduct : null;
  const loadedProductId = getProductId(product);

  const warrantyState = useSelector((s) => s.warranty);
  const dynamicState = useSelector((s) => s.dynamicPricing);
  const relatedState = useSelector((s) => s.relatedProducts);
  const crossSellState = useSelector((s) => s.relatedProducts); // Usually these share the same slice state
  const recommendationState = useSelector((s) => s.recommendation);
  const user = useSelector((s) => s.auth.current);
  
  const userId = user?.id || user?._id || user?.userId || user?.email;
  const isLoggedIn = Boolean(userId && (tokenStorage.getAccessToken() || tokenStorage.getRefreshToken()));

  // Local State
  const [quantity, setQuantity] = useState(1);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("details");
  const [recentlyViewedList, setRecentlyViewedList] = useState([]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [showGuestOtpModal, setShowGuestOtpModal] = useState(false);

  const sideEffectsRanFor = useRef(null);
  const dynamicPriceRequestKey = useRef(null);

  // Tab Setup
  useEffect(() => {
    setActiveInfoTab(product?.commonImages?.length ? "common-images" : "details");
  }, [product?._id, product?.id, product?.commonImages?.length]);

  // Variant Selection and Syncing
  const variants = product?.variants || [];
  
  useEffect(() => {
    if (!variants.length) {
      setSelectedVariant(null);
      return;
    }

    const pathVariantKey = rawParamId && rawParamId.includes(":") ? rawParamId.split(":")[1] : null;
    const paramVariantKey = searchParams.get("variant") || searchParams.get("variantId") || searchParams.get("sku") || pathVariantKey;
    const storedVariantKey = productId ? window.sessionStorage.getItem(`selected_variant_${productId}`) : null;
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

    const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];

    setSelectedVariant((current) => {
      if (targetVariant) return targetVariant;
      if (current && variants.some((variant) => (variant._id || variant.sku) === (current._id || current.sku))) return current;
      return defaultVariant;
    });
  }, [variants, searchParams, productId, rawParamId]);

  const selectedVariantKey = selectedVariant?._id || selectedVariant?.sku || "";

  useEffect(() => {
    if (!selectedVariant || !productId) return;
    const variantKey = selectedVariant._id || selectedVariant.id || selectedVariant.sku;
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

  // Initial Fetching
  useEffect(() => {
    if (!productId) return;
    dispatch(fetchProductById({ productId }));
    dispatch(fetchProductWarranty({ productId })).catch(() => {});
    dispatch(fetchRelatedProducts({ productId })).catch(() => {});
    dispatch(fetchCrossSellProducts({ productId })).catch(() => {});
    sideEffectsRanFor.current = null;
    setDeliveryResult(null);
  }, [dispatch, productId]);

  // Side Effects (Analytics, Recommendations, Recently Viewed)
  useEffect(() => {
    if (!product) return;
    if (sideEffectsRanFor.current === productId) return;
    sideEffectsRanFor.current = productId;

    dispatch(fetchRecommendations({ category: product.category, period: "week", limit: 8 })).catch(() => {});

    if (isLoggedIn) {
      dispatch(trackAnalyticsEvent({ eventName: "product_view", metadata: { productId } })).catch(() => {});
      dispatch(trackRecommendationInteraction({ productId, interactionType: "viewed" })).catch(() => {});
    }
  }, [dispatch, isLoggedIn, product, productId]);

  useEffect(() => {
    if (!isLoggedIn || !product) {
      setRecentlyViewedList([]);
      return;
    }
    addRecentlyViewed(product);
    setRecentlyViewedList(getRecentlyViewed().filter((p) => String(getProductId(p)) !== String(productId)));
  }, [isLoggedIn, product, productId]);

  // Dynamic Pricing fetch
  useEffect(() => {
    if (!loadedProductId || String(loadedProductId) !== String(productId)) return;
    const requestKey = `${productId}:${selectedVariantKey}:${quantity}`;
    if (dynamicPriceRequestKey.current === requestKey) return;
    dynamicPriceRequestKey.current = requestKey;

    dispatch(fetchDynamicPrice({
      productId,
      variantId: selectedVariant?._id,
      sku: selectedVariant?.sku,
      quantity,
    })).catch(() => {});
  }, [dispatch, loadedProductId, productId, quantity, selectedVariantKey, selectedVariant?._id, selectedVariant?.sku]);

  // Stock Validation
  const getAvailableStock = (v) => v?.stockQuantity ?? v?.inventoryQuantity ?? v?.quantity;
  const availableStock = getAvailableStock(selectedVariant) ?? getAvailableStock(product);

  useEffect(() => {
    setQuantity((currentQuantity) =>
      availableStock == null
        ? currentQuantity
        : Math.max(1, Math.min(currentQuantity, availableStock)),
    );
  }, [availableStock, selectedVariantKey]);


  // Derived State extracted from Page

  const { variantOptions, selectedAttributes, findVariantForSelection } = useProductDetailVariants({ product, variants, selectedVariant });
  const { selectedVariantPrice, productPrice, activeDealPrice, activeDealOriginalPrice, activeDealBadge, dynamicPrice, baseDisplayPrice, safeDynamicPrice, price, mrp, discount, currency, shipping, shippingEtaMin, shippingEtaMax, shippingEtaText, staticIsFree, staticCharge, productCodAvailable, productCodDisabled } = useProductDetailPricing({ product, selectedVariant, dynamicState, productId });
  const { fallbackProductImage, variantImages, commonImages, productImages, rawMergedImages, images, productVideo } = useProductDetailImages({ product, selectedVariant });

  

  

  

  

  const productAttributes = product?.attributes || {};
  const variantAttributes = selectedVariant?.attributes || {};
  const productSpecifications = product?.specifications || {};
  const variantSpecifications = selectedVariant?.specifications || {};
  const flattenSpecifications = (source = {}) =>
    Object.entries(source || {}).reduce((result, [section, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.entries(value).forEach(([key, nestedValue]) => {
          result[`${section} · ${key}`] = nestedValue;
        });
      } else {
        result[section] = value;
      }
      return result;
    }, {});
  const attributes = {
    ...productAttributes,
    ...flattenSpecifications(productSpecifications),
    ...variantAttributes,
    ...flattenSpecifications(variantSpecifications),
  };



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

  const baseProductTitle = getProductTitle(product);
  const variantTitleDetail = selectedVariant?.title?.trim() || "";
  const productTitle = composeProductVariantTitle(
    baseProductTitle,
    variantTitleDetail,
  );

  const appendVariantContent = (
    baseContent = "",
    variantContent = "",
    separator = " — ",
  ) => {
    const base = String(baseContent || "").trim();
    const variant = String(variantContent || "").trim();
    if (!variant) return base;
    if (!base) return variant;
    if (base.toLowerCase().includes(variant.toLowerCase())) return base;
    if (variant.toLowerCase().includes(base.toLowerCase())) return variant;
    return `${base}${separator}${variant}`;
  };

  const productDescription = appendVariantContent(
    product?.description,
    selectedVariant?.description,
    "<br/><br/>",
  );
  const productShortDescription = appendVariantContent(
    product?.shortDescription,
    selectedVariant?.shortDescription,
  );

  const { preview: productTitlePreview, isTruncated: isProductTitleTruncated } =
    getShowMoreText(productTitle, {
      mode: "characters",
      limit: 35,
    });

  
  return {
    variants,
    variantOptions,
    selectedAttributes,
    findVariantForSelection,
    selectedVariantPrice,
    productPrice,
    activeDealPrice,
    activeDealOriginalPrice,
    activeDealBadge,
    dynamicPrice,
    baseDisplayPrice,
    safeDynamicPrice,
    price,
    mrp,
    currency,
    shipping,
    shippingEtaMin,
    shippingEtaMax,
    shippingEtaText,
    staticIsFree,
    staticCharge,
    productCodAvailable,
    productCodDisabled,
    discount,
    fallbackProductImage,
    variantImages,
    commonImages,
    productImages,
    rawMergedImages,
    images,
    productVideo,
    attributes,
    availableStock,
    inStock,
    quantityAtStockLimit,
    quantityStockMessage,
    categoryLabel,
    rawDetails,
    detailRows,
    productTitle,
    productDescription,
    productShortDescription,
    productTitlePreview,
    isProductTitleTruncated,
    product,
    productState,
    warranty: warrantyState.current,
    dynamicState,
    relatedProducts: relatedState.relatedByProduct[productId]?.items || [],
    crossSellProducts: crossSellState.crossSellByProduct[productId]?.items || [],
    recommendedProducts: (recommendationState?.list || []).filter((p) => String(getProductId(p) || "") !== String(productId || "")),
    recentlyViewedList,
    isLoggedIn,
    quantity,
    setQuantity,
    deliveryResult,
    setDeliveryResult,
    selectedVariant,
    setSelectedVariant,
    zoomOpen,
    setZoomOpen,
    shareOpen,
    setShareOpen,
    activeInfoTab,
    setActiveInfoTab,
    isSizeChartOpen,
    setIsSizeChartOpen,
    showGuestOtpModal,
    setShowGuestOtpModal,
    searchParams,
    setSearchParams,
  };
}
