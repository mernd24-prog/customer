import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";
import defaultBannerImage from "/image/png/ShoppingBanner.png";

export default function ShoppingMadeEasyBanner({
  title = "Shopping Made Easy",
  description = "Enjoy seamless shopping with reliable delivery, secure payments, and hassle-free returns.",
  ctaLabel = "Shop Now",
  ctaTo = "/products",
  backgroundImage = defaultBannerImage,
  className = "",
}) {
  return (
    <section
       className={`relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[600px] w-full overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full py-8 sm:py-10 md:py-12 lg:py-[65px] px-6 sm:px-12 lg:px-[180px]">
        <div className="max-w-[470px]">
          <h2 className="font-['DM_Sans'] text-[32px] font-bold leading-[100%] text-[#3E4093] sm:text-[40px] lg:text-[51px]">
            {title}
          </h2>

          <p className="mt-5 text-[14px] font-normal leading-[24px] text-[#2E2E2E] sm:text-[16px] sm:leading-[26px]">
            {description}
          </p>

          <Link
            to={ctaTo}
            className="mt-8 inline-flex h-[48px] items-center gap-2 rounded-[8px] bg-[#CE9F2D] px-6 text-[14px] font-bold text-black transition-colors hover:bg-[#bd9025]"
          >
            {ctaLabel}
            <FaAngleRight className="text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
}