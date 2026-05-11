import FAQContentSection from "../../components/faq/FAQContentSection";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import FAQSearchSection from "../../components/faq/FAQSearchBar";
import NeedHelpSection from "../../components/faq/NeedHelpSection";

export default function FAQPage() {
  return (
    <>
    
      <FAQHeroSection />
      <h1 className="text-3xl font-bold text-center mt-10">FAQ’s</h1>
      <FAQSearchSection/>
      <FAQContentSection />
      <NeedHelpSection
        heading1="Need More Help?"
        heading2="We’re here for you."
        description="Get the help you need from our automated assistant, or contact an agent"
        buttonText="Contact Us"
      />
    </>
  );
}