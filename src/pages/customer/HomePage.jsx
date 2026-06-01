import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import CollageMainSection from "../../components/ui/CollageCard";
import ShowcaseSection from "../../components/home/ShowcaseSection";
import TopDealCard from "../../components/ui/TopDealCard";
import NewArrivalCard from "../../components/ui/NewArrivalCard";
import { reusableArrivalsDemo, reusableTopDealsDemo } from "../../data/topdeal";

export function HomePage() {
  const dispatch = useDispatch();
  const cmsPages = useSelector((s) => s.cms.list);
  const categoryList = useSelector((s) => s.catalog.list);
  const categories = Array.isArray(categoryList) ? categoryList : [];

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

      <HomeCategoryGrid
        categories={categories?.slice(7, 12)}
        loading={false}
        title="Time for a spring refresh"
      />
      <CollageMainSection />

      <section className=" my-10">
        <ShowcaseSection
          title="Top Deals"
          subtitle="Score the lowest prices on samglobal.com"
          headerbgColor="bg-[#C9C9DB]"
          bodybgColor="bg-[#F3F3FA]"
          gridClassName="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4"
          items={reusableTopDealsDemo}
          CardComponent={TopDealCard}
        />

        <ShowcaseSection
          title="New Arrivals"
          subtitle="Navigate trends with data-driven rankings"
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

      <MothersDaySwiper data={cmsBannerSlides} />

      <div className="mt-16">
        <HomeProductsForYouSection />
      </div>

      {/* <div className="m-14">
        <h2 className="text-3xl font-bold">All varities of the Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <PrimaryGradientButton>Primary Button</PrimaryGradientButton>

          <RegisterButton>Register</RegisterButton>
          <RoundIconWithBg />

          <ButtonWithIcon icon={<FaRegHeart />}>Shop Nowssss</ButtonWithIcon>
          <PriceButton currentPrice="₹1,499" originalPrice="₹1,499" />
        </div>
      </div> */}

      {/* GLOBAL CARD EXAMPLES */}
      <div className=" ">
        <div className="flex flex-wrap items-start gap-6">
          {/* <ProductCard
            title="Lace & Beads long sleeve ruffle hem maxi dress in white polka dot"
            rating={4}
            price="₹ 993.00"
            originalPrice="₹ 1199.00"
            images={[{ src: "/image/png/jacket.png" }]}
            customWidth="260px"
            onWishlist={() => alert("Added to wishlist!")}
            onAddToCart={() => alert("Added to cart!")}
          /> */}

          {/* <CategoryPriceCard
            category="Men's Wear"
            price="₹ 993.00"
            originalPrice="₹ 1199.00"
            images={[{ src: "/image/jpg/home-decor.jpg" }]}
            customWidth="260px"
          /> */}

        
          {/* <DealGridCard
            badge="March"
            title="Trendy Outfits for Men & Women"
            subtitle="66K+ Views"
            images={[
              {
                src: "/image/png/blazer.png",
                price: "₹ 993.00",
                originalPrice: "₹ 1199.00",
              },
              {
                src: "/image/png/men-fashion.png",
                price: "₹ 993.00",
                originalPrice: "₹ 1199.00",
              },
            ]}
            customWidth="460px"
          /> */}

{/*          
          <FourGridCard
            title="Trending in Women's Fashion"
            images={[
              { src: "/image/png/blazer.png" },
              { src: "/image/png/maxi.png" },
              { src: "/image/png/jacket.png" },
              { src: "/image/png/men-fashion.png" },
            ]}
            customWidth="260px"
          /> */}

          {/* <CategoryCard
            category="Women's Fashion"
            images={[{ src: "/image/png/jacket.png" }]}
            customWidth="180px"
          /> */}
        </div>
      </div>
    </>
  );
}
