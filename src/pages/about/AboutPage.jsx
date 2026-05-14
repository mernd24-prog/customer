import Seo from "../../components/common/Seo";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandCarousel";
import WhyChooseSection from "../../components/about/WhyChooseSection";
import {
  ourMission,
  ourStoryData,
  valueData,
  whyChooseUsData,
} from "../../data/aboutUs";

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Sam Global"
        description="Learn about Sam Global's mission, story, values, and retail approach."
      />

      <AboutBanner />

      <main className="w-full">
        <div>
          <OurStory data={ourStoryData} />
          <ValuesSection data={valueData} />
          <BrandCarousel />

          <InfoSection data={ourMission} />
          <WhyChooseSection data={whyChooseUsData} />
        </div>
      </main>
    </>
  );
}
