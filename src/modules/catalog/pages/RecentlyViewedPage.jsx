import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import { ProductGrid } from "../../products/components";
import { useCartActions, useWishlistActions } from "../../products/controllers/actions";
import { getRecentlyViewed } from "../../../utils/recentlyViewed";

const ProductGridPage = memo(function ProductGridPage({
  title,
  description,
  items = [],
  loading = false,
  error = null,
  sourceLink,
  sourceText,
}) {
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();

  return (
    <>
      <Seo title={`${title} | Sam Global`} description={description} />
      <section className="w-container py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-ink">{title}</h1>
            <p className="mt-1 text-[13px] leading-[20px] text-muted">{description}</p>
          </div>
          {sourceLink && (
            <Link to={sourceLink} className="group inline-flex items-center gap-1.5 text-[13px] leading-[20px] tracking-[0.5px] font-medium text-gold hover:text-gold-dark transition-colors">
              <span>{sourceText || "Explore more"}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          )}
        </div>

        <ApiState
          loading={loading}
          error={error}
          empty={!loading && !items.length}
          emptyTitle="No Products Available"
          emptyText="Check back later or explore other sections."
        >
          <ProductGrid
            products={items}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            isWishlisted={isWishlisted}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          />
        </ApiState>
      </section>
    </>
  );
});

export function RecentlyViewedPage() {
  const recent = getRecentlyViewed();
  return (
    <ProductGridPage
      title="Recently Viewed"
      description="Quickly continue from products you viewed recently."
      items={recent}
      sourceLink="/products"
      sourceText="Browse all products"
    />
  );
}
