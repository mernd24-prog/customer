import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/common/Seo";
import { EmptyState } from "../../components/common";
import { ProductGrid } from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import {
  fetchRecommendations,
  fetchTrendingProducts,
} from "../../features/recommendation/recommendationSlice";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { tokenStorage } from "../../api/tokenStorage";

function ProductGridPage({
  title,
  description,
  items = [],
  sourceLink,
  sourceText,
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  return (
    <>
      <Seo title={`${title} | Sam Global`} description={description} />
      <section className="w-container py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-heading-md font-semibold text-ink">{title}</h1>
            <p className="mt-1 text-caption-md text-muted">{description}</p>
          </div>
          {sourceLink && (
            <Link to={sourceLink} className="text-label-md font-medium text-gold">
              {sourceText || "Explore more"} →
            </Link>
          )}
        </div>

        {items.length ? (
          <ProductGrid
            products={items}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            isWishlisted={isWishlisted}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          />
        ) : (
          <EmptyState
            title="No products available"
            description="Check back later or explore other sections."
          />
        )}
      </section>
    </>
  );
}

export function RecentlyUploadedPage() {
  const dispatch = useDispatch();
  const products = useSelector((s) =>
    Array.isArray(s.product.list) ? s.product.list : [],
  );
  useEffect(() => {
    dispatch(fetchProducts({ sort: "newest", page: 1, limit: 48 })).catch(
      () => {},
    );
  }, [dispatch]);
  return (
    <ProductGridPage
      title="Recently Uploaded"
      description="Freshly added products uploaded by sellers."
      items={products}
      sourceLink="/products?sort=newest"
      sourceText="All recent products"
    />
  );
}

export function NewArrivalsPage() {
  const dispatch = useDispatch();
  const products = useSelector((s) =>
    Array.isArray(s.product.list) ? s.product.list : [],
  );
  useEffect(() => {
    dispatch(fetchProducts({ sort: "newest", page: 1, limit: 48 })).catch(
      () => {},
    );
  }, [dispatch]);
  return (
    <ProductGridPage
      title="New Arrivals"
      description="Latest arrivals curated for fast discovery."
      items={products}
      sourceLink="/products?sort=newest"
      sourceText="View all arrivals"
    />
  );
}

export function RelatedProductsPage() {
  const dispatch = useDispatch();
  const recommendations = useSelector((s) =>
    Array.isArray(s.recommendation.list) ? s.recommendation.list : [],
  );
  const fallbackProducts = useSelector((s) =>
    Array.isArray(s.product.list) ? s.product.list : [],
  );
  const products = recommendations.length ? recommendations : fallbackProducts;
  useEffect(() => {
    if (tokenStorage.getAccessToken()) {
      dispatch(fetchRecommendations({ limit: 48 })).catch(() => {});
    } else {
      dispatch(fetchProducts({ sort: "rating", page: 1, limit: 48 })).catch(
        () => {},
      );
    }
  }, [dispatch]);
  return (
    <ProductGridPage
      title="Related Products"
      description="Products customers often view together and similar picks."
      items={products}
      sourceLink="/recommendations"
      sourceText="Personalized recommendations"
    />
  );
}

export function TrendingNowPage() {
  const dispatch = useDispatch();
  const trending = useSelector((s) =>
    Array.isArray(s.recommendation.trendingList)
      ? s.recommendation.trendingList
      : [],
  );
  const fallbackProducts = useSelector((s) =>
    Array.isArray(s.product.list) ? s.product.list : [],
  );
  const products = trending.length ? trending : fallbackProducts;
  useEffect(() => {
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => {});
    dispatch(fetchProducts({ sort: "rating", page: 1, limit: 48 })).catch(
      () => {},
    );
  }, [dispatch]);
  return (
    <ProductGridPage
      title="Trending Now"
      description="Most popular products trending across categories."
      items={products}
      sourceLink="/products?sort=rating"
      sourceText="Top rated products"
    />
  );
}

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
