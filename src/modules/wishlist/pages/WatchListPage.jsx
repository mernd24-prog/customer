import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, Seo } from "../../../components/ui";

import { WatchlistItemCard } from "../components/WatchlistItemCard";
import { useWishlistActions } from "../../products/controllers/actions";
import { useWatchlistProducts } from "../../../hooks/useWatchlistProducts";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { wishlistItemKey } from "../../../utils/ecommerce";
import { OutlineSmallButton } from "../../../components/ui/button/static";
import { FaAngleRight } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { SkeletonLoader } from "../../../components/ui/skeleton";

const PAGE_SIZE = 10;

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { moveWishlistToCart, removeFromWishlist } = useWishlistActions();
  const { products, hideFallbackProduct, isUsingFallback, isLoading } =
    useWatchlistProducts();

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  // Reset visible count when product list changes (e.g. item removed)
  useEffect(() => {
    setVisibleCount((prev) => Math.max(PAGE_SIZE, prev));
  }, [products.length]);

  // IntersectionObserver — load next batch when sentinel enters viewport
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, products.length),
          );
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, products.length]);

  const removeProduct = (product) => {
    if (isUsingFallback) {
      hideFallbackProduct(product);
      return;
    }
    removeFromWishlist(product);
  };

  const handleAddToCart = (product) => {
    return moveWishlistToCart(product, 1);
  };

  const handleRemove = (product) => {
    removeProduct(product);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Wishlist", href: "/wishlist" },
  ];

  return (
    <>
      <Seo title="My Wishlist | Sam Global" />

      <section className="min-h-screen py-3 sm:py-6 lg:py-8 mt-8 lg:mt-0">
        <div>
          <Breadcrumbs items={breadcrumbItems} />

          {isLoading ? (
            <div className="mt-8 lg:mt-10">
              <SkeletonLoader
                count={products.length || 4}
                containerClass="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
                wrapperClass=""
                layout={[
                  {
                    type: "col",
                    className:
                      "rounded-[12px] border border-border overflow-hidden bg-white p-3",
                    children: [
                      {
                        type: "box",
                        width: "100%",
                        height: "180px",
                        rounded: "rounded-[8px]",
                      },
                      {
                        type: "col",
                        className: "mt-3",
                        children: [
                          { type: "box", width: "85%", height: "14px" },
                          {
                            type: "box",
                            width: "50%",
                            height: "16px",
                            className: "mt-2",
                          },
                          {
                            type: "box",
                            width: "100%",
                            height: "32px",
                            className: "mt-3 rounded-md",
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
              <div className="mt-8 lg:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                {visibleProducts.map((product) => {
                  const id = wishlistItemKey(product.wishlistEntry || product);

                  return (
                    <WatchlistItemCard
                      key={id}
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      onRemove={() => handleRemove(product)}
                    />
                  );
                })}
              </div>

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="mt-8 flex justify-center items-center py-4"
                >
                  <Loader2
                    className="animate-spin text-[#CE9F2D]"
                    size={28}
                    strokeWidth={2}
                  />
                </div>
              )}

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
              title="Your Wishlist Is Empty"
              description="Save items you love to buy later."
              actionLabel="Continue Shopping"
              onAction={() => navigate("/products")}
            />
          )}
        </div>
      </section>
    </>
  );
}