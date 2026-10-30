import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useProductDetailController } from "../controllers";
import { useCartActions, useWishlistActions } from "../controllers/actions";
import ProductServiceBadges from "../components/ProductServiceBadges";
import {
  getProductId,
  getProductTitle,
  getProductPublicPath,
  decodeProductRouteToken,
  getProductCategoryName,
  getProductReviewCount,
} from "../../../utils/ecommerce";

import CUSTOMER_ROUTES from "../../../constants/routes";
import {
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../../constants";

import ProductPriceBlock from "../components/ProductPriceBlock";
import ShowMoreText from "../../../utils/showMore";
import { PRODUCT_DETAIL_SKELETON } from "../../../components/ui/skeleton/layouts";
import {
  Star,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import QuantitySelector from "../../cart/components/QuantitySelector";
import ImageGallery from "../components/ImageGallery";
import DeliveryChecker from "../components/DeliveryChecker";
import VariantSelector from "../components/VariantSelector";
import ImageVariantPicker from "../components/ImageVariantPicker";
import ProductActionButtons from "../components/ProductActionButtons";

const ProductInfoSection = lazy(() => import("../sections/ProductInfoSection"));
const ProductRecommendationSection = lazy(
  () => import("../sections/ProductRecommendationSection"),
);
const ProductReviewsSection = lazy(
  () => import("../../../modules/products/components/ProductReviewsSection"),
);
const GuestOtpAuthModal = lazy(
  () => import("../../../components/ui/overlay/GuestOtpAuthModal"),
);
const SizeChartSidebar = lazy(() => import("../components/SizeChartSidebar"));
import { capitalizeFirst } from "../../../utils/stringUtils";

import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { PageContainer } from "../../../components/ui/layout";
export default function ProductDetailPage() {
  const { productId: rawParamId, publicCode, productToken } = useParams();
  const tokenPayload = decodeProductRouteToken(productToken);
  const rawRouteProductId =
    publicCode || (rawParamId ? String(rawParamId).split(":")[0] : "");
  const isRawObjectIdRoute =
    !productToken && /^[a-f0-9]{24}$/i.test(rawRouteProductId);
  const productId = isRawObjectIdRoute ? "" : productToken || rawRouteProductId;
  const decodedProductId = tokenPayload?.p || rawRouteProductId;

  const navigate = useNavigate();
  const location = useLocation();

  const {
    product,
    productState,
    productTitle,
    productDescription,
    productShortDescription,
    productTitlePreview,
    isProductTitleTruncated,
    warranty,
    dynamicState,
    categoryRelatedProducts,
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
    safeDynamicPrice,
    price,
    images,
    productVideo,
    mrp,
    discount,
    currency,
    availableStock,
    effectiveMaxStock,
    inStock,
    quantityAtStockLimit,
    quantityStockMessage,
    activeDealBadge,
    shippingEtaText,
    staticIsFree,
    staticCharge,
    productCodAvailable,
    productCodDisabled,
    variants,
    variantOptions,
    selectedAttributes,
    findVariantForSelection,
    variantMatchesSelection,
    getVariantAttributeValue,
    categoryLabel,
    brand,
    detailRows,
    loadedProductId,
  } = useProductDetailController(productId, rawParamId, decodedProductId);
  const productRatingValue = Number(
    product?.rating ??
      product?.averageRating ??
      product?.avgRating ??
      product?.reviewsAverage ??
      0,
  );
  const productReviewCount = getProductReviewCount(product);
  const shouldShowProductRating =
    productRatingValue > 0 || productReviewCount > 0;
  const resolvedProductId =
    loadedProductId || getProductId(product) || productId;

  useEffect(() => {
    if (isRawObjectIdRoute) {
      navigate("/products", { replace: true });
    }
  }, [isRawObjectIdRoute, navigate]);

  useEffect(() => {
    if (!product) return;
    const nextPath = getProductPublicPath(product, {
      variant: selectedVariant,
    });
    const currentPath = `${location.pathname}${location.search}`;
    if (nextPath && nextPath !== currentPath) {
      navigate(nextPath, { replace: true });
    }
  }, [location.pathname, location.search, navigate, product, selectedVariant]);

  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
  const [peaceOfMindOpen, setPeaceOfMindOpen] = useState(true);
  const infoTabs = [
    ...(product?.commonImages?.length
      ? [{ key: "common-images", label: " Catalogue Images" }]
      : []),
    { key: "details", label: "Product Details" },
    { key: "description", label: "Description" },
    { key: "warranty", label: "Warranty & Returns" },
    { key: "seller", label: "Seller Information" },
  ];

  return (
    <AppErrorBoundary>
      <Seo
        title={productTitle}
        metaDescription={
          productShortDescription || product?.seo?.metaDescription
        }
        keywords={product?.seo?.keywords || []}
        image={product?.seo?.ogImage}
      />

      <PageContainer>
        <ApiState
          loading={productState.loading && !product}
          error={productState.error}
          empty={!product && !productState.loading}
          skeletonLayout={PRODUCT_DETAIL_SKELETON}
          skeletonContainerClass="bg-transparent px-4 sm:px-6 lg:px-8 py-6"
          emptyTitle="Product coming soon"
          emptyText="This product page is being prepared or is temporarily unavailable."
        >
          {product && (
            <>
              <div className="mt-2 grid min-w-0 items-start gap-6 lg:mt-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-6 xl:gap-10">
                {/* Left: Sticky Breadcrumbs + Image Gallery */}
                <div className="min-w-0 lg:sticky lg:top-[calc(var(--customer-header-height,95px)+64px)] lg:self-start">
                  <div className="mb-3 min-w-0">
                    <Breadcrumbs
                      className="gap-x-2.5 gap-y-1.5"
                      lastItemOnNewLineMobile
                      items={[
                        { label: "Home", href: "/" },
                        ...(product?.parentCategory &&
                        !/^[a-f\d]{24}$/i.test(String(product.parentCategory))
                          ? [
                              {
                                label: String(product.parentCategory).replace(
                                  /-/g,
                                  " ",
                                ),
                                href: CUSTOMER_ROUTES.category(
                                  product.parentCategory,
                                ),
                              },
                            ]
                          : []),
                        ...(getProductCategoryName(product) &&
                        (product.categoryKey || product.category) !==
                          product.parentCategory
                          ? [
                              {
                                label: getProductCategoryName(product),
                                href: CUSTOMER_ROUTES.category(
                                  product.categoryKey || product.category,
                                ),
                              },
                            ]
                          : []),
                        { label: productTitle },
                      ]}
                    />
                  </div>

                  <ImageGallery
                    images={images}
                    video={productVideo}
                    fallbackLabel={productTitle}
                    isWishlisted={isWishlisted({ ...product, selectedVariant })}
                    onWishlist={() =>
                      toggleWishlist({ ...product, selectedVariant })
                    }
                    onModalOpen={() => {
                      setShareOpen(false);
                      setZoomOpen(true);
                    }}
                    onModalClose={() => setZoomOpen(false)}
                    productTitle={productTitle}
                    shareOpen={!zoomOpen && shareOpen}
                    onShareToggle={() => setShareOpen((prev) => !prev)}
                    onShareClose={() => setShareOpen(false)}
                  />
                </div>

                <div className="relative flex min-w-0 flex-col gap-5 lg:mt-10">
                  <div className="flex flex-col gap-2">
                    <div className="mt-5 flex min-w-0 items-baseline gap-1.5 text-xs">
                      <span className="shrink-0 font-medium text-muted">Brand:</span>
                      {brand ? (
                        <Link
                          to={`/brands/${encodeURIComponent(brand)}`}
                          className="max-w-full break-words font-bold uppercase tracking-wide text-navy transition-colors hover:text-[#CE9F2D]"
                        >
                          {capitalizeFirst(brand)}
                        </Link>
                      ) : (
                        <span className="font-medium text-muted">Not specified</span>
                      )}
                    </div>

                    <h1
                      className={`break-words leading-snug ${
                        brand
                          ? "text-base font-semibold text-[#1B1D60] sm:text-lg"
                          : "text-lg font-bold text-[#1B1D60] sm:text-xl"
                      }`}
                    >
                      <ShowMoreText
                        text={productTitle}
                        mode="lines"
                        limit={2}
                        buttonClassName="ml-1 border-0 bg-transparent p-0 text-xs font-semibold text-[#CE9F2D] shadow-none outline-none hover:underline"
                      />
                    </h1>

                    {/* Rating */}
                    <div className="flex flex-wrap items-center gap-2">
                      {shouldShowProductRating && productRatingValue > 0 && (
                        <div className="inline-flex items-center gap-1 rounded bg-[#388E3C] px-1.5 py-0.5 text-xs font-bold text-white shadow-xs">
                          <span>{productRatingValue.toFixed(1)}</span>
                          <Star size={10} className="fill-white" />
                        </div>
                      )}

                      {shouldShowProductRating && productReviewCount > 0 && (
                        <span className="text-xs font-medium text-[#878787]">
                          {productReviewCount} reviews
                        </span>
                      )}

                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#F0E6D2]" />

                  {/* Price */}
                  <ProductPriceBlock
                    price={price}
                    mrp={mrp}
                    priceClassName="text-2xl font-extrabold text-[#1B1D60] sm:text-3xl"
                    mrpClassName="font-medium text-[#9CA3AF]"
                    discountClassName="bg-[#E8F5E9] text-xs font-bold text-[#16833B]"
                    currency={currency}
                    discount={discount}
                    safeDynamicPrice={safeDynamicPrice}
                    dynamicState={dynamicState}
                    dealBadge={activeDealBadge}
                  />

                  {/* Variants */}
                  {variants.length > 0 && variantOptions.length > 0 && (
                    <VariantSelector
                      variantOptions={variantOptions}
                      selectedAttributes={selectedAttributes}
                      findVariantForSelection={findVariantForSelection}
                      variantMatchesSelection={variantMatchesSelection}
                      getVariantAttributeValue={getVariantAttributeValue}
                      setSelectedVariant={setSelectedVariant}
                      product={product}
                      onSizeChartClick={() => setIsSizeChartOpen(true)}
                    />
                  )}

                  {variants.length > 1 && variantOptions.length === 0 && (
                    <ImageVariantPicker
                      variants={variants}
                      selectedVariant={selectedVariant}
                      setSelectedVariant={setSelectedVariant}
                      productTitle={productTitle}
                    />
                  )}

                  <div className="grid min-w-0 grid-cols-2 items-end gap-3 sm:flex sm:flex-col sm:items-stretch sm:gap-5">
                    {/* Quantity */}
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-[#6F7480] font-bold">
                        Quantity
                      </span>

                      <div className="w-full sm:w-fit">
                        <QuantitySelector
                          quantity={quantity}
                          fullWidth
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
                          max={effectiveMaxStock}
                          increaseDisabled={!inStock || quantityAtStockLimit}
                          increaseDisabledLabel={
                            quantityStockMessage || undefined
                          }
                        />
                      </div>

                      {quantityStockMessage && (
                        <p className="text-xs font-semibold text-amber-600">
                          {quantityStockMessage}
                        </p>
                      )}
                    </div>

                    {/* Delivery Checker */}
                    <DeliveryChecker
                      productId={resolvedProductId}
                      product={product}
                      compactMobile
                      onResultChange={setDeliveryResult}
                    />
                  </div>

                  {/* Shop with Peace of Mind */}
                  <div className="overflow-hidden rounded-lg border border-border bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => setPeaceOfMindOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between bg-white px-5 py-4 text-left transition-colors hover:bg-surface-soft"
                      aria-expanded={peaceOfMindOpen}
                    >
                      <div>
                        <h3 className="text-base font-bold text-ink sm:text-lg">
                          Shop with peace of mind
                        </h3>
                        <p className={`overflow-hidden text-xs text-muted transition-all duration-300 ease-in-out sm:text-sm ${peaceOfMindOpen ? "mt-0 max-h-0 opacity-0" : "mt-0.5 max-h-8 opacity-100"}`}>
                          Complete care and guarantee for your purchase
                        </p>
                      </div>

                      <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream text-ink transition-colors hover:bg-cream-strong">
                        {peaceOfMindOpen ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${peaceOfMindOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      aria-hidden={!peaceOfMindOpen}
                      inert={!peaceOfMindOpen}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="border-t border-border">
                          {!deliveryResult && (
                            <div className="border-b border-border px-4 py-4 sm:px-5">
                              <ProductServiceBadges
                                shippingEtaText={shippingEtaText}
                                staticIsFree={staticIsFree}
                                staticCharge={staticCharge}
                                productCodAvailable={productCodAvailable}
                                productCodDisabled={productCodDisabled}
                                layout="row"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Information */}
                  <Suspense
                    fallback={
                      <div className="mt-4 h-32 animate-pulse rounded-xl bg-gray-100" />
                    }
                  >
                    <ProductInfoSection
                      detailRows={detailRows}
                      warranty={warranty}
                      product={product}
                      selectedVariant={selectedVariant}
                      effectiveDescription={productDescription}
                    />
                  </Suspense>

                  {/* Keep purchase actions after the complete product information. */}
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

              {/* Reviews */}
              <div className="mt-10 w-full">
                <Suspense
                  fallback={
                    <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
                  }
                >
                  <ProductReviewsSection
                    productId={productId || resolvedProductId}
                    product={product}
                    realProductId={resolvedProductId}
                  />
                </Suspense>
              </div>

              {/* Recommendations */}
              <Suspense
                fallback={
                  <div className="mt-8 h-40 animate-pulse rounded-xl bg-gray-100" />
                }
              >
                <ProductRecommendationSection
                  title="You May Also Like"
                  linkText="Explore more →"
                  products={categoryRelatedProducts}
                  limit={categoryRelatedProducts.length}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                  className="mt-10"
                />

              </Suspense>
            </>
          )}
        </ApiState>
      </PageContainer>

      <Suspense fallback={null}>
        {showGuestOtpModal && (
          <GuestOtpAuthModal
            open={showGuestOtpModal}
            onClose={() => setShowGuestOtpModal(false)}
            onSuccess={() => {
              setShowGuestOtpModal(false);
              navigate("/checkout");
            }}
          />
        )}
        {product && isSizeChartOpen && (
          <SizeChartSidebar
            isOpen={isSizeChartOpen}
            onClose={() => setIsSizeChartOpen(false)}
            productName={getProductTitle(product)}
          />
        )}
      </Suspense>
    </AppErrorBoundary>
  );
}
