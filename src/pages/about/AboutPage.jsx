import { useMemo } from "react";
import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";
import Seo from "../../components/common/Seo";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandSection";
import WhyChooseSection from "../../components/about/WhyChooseSection";
import {
  brandSwiperData,
  ourMission,
  ourStoryData,
  valueData,
} from "../../data/aboutUs";

const asArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.cards)) return value.cards;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.logos)) return value.logos;
  return fallback;
};

export default function AboutPage() {
  // About Us Banner Data Fetch from the CMS API
  const { page: cmsData } = useCmsRecord("about-us");
  const image = cmsData?.coverImage ?? "/image/png/aboutBanner.png";

  // About Us Why Choose Us Data Fetch From the CMS API
  const { page: whyChoose } = useCmsRecord("why-choose-us");
  const apiData = whyChoose?.metadata?.data;

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

  const { page: cmsAboutPage } = useCmsRecord("home-about-sections");
  const aboutCmsData = useMemo(
    () => getCmsPayload(cmsAboutPage, null),
    [cmsAboutPage],
  );

  const storyData = useMemo(
    () => ({
      ...ourStoryData,
      ...aboutCmsData?.story,
      image:
        aboutCmsData?.story?.image ||
        aboutCmsData?.coverImage ||
        aboutCmsData?.image ||
        ourStoryData.image,
      description:
        aboutCmsData?.story?.description ||
        aboutCmsData?.description ||
        aboutCmsData?.body ||
        ourStoryData.description,
      heading:
        aboutCmsData?.story?.heading ||
        aboutCmsData?.heading ||
        aboutCmsData?.title ||
        ourStoryData.heading,
      ctaText:
        aboutCmsData?.story?.ctaText ||
        aboutCmsData?.ctaText ||
        ourStoryData.ctaText,
    }),
    [aboutCmsData],
  );

  const valuesData = useMemo(
    () => ({
      ...valueData,
      sectionDetails: {
        heading:
          aboutCmsData?.values?.heading || valueData.sectionDetails.heading,
      },
      cards: asArray(aboutCmsData?.values, valueData.cards),
    }),
    [aboutCmsData],
  );

  const brandData = useMemo(
    () => ({
      ...brandSwiperData,
      sectionDetails: {
        heading:
          aboutCmsData?.brands?.heading ||
          brandSwiperData.sectionDetails.heading,
        description:
          aboutCmsData?.brands?.description ||
          brandSwiperData.sectionDetails.description,
      },
      logos: asArray(aboutCmsData?.brands, brandSwiperData.logos),
    }),
    [aboutCmsData],
  );

  const missionData = useMemo(
    () => ({
      ...ourMission,
      ...aboutCmsData?.mission,
      image:
        aboutCmsData?.mission?.image ||
        aboutCmsData?.heroImage ||
        aboutCmsData?.galleryImages?.[0] ||
        ourMission.image,
      title:
        aboutCmsData?.mission?.title ||
        aboutCmsData?.mission?.heading ||
        ourMission.title,
      description: aboutCmsData?.mission?.description || ourMission.description,
    }),
    [aboutCmsData],
  );

  const pageTitle =
    cmsAboutPage?.metadata?.seoTitle ||
    cmsAboutPage?.title ||
    "About Sam Global";
  const pageDescription =
    cmsAboutPage?.metadata?.seoDescription ||
    cmsAboutPage?.excerpt ||
    storyData?.description ||
    "Learn about Sam Global's mission, story, values, and retail approach.";

  return (
    <>
      <Seo title={pageTitle} description={pageDescription} />

      <AboutBanner image={image} />

      <main className="w-full">
        <div>
          <OurStory data={storyData} />
          <ValuesSection data={valuesData} />
          <BrandCarousel data={brandData} />
          <WhyChooseSection data={(transformedData && transformedData) || {}} />
          <InfoSection data={missionData} />
        </div>
      </main>
    </>
  );
}
