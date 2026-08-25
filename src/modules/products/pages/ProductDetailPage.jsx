import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useProductDetailController } from "../controllers";
import { useCartActions, useWishlistActions } from "../controllers/actions";
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
} from "../../../utils/ecommerce";
import { formatPageTitle } from "../../../utils/common";
import ProductReviewsSection from "../../../modules/products/components/ProductReviewsSection";
import CUSTOMER_ROUTES from "../../../constants/routes";
import {
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../../constants";
import GuestOtpAuthModal from "../../../components/ui/overlay/GuestOtpAuthModal";
import StarRating from "../components/starRating";
import ShareProductPopover from "../components/socialMediaShare";
import ProductPriceBlock from "../components/oldAndNewPrice";
import ProductStockStatus from "../components/stockStatus";
import SizeChartSidebar from "../components/SizeChartSidebar";
import ShowMoreText, { getShowMoreText } from "../../../utils/showMore";
import { PRODUCT_DETAIL_SKELETON } from "../../../components/ui/skeleton/layouts";
import { Star, Banknote, Truck } from "lucide-react";import QuantitySelector from "../../cart/components/QuantitySelector";
import ImageGallery from "../components/ImageGallery";
import DeliveryChecker from "../components/DeliveryChecker";
import VariantSelector from "../components/VariantSelector";
import ProductActionButtons from "../components/ProductActionButtons";
import ProductInfoSection from "../sections/ProductInfoSection";
import ProductRecommendationSection from "../sections/ProductRecommendationSection";
import {
  getActiveDealPrice,
  getActiveDealOriginalPrice,
} from "../../../utils/pages/productUtils";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
export default function ProductDetailPage() {
  const { productId: rawParamId } = useParams();
  const productId = rawParamId ? String(rawParamId).split(":")[0] : "";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    product,
    productState,
    productTitle,
    productTitlePreview,
    isProductTitleTruncated,
    warranty,
    dynamicState,
    relatedProducts,
    crossSellProducts,
    recommendedProducts,
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
    safeDynamicPrice,
    price,
    images,
    productVideo,
    mrp,
    discount,
    currency,
    availableStock,
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
    detailRows,
  } = useProductDetailController(productId, rawParamId);

  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
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
    <AppErrorBoundary>
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
                    <ProductServiceBadges
                      shippingEtaText={shippingEtaText}
                      staticIsFree={staticIsFree}
                      staticCharge={staticCharge}
                      productCodAvailable={productCodAvailable}
                      productCodDisabled={productCodDisabled}
                    />
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
    </AppErrorBoundary>
  );
}
