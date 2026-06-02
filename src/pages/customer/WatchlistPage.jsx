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

      <section className="min-h-screen py-8">
        <div className="w-container">
          <div className="mb-6">
            <h1 className="font-montserrat text-[34px] font-bold text-ink">
              Watchlist
            </h1>
            <p className="mt-1 font-montserrat text-[15px] text-muted">
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
            <div className="rounded-[var(--customer-radius)] border border-border bg-white py-24 text-center">
              <h2 className="font-montserrat text-[30px] font-bold text-ink">
                Your watchlist is empty
              </h2>
              <p className="mt-3 font-montserrat text-[16px] text-muted">
                Save items you love to buy later.
              </p>
              <BrandButton
                variant="gradient"
                rounded
                label="Continue Shopping"
                className="mt-7 h-[52px] px-8  mx-auto text-[15px] font-bold"
                onClick={() => navigate("/")}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
