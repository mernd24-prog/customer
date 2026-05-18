import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/common/Seo";
import ProductCard from "../../components/product/ProductCard";
import SectionContainer from "../../components/ui/SectionContainer";
import MothersDaySwiper from "../../components/home/MothersDayCarousel";
import HomeProductsForYouSection from "../../components/home/HomeProductsForYouSection";
import InfoSection from "../../components/about/InfoSection";
import {
  ourMission,
  ourStoryData,
  valueData,
  whyChooseUsData,
} from "../../data/aboutUs";
import { mothersDayData } from "../../data/homeSections";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import {
  fetchTrendingProducts,
  fetchRecommendations,
} from "../../features/recommendation/recommendationSlice";
import { fetchCmsPages } from "../../features/cms/cmsSlice";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { fetchProducts } from "../../features/product/productSlice";
import { tokenStorage } from "../../api/tokenStorage";
import WhyChooseSection from "../../components/about/WhyChooseSection";
import FAQPage from "../faq/FAQPage";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import Banner from "../../components/layout/HeroBanner";
import CollageMainSection from "../../components/ui/CollageCard";
import ShowcaseSection from "../../components/home/ShowcaseSection";
import TopDealCard from "../../components/ui/TopDealCard";
import NewArrivalCard from "../../components/ui/NewArrivalCard";
import Button from "../../components/ui/Button";
import NeedHelpSection from "../../components/faq/NeedHelpSection";
import CommitmentCard from "../../components/ui/CommitmentCard";
import { aboutSectionImages } from "../../constant/image.constant";
import SupportFeatureSection from "../../components/ui/SupportFeatureSection";
import { helpSupportData } from "../../data/helpSupport";
import { useCardPlayground } from "../../hooks/useCardPlayground";
// import FashionMegaMenu from "../../components/category/FashionMegaMenu";
// import { fashionMenuData } from "../../data/megaMenu";

const reusableTopDealsDemo = [
  {
    id: "demo-top-1",
    title: "Minimal Street Jacket",
    image: "/image/png/blazer.png",
    price: "₹1,499",
    oldPrice: "₹2,099",
  },
  {
    id: "demo-top-2",
    title: "Smart Home Accent Set",
    image: "/image/jpg/home-decor.jpg",
    price: "₹2,299",
    oldPrice: "₹3,099",
  },
  {
    id: "demo-top-3",
    title: "Everyday Classic Watch",
    image: "/image/png/watch.png",
    price: "₹999",
    oldPrice: "₹1,499",
  },
  {
    id: "demo-top-4",
    title: "Premium Fragrance Duo",
    image: "/image/png/ForYou.png",
    price: "₹1,799",
    oldPrice: "₹2,499",
  },
];

const reusableArrivalsDemo = [
  {
    id: "demo-arrival-1",
    title: "Summer Style Pack",
    views: 2400,
    images: ["/image/png/maxi.png", "/image/png/blazer.png"],
    price: "₹1,299",
    oldPrice: "₹1,899",
  },
  {
    id: "demo-arrival-2",
    title: "Home Comfort Edit",
    views: 1800,
    images: ["/image/jpg/home-decor.jpg", "/image/png/stylishPair.png"],
    price: "₹2,099",
    oldPrice: "₹2,899",
  },
  {
    id: "demo-arrival-3",
    title: "Weekend Casual Picks",
    views: 3200,
    images: ["/image/png/pants.png", "/image/png/menswear.png"],
    price: "₹1,099",
    oldPrice: "₹1,599",
  },
];

const universalCardsDemo = [
  {
    id: "u-1",
    title: "Fashion Capsule Pack",
    description: "Single-image reusable card with CTA and rating.",
    image: "/image/png/blazer.png",
    category: "fashion",
    rating: 4.7,
    ctaLabel: "Shop Now",
    to: "/products",
  },
  {
    id: "u-2",
    title: "Home Styling Bundle",
    description: "Multi-image card rendered by same component.",
    images: ["/image/jpg/home-decor.jpg", "/image/png/stylishPair.png"],
    category: "home",
    rating: 4.5,
    ctaLabel: "Explore",
    to: "/products",
  },
  {
    id: "u-3",
    title: "Smart Essentials Combo",
    description: "Category + favorite toggle + dynamic layout support.",
    images: ["/image/png/ForYou.png", "/image/png/watch.png"],
    category: "electronics",
    rating: 4.2,
    ctaLabel: "View Deal",
    to: "/products",
  },
  {
    id: "u-4",
    title: "Premium Fragrance Set",
    description: "Reusable structure with only props changed.",
    image: "/image/png/ForYou.png",
    category: "beauty",
    rating: 4.8,
    ctaLabel: "Buy",
    to: "/products",
  },
  {
    id: "u-5",
    title: "Kids Trend Collection",
    description: "Can be filtered and sorted through shared handlers.",
    images: ["/image/png/maxi.png", "/image/png/pants.png"],
    category: "kids",
    rating: 4.3,
    ctaLabel: "Browse",
    to: "/products",
  },
];

