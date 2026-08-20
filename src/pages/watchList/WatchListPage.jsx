import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, Seo } from "../../components/ui";
import CartItemCard from "../../pages/cart/components/CartItemCard";
import { useProductActions } from "../../hooks/useProductActions";
import { useWatchlistProducts } from "../../hooks/useWatchlistProducts";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import {
  getProductId,
  getProductImage,
  getProductTitle,
  getImageFallbackSrc,
  getProductAvailableStock,
  getProductMrp,
  getProductPrice,
  wishlistItemKey,
} from "../../utils/ecommerce";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { adaptProductToItem } from "../../utils/pages/watchListUtils";
import { OutlineSmallButton } from "../../components/ui/button/static";
import { FaAngleRight } from "react-icons/fa6";
import { ProductCard } from "../../components/ecommerce";
import { SkeletonLoader, SKELETON_PRESETS } from "../../components/ui/skeleton";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { addToCart, moveWishlistToCart, removeFromWishlist } =
    useProductActions();
  const { products, hideFallbackProduct, isUsingFallback, isLoading } =
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
      const product = products.find(
        (p) => wishlistItemKey(p.wishlistEntry || p) === id,
      );
      const item = product ? adaptProductToItem(product, prev[id] ?? 1) : null;

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
    const product = products.find(
      (p) => wishlistItemKey(p.wishlistEntry || p) === id,
    );
    if (product) removeProduct(product);
  };

  // CartItemCard's secondary action is repurposed as an atomic wishlist-to-cart move.
  const handleSaveForLater = (id) => {
    const product = products.find(
      (p) => wishlistItemKey(p.wishlistEntry || p) === id,
    );
    if (!product) return;
    const qty = localQuantities[id] ?? 1;
    return moveWishlistToCart(product, qty);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Watchlist", href: "/watchlist" },
  ];

  return (
    <>
      <Seo title="My Watchlist | Sam Global" />

      <section className="min-h-screen  py-3 sm:py-6 lg:py-8 mt-8 lg:mt-0">
        <div>
          <Breadcrumbs items={breadcrumbItems} />

          {isLoading ? (
            <div className="mt-8 lg:mt-10 rounded-[16px] border border-gold/50 bg-[#FFFDF8] sm:rounded-[20px]">
              <SkeletonLoader
                count={products.length || 3}
                containerClass="flex flex-col"
                wrapperClass="border-b border-[#E7D9B8] last:border-b-0"
                layout={[
                  {
                    type: "row",
                    className: "items-start gap-4 sm:gap-6 p-4 lg:p-6",
                    children: [
                      {
                        type: "box",
                        width: "120px",
                        height: "120px",
                        rounded: "rounded-[12px]",
                        className: "shrink-0 lg:w-[180px] lg:h-[180px]",
                      },
                      {
                        type: "col",
                        className: "flex-1 pt-2",
                        children: [
                          { type: "box", width: "80%", height: "24px" },
                          {
                            type: "box",
                            width: "40%",
                            height: "16px",
                            className: "mt-4",
                          },
                          {
                            type: "box",
                            width: "120px",
                            height: "30px",
                            className: "mt-4",
                          },
                        ],
                      },
                    ],
                  },
                ]}
              />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mt-8 lg:mt-10 rounded-[16px] border border-gold/50 bg-[#FFFDF8] sm:rounded-[20px]">
                {products.map((product, index) => {
                  const id = wishlistItemKey(product.wishlistEntry || product);
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
                        saveForLaterLabel="Move to Cart"
                        removeLabel="Remove From Watchlist"
                        showCheckbox={false}
                        showQuantitySelector={true}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-6 lg:mt-8">
                <OutlineSmallButton
                  to="/products"
                  rightIcon={<FaAngleRight className="text-[10px]" />}
                  className="xl:text-[18px] text-[14px] xl:font-bold lg:text-[16px] lg:font-semibold transition-all duration-300 ease-in-out"
                >
                  Continue Shopping
                </OutlineSmallButton>
              </div>
            </>
          ) : (
            <EmptyState
              title="Your Watchlist Is Empty"
              description="Save items you love to buy later."
              actionLabel="Continue Shopping"
              onAction={() => navigate("/products")}
            />
          )}

          {/* RECENTLY VIEWED SECTION
          {recentViewedItems && recentViewedItems.length > 0 && (
            <div className="mt-8 lg:mt-16">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
                <div>
                  <h2 className="text-xl font-bold text-[#3F4095] sm:text-2xl lg:text-[38px]">
                    Recently Viewed
                  </h2>
                  <p className="mt-2 text-sm text-[#666] sm:text-lg">
                    Multiple Widgets Available in the Product Designer
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
          )} */}
        </div>
      </section>
    </>
  );
}
