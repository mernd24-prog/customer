import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandSection";
import WhyChooseSection from "../../components/about/WhyChooseSection";

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
      const timeoutId = setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, aboutSamGlobalSection, valuesSection, chooseSection]);

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
