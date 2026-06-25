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
      className={`mt-8 md:mt-16 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[420px] min-[375px]:h-[440px] min-[425px]:h-[460px] md:h-[520px] lg:h-[500px] xl:h-[600px] w-screen items-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full w-full items-start px-4 py-6 min-[375px]:px-5 min-[425px]:px-6 md:px-10 lg:px-16 xl:px-[64px] 2xl:px-[180px]">
        <div className="w-full max-w-[240px] min-[375px]:max-w-[280px]  lg:mt-12 min-[425px]:max-w-[320px] md:max-w-[430px] lg:max-w-[520px] xl:max-w-[620px]">
          <h2 className="font-['DM_Sans'] text-[20px] font-bold  text-[#3E4093] min-[375px]:text-[24px] min-[425px]:text-[28px] md:text-[44px] lg:text-[52px]">
            {title}
          </h2>

          <p className="mt-3 max-w-[220px] text-[12px] leading-[1.5] text-[#2E2E2E] min-[375px]:max-w-[250px] min-[375px]:text-[14px] min-[425px]:max-w-[290px] min-[425px]:text-[13px] md:mt-4 md:max-w-[380px] md:text-[18px] lg:my-6 lg:max-w-[470px] lg:text-lg xl:max-w-[560px]">
            {description}
          </p>

          <SolidLargeButton
            to={ctaTo}
            className="mt-5 h-[40px] min-w-[120px] rounded-[10px] px-4 py-2  text-[14px] font-smibold leading-none text-black min-[425px]:h-[44px] min-[425px]:min-w-[132px] min-[425px]:text-[15px] md:mt-6 md:h-[52px]  md:px-6 md:text-[18px] lg:h-[50px] md:min-w-[140px] lg:px-8 lg:text-[20px]"
          >
            {ctaLabel}
          </SolidLargeButton>
        </div>
      </div>
    </section>
  );
}
