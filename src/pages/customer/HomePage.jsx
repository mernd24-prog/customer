import { useEffect } from "react";
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
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { fetchProducts } from "../../features/product/productSlice";
import { tokenStorage } from "../../api/tokenStorage";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import Banner from "../../layouts/HeroBanner";
import { CategoryBar } from "../../layouts/Header";
import CollageMainSection from "../../components/ui/CollageCard";
import ShowcaseSection from "../../components/home/ShowcaseSection";
import TopDealCard from "../../components/ui/TopDealCard";
import NewArrivalCard from "../../components/ui/NewArrivalCard";
import { reusableArrivalsDemo, reusableTopDealsDemo } from "../../data/topdeal";
import { mothersDayData } from "../../data/special";
import ShoppingMadeEasyBanner from "../../components/home/ShoppingBanner";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";

export function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categoryList = useSelector((s) => s.catalog.list);
  const categories = Array.isArray(categoryList) ? categoryList : [];

  useEffect(() => {
    dispatch(fetchTrendingProducts({ period: "week" })).catch(() => {});
    if (tokenStorage.getAccessToken()) {
      dispatch(fetchRecommendations({ limit: 8 })).catch(() => {});
    }
    dispatch(fetchCategories({ limit: 20 })).catch(() => {});
    dispatch(fetchProducts({ limit: 8, page: 1, sort: "newest" })).catch(
      () => {},
    );
    dispatch(fetchCmsPages({ limit: 100 })).catch(() => {});
  }, [dispatch]);

  return (
    <>
      <Seo
        title="Sam Global | Shop smarter"
        description="Discover the best deals on fashion, electronics, home and more at Sam Global."
      />
      <Banner />
      <CategoryBar />

      <HomeCategoryGrid
        categories={categories?.slice(7, 12)}
        loading={false}
        title="Time for a Spring Refresh"
        subtitle="Curated collections for every style and home"
      />

      <CollageMainSection />

      <ShoppingMadeEasyBanner
        title="Shopping Made Easy"
        description="Enjoy seamless shopping with reliable delivery, secure payments, and hassle-free returns."
        ctaLabel="Shop Now"
      />

       <FeaturedProductsSection />

      <section className=" my-10">
        

        <ShowcaseSection
          title="New Arrivals"
          subtitle="Newly added products with trend-driven rankings"
          headerbgColor="bg-white"
          bodybgColor="bg-white"
          gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3"
          items={reusableArrivalsDemo}
          CardComponent={NewArrivalCard}
          skeletonVariant="new-arrivals"
          skeletonCount={3}
          className="mt-8"
          actionLabel="View Shop"
          onAction={() => navigate("/products")}
        />
      </section>

      <MothersDaySwiper data={mothersDayData} />
      

      {/* <MothersDaySwiper data={cmsBannerSlides} /> */}

      <div className="mt-16">
        <HomeProductsForYouSection
          title="Explore Our Collection"
          description="Handpicked products loved by thousands of shoppers"
          actionLabel="Browse All Products"
          limit={5}
        />
      </div>
    </>
  );
}
