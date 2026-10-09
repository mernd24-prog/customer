import { FALLBACK_ABOUT } from "../../../data/fallbackCmsData";

export default function AboutBanner({ image }) {
const fallbackImage = FALLBACK_ABOUT.banner.image;
const bannerImage = image || fallbackImage;

return ( <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden"> <div className="relative h-[250px] w-full sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px]">
<img
loading="eager"
fetchPriority="high"
width="1920"
height="650"
src={bannerImage}
alt="About Sam Global"
className="h-full w-full object-cover"
onError={(event) => {
const img = event.currentTarget;


        if (img.src !== new URL(fallbackImage, window.location.origin).href) {
          img.src = fallbackImage;
        }
      }}
    />
  </div>
</section>


);
}
