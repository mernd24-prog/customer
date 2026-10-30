import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";
import FallbackImage from "../../../components/ui/FallbackImage";
import { BannerActionButton } from "../../../components/ui/button/static";

export default function AboutBanner({ image, data }) {
  const fallbackImage = FALLBACK_ABOUT.banner.image;
  const banner = data || FALLBACK_ABOUT.banner;

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-[#eae0d5]">
      <div className="relative h-[300px] w-full sm:h-[380px] md:h-[470px] lg:h-[560px] xl:h-[640px]">
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

        <div className="absolute inset-0 bg-gradient-to-r from-[#00000030] via-[#00000010] to-[#00000020]" />

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="customer-container flex w-full justify-center">
            <div className="w-full max-w-[980px] rounded-lg  px-5 py-6 text-center shadow-[0_30px_80px_rgba(34,27,17,0.18)] backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-11">
              {/* {banner?.badge && (
                <span className="mb-4 inline-block rounded-lg border border-white/60 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-xs">
                  {banner.badge}
                </span>
              )} */}

              {banner?.title && (
                <h1 className="text-white text-6xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold">
                  {banner.title}
                </h1>
              )}
 
              {banner?.description && (
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base lg:text-lg">
                  {banner.description}
                </p>
              )}
  
              {banner?.cta?.label && (
                <BannerActionButton
                  as="a"
                  href={banner.cta.href || "#who-we-are"}
                >
                  {banner.cta.label}
                </BannerActionButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
