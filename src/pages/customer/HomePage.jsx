import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo";
import MothersDaySwiper from "../../components/home/MothersDayCarousel";
import HomeProductsForYouSection from "../../components/home/HomeProductsForYouSection";
import {
  fetchTrendingProducts,
  fetchRecommendations,
} from "../../features/recommendation/recommendationSlice";
import { fetchCmsPages } from "../../features/cms/cmsSlice";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { tokenStorage } from "../../api/tokenStorage";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import Banner from "../../layouts/HeroBanner";
import { CategoryBar } from "../../layouts/Header";
import CollageMainSection from "../../components/ui/CollageCard";
import ShowcaseSection from "../../components/home/ShowcaseSection";
import NewArrivalCard from "../../components/ui/NewArrivalCard";
import { mothersDayData } from "../../data/special";
import ShoppingMadeEasyBanner from "../../components/home/ShoppingBanner";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";

const formatPrice = (product) => {
  const price = Number(product?.salePrice || product?.price || 0);
  return `₹${price.toLocaleString("en-IN")}`;
};

const getProductLink = (product) => {
  const slug = product?.slug || product?.id || product?._id;
  return slug ? `/products/${slug}` : "/products";
};

const getProductImage = (product) =>
  product?.images?.[0] || product?.image || product?.thumbnail || "";

const toNewArrivalProduct = (product) => ({
  id: String(product?._id || product?.id || ""),
  title: product?.title || "",
  image: getProductImage(product),
  price: formatPrice(product),
  oldPrice:
    product?.mrp || product?.price
      ? `₹${Number(product.mrp || product.price || 0).toLocaleString("en-IN")}`
      : undefined,
  rating: Number(product?.rating || 0).toFixed(1),
  reviewsCount: product?.reviewCount || 0,
  link: getProductLink(product),
});

const buildNewArrivalItems = (products) => {
  if (!products.length) return [];

  // Group by category (up to 3 groups)
  const grouped = {};
  for (const product of products) {
    const cat = product?.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    if (grouped[cat].length < 4) grouped[cat].push(product);
  }

  const categories = Object.keys(grouped).slice(0, 3);
  const badges = ["New", "Trending", "Popular"];

  return categories.map((cat, index) => ({
    id: `arrivals-${index}`,
    badgeText: badges[index] || "New",
    badgeType: ["new", "trending", "luxe"][index] || "new",
    title: cat === "Uncategorized" ? "New Arrivals" : cat,
    seeAllLink: `/products?category=${encodeURIComponent(cat)}`,
    products: grouped[cat].map(toNewArrivalProduct),
  }));
};

export function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categoryList = useSelector((s) => s.catalog.list);
  const categories = Array.isArray(categoryList) ? categoryList : [];

  const productList = useSelector((s) => s.product.list);
  const trendingList = useSelector((s) => s.recommendation.trendingList);
  const products = Array.isArray(productList) ? productList : [];

  const trendingProducts = Array.isArray(trendingList) ? trendingList : [];

  useEffect(() => {
    dispatch(fetchCategories()).catch(() => {});
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => {});
    if (tokenStorage.getAccessToken()) {
      dispatch(fetchRecommendations({ limit: 10 })).catch(() => {});
    }
    dispatch(fetchProducts({ limit: 18, page: 1, sort: "newest" })).catch(
      () => {},
    );
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
        title="Sam Global | Shop smarter"
        description="Discover the best deals on fashion, electronics, home and more at Sam Global."
      />
      <Banner />
      <CategoryBar />

      <HomeCategoryGrid
        categories={categories
          ?.filter((c) => c?.isDashboardVisible !== false)
          .slice(0, 10)}
        loading={false}
        title="Time for a Spring Refresh"
        subtitle="Curated collections for every style & home"
        className="text-[#3E4093] font-bold"
      />

      <CollageMainSection />

      <ShoppingMadeEasyBanner
        title="Shopping Made Easy"
        description="Enjoy seamless shopping with reliable delivery, secure payments, and hassle-free returns."
        ctaLabel="Shop Now"
      />

      <FeaturedProductsSection
        title="Featured Products"
        actionLabel="View All Products"
        actionHref="/products"
        products={featuredProducts}
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
          onAction={() => navigate("/products")}
        />
      </section>

      <MothersDaySwiper data={mothersDayData} />

      <div className="mt-16">
        <HomeProductsForYouSection
          title="Explore Our Collection"
          description="Handpicked products loved by thousands of shoppers"
          actionLabel="Browse All Products"
          limit={10}
        />
      </div>
    </>
  );
}
