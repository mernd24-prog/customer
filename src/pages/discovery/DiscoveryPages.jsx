import { useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/ui/Seo";
import { EmptyState } from "../../components/ui";
import ApiState from "../../components/ui/ApiState";
import {
  ProductGrid,
} from "../../modules/products/components";
import { useCartActions, useWishlistActions } from "../../modules/products/controllers/actions";
import { fetchProducts } from "../../modules/products/slices/productSlice";
import {
  fetchRecommendations,
  fetchTrendingProducts,
} from "../../features/recommendation/recommendationSlice";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { tokenStorage } from "../../api/tokenStorage";

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

export function RecentlyUploadedPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.product);
  const products = Array.isArray(list) ? list : [];
  useEffect(() => {
    dispatch(fetchProducts({ newArrival: "true", sort: "newest", page: 1, limit: 48 })).catch(
      () => {},
    );
  }, [dispatch]);
  return (
    <ProductGridPage
      title="Recently Uploaded"
      description="Freshly added products uploaded by sellers."
      items={products}
      loading={loading}
      error={error}
      sourceLink="/products?newArrival=true&sort=newest"
      sourceText="All recent products"
    />
  );
}

export function NewArrivalsPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.product);
  const products = Array.isArray(list) ? list : [];
  useEffect(() => {
    dispatch(fetchProducts({ newArrival: "true", sort: "newest", page: 1, limit: 48 })).catch(
      () => {},
    );
  }, [dispatch]);
  return (
    <ProductGridPage
      title="New Arrivals"
      description="Latest arrivals curated for fast discovery."
      items={products}
      loading={loading}
      error={error}
      sourceLink="/products?newArrival=true&sort=newest"
      sourceText="View all arrivals"
    />
  );
}

export function RelatedProductsPage() {
  const dispatch = useDispatch();
  const recState = useSelector((s) => s.recommendation);
  const prodState = useSelector((s) => s.product);
  const recommendations = Array.isArray(recState.list) ? recState.list : [];
  const fallbackProducts = Array.isArray(prodState.list) ? prodState.list : [];
  const products = recommendations.length ? recommendations : fallbackProducts;
  const isAuth = tokenStorage.getAccessToken();
  const loading = isAuth ? recState.loading : prodState.loading;
  const error = isAuth ? recState.error : prodState.error;
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
      loading={loading}
      error={error}
      sourceLink="/recommendations"
      sourceText="Personalized recommendations"
    />
  );
}

export function TrendingNowPage() {
  const dispatch = useDispatch();
  const recState = useSelector((s) => s.recommendation);
  const prodState = useSelector((s) => s.product);
  const trending = Array.isArray(recState.trendingList) ? recState.trendingList : [];
  const fallbackProducts = Array.isArray(prodState.list) ? prodState.list : [];
  const products = trending.length ? trending : fallbackProducts;
  const loading = recState.loading || prodState.loading;
  const error = recState.error || prodState.error;
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
      loading={loading}
      error={error}
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
