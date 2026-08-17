import React, { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/ui/Seo";
import {
  fetchTrendingProducts,
  fetchRecommendations,
} from "../../features/recommendation/recommendationSlice";
import { fetchProducts } from "../../features/product/productSlice";
import { tokenStorage } from "../../api/tokenStorage";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import Banner from "../../layouts/HeroBanner";
import { CategoryBar } from "../../layouts/Header";
import NewArrivalCard from "../../components/ui/NewArrivalCard";
import { mothersDayData } from "../../data/special";

const ShoppingMadeEasyBanner = React.lazy(() => import("../../components/home/ShoppingBanner"));
const FeaturedProductsSection = React.lazy(() => import("../../components/home/FeaturedProductsSection"));
const MothersDaySwiper = React.lazy(() => import("../../components/home/MothersDayCarousel"));
const HomeProductsForYouSection = React.lazy(() => import("../../components/home/HomeProductsForYouSection"));
const CollageSection = React.lazy(() => import("../../components/home/CollageSection"));
const ShowcaseSection = React.lazy(() => import("../../components/home/ShowcaseSection"));

import { toStandardProductCard as toNewArrivalProduct } from "../../utils/productUtils";

const buildNewArrivalItems = (products) => {
  if (!products.length) return [];

  // Group by category (up to 3 groups)
  const grouped = {};
  for (const product of products) {
    const cat = product?.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    if (grouped[cat].length < 3) grouped[cat].push(product);
  }

  const categories = Object.keys(grouped).slice(0, 3);

  return categories.map((cat, index) => {
    const categoryProducts = grouped[cat];
    let dynamicBadge = "";

    // Find the first available badge from the products in this category
    for (const p of categoryProducts) {
      const b =
        p?.badge ||
        p?.deal?.badge ||
        p?.metadata?.badge ||
        p?.metadata?.dealBadge ||
        (p?.isFeatured ? "Featured" : "");
      if (b) {
        dynamicBadge = b;
        break;
      }
    }

    // Fallback if no dynamic badge is found
    if (!dynamicBadge) {
      const fallbacks = ["New", "Trending", "Popular"];
      dynamicBadge = fallbacks[index] || "New";
    }

    return {
      id: `arrivals-${index}`,
      badgeText: dynamicBadge,
      badgeType: "new",
      title: cat === "Uncategorized" ? "New Arrivals" : cat,
      seeAllLink: `/products?category=${encodeURIComponent(cat)}`,
      products: categoryProducts.map(toNewArrivalProduct),
    };
  });
};

export function HomePage() {
  const dispatch = useDispatch();
  const categoryList = useSelector((s) => s.catalog.globalCategories);
  const categories = Array.isArray(categoryList) ? categoryList : [];

  const [homeProducts, setHomeProducts] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const trendingList = useSelector((s) => s.recommendation.trendingList);
  const cmsList = useSelector((s) => s.cms.list);
  const cmsPages = Array.isArray(cmsList) ? cmsList : [];
  const products = homeProducts;

  const trendingProducts = Array.isArray(trendingList) ? trendingList : [];
  
  const isTrendingLoading = useSelector((s) => s.recommendation.loading);
  const loading = homeLoading || isTrendingLoading;

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setHomeLoading(true);
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => {});
    if (tokenStorage.getAccessToken()) {
      dispatch(fetchRecommendations({ limit: 10 })).catch(() => {});
    }
    
    dispatch(fetchProducts({ limit: 18, page: 1, sort: "newest" }))
      .unwrap()
      .then((result) => {
        const data = result?.data || {};
        const list =
          data.hits ||
          data.products ||
          data.results ||
          data.items ||
          data.list ||
          (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          setHomeProducts(list);
        }
      })
      .catch(() => {})
      .finally(() => setHomeLoading(false));

  }, [dispatch]);

  // Featured: top-rated from newest products; fall back to trending
  const featuredProducts = useMemo(() => {
    const pool = products.length ? products : trendingProducts;
    return [...pool]
      .sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))
      .slice(0, 5);
  }, [products, trendingProducts]);

  // New arrivals grouped by category
  const newArrivalItems = useMemo(
    () => buildNewArrivalItems(products.slice(0, 12)),
    [products],
  );

  return (
    <>
      <Seo
        title="Sam Global | Shop Smarter"
        description="Discover the best deals on fashion, electronics, home and more at Sam Global."
      />
      <Banner />
      <CategoryBar />

      <HomeCategoryGrid
        categories={categories
          ?.filter((c) => c?.isDashboardVisible !== false)
          .slice(0, 10)}
        loading={false}
        title="Time For a Spring Refresh"
        subtitle="Curated collections for every style & home"
        className="text-[#3E4093] font-regular text-[18px] "
      />

      <Suspense fallback={<div className="h-[400px] w-full" />}>
        <CollageSection cmsPages={cmsPages} />

      <ShoppingMadeEasyBanner
        cmsPage={cmsPages.find(
          (p) => p.slug === "promotion_banner" || p.slug === "promotion-banner"
        )}
      />

        <FeaturedProductsSection
          title="Featured Products"
          actionLabel="View All Products"
          actionHref="/products"
          products={featuredProducts}
          loading={loading}
        />

        <section className="my-10">
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
      </Suspense>

      <Suspense fallback={<div className="h-[200px] w-full" />}>
        <MothersDaySwiper data={mothersDayData} />

        <div className="mt-16">
          <HomeProductsForYouSection
            title="Explore Our Collection"
            description="Handpicked products loved by thousands of shoppers"
            actionLabel="Browse All Products"
            limit={10}
            fallbackProducts={homeProducts}
          />
        </div>
      </Suspense>
    </>
  );
}
