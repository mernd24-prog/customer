import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, fetchProducts } from "../slices/productSlice";
import { fetchProductWarranty } from "../../../features/warranty/warrantySlice";
import { fetchDynamicPrice } from "../../../features/dynamicPricing/dynamicPricingSlice";
import {
  trackRecommendationInteraction,
  fetchRecommendations,
} from "../../../features/recommendation/recommendationSlice";
import {
  fetchCrossSellProducts,
  fetchRelatedProducts,
} from "../slices/relatedProductsSlice";
import { trackAnalyticsEvent } from "../../../features/analytics/analyticsSlice";
import {
  addRecentlyViewed,
  getRecentlyViewed,
} from "../../../utils/recentlyViewed";
import { tokenStorage } from "../../../api/tokenStorage";
import {
  decodeVariantRouteToken,
  encodeVariantRouteToken,
  getProductId,
  getProductSlug,
  getVariantRouteKey,
} from "../../../utils/ecommerce";
import {
  applyImageFallback,
  getImageFallbackSrc,
  getProductImage,
  getProductTitle,
  composeProductVariantTitle,
  getProductPrice,
  getProductMrp,
  getDefaultVariant,
  getAvailableStock as getVariantAvailableStock,
  getVariantPrice,
  getImageUrlFromValue,
  firstMoneyValue,
  buildCartItem,
  isProductCodAvailable,
  getProductBrandName,
  getProductCategoryName,
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

export function useProductDetailController(
  productId,
  rawParamId,
  matchProductId = productId,
) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract Global State
  const productState = useSelector((s) => s.product);
  const currentProduct = productState.current;
  const productIdentifier = String(matchProductId || productId || "");
  const productRequestIdentifier = String(productId || "");
  const product = [
    getProductId(currentProduct),
    getProductSlug(currentProduct),
  ].some((value) => String(value || "") === productIdentifier)
    ? currentProduct
    : null;
  const loadedProductId = getProductId(product);

  const warrantyState = useSelector((s) => s.warranty);
  const dynamicState = useSelector((s) => s.dynamicPricing);
  const relatedState = useSelector((s) => s.relatedProducts);
  const user = useSelector((s) => s.auth.current);

  const userId = user?.id || user?._id || user?.userId || user?.email;
  const isLoggedIn = Boolean(
    userId && (tokenStorage.getAccessToken() || tokenStorage.getRefreshToken()),
  );
  const relatedLookupKey = productRequestIdentifier || loadedProductId;

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
    setActiveInfoTab(
      product?.commonImages?.length ? "common-images" : "details",
    );
  }, [product?._id, product?.id, product?.commonImages?.length]);

  // Variant Selection and Syncing
  const variants = product?.variants || [];

  // Only an explicit selection (or route hydration) writes the variant URL.
  // A separate state-to-URL effect can write the previous render's variant back.
  const selectVariant = useCallback((variant) => {
    setSelectedVariant(variant);
    if (!variant || !productIdentifier) return;
    const variantKey = getVariantRouteKey(variant);

    if (variantKey) {
      window.sessionStorage.setItem(
        `selected_variant_${productIdentifier}`,
        variantKey,
      );
    }

    const currentParam = searchParams.get("x");
    const hasReadableVariantParam =
      searchParams.has("v") ||
      searchParams.has("variant") ||
      searchParams.has("variantId") ||
      searchParams.has("sku");

    const publicVariantToken = variantKey
      ? encodeVariantRouteToken({ v: variantKey })
      : "";

    if (
      publicVariantToken &&
      (currentParam !== publicVariantToken || hasReadableVariantParam)
    ) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("x", publicVariantToken);
          next.delete("v");
          next.delete("variant");
          next.delete("variantId");
          next.delete("sku");
          return next;
        },
        { replace: true },
      );
    } else if (!variantKey && hasReadableVariantParam) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("v");
          next.delete("variant");
          next.delete("variantId");
          next.delete("sku");
          return next;
        },
        { replace: true },
      );
    }
  }, [productIdentifier, searchParams, setSearchParams]);


  useEffect(() => {
    if (!variants.length) {
      setSelectedVariant(null);
      return;
    }

    const pathVariantKey =
      rawParamId && rawParamId.includes(":") ? rawParamId.split(":")[1] : null;
    const opaqueVariantPayload = decodeVariantRouteToken(searchParams.get("x"));
    const paramVariantKey =
      opaqueVariantPayload?.v ||
      searchParams.get("v") ||
      searchParams.get("variant") ||
      searchParams.get("variantId") ||
      searchParams.get("sku") ||
      pathVariantKey;
    const storedVariantKey = productIdentifier
      ? window.sessionStorage.getItem(`selected_variant_${productIdentifier}`)
      : null;
    const targetKey = paramVariantKey || storedVariantKey;

    let targetVariant = null;
    if (targetKey) {
      targetVariant = variants.find(
        (v) =>
          String(v._id || "") === String(targetKey) ||
          String(v.id || "") === String(targetKey) ||
          String(v.sku || "") === String(targetKey) ||
          String(v.code || "") === String(targetKey) ||
          String(getVariantRouteKey(v) || "") === String(targetKey),
      );
    }

    const defaultVariant = getDefaultVariant(product) || variants[0];

    selectVariant(targetVariant || defaultVariant);
  }, [variants, searchParams, productIdentifier, rawParamId, selectVariant]);

  const selectedVariantKey = selectedVariant?.sku || selectedVariant?._id || "";


  // Initial Fetching
  useEffect(() => {
    if (!productRequestIdentifier) return;
    dispatch(fetchProductById({ productId: productRequestIdentifier }));
    if (!productState.list?.length) {
      dispatch(fetchProducts({ limit: 10, page: 1, view: "cards" })).catch(() => {});
    }
    sideEffectsRanFor.current = null;
    setDeliveryResult(null);
  }, [dispatch, productRequestIdentifier]);

  useEffect(() => {
    if (!loadedProductId) return;
    dispatch(fetchProductWarranty({ productId: loadedProductId })).catch(
      () => {},
    );
    dispatch(
      fetchRelatedProducts({
        productId: productRequestIdentifier || loadedProductId,
        params: { limit: 100 },
      }),
    ).catch(() => {});
    dispatch(
      fetchCrossSellProducts({
        productId: productRequestIdentifier || loadedProductId,
        params: { limit: 12 },
      }),
    ).catch(() => {});
  }, [dispatch, loadedProductId, productRequestIdentifier]);

  // Side Effects (Analytics, Recommendations, Recently Viewed)
  useEffect(() => {
    if (!product || !loadedProductId) return;
    if (sideEffectsRanFor.current === loadedProductId) return;
    sideEffectsRanFor.current = loadedProductId;

    dispatch(
      fetchRecommendations({
        productId: loadedProductId,
        category: product.category || "",
        period: "week",
        limit: 8,
        cache: false,
      }),
    ).catch(() => {});

    if (isLoggedIn) {
      dispatch(
        trackAnalyticsEvent({
          eventName: "product_view",
          metadata: { productId: loadedProductId },
        }),
      ).catch(() => {});
      dispatch(
        trackRecommendationInteraction({
          productId: loadedProductId,
          interactionType: "viewed",
        }),
      ).catch(() => {});
    }
  }, [dispatch, isLoggedIn, product, loadedProductId]);

  useEffect(() => {
    if (!isLoggedIn || !product) {
      setRecentlyViewedList([]);
      return;
    }
    addRecentlyViewed(product);
    setRecentlyViewedList(
      getRecentlyViewed().filter(
        (p) => String(getProductId(p)) !== String(loadedProductId),
      ),
    );
  }, [isLoggedIn, product, loadedProductId]);

  // Dynamic Pricing fetch
  useEffect(() => {
    if (!loadedProductId) return;
    const requestKey = `${loadedProductId}:${selectedVariantKey}:${quantity}`;
    if (dynamicPriceRequestKey.current === requestKey) return;
    dynamicPriceRequestKey.current = requestKey;

    dispatch(
      fetchDynamicPrice({
        productId: loadedProductId,
        variantId: selectedVariant?._id,
        sku: selectedVariant?.sku,
        quantity,
      }),
    ).catch(() => {});
  }, [
    dispatch,
    loadedProductId,
    quantity,
    selectedVariantKey,
    selectedVariant?._id,
    selectedVariant?.sku,
  ]);

  // Stock Validation
  const getAvailableStock = (v) =>
    getVariantAvailableStock(v) ??
    v?.stockQuantity ??
    v?.inventoryQuantity ??
    v?.quantity;
  const rawAvailableStock =
    getAvailableStock(selectedVariant) ?? getAvailableStock(product);
  const availableStock =
    rawAvailableStock != null && !isNaN(Number(rawAvailableStock))
      ? Number(rawAvailableStock)
      : null;
  const effectiveMaxStock = availableStock != null ? Math.min(availableStock, 10) : 10;

  useEffect(() => {
    setQuantity((currentQuantity) => {
      const num = Number(currentQuantity);
      const validCurrent = Number.isFinite(num) && num >= 1 ? num : 1;
      return Math.max(1, Math.min(validCurrent, effectiveMaxStock));
    });
  }, [effectiveMaxStock, selectedVariantKey]);

  // Derived State extracted from Page
  const {
    variantOptions,
    selectedAttributes,
    findVariantForSelection,
    variantMatchesSelection,
    getVariantAttributeValue,
  } = useProductDetailVariants({ product, variants, selectedVariant });
  const {
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
    discount,
    currency,
    shipping,
    shippingEtaMin,
    shippingEtaMax,
    shippingEtaText,
    staticIsFree,
    staticCharge,
    productCodAvailable,
    productCodDisabled,
  } = useProductDetailPricing({
    product,
    selectedVariant,
    dynamicState,
    productId: loadedProductId || productId,
  });
  const {
    fallbackProductImage,
    variantImages,
    commonImages,
    productImages,
    rawMergedImages,
    images,
    productVideo,
  } = useProductDetailImages({ product, selectedVariant });

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

  const getExplicitAvailability = (item) =>
    [item?.inStock, item?.isInStock, item?.isAvailable].find(
      (value) => typeof value === "boolean",
    );
  const isOutOfStockStatus = (item) =>
    [item?.stockStatus, item?.availability, item?.inventoryStatus]
      .filter((value) => typeof value === "string")
      .some((value) =>
        ["out_of_stock", "outofstock", "sold_out", "unavailable"].includes(
          value.trim().toLowerCase().replace(/[\s-]+/g, "_"),
        ),
      );
  const variantAvailability = getExplicitAvailability(selectedVariant);
  const productAvailability = getExplicitAvailability(product);
  const inStock =
    availableStock != null
      ? availableStock > 0
      : typeof variantAvailability === "boolean"
        ? variantAvailability
        : typeof productAvailability === "boolean"
          ? productAvailability
          : !isOutOfStockStatus(selectedVariant) && !isOutOfStockStatus(product);

  const quantityAtStockLimit =
    availableStock != null ? quantity >= effectiveMaxStock : false;
  const quantityStockMessage = !inStock
    ? "Out Of Stock"
    : quantity >= 10
      ? "Max 10 items per order"
      : quantityAtStockLimit
        ? `Only ${Math.min(availableStock ?? 0, 10)} in stock`
        : "";

  const brand = getProductBrandName(product);
  const categoryLabel = getProductCategoryName(product);

  const rawDetails = {
    Brand: brand,
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
    { variants },
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
      limit: 60,
    });

  const rawRelated =
    relatedState.relatedByProduct[relatedLookupKey]?.items ||
    relatedState.relatedByProduct[loadedProductId]?.items ||
    [];
  const rawCrossSell =
    relatedState.crossSellByProduct[relatedLookupKey]?.items ||
    relatedState.crossSellByProduct[loadedProductId]?.items ||
    [];

  const categoryRelatedProducts = useMemo(
    () => {
      const products = [];
      const seenIds = new Set([String(loadedProductId)]);

      [...rawRelated, ...rawCrossSell].forEach((item) => {
        const id = String(getProductId(item) || "");
        if (!id || seenIds.has(id)) return;
        seenIds.add(id);
        products.push(item);
      });

      return products;
    },
    [rawRelated, rawCrossSell, loadedProductId],
  );

  return {
    variants,
    variantOptions,
    selectedAttributes,
    findVariantForSelection,
    variantMatchesSelection,
    getVariantAttributeValue,
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
    effectiveMaxStock,
    inStock,
    quantityAtStockLimit,
    quantityStockMessage,
    categoryLabel,
    brand,
    rawDetails,
    detailRows,
    productTitle,
    productDescription,
    productShortDescription,
    productTitlePreview,
    isProductTitleTruncated,
    product,
    loadedProductId,
    productState,
    warranty: warrantyState.current,
    dynamicState,
    relatedProducts: rawRelated,
    categoryRelatedProducts,
    recommendedProducts: rawRelated.filter(
      (p) => String(getProductId(p) || "") !== String(loadedProductId || ""),
    ),
    recentlyViewedList,
    isLoggedIn,
    quantity,
    setQuantity,
    deliveryResult,
    setDeliveryResult,
    selectedVariant,
    setSelectedVariant: selectVariant,
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
