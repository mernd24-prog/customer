import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import Seo from "../../components/ui/Seo";
import AboutBanner from "./components/AboutBanner";
import InfoSection from "./components/InfoSection";
import OurStory from "./components/OurStory";
import ValuesSection from "./components/ValuesSection";
import BrandCarousel from "./components/BrandSection";
import WhyChooseSection from "./components/WhyChooseSection";

const FALLBACK_ABOUT = {
  bannerImage: "/image/png/fallback/sellerPolicy.webp",
  story: {
    description:
      "Sam Global is built on years of retail and distribution experience, with a clear focus on disciplined execution, customer trust, and sustainable growth across India.",
    image: { url: "/image/png/fallback/become-a-seller/outStory.png", alt: "Sam Global story" },
  },
  values: {
    title: "Our Values",
    points: [
      { title: "Execution Excellence", description: "Every customer interaction and process is driven by performance and discipline.", image: { url: "/image/png/fallback/icons/excellence.png" } },
      { title: "Customer First", description: "We focus on consistent, high-quality retail experiences for Indian consumers.", image: { url: "/image/png/fallback/icons/customer.png" } },
      { title: "Scalable Growth", description: "We build systems that support sustainable long-term expansion.", image: { url: "/image/png/fallback/icons/growth.png" } },
    ],
  },
  brands: {
    title: "Indian Brands",
    description: "Experience Across Leading Global Brands",
    points: ["zara", "gq", "lacoste", "gucci", "prada", "vogue"].map((brand) => ({
      title: brand.toUpperCase(),
      image: { url: `/image/png/fallback/brands/${brand}.png` },
    })),
  },
  mission: {
    title: "Our Mission",
    description: "Our mission is to build a trusted digital marketplace where customers can shop with clarity and sellers can grow with confidence. </br> </br> We aim to make quality products more accessible through dependable technology, transparent service, and a customer-first approach.",
    image: { url: "/image/png/fallback/become-a-seller/hand.png", alt: "Our mission" },
  },
  whyChoose: {
    title: "Why Choose Us",
    description: "A strong retail partner focused on execution, growth, and long-term success.",
    points: [
      { title: "Global Brand Experience", description: "Retail expertise shaped by leading global brands.", image: { url: "/image/png/fallback/icons/dummy.png" } },
      { title: "Financial Discipline", description: "Strong governance and structured planning.", image: { url: "/image/png/fallback/icons/dummy1.png" } },
      { title: "Strong Retail Execution", description: "Disciplined operations that drive consistency.", image: { url: "/image/png/fallback/icons/dummy2.png" } },
      { title: "Structured Expansion", description: "Scalable systems for multi-city growth.", image: { url: "/image/png/fallback/icons/dummy3.png" } },
      { title: "Consumer Understanding", description: "Deep insight into customer needs and choices.", image: { url: "/image/png/fallback/icons/dummy4.png" } },
      { title: "Long-Term Partnerships", description: "Built for trusted and sustainable collaboration.", image: { url: "/image/png/fallback/icons/dummy5.png" } },
    ],
  },
};

export default function AboutPage() {
  const { page: bannerPage } = useCmsRecord("about-banner");
  const { page: storyPage } = useCmsRecord("about-sam-global");
  const { page: valuesPage } = useCmsRecord("our-values");
  const { page: brandsPage } = useCmsRecord("indian-brand");
  const { page: missionPage } = useCmsRecord("our-mission");
  const { page: choosePage } = useCmsRecord("why-choose-us");

  const bannerSection = bannerPage?.sections?.[0];
  const aboutSamGlobalSection = storyPage?.sections?.[0] || FALLBACK_ABOUT.story;
  const valuesSection = valuesPage?.sections?.[0] || FALLBACK_ABOUT.values;
  const brandSection = brandsPage?.sections?.[0] || FALLBACK_ABOUT.brands;
  const missionSection = missionPage?.sections?.[0] || FALLBACK_ABOUT.mission;
  const chooseSection = choosePage?.sections?.[0] || FALLBACK_ABOUT.whyChoose;
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
      <Seo 
        title="About Us - Sam Global" 
        metaDescription="Learn more about Sam Global, our story, our values, and our mission." 
      />
      <AboutBanner
        image={bannerSection?.image?.url ?? FALLBACK_ABOUT.bannerImage}
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
