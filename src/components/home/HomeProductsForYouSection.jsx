import ProductsForYouCard from "../ui/ProductsForYouCard";
import productsForYou from "../../data/productsForYou";
import SupportFeatureSection from "../ui/SupportFeatureSection";
import { helpSupportData } from "../../data/helpSupport";
import CommitmentCard from "../ui/CommitmentCard";
<<<<<<< HEAD
=======
import { commitmentData } from "../../data/commitment";
import { aboutSectionImages } from "../../constant/image.constant";
>>>>>>> origin/mahima-dev

export default function HomeProductsForYouSection({ loading = false }) {
  const list = loading ? Array.from({ length: 12 }) : productsForYou;

    return (
        <>
            <section className="mt-8 rounded-[10px]  bg-[#F7F6F500] p-5 sm:p-4 lg:p-6">
                <h2 className="text-center font-montserrat text-[16px] font-semibold text-[#2E2E2E] sm:text-[18px]">
                    Products For You
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-4  md:grid-cols-3 lg:grid-cols-4">
                    {loading
                        ? list.map((_, index) => (
                            <ProductsForYouCard key={`skeleton-${index}`} loading />
                        ))
                        : list.map((item) => (
                            <ProductsForYouCard key={item.id} {...item} variant="list" link={`/product/${item.id}`} />
                        ))}
                </div>
            </section>

            <section className="mt-8 bg-transparent px-4 py-6 lg:px-6">
            {/* Heading */}
            <h2 className="mb-8 text-center font-montserrat text-[28px] font-bold leading-[40px] text-[#2E2E2E] sm:text-[29px] ">
                Our Commitment
            </h2>

            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 ">
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
        
            <section>
                <SupportFeatureSection
                    title="How Can We Help You?"
                    subtitle="From product questions to partnership opportunities, our team is here to support you every step."
                    items={helpSupportData}
                    columns={4}
                />
            </section></>

    );
}

//         
