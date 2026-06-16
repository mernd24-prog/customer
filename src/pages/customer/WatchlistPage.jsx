import { useNavigate } from "react-router-dom";

import Seo from "../../components/common/Seo";
import { WatchlistItemCard } from "../../components/ecommerce/WatchlistItemCard";
import BrandButton from "../../components/ui/BrandButton";
import { useProductActions } from "../../hooks/useProductActions";
import { useWatchlistProducts } from "../../hooks/useWatchlistProducts";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { addToCart, removeFromWishlist } = useProductActions();
  const { products, hideFallbackProduct, isUsingFallback } =
    useWatchlistProducts();

  const removeProduct = (product) => {
    if (isUsingFallback) {
      hideFallbackProduct(product);
      return;
    }

    removeFromWishlist(product);
  };

  return (
    <>
      <Seo title="My Watchlist | Sam Global" />

      <section className="min-h-screen py-3 sm:py-6 lg:py-8">
        <div className="w-container">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-[24px] font-bold leading-tight text-ink sm:text-[30px] lg:text-[34px]">
              Watchlist
            </h1>
            <p className="mt-1 text-[13px] text-muted sm:text-[15px]">
              {products.length} saved {products.length === 1 ? "item" : "items"}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="flex flex-col gap-4">
              {products.map((product) => (
                <WatchlistItemCard
                  key={product.id || product._id || product.productId}
                  product={product}
                  onAddToCart={addToCart}
                  onRemove={removeProduct}
                />
              ))}
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
        </div>
      </section>
    </>
  );
}
