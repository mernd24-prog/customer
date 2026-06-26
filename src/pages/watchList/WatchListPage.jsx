import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo";
import CartItemCard from "../../components/cart/CartItemCard";
import BrandButton from "../../components/ui/BrandButton";
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
    stock,
    rating,
    reviewCount,
    attributes: {},
    increaseDisabled: stock !== null && stock <= 0,
    stockMessage: stock !== null && stock <= 0 ? "Out of stock" : "",
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
    setLocalQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 1) + 1,
    }));
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

      <section className="min-h-screen  py-3 sm:py-6 lg:py-8 mt-8 lg:mt-0">
        <div>
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
          />

          {products.length > 0 ? (
            <div className="mt-8 lg:mt-10 rounded-[16px] border border-gold/50 bg-[#FFFDF8] sm:rounded-[20px]">
              {products.map((product, index) => {
                const id = getProductId(product);
                const item = adaptProductToItem(
                  product,
                  localQuantities[id] ?? 1,
                );

                return (
                  <div key={id}>
                    <CartItemCard
                      item={item}
                      selected={false}
                      isLastItem={index === products.length - 1}
                      fullWidth
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
            <div className="rounded-[var(--customer-radius)] border border-border bg-white px-4 py-10 text-center sm:px-6 sm:py-20 lg:py-24">
              <h2 className="text-[22px] font-bold leading-tight text-ink sm:text-[28px] lg:text-[30px]">
                Your watchlist is empty
              </h2>
              <p className="mt-3 text-[14px] text-muted sm:text-[16px]">
                Save items you love to buy later.
              </p>
              <BrandButton
                variant="gradient"
                rounded
                label="Continue Shopping"
                className="mx-auto mt-6 h-[42px] w-full max-w-[210px] px-5 text-[13px] font-bold sm:h-[52px] sm:max-w-[240px] sm:px-8 sm:text-[15px]"
                onClick={() => navigate("/")}
              />
            </div>
          )}

          {/* RECENTLY VIEWED SECTION */}
          {recentViewedItems && recentViewedItems.length > 0 && (
            <div className="mt-8 lg:mt-16">
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
