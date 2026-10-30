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
import ProductStockStatus from "../components/ProductStockStatus";
import ShowMoreText from "../../../utils/showMore";
import { PRODUCT_DETAIL_SKELETON } from "../../../components/ui/skeleton/layouts";
import {
  Star,
  ChevronRight,
  Clock,
  RefreshCw,
  ShieldCheck,
  Banknote,
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
    crossSellProducts,
    recommendedProducts,
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
                    {brand && (
                      <Link
                        to={`/brands/${encodeURIComponent(brand)}`}
                        className="max-w-full w-fit break-words text-sm font-bold uppercase tracking-widest text-navy transition-colors hover:text-[#CE9F2D]"
                      >
                        {capitalizeFirst(brand)}
                      </Link>
                    )}

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
                        limit={1}
                        buttonClassName="ml-1 border-0 bg-transparent p-0 text-xs font-semibold text-[#CE9F2D] shadow-none outline-none hover:underline"
                      />
                    </h1>

                    {/* Rating */}
                    {shouldShowProductRating && (
                      <div className="flex flex-wrap items-center gap-2">
                        {productRatingValue > 0 && (
                          <div className="inline-flex items-center gap-1 rounded bg-[#388E3C] px-1.5 py-0.5 text-xs font-bold text-white shadow-xs">
                            <span>{productRatingValue.toFixed(1)}</span>
                            <Star size={10} className="fill-white" />
                          </div>
                        )}

                        {productReviewCount > 0 && (
                          <span className="text-xs font-medium text-[#878787]">
                            {productReviewCount} reviews
                          </span>
                        )}

                        <ProductStockStatus
                          inStock={inStock}
                          selectedVariant={selectedVariant}
                          product={product}
                          availableStock={availableStock}
                        />
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#F0E6D2]" />

                  {/* Price */}
                  <ProductPriceBlock
                    price={price}
                    mrp={mrp}
                    priceClassName="text-2xl font-extrabold text-[#1B1D60] sm:text-3xl"
                    mrpClassName="text-sm font-medium text-[#9CA3AF] line-through"
                    discountClassName="text-xs font-bold"
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

                  {/* Quantity */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs  uppercase tracking-wider text-[#6F7480] font-bold">
                      Quantity
                    </span>

                    <div className="w-fit">
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

                  {/* Action Buttons */}
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

                  {/* Delivery Checker */}
                  <DeliveryChecker
                    productId={resolvedProductId}
                    product={product}
                    onResultChange={setDeliveryResult}
                  />

                  {/* Service Badges */}
                  {!deliveryResult && (
                    <ProductServiceBadges
                      shippingEtaText={shippingEtaText}
                      staticIsFree={staticIsFree}
                      staticCharge={staticCharge}
                      productCodAvailable={productCodAvailable}
                      productCodDisabled={productCodDisabled}
                    />
                  )}

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
                        <p className="mt-0.5 text-xs text-muted sm:text-sm">
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

                    {peaceOfMindOpen && (
                      <div className="grid grid-cols-2 gap-3 border-t border-border p-4 text-center sm:p-5 2xl:grid-cols-4">
                        <div className="flex flex-col items-center rounded-lg border border-border/70 bg-surface-soft p-3">
                          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                            <Clock size={22} className="stroke-[2.2]" />
                          </div>
                          <span className="text-xs font-bold text-ink sm:text-sm">
                            Fast Dispatch
                          </span>
                          <span className="mt-0.5 text-xs text-muted">
                            Within 24-48 hrs
                          </span>
                        </div>

                        <div className="flex flex-col items-center rounded-lg border border-border/70 bg-surface-soft p-3">
                          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                            <RefreshCw size={22} className="stroke-[2.2]" />
                          </div>
                          <span className="text-xs font-bold text-ink sm:text-sm">
                            Easy Returns
                          </span>
                          <span className="mt-0.5 text-xs text-muted">
                            7-day policy
                          </span>
                        </div>

                        <div className="flex flex-col items-center rounded-lg border border-border/70 bg-surface-soft p-3">
                          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                            <Banknote size={22} className="stroke-[2.2]" />
                          </div>
                          <span className="text-xs font-bold text-ink sm:text-sm">
                            Cash on Delivery
                          </span>
                          <span className="mt-0.5 text-xs text-muted">
                            Pay on delivery
                          </span>
                        </div>

                        <div className="flex flex-col items-center rounded-lg border border-border/70 bg-surface-soft p-3">
                          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                            <ShieldCheck size={22} className="stroke-[2.2]" />
                          </div>
                          <span className="text-xs font-bold text-ink sm:text-sm">
                            100% Genuine
                          </span>
                          <span className="mt-0.5 text-xs text-muted">
                            Quality verified
                          </span>
                        </div>
                      </div>
                    )}
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
                </div>
              </div>

              {/* Reviews */}
              <div className="mx-auto mt-10 w-full max-w-5xl">
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
                  products={crossSellProducts}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                  className="mt-10"
                />

                {recommendedProducts.length > 0 && (
                  <ProductRecommendationSection
                    title="Related Products"
                    linkText="View all →"
                    products={recommendedProducts}
                    addToCart={addToCart}
                    toggleWishlist={toggleWishlist}
                    isWishlisted={isWishlisted}
                    className="mt-10"
                  />
                )}
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