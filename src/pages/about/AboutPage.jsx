import { useMemo } from "react";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import Seo from "../../components/common/Seo";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandSection";
import WhyChooseSection from "../../components/about/WhyChooseSection";

const normalizeSectionType = (type = "") =>
  String(type).trim().toLowerCase().replace(/\s+/g, "-");

const getSectionByType = (sections, type) =>
  Array.isArray(sections)
    ? sections.find((section) => normalizeSectionType(section?.type) === type)
    : null;

export default function AboutPage() {
  const { page: cmsAboutPage } = useCmsRecord("about-us-details");

  const sections = cmsAboutPage?.data?.sections || cmsAboutPage?.sections || [];

  const bannerSection = getSectionByType(sections, "about-banner");
  const aboutSamGlobalSection = getSectionByType(sections, "about-sam-global");
  const valuesSection = getSectionByType(sections, "our-values");
  const brandSection = getSectionByType(sections, "indian-brand");
  const missionSection = getSectionByType(sections, "our-mission");
  const chooseSection = getSectionByType(sections, "why-choose-us");

  return (
    <>
      {/* <Seo title={pageTitle} description={pageDescription} /> */}

      <AboutBanner image={bannerSection?.image?.url} />

      <main className="w-full">
        <div>
          <div id="who-we-are" className="scroll-mt-28">
            <OurStory data={aboutSamGlobalSection} />
          </div>
          <div id="our-values" className="scroll-mt-20">
            <ValuesSection data={valuesSection} />
          </div>

          <BrandCarousel data={brandSection} />
          <InfoSection data={missionSection} />
          <div id="why-choose-us" className="scroll-mt-34">
            <WhyChooseSection data={chooseSection} />
          </div>
        </div>
      </main>
    </>
  );
}
