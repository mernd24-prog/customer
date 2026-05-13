import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../product/ProductCard";
import ProductsForYouCard from "../ui/ProductsForYouCard";
import SupportFeatureSection from "../ui/SupportFeatureSection";
import { helpSupportData } from "../../data/helpSupport";
import CommitmentCard from "../ui/CommitmentCard";
import { aboutSectionImages } from "../../constant/image.constant";
import { useProductActions } from "../../hooks/useProductActions";
import { getProductId } from "../../utils/ecommerce";

export default function HomeProductsForYouSection() {
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const recommendationList = useSelector((s) => s.recommendation.list);
  const loading = useSelector((s) => s.recommendation.loading);

  const products = Array.isArray(recommendationList) ? recommendationList.slice(0, 8) : [];

  return (
    <>
      <section className="mt-8 rounded-[10px] bg-[#F7F6F500] p-5 sm:p-4 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-montserrat text-[16px] font-semibold text-[#2E2E2E] sm:text-[18px]">
            Products For You
          </h2>
          <Link to="/products" className="text-sm font-medium text-[#d4a437] underline-offset-4 hover:underline">
            See all →
          </Link>
        </div>

        {loading && !products.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductsForYouCard key={i} loading />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
                onAddToCart={addToCart}
                onWishlist={toggleWishlist}
                isWishlisted={isWishlisted(product)}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* Commitment Section */}
      <section className="mt-8 px-3 py-5 sm:px-4 sm:py-6 lg:mt-10 lg:px-6 lg:py-8">
        
        {/* Heading */}
        <h2 className="mb-6 text-center font-montserrat text-[22px] font-bold leading-tight text-[#2E2E2E] sm:text-[26px] md:text-[30px] lg:mb-8 lg:text-[34px]">
          Our Commitment
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          
          {/* Customer Card */}
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
      </section>

      {/* Support Section */}
      <section className="px-3 pb-6 sm:px-4 lg:px-6 lg:pb-10">
        <SupportFeatureSection
          title="How Can We Help You?"
          subtitle="From product questions to partnership opportunities, our team is here to support you every step."
          items={helpSupportData}
          columns={4}
        />
      </section>
    </>
  );
}
