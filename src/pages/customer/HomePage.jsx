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
import Banner from "../../components/layout/HeroBanner";
import CollageMainSection from "../../components/ui/CollageCard";
import NeedHelpSection from "../../components/faq/NeedHelpSection";
// import FashionMegaMenu from "../../components/category/FashionMegaMenu";

export function HomePage() {
  const dispatch = useDispatch();

  const cmsPages = useSelector((s) => s.cms.list);
  const categoryList = useSelector((s) => s.catalog.list);
  const categories = Array.isArray(categoryList) ? categoryList : [];
  const homeCategories = useMemo(() => {
    if (!categories.length) return [];

    const roots = categories.filter(
      (item) => !item?.parentKey || Number(item?.level ?? 0) === 0,
    );
    const source = roots.length ? roots : categories;

    return source
      .filter((item) => item?.title || item?.name)
      .slice(0, 5)
      .map((item) => ({
        id: item?.id || item?._id || item?.categoryKey || item?.key,
        categoryKey: item?.categoryKey || item?.key,
        title: item?.title || item?.name,
        imageUrl: item?.imageUrl || item?.image || item?.iconUrl || "/image/png/Home.png",
      }));
  }, [categories]);
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
    if (!categories.length) {
      dispatch(fetchCategories({ tree: true, active: true, maxDepth: 3 })).catch(() => {});
    }
    dispatch(fetchProducts({ limit: 8, page: 1, sort: "newest" })).catch(
      () => {},
    );
    dispatch(fetchCmsPages({ limit: 100 })).catch(() => {});
  }, [categories.length, dispatch]);

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
      <HomeCategoryGrid categories={homeCategories} loading={false} />
      <CollageMainSection cmsPages={cmsPages} />

      <NeedHelpSection
        heading1="Shopping Made Easy"
        heading2=""
        description="Enjoy reliablity ,secure dileveries and hassle free returns. Shop with confidence at Sam Global."
        buttonText="Contact Us"
      />

      {/* Seasonal swiper */}
      <MothersDaySwiper
        data={cmsBannerSlides}
      />
      {/* Products For You + Our Commitment */}
      <div className="w-container">
        <HomeProductsForYouSection />
      </div>
    </>
  );
}
