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

  return (
    <>
      <AboutBanner
        image={bannerSection?.image?.url ?? "/image/png/aboutBanner.png"}
      />

      <OurStory data={aboutSamGlobalSection} />
      <ValuesSection data={valuesSection} />
      <BrandCarousel data={brandSection} />
      <InfoSection data={missionSection} />
      <WhyChooseSection data={chooseSection} />
    </>
  );
}