export function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recent = getRecentlyViewed();
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const trendingList = useSelector((s) => s.recommendation.trendingList);
  const trendingLoading = useSelector((s) => s.recommendation.loadingTrending);
  const productList = useSelector((s) => s.product.list);
  const productLoading = useSelector((s) => s.product.loading);
  const cmsPages = useSelector((s) => s.cms.list);
  const categoryList = useSelector((s) => s.catalog.list);
  const categories = Array.isArray(categoryList) ? categoryList : [];
  const trendingProducts = Array.isArray(trendingList) ? trendingList : [];
  const featuredProducts = Array.isArray(productList)
    ? productList.slice(0, 8)
    : [];
  const cmsBannerSlides = useMemo(() => {
    const list = Array.isArray(cmsPages) ? cmsPages : [];
    const bannerLike = list
      .filter((item) => {
        const pageType = String(
          item?.pageType || item?.type || "",
        ).toLowerCase();
        const slug = String(item?.slug || "").toLowerCase();
        const isBannerLike =
          pageType.includes("banner") ||
          slug.includes("banner") ||
          slug.includes("hero");
        const isPublished = item?.published !== false;
        const isActive = item?.metadata?.active !== false;
        return isBannerLike && isPublished && isActive;
      })
      .sort(
        (a, b) =>
          Number(a?.metadata?.sortOrder || 999) -
          Number(b?.metadata?.sortOrder || 999),
      )
      .slice(0, 8)
      .map((item) => ({
        title: item?.metadata?.headline || item?.title || "Featured",
        name: item?.metadata?.subtitle || item?.title || "Featured",
        link:
          item?.metadata?.ctaUrl ||
          (item?.slug ? `/cms/${item.slug}` : "/products"),
        image:
          item?.heroImage ||
          item?.coverImage ||
          item?.thumbnailUrl ||
          item?.metadata?.heroImage ||
          item?.metadata?.coverImage ||
          item?.metadata?.thumbnailUrl,
      }))
      .filter((item) => item.image);
    return bannerLike;
  }, [cmsPages]);
  const demo = useCardPlayground(universalCardsDemo);

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
      {/* <FashionMegaMenu/> */}

      {/* Category Grid */}
      {/* Category Grid */}
      <HomeCategoryGrid categories={categories?.slice(0, 5)} loading={false} />
      <CollageMainSection />

      <section className="w-container my-10">
        <h2 className="mb-2 font-montserrat text-2xl font-bold text-[#1d1d1d]">
          Reusable UI Demo
        </h2>
        <p className="mb-6 text-sm text-[#6b6b6b]">
          Same components, different data props. This is the library-style
          pattern now in app.
        </p>

        <ShowcaseSection
          title="Top Deals Demo (Reusable TopDealCard)"
          subtitle="Configured only by props + items"
          headerbgColor="bg-[#C9C9DB]"
          bodybgColor="bg-[#F3F3FA]"
          gridClassName="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4"
          items={reusableTopDealsDemo}
          CardComponent={TopDealCard}
        />

        <ShowcaseSection
          title="New Arrivals Demo (Reusable NewArrivalCard)"
          subtitle="Same section, only component + item shape changed"
          headerbgColor="bg-[#ECDFCB]"
          bodybgColor="bg-[#CE9F2D0D]"
          gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3"
          items={reusableArrivalsDemo}
          CardComponent={NewArrivalCard}
          skeletonVariant="new-arrivals"
          skeletonCount={3}
          className="mt-8"
        />
      </section>

      <NeedHelpSection
        heading1="Shopping Made Easy"
        heading2=""
        description="Enjoy reliablity ,secure dileveries and hassle free returns. Shop with confidence at Sam Global."
        buttonText="Contact Us"
      />

      {/* Seasonal swiper */}
      <MothersDaySwiper
        data={cmsBannerSlides.length ? cmsBannerSlides : mothersDayData}
      />
      {/* Products For You + Our Commitment */}
      <div className="w-container">
        <HomeProductsForYouSection />
      </div>
    </>
  );
}
