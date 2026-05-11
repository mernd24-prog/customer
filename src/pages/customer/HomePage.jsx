import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/product/ProductCard";
import Seo from "../../components/common/Seo";
import { useToastThunk } from "../../hooks/useToastThunk";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { updateCart } from "../../features/cart/cartSlice";
import { addProductToCartPayload, wishlistPayload } from "./helpers";
import InfoSection from "../../components/about/InfoSection";
import {
  ourMission,
  ourStoryData,
  valueData,
  whyChooseUsData,
} from "../../data/aboutUs";
import BrandCarousel from "../../components/about/BrandCarousel";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import WhyChooseSection from "../../components/about/WhyChooseSection";
import ProductDetailPage from "../../components/product/ProductDetail";
import {
  useFetch,
  itemsFrom,
  addProductToCartPayload,
  wishlistPayload,
} from "./helpers";
import FAQPage from "../faq/FAQPage"
import { productImages } from "../../constant/image.constant";
import { faqData } from "../../data/faqData";
import InfoSection from "../../components/ui/sections/InfoSection";


import CollageMainSection from "../../components/cards/collageCard";
import MothersDaySwiper from "../../components/swiper/mothersDaySwiper";
import HomeCategoryGrid from "../../components/home/HomeCategoryGrid";
import categories from "../../data/categories";
import { valueData } from "../../data/aboutSection";
import ValueCardSection from "../../components/ui/sections/valueCardSection";

export function HomePage() {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart.current);
  const run = useToastThunk();
  const recent = getRecentlyViewed();

  const addToCart = (product) =>
    run(
      dispatch,
      updateCart(addProductToCartPayload(cart, product)),
      "Added to cart",
    );
  const wishlist = (product) =>
    run(
      dispatch,
      updateCart(wishlistPayload(cart, product)),
      "Saved to wishlist",
    );

  return (
    <>
      <Seo title="Sam Global | Shop smarter" />

      {/* About Us Page */}
      {/* <OurStory data={ourStoryData} />
      <ValuesSection data={valueData} />
      <BrandCarousel />
      <WhyChooseSection data={whyChooseUsData} />
      <InfoSection data={ourMission} /> */}

      {/* Product Detail Page */}
      <ProductDetailPage />

      <HomeShowcaseSections
        sections={homeShowcaseSections}
        loading={isHomeLoading}
      />
      <InfoSection />
      <MothersDaySwiper />

      <HomeProductsForYouSection loading={isHomeLoading} />

      <FAQPage />
      
      {recent.length > 0 && (
        <>
          <h2>Recently viewed</h2>
          <div className="grid">
            {recent.map((product) => (
              <ProductCard
                key={product.id || product._id || product.productId}
                product={product}
                onAddToCart={addToCart}
                onWishlist={wishlist}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
