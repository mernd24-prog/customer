import React, { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/ui/Seo";
import {
  fetchTrendingProducts,
  fetchRecommendations,
} from "../../features/recommendation/recommendationSlice";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchCmsPages } from "../../features/cms/cmsSlice";
import { tokenStorage } from "../../api/tokenStorage";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import Banner from "../../layouts/HeroBanner";
import { CategoryBar } from "../../layouts/Header";
import NewArrivalCard from "../../components/ui/NewArrivalCard";
import LazySection from "../../components/ui/LazySection";
import { mothersDayData } from "../../data/special";

const ShoppingMadeEasyBanner = React.lazy(
  () => import("../../components/home/ShoppingBanner"),
);
const FeaturedProductsSection = React.lazy(
  () => import("../../components/home/FeaturedProductsSection"),
);
const MothersDaySwiper = React.lazy(
  () => import("../../components/home/MothersDayCarousel"),
);
const HomeProductsForYouSection = React.lazy(
  () => import("../../components/home/HomeProductsForYouSection"),
);
const CollageSection = React.lazy(
  () => import("../../components/home/CollageSection"),
);
const ShowcaseSection = React.lazy(
  () => import("../../components/home/ShowcaseSection"),
);

import { toStandardProductCard as toNewArrivalProduct } from "../../utils/productUtils";
import { getProductListFromResponse } from "../../utils/ecommerce";

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
    dispatch(fetchCmsPages({ limit: 100 })).catch(() => {});
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
        loading={homeLoading}
        title="Time For a Spring Refresh"
        subtitle="Curated collections for every style & home"
        className="text-[#3E4093] font-regular text-[18px] "
      />

      <LazySection minHeight="400px">
        <CollageSection cmsPages={cmsPages} />
      </LazySection>

      <LazySection minHeight="150px">
        <ShoppingMadeEasyBanner
          cmsPage={cmsPages.find(
            (p) =>
              p.slug === "promotion_banner" || p.slug === "promotion-banner",
          )}
        />
      </LazySection>

      <LazySection minHeight="450px">
        <FeaturedProductsSection
          title="Featured Products"
          actionLabel="View All Products"
          actionHref="/products"
          products={featuredProducts}
          loading={loading}
        />
      </LazySection>

      <LazySection minHeight="500px">
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
      </LazySection>

      <LazySection minHeight="380px">
        <MothersDaySwiper data={mothersDayData} />
      </LazySection>

      <LazySection minHeight="400px">
        <div className="mt-16">
          <HomeProductsForYouSection
            title="Explore Our Collection"
            description="Handpicked products loved by thousands of shoppers"
            actionLabel="Browse All Products"
            limit={10}
            fallbackProducts={homeProducts}
          />
        </div>
      </LazySection>
    </>
  );
}
