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
import BrandCarousel from "../../components/about/BrandCarousel";
import WhyChooseSection from "../../components/about/WhyChooseSection";
import FAQPage from "../faq/FAQPage";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import Banner from "../../components/layout/HeroBanner";
import CollageMainSection from "../../components/ui/collageCard";
import NeedHelpSection from "../../components/faq/NeedHelpSection";
import CommitmentCard from "../../components/ui/CommitmentCard";
import { aboutSectionImages } from "../../constant/image.constant";
import SupportFeatureSection from "../../components/ui/SupportFeatureSection";
import { helpSupportData } from "../../data/helpSupport";
// import FashionMegaMenu from "../../components/category/FashionMegaMenu";
// import { fashionMenuData } from "../../data/megaMenu";

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
      {/* <ValuesSection data={valueData} /> */}
      {/* Commitment Section */}
      {/* <section className="mt-8 px-3 py-5 sm:px-4 sm:py-6 lg:mt-10 lg:px-6 lg:py-8">
 
        <h2 className="mb-6 text-center font-montserrat text-[22px] font-bold leading-tight text-[#2E2E2E] sm:text-[26px] md:text-[30px] lg:mb-8 lg:text-[34px]">
          Our Commitment
        </h2>

        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">

        
          <CommitmentCard
            title="To our customers, we promise:"
            bgColor="bg-[#F5ECDD]"
            iconColor="text-[#B57A2B]"
            watermarkImage={aboutSectionImages.watermark}
            points={[
              "Quality and curated selection",
              "Seamless shopping experience",
              "Trust and consistency",
            ]}
          />

          <CommitmentCard
            title="To our partners, we offer:"
            bgColor="bg-[#E9E8F6]"
            iconColor="text-[#2E3192]"
            watermarkImage={aboutSectionImages.watermark}
            points={[
              "Scalable growth opportunities",
              "Strong execution and performance",
              "Structured and reliable retail expansion",
            ]}
          />
        </div>
      </section> */}

      {/* Support Section */}
      {/* <section className="px-3 pb-6 sm:px-4 lg:px-6 lg:pb-10">
        <SupportFeatureSection
          title="How Can We Help You?"
          subtitle="From product questions to partnership opportunities, our team is here to support you every step."
          items={helpSupportData}
          columns={4}
        />
      </section> */}
      {/* Our Mission */}
      {/* <InfoSection data={ourMission} /> */}
      {/* Trending Now */}
      {/* {(trendingProducts.length > 0 || trendingLoading) && (
        <section className="w-container my-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-montserrat text-lg font-semibold text-[#2E2E2E] sm:text-xl">
              Trending Now
            </h2>
            <Link
              to="/trending-now"
              className="font-montserrat text-sm font-medium text-[#CE9F2D] underline-offset-4 hover:underline"
            >
              See all →
            </Link>
          </div>
          {trendingLoading && !trendingProducts.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-[12px] bg-[#F5ECDD]"
                />
              ))}
            </div>
          ) : (
            <div className="grid  grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={getProductId(product)}
                  product={product}
                  onAddToCart={addToCart}
                  onWishlist={toggleWishlist}
                  isWishlisted={isWishlisted(product)}
                />
              ))}
            </div>
          )}
        </section>
      )} */}

      {/* New Arrivals */}
      {/* {(featuredProducts.length > 0 || productLoading) && (
        <section className="my-8 ">
          <div className="my-6 flex items-center justify-between">
            <h2 className="font-montserrat text-lg font-semibold text-[#2E2E2E] sm:text-xl">
              New Arrivals
            </h2>
            <Link
              to="/new-arrivals"
              className="font-montserrat text-lg font-medium text-black "
            >
              View all →
            </Link>
          </div>
          {productLoading && !featuredProducts.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4]   animate-pulse rounded-[12px] bg-[#F5ECDD]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={getProductId(product)}
                  product={product}
                  onAddToCart={addToCart}
                  onWishlist={toggleWishlist}
                  isWishlisted={isWishlisted(product)}
                />
              ))}
            </div>
          )}
        </section>
      )} */}

      {/* Recently Viewed */}
      {/* {recent.length > 0 && (
        <section className="w-container my-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-montserrat text-lg font-semibold text-[#2E2E2E] sm:text-xl">
              Recently Viewed
            </h2>
            <Link to="/recently-viewed" className="font-montserrat text-sm font-medium text-[#CE9F2D]">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
                onAddToCart={addToCart}
                onWishlist={toggleWishlist}
                isWishlisted={isWishlisted(product)}
              />
            ))}
          </div>
        </section>
      )} */}
      {/* <OurStory data={ourStoryData} /> */}
      {/* <BrandCarousel /> */}
      {/* <WhyChooseSection data={whyChooseUsData} /> */}
      {/* <FAQPage /> */}
    </>
  );
}
