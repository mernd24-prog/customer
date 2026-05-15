import Seo from "../../components/common/Seo";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandCarousel";
import WhyChooseSection from "../../components/about/WhyChooseSection";
import { getCmsImageSet, useCmsRecord } from "../../hooks/useCmsRecord";
import { ourMission, ourStoryData, valueData } from "../../data/aboutUs";
import { useMemo } from "react";

export default function AboutPage() {
  // About Us Banner Data Fetch from the CMS API
  const { page: cmsData, loading } = useCmsRecord("about-us");
  const image = cmsData?.coverImage;

  // About Us Why Choose Us Data Fetch From the CMS API
  const { page: whyChoose } = useCmsRecord("why-choose-us");
  const apiData = whyChoose?.metadata?.data;
  console.log(apiData);

  const transformedData = useMemo(() => {
    if (apiData?.items && apiData?.items.length > 0) {
      return {
        sectionDetails: {
          heading:
            apiData?.title && apiData?.title !== ""
              ? apiData.title
              : "Why Choose Us ?",
          description: apiData?.description,
        },
        cards: apiData?.items.map((item) => ({
          title: item?.title,
          description: item?.description,
          icon: "",
        })),
      };
    }
  }, [apiData]);

  console.log("Transformed Why Choose Data:", transformedData);

  return (
    <>
      <Seo
        title="About Sam Global"
        description="Learn about Sam Global's mission, story, values, and retail approach."
      />

      <AboutBanner image={image} />

      <main className="w-full">
        <div>
          <OurStory data={ourStoryData} />
          <ValuesSection data={valueData} />
          <BrandCarousel />

          <InfoSection data={ourMission} />
          <WhyChooseSection data={(transformedData && transformedData) || {}} />
        </div>
      </main>
    </>
  );
}
