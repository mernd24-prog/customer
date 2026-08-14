import { SolidLargeButton } from "../ui/button/static";
import defaultBannerImage from "/image/png/bannerFestival.png";

export default function ShoppingMadeEasyBanner({
  title = "Raksha Bandhan Special",
  description = "Celebrate the eternal bond of love with curated Rakhi gifts, sweet hampers, and festive treats.",
  ctaLabel = "Explore Rakhi Collection",
  ctaTo = "/products",
  backgroundImage = defaultBannerImage,
  className = "",
}) {
  return (
    <section
      className={`mt-8 md:mt-16 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[420px] min-[375px]:h-[440px] min-[425px]:h-[460px] md:h-[520px] lg:h-[450px] xl:h-[600px] w-screen items-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full w-full items-center justify-end px-6 md:px-12 lg:px-20 xl:px-[96px] 2xl:px-[180px]">
        <div className="w-full max-w-[320px] min-[375px]:max-w-[360px] md:max-w-[480px] lg:max-w-[580px] flex flex-col items-end text-right">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1B1D60] leading-tight drop-shadow-sm">
            {title}
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold text-[#2E2E2E] max-w-[480px] drop-shadow-xs">
            {description}
          </p>

          <SolidLargeButton
            to={ctaTo}
            className="mt-5 sm:mt-6 h-[44px] sm:h-[48px] lg:h-[52px] rounded-xl px-6 lg:px-8 font-bold text-white bg-[#CE9F2D] hover:bg-[#b88c22] shadow-lg transition-all"
          >
            {ctaLabel}
          </SolidLargeButton>
        </div>
      </div>
    </section>
  );
}
