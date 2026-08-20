import { useCmsRecord } from "../../hooks/useCmsRecord";
import { SolidLargeButton } from "../ui/button/static";
import defaultBannerImage from "/image/png/bannerFestival.webp";

export default function ShoppingMadeEasyBanner({
  data,
  cmsPage,
  title,
  description,
  ctaLabel,
  ctaTo,
  ctaTarget,
  backgroundImage,
  className = "",
}) {
  const { page: fetchedCmsPage } = useCmsRecord("promotion_banner");
  const item = data || cmsPage || fetchedCmsPage;

  const bannerTitle =
    title ||
    item?.title ||
    item?.metadata?.data?.title ||
    "Raksha Bandhan Special";

  const bannerDescription =
    description ||
    item?.description ||
    item?.excerpt ||
    item?.metadata?.data?.description ||
    "Celebrate the eternal bond of love with curated Rakhi gifts, sweet hampers, and festive treats.";

  const bannerCtaLabel =
    ctaLabel || item?.cta?.label || "Explore Rakhi Collection";

  const bannerCtaTo =
    ctaTo ||
    (item?.cta?.url && item.cta.url.trim() !== "" ? item.cta.url : "/products");

  const bannerCtaTarget = ctaTarget || item?.cta?.target || "_self";

  const bannerImage =
    backgroundImage ||
    item?.heroImage ||
    item?.coverImage ||
    item?.image?.url ||
    item?.thumbnailUrl ||
    defaultBannerImage;

  let optimizedBannerImage = bannerImage;
  if (
    optimizedBannerImage?.includes("res.cloudinary.com") &&
    optimizedBannerImage?.includes("/upload/")
  ) {
    optimizedBannerImage = optimizedBannerImage.replace(
      /\/upload\/(v\d+\/)/,
      "/upload/f_auto,q_auto/$1",
    );
  }

  return (
    <section
      className={`mt-8 md:mt-16 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex h-[420px] min-[375px]:h-[440px] min-[425px]:h-[460px] md:h-[520px] lg:h-[450px] xl:h-[600px] w-screen items-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `url("${optimizedBannerImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full w-full items-center justify-end px-6 md:px-12 lg:px-20 xl:px-[96px] 2xl:px-[180px]">
        <div className="w-full max-w-[320px] min-[375px]:max-w-[360px] md:max-w-[480px] lg:max-w-[580px] flex flex-col items-end text-right">
          <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold text-[#1B1D60] leading-tight drop-shadow-sm">
            {bannerTitle}
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold text-[#2E2E2E] max-w-[480px] drop-shadow-xs">
            {bannerDescription}
          </p>

          <SolidLargeButton
            to={bannerCtaTo}
            target={bannerCtaTarget}
            rel={
              bannerCtaTarget === "_blank" ? "noopener noreferrer" : undefined
            }
            className="mt-5 sm:mt-6 h-[44px] sm:h-[48px] lg:h-[52px] rounded-xl px-6 lg:px-8 font-bold text-white bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] hover:bg-[linear-gradient(#bd9025,#bd9025)] shadow-lg transition-all"
          >
            {bannerCtaLabel}
          </SolidLargeButton>
        </div>
      </div>
    </section>
  );
}
