import ProductCard from "../../components/product/ProductCard";
import Seo from "../../components/common/Seo";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import InfoSection from "../../components/about/InfoSection";
import { ourMission } from "../../data/aboutUs";
import ProductDetailPage from "../../components/product/ProductDetail";
import FAQPage from "../faq/FAQPage";

import HomeShowcaseSections from "../../components/home/HomeShowcaseSections";
import MothersDaySwiper from "../../components/home/MothersDayCarousel";
import HomeProductsForYouSection from "../../components/home/HomeProductsForYouSection";
import { homeShowcaseSections, mothersDayData } from "../../data/homeSections";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";

export function HomePage() {
  const recent = getRecentlyViewed();
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  return (
    <>
      <Seo title="Sam Global | Shop smarter" />
      {/* About Us Page
      <OurStory data={ourStoryData} />
      <ValuesSection data={valueData} />
      <BrandCarousel />
      <WhyChooseSection data={whyChooseUsData} /> */}

      {/* Product Detail Page */}
      <ProductDetailPage />
      <HomeShowcaseSections sections={homeShowcaseSections} loading={false} />
      <InfoSection data={ourMission} />
      <MothersDaySwiper data={mothersDayData} />
      <HomeProductsForYouSection loading={false} />
      <FAQPage />

      {recent.length > 0 && (
        <>
          <h2>Recently viewed</h2>
          <div className="grid">
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
        </>
      )}
    </>
  );
}
