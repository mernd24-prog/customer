import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/product/ProductCard";
import Seo from "../../components/common/Seo";
import { useToastThunk } from "../../hooks/useToastThunk";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { updateCart } from "../../features/cart/cartSlice";
import ProductDetailPage from "../../components/product/ProductDetail";
import { addProductToCartPayload, wishlistPayload } from "./helpers";
import FAQPage from "../faq/FAQPage";
import HomeShowcaseSections from "../../components/home/HomeShowcaseSections";
import HomeProductsForYouSection from "../../components/home/HomeProductsForYouSection";
import MothersDayCarousel from "../../components/home/MothersDayCarousel";
import { homeShowcaseSections } from "../../data/homeSections";

export function HomePage() {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart.current);
  const run = useToastThunk();
  const recent = getRecentlyViewed();
  const isHomeLoading = false;

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
      {/* <OurStory data={ourStoryData} />
      <ValuesSection data={valueData} />
      <BrandCarousel />
      <WhyChooseSection data={whyChooseUsData} />
      <InfoSection data={ourMission} /> */}

      <ProductDetailPage />

      <HomeShowcaseSections
        sections={homeShowcaseSections}
        loading={isHomeLoading}
      />
      <MothersDayCarousel />

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
