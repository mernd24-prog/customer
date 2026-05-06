import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/ProductCard";
import Seo from "../../components/Seo";
import { useToastThunk } from "../../hooks/useToastThunk";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { updateCart } from "../../features/cart/cartSlice";
import { fetchTrendingProducts } from "../../features/recommendation/recommendationSlice";
import { fetchCmsPages } from "../../features/cms/cmsSlice";
import categories from "../../data/categories.json";
import { homeShowcaseSections } from "../../data/homeSections";
import Banner from "../../components/organism/Banner";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import HomeShowcaseSections from "../../components/home/HomeShowcaseSections";
import HomeProductsForYouSection from "../../components/home/HomeProductsForYouSection";
import {
  useFetch,
  itemsFrom,
  addProductToCartPayload,
  wishlistPayload,
} from "./helpers";

export function HomePage() {
  const dispatch = useDispatch();
  const catalog = useFetch(
    fetchCategories,
    { page: 1, limit: 8, active: true },
    (s) => s.catalog,
  );
  const trending = useFetch(
    fetchTrendingProducts,
    { limit: 8, period: "week" },
    (s) => s.recommendation,
  );
  const cms = useFetch(
    fetchCmsPages,
    { pageType: "banner", published: true, limit: 3 },
    (s) => s.cms,
  );
  const cart = useSelector((s) => s.cart.current);
  const run = useToastThunk();
  const recent = getRecentlyViewed();
  const products = itemsFrom(trending);
  const [minSkeletonTime, setMinSkeletonTime] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinSkeletonTime(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  const isHomeLoading = Boolean(
    minSkeletonTime || catalog.loading || cms.loading || trending.loading,
  );

  const addToCart = (product) =>
    run(
      dispatch,
      updateCart(addProductToCartPayload(cart, product)),
      "Added to cart",
    );
  const wishlist = (product) =>
    run(
      dispatch,
      updateCart(wishlistPayload(cart, product)),
      "Saved to wishlist",
    );

  return (
    <>
      <Seo title="Sam Global | Shop smarter" />
      <Banner />
      {/* Keep fetched values currently in use to avoid behavior drift while refactoring. */}
      <div className="hidden">{Boolean(catalog || cms || products.length)}</div>
      <HomeCategoryGrid categories={categories} loading={isHomeLoading} />
      <HomeShowcaseSections sections={homeShowcaseSections} loading={isHomeLoading} />
      <HomeProductsForYouSection loading={isHomeLoading} />

      {recent.length > 0 && (
        <>
          <h2>Recently viewed</h2>
          <div className="grid">
            {recent.map((product) => (
              <ProductCard
                key={product.id || product._id || product.productId}
                product={product}
                onAddToCart={addToCart}
                onWishlist={wishlist}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
