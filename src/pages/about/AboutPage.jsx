import { useMemo } from "react";
import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";
import Seo from "../../components/common/Seo";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandCarousel";
import WhyChooseSection from "../../components/about/WhyChooseSection";

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
  const image = cmsData?.coverImage;

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
      heading: "Our Story",
      description: "",
      image: "",
      ctaText: "",
      ...aboutCmsData?.story,
      image:
        aboutCmsData?.story?.image ||
        aboutCmsData?.coverImage ||
        aboutCmsData?.image,
      description:
        aboutCmsData?.story?.description ||
        aboutCmsData?.description ||
        aboutCmsData?.body,
      heading:
        aboutCmsData?.story?.heading ||
        aboutCmsData?.heading ||
        aboutCmsData?.title,
      ctaText:
        aboutCmsData?.story?.ctaText ||
        aboutCmsData?.ctaText,
    }),
    [aboutCmsData],
  );

  const valuesData = useMemo(
    () => ({
      sectionDetails: { heading: "Our Values" },
      sectionDetails: {
        heading: aboutCmsData?.values?.heading || "Our Values",
      },
      cards: asArray(aboutCmsData?.values, []),
    }),
    [aboutCmsData],
  );

  const brandData = useMemo(
    () => ({
      sectionDetails: {
        heading: aboutCmsData?.brands?.heading || "Our Brand Network",
        description:
          aboutCmsData?.brands?.description || "",
      },
      logos: asArray(aboutCmsData?.brands, []),
    }),
    [aboutCmsData],
  );

  const missionData = useMemo(
    () => ({
      title: "Our Mission",
      description: "",
      image: "",
      ...aboutCmsData?.mission,
      image:
        aboutCmsData?.mission?.image ||
        aboutCmsData?.heroImage ||
        aboutCmsData?.galleryImages?.[0],
      title:
        aboutCmsData?.mission?.title ||
        aboutCmsData?.mission?.heading ||
        "Our Mission",
      description: aboutCmsData?.mission?.description || "",
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
