import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import AboutBanner from "./components/AboutBanner";
import InfoSection from "./components/InfoSection";
import OurStory from "./components/OurStory";
import ValuesSection from "./components/ValuesSection";
import BrandCarousel from "./components/BrandSection";
import WhyChooseSection from "./components/WhyChooseSection";

export default function AboutPage() {
  const { page: bannerPage } = useCmsRecord("about-banner");
  const { page: storyPage } = useCmsRecord("about-sam-global");
  const { page: valuesPage } = useCmsRecord("our-values");
  const { page: brandsPage } = useCmsRecord("indian-brand");
  const { page: missionPage } = useCmsRecord("our-mission");
  const { page: choosePage } = useCmsRecord("why-choose-us");

  const bannerSection = bannerPage?.sections?.[0];
  const aboutSamGlobalSection = storyPage?.sections?.[0];
  const valuesSection = valuesPage?.sections?.[0];
  const brandSection = brandsPage?.sections?.[0];
  const missionSection = missionPage?.sections?.[0];
  const chooseSection = choosePage?.sections?.[0];
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      };

      // Fire once quickly for immediate response, and once later to correct layout shifts from loading images
      const t1 = setTimeout(scrollToElement, 100);
      const t2 = setTimeout(scrollToElement, 700);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [location.hash, location.key, aboutSamGlobalSection, valuesSection, chooseSection]);

  return (
    <>
      <AboutBanner
        image={bannerSection?.image?.url ?? "/image/png/aboutBanner.png"}
      />
      <div id="who-we-are" style={{ scrollMarginTop: "160px" }}>
        <OurStory data={aboutSamGlobalSection} />
      </div>
      <div id="our-values" style={{ scrollMarginTop: "160px" }}>
        <ValuesSection data={valuesSection} />
      </div>

      <BrandCarousel data={brandSection} />
      <InfoSection data={missionSection} />
      <div id="why-choose-us" style={{ scrollMarginTop: "160px" }}>
        <WhyChooseSection data={chooseSection} />
      </div>
    </>
  );
}
