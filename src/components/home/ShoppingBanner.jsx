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
      className={`relative my-8 h-[220px] w-full overflow-hidden sm:my-10 sm:h-[300px] md:h-[420px] lg:my-16 lg:h-[520px] xl:h-[600px] full-banner ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full items-center px-4 py-5 min-[375px]:px-5 sm:px-8 md:px-12 lg:px-20 xl:px-[180px]">
        <div className="w-[66%] max-w-[470px] min-[375px]:w-[62%] sm:w-[58%] md:w-[54%] lg:w-[48%] xl:w-full">
          <h2 className="font-['DM_Sans'] text-[22px] font-bold leading-[110%] text-[#3E4093] min-[375px]:text-[24px] min-[425px]:text-[26px] sm:text-[34px] md:text-[42px] lg:text-[46px] xl:text-[50px]">
            {title}
          </h2>

          <p className="mt-2 text-[11px] font-medium leading-[16px] text-[#2E2E2E] min-[375px]:text-[12px] min-[375px]:leading-[17px] min-[425px]:text-[13px] min-[425px]:leading-[19px] sm:mt-3 sm:text-[15px] sm:leading-[23px] md:text-[16px] md:leading-[25px] lg:mt-5 lg:text-[17px] lg:leading-[26px] xl:text-[18px] xl:leading-[28px]">
            {description}
          </p>

          <SolidLargeButton
            to={ctaTo}
            rightIcon={<FaAngleRight className="text-[10px] sm:text-[14px]" />}
            className="mt-3 h-[34px] min-w-[100px] rounded-[8px] px-3 py-2 font-dmSans text-[11px] font-bold leading-none text-black min-[425px]:h-[38px] min-[425px]:min-w-[112px] min-[425px]:text-[12px] sm:mt-4 sm:h-[44px] sm:min-w-[130px] sm:px-5 sm:text-[14px] lg:mt-6 lg:h-[49px] lg:min-w-[150px] lg:px-[22px] lg:text-[18px]"
          >
            {ctaLabel}
          </SolidLargeButton>
        </div>
      </div>
    </section>
  );
}