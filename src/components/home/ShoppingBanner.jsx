import { SolidLargeButton } from "../ui/button/static";
import defaultBannerImage from "/image/png/bannerFestival.png";

export default function ShoppingMadeEasyBanner({ className = "" }) {
  return (
    <section
      className={`mt-8 md:mt-16 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[420px] min-[375px]:h-[440px] min-[425px]:h-[460px] md:h-[520px] lg:h-[450px] xl:h-[600px] w-screen items-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `url("${defaultBannerImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full w-full items-center justify-end px-6 md:px-12 lg:px-20 xl:px-[96px] 2xl:px-[180px]">
        <div className="w-full max-w-[320px] min-[375px]:max-w-[360px] md:max-w-[480px] lg:max-w-[580px] flex flex-col items-end text-right">
          <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold text-[#1B1D60] leading-tight drop-shadow-sm">
            Navratri Special
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold text-[#2E2E2E] max-w-[480px]">
            Celebrate the vibrant spirit of Navratri with exquisite festive wear, traditional outfits, dandiya accessories, and special festive offers.
          </p>

          <SolidLargeButton
            to="/products"
            className="mt-5 sm:mt-6 h-[44px] sm:h-[48px] lg:h-[52px] rounded-xl px-6 lg:px-8 font-bold text-white bg-[#1B1D60] hover:bg-[#282C75] shadow-lg transition-all"
          >
            Explore Navratri Collection
          </SolidLargeButton>
        </div>
      </div>
    </section>
  );
}
