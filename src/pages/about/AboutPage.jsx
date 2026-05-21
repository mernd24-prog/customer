import { useMemo } from "react";
import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";
import Seo from "../../components/common/Seo";
import AboutBanner from "../../components/about/AboutBanner";
import InfoSection from "../../components/about/InfoSection";
import OurStory from "../../components/about/OurStory";
import ValuesSection from "../../components/about/ValuesSection";
import BrandCarousel from "../../components/about/BrandSection";
import WhyChooseSection from "../../components/about/WhyChooseSection";

const asArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.cards)) return value.cards;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.logos)) return value.logos;
  return fallback;
};

export default function AboutPage() {

  // About Us Why Choose Us Data Fetch From the CMS API
  const { page: whyChoose } = useCmsRecord("why-choose-us");

  const apiData = whyChoose || {};

  const transformedData = useMemo(() => {
    if (apiData?.points && apiData?.points.length > 0) {
      return {
        sectionDetails: {
          heading: apiData?.title || "Why Choose Us ?",

          description:
            apiData?.description ||
            "Benefits customers value most.",
        },

        cards: apiData?.points.map((item) => ({
          title: item?.title || "",
          description: item?.description || "",
          image: item?.image || "",
        })),
      };
    }

    return {
      sectionDetails: {
        heading: "Why Choose Us ?",
        description: "",
      },

      cards: [],
    };
  }, [apiData]);

  const { page: cmsAboutPage } = useCmsRecord("home-about-sections");

  const sections =
    cmsAboutPage?.data?.sections ||
    cmsAboutPage?.sections ||
    [];

  const image = cmsAboutPage?.image ?? "/image/png/aboutBanner.png";

  const sectionMap = useMemo(() => {
    return sections.reduce((acc, section) => {
      const key = section?.title
        ?.toLowerCase()
        ?.replace(/\s+/g, "-");

      if (key) {
        acc[key] = section;
      }

      return acc;
    }, {});
  }, [sections]);
  const storySection = sectionMap["our-story"];
  const valuesSection = sectionMap["our-values"];
  const missionSection = sectionMap["our-mission"];
  const brandsSection = sectionMap["indian-brands"];

  const storyData = useMemo(
    () => ({
      heading:
        storySection?.title || "Our Story",

      description:
        storySection?.description || "",

      image:
        storySection?.image?.url || "",

      ctaText:
        storySection?.cta?.label || "",
    }),
    [storySection],
  );


  const valuesData = useMemo(
    () => ({
      sectionDetails: {
        heading:
          valuesSection?.title || "Our Values",

        description:
          valuesSection?.description || "",
      },

      cards: (valuesSection?.points || []).map(
        (item) => ({
          title: item?.title || "",
          description:
            item?.description || "",

          image:
            item?.image?.url || "",

          alt:
            item?.image?.alt || item?.title,
        }),
      ),
    }),
    [valuesSection],
  );

  const brandData = useMemo(
    () => ({
      sectionDetails: {
        heading:
          brandsSection?.title ||
          "Indian Brands",

        description:
          brandsSection?.description || "",
      },

      logos: (brandsSection?.points || []).map(
        (item) => ({
          image:
            item?.image?.url || "",

          alt:
            item?.image?.alt || "",
        }),
      ),
    }),
    [brandsSection],
  );

  const missionData = useMemo(
    () => ({
      title:
        missionSection?.title ||
        "Our Mission",

      description:
        missionSection?.description || "",

      image:
        missionSection?.image?.url || "",
    }),
    [missionSection],
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
          <InfoSection data={missionData} />
          <WhyChooseSection data={transformedData} />
        </div>
      </main>
    </>
  );
}
