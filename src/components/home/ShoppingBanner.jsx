import { FaAngleRight } from "react-icons/fa6";
import { SolidLargeButton } from "../dynamicComponent/button/static";
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
      className={`relative h-[250px] my-16 full-banner sm:h-[350px] md:h-[450px] lg:h-[600px] w-full overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full py-8 sm:py-10 md:py-12 lg:py-[65px] px-6 sm:px-12 lg:px-[65px]  2xl:px-[180px]">
        <div className="max-w-[470px]">
          <h2 className=" text-[32px] font-bold leading-[100%] text-[#3E4093] sm:text-[40px] lg:text-[50px]">
            {title}
          </h2>

          <p className="mt-5 text-[14px] font-medium leading-[24px] text-[#2E2E2E] sm:text-[18px] sm:leading-[26px]">
            {description}
          </p>

          <SolidLargeButton
            to={ctaTo}
            rightIcon={<FaAngleRight className="text-[10px] sm:text-xs" />}
            className="mt-6 h-[40px] rounded-[8px] px-4 text-[12px] font-bold sm:mt-8 sm:h-[44px] sm:px-5 sm:text-[13px] md:h-[48px] md:px-6 md:text-[20px]"
          >
            {ctaLabel}
          </SolidLargeButton>
        </div>
      </div>
    </section>
  );
}
