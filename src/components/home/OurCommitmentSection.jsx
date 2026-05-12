import CommitmentCard from "../ui/CommitmentCard";

export default function OurCommitmentSection() {
    return (
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
                    watermarkImage="aboutSectionImages.watermark"
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
                    watermarkImage="aboutSectionImages.watermark"
                    points={[
                        "Scalable growth opportunities",
                        "Strong execution and performance",
                        "Structured and reliable retail expansion",
                    ]}
                />
            </div>
        </section>
    );
}
