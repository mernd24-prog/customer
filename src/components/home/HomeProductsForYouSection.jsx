import ProductsForYouCard from "../ui/ProductsForYouCard";
import productsForYou from "../../data/productsForYou";
import SupportFeatureSection from "../ui/SupportFeatureSection";
import { helpSupportData } from "../../data/helpSupport";
import CommitmentCard from "../ui/CommitmentCard";
import { aboutSectionImages } from "../../constant/image.constant";

export default function HomeProductsForYouSection({
  loading = false,
}) {
  const list = loading
    ? Array.from({ length: 12 })
    : productsForYou;

  return (
    <>
      {/* Products Section */}
      <section className="mt-6 rounded-[12px] bg-[#F7F6F500] px-3 py-4 sm:mt-8 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        
        {/* Heading */}
        <h2 className="text-center font-montserrat text-[18px] font-semibold text-[#2E2E2E] sm:text-[20px] md:text-[22px] lg:text-[24px]">
          Products For You
        </h2>

        {/* Products Grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
          {loading
            ? list.map((_, index) => (
                <ProductsForYouCard
                  key={`skeleton-${index}`}
                  loading
                />
              ))
            : list.map((item) => (
                <ProductsForYouCard
                  key={item.id}
                  {...item}
                  variant=""
                  link={`/product/${item.id}`}
                />
              ))}
        </div>
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

          {/* Partner Card */}
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