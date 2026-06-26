import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  EmptyState, Seo } from "../../components/common";
import CartItemCard from "../../components/cart/CartItemCard";
import { useProductActions } from "../../hooks/useProductActions";
import { useWatchlistProducts } from "../../hooks/useWatchlistProducts";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import { FaAngleRight } from "react-icons/fa6";
import {
  getProductId,
  getProductImage,
  getProductTitle,
  getImageFallbackSrc,
} from "../../utils/ecommerce";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { OutlineSmallButton } from "../../components/dynamicComponent/button/static";
import { ProductCard } from "../../components/ecommerce";

function adaptProductToItem(product, quantity = 1) {
  const id = getProductId(product);
  const title = getProductTitle(product, "Product");
  const image =
    getProductImage(product) || getImageFallbackSrc(title, "watchlist");
  const price =
    product?.price ?? product?.sellingPrice ?? product?.salePrice ?? 0;
  const oldPrice =
    product?.mrp ?? product?.originalPrice ?? product?.compareAtPrice;
  const stock =
    product?.stock ??
    product?.availableStock ??
    product?.inventory ??
    product?.totalStock ??
    null;
  const stockQuantity = stock == null ? null : Number(stock);
  const hasStockQuantity = Number.isFinite(stockQuantity);
  const outOfStock = hasStockQuantity && stockQuantity <= 0;
  const stockLimitReached =
    hasStockQuantity && stockQuantity > 0 && quantity >= stockQuantity;
  const stockMessage = outOfStock
    ? "Out of stock"
    : stockLimitReached
      ? `Only ${stockQuantity} in stock`
      : "";
  const rating =
    product?.rating ??
    product?.averageRating ??
    product?.ratingsAverage ??
    null;
  const reviewCount =
    product?.reviewCount ??
    product?.reviewsCount ??
    product?.numReviews ??
    null;

  return {
    id,
    productId: id,
    title,
    image,
    price,
    oldPrice,
    quantity,
    shipping: 0,
    seller: product?.seller?.name || product?.seller || product?.brand || "",
    color: product?.color || product?.selectedColor || null,
    size: product?.size || product?.selectedSize || null,
    stock: hasStockQuantity ? stockQuantity : null,
    rating,
    reviewCount,
    attributes: {},
    increaseDisabled: outOfStock || stockLimitReached,
    stockMessage,
    _raw: product,
  };
}

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { addToCart, removeFromWishlist, toggleWishlist, isWishlisted } =
    useProductActions();
  const { products, hideFallbackProduct, isUsingFallback } =
    useWatchlistProducts();

  // Local quantity state keyed by product id
  const [localQuantities, setLocalQuantities] = useState({});

  const removeProduct = (product) => {
    if (isUsingFallback) {
      hideFallbackProduct(product);
      return;
    }
    removeFromWishlist(product);
  };

  const handleIncrease = (id) => {
    setLocalQuantities((prev) => {
      const product = products.find((p) => getProductId(p) === id);
      const item = product
        ? adaptProductToItem(product, prev[id] ?? 1)
        : null;

      if (item?.increaseDisabled) return prev;

      return {
        ...prev,
        [id]: (prev[id] ?? 1) + 1,
      };
    });
  };

  const handleDecrease = (id) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] ?? 1) - 1),
    }));
  };

  const handleRemove = (id) => {
    const product = products.find((p) => getProductId(p) === id);
    if (product) removeProduct(product);
  };

  // "Move to Wishlist" in CartItemCard → here repurposed as "Add to Cart"
  const handleSaveForLater = (id) => {
    const product = products.find((p) => getProductId(p) === id);
    if (!product) return;
    const qty = localQuantities[id] ?? 1;
    addToCart({ ...product, quantity: qty });
  };

  const recentViewedItems = getRecentlyViewed();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Wishlist", href: "/watchlist" },
  ];

  return (
    <>
      <Seo title="My Watchlist | Sam Global" />

      <section className="min-h-screen  py-3 sm:py-6 lg:py-8 ">
        <div className="w-container">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
          />

          {products.length > 0 ? (
            <div className=" rounded-[16px] border border-[#CE9F2D80] bg-[#FFFDF8] sm:rounded-[20px]">
              {products.map((product, index) => {
                const id = getProductId(product);
                const item = adaptProductToItem(
                  product,
                  localQuantities[id] ?? 1,
                );

                return (
                  <div
                    key={id}
                  >
                    <CartItemCard
                      item={item}
                      selected={false}
                      isLastItem={index === products.length - 1}
                      onSelect={() => {}}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                      onSaveForLater={handleSaveForLater}
                      saveForLaterLabel="Add to Cart"
                      removeLabel="Remove from Watchlist"
                      showCheckbox={false}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Your watchlist is empty"
              description="Save items you love to buy later."
              actionLabel="Continue Shopping"
              onAction={() => navigate("/")}
            />
          )}

          {/* RECENTLY VIEWED SECTION */}
          {recentViewedItems && recentViewedItems.length > 0 && (
            <div className="mt-12 lg:mt-16">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
                <div>
                  <h2 className="text-xl font-bold text-[#3F4095] sm:text-2xl lg:text-[38px]">
                    Recently Viewed
                  </h2>
                  <p className="mt-2 text-sm text-[#666] sm:text-lg">
                    Multiple widgets available in the product designer
                  </p>
                </div>
                <OutlineSmallButton
                  to="/products"
                  rightIcon={<FaAngleRight className="text-[10px]" />}
                  className="self-start sm:self-center"
                >
                  Browse All Products
                </OutlineSmallButton>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {recentViewedItems.map((item) => (
                  <ProductCard
                    key={getProductId(item)}
                    product={item}
                    onAddToCart={addToCart}
                    onWishlist={toggleWishlist}
                    isWishlisted={isWishlisted(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
