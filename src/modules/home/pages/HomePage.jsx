import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../../components/ui/Seo";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import {
  fetchTrendingProducts,
  fetchRecommendations,
} from "../../../features/recommendation/recommendationSlice";
import { fetchProducts } from "../../../modules/products/slices/productSlice";
import { tokenStorage } from "../../../api/tokenStorage";
import HomeCategoryGrid from "../../../components/home/HomeCategoryGrid";
import Banner from "../../../layouts/HeroBanner";
import { CategoryBar } from "../../../layouts/Header";
import LazySection from "../../../components/ui/LazySection";
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import ShoppingMadeEasyBanner from "../../../components/home/ShoppingBanner";
import FeaturedProductsSection from "../../../components/home/FeaturedProductsSection";
import PromoCampaignCarousel from "../../../components/home/PromoCampaignCarousel";
import HomeProductsForYouSection from "../../../components/home/HomeProductsForYouSection";
import { FALLBACK_HOME_CATEGORIES } from "../../../data/fallbackCmsData";

import { getProductListFromResponse } from "../../../utils/ecommerce";

export function HomePage() {
  const dispatch = useDispatch();
  const categoryList = useSelector(
    (s) => s.catalog.globalCategories || s.catalog.list,
  );
  const apiCategories = Array.isArray(categoryList) ? categoryList : [];
  const categories = apiCategories.length
    ? apiCategories
    : FALLBACK_HOME_CATEGORIES;
  const [categoryRequestComplete, setCategoryRequestComplete] = useState(
    categories.length > 0,
  );
  const [homeProducts, setHomeProducts] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const trendingList = useSelector((s) => s.recommendation.trendingList);
  const { page: promoCampaignPage } = useCmsRecord("promo-campaign-carousel");
  const { page: shoppingBannerPage } = useCmsRecord("shopping-banner");
  const products = homeProducts;

  const trendingProducts = Array.isArray(trendingList) ? trendingList : [];

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setHomeLoading(true);
    setCategoryRequestComplete(true);
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => {});
    if (tokenStorage.getAccessToken()) {
      dispatch(fetchRecommendations({ limit: 10 })).catch(() => {});
    }
    if (!hasFetchedRef.current || homeProducts.length === 0) {
      hasFetchedRef.current = true;
      setHomeLoading(true);
      dispatch(fetchProducts({ limit: 18, page: 1, sort: "newest" }))
        .unwrap()
        .then((result) => {
          const data = result?.data || {};
          const list = getProductListFromResponse(data);
          setHomeProducts(list);
        })
        .catch(() => {})
        .finally(() => setHomeLoading(false));
    } else {
      setHomeLoading(false);
    }
  }, [dispatch]);

  // Featured: top-rated from newest products; fall back to trending
 const featuredProducts = useMemo(() => {
  const pool = products.length ? products : trendingProducts;

  return pool
    .filter((product) => product?.metadata?.featured === true)
    .slice(0, 5);
}, [products, trendingProducts]);

  return (
    <AppErrorBoundary>
      <Seo
        title="Sam Global | Shop Smarter"
        description="Discover the best deals on fashion, electronics, home and more at Sam Global."
      />
      <Banner />
      {/* <CategoryBar loading={!categoryRequestComplete && !categories.length} />

      {categories.length > 0 && (
        <HomeCategoryGrid
          categories={categories}
          loading={!categoryRequestComplete && !categories.length}
          title="Time for a Spring Refresh"
          subtitle=""
        />
      )} */}
      {/* 
      // <LazySection minHeight="280px">
      //   <FeaturedCollectionsSection />
      // </LazySection> */}

      <LazySection minHeight="380px">
        <PromoCampaignCarousel data={promoCampaignPage} />
      </LazySection>

      <LazySection minHeight="150px">
        <ShoppingMadeEasyBanner data={shoppingBannerPage} />
      </LazySection>

      {featuredProducts.length > 0 && (
        <LazySection minHeight="450px">
          <FeaturedProductsSection
            title="Featured Products"
            actionLabel="View All Products"
            actionHref="/products"
            products={featuredProducts}
            loading={false}
          />
        </LazySection>
      )}

      {/* <LazySection minHeight="500px">
        <section className="">
          <ShowcaseSection
            title="New Arrivals"
            subtitle="Newly added products with trend-driven rankings"
            headerbgColor="bg-white"
            bodybgColor="bg-white"
            gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-9 xl:grid-cols-3"
            items={newArrivalItems.length ? newArrivalItems : undefined}
            CardComponent={NewArrivalCard}
            skeletonVariant="new-arrivals"
            skeletonCount={3}
            className="mt-8"
            actionLabel="View Shop"
            actionHref="/products"
            loading={loading}
          />
        </section>
      </LazySection> */}

      {(products.length > 0 || trendingProducts.length > 0) && (
        <LazySection minHeight="400px">
          <div className="">
            <HomeProductsForYouSection
              title="Explore Our Collection"
              actionLabel="Browse All Products"
              limit={10}
              fallbackProducts={homeProducts}
            />
          </div>
        </LazySection>
      )}
    </AppErrorBoundary>
  );
}
