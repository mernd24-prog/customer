
import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";
import FallbackImage from "../../../components/ui/FallbackImage";
import { BannerActionButton } from "../../../components/ui/button/static";

export default function AboutBanner({ image, data }) {
  const fallbackImage = FALLBACK_ABOUT.banner.image;
  const banner = data || FALLBACK_ABOUT.banner;

  return (
    <section className="relative left-1/2 -ml-[50vw] w-screen overflow-hidden bg-[#eae0d5]">
      <div className="relative h-[280px] w-full sm:h-[360px] md:h-[440px] lg:h-[540px] xl:h-[620px]">
        <FallbackImage
          src={image || banner?.image}
          fallbackSrc={fallbackImage}
          alt={banner?.title || "About Sam Global"}
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="650"
          className="h-full w-full object-cover saturate-[0.85] brightness-[0.8]"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/30" />

        {/* Banner Content */}
        <div className="absolute inset-0 flex items-center justify-center px-4 py-6 sm:px-6 md:px-8">
          <div className="customer-container flex w-full justify-center">
            <div className="w-full max-w-[850px] px-2 py-4 text-center sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">

              {banner?.title && (
                <h1 className="mx-auto max-w-[750px] text-balance text-2xl leading-tight font-extrabold text-white sm:text-3xl sm:leading-tight md:text-4xl lg:text-5xl xl:text-6xl">
                  {banner.title}
                </h1>
              )}

              {banner?.description && (
                <p className="mx-auto mt-3 max-w-[600px] text-pretty text-xs leading-relaxed font-normal text-white/90 sm:mt-4 sm:text-sm sm:leading-6 md:text-base md:leading-7 lg:mt-5 lg:text-lg lg:leading-8">
                  {banner.description}
                </p>
              )}

              {banner?.cta?.label && (
                <div className="mt-4 sm:mt-5 md:mt-7">
                  <BannerActionButton
                    as="a"
                    href={banner.cta.href || "#who-we-are"}
                  >
                    {banner.cta.label}
                  </BannerActionButton>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
