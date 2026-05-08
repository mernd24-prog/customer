import { useState } from "react";
import { faqData } from "../../data/faqData";
import FAQAccordion from "./FAQAccordion";
import FAQSidebar from "./FAQSidebar";

export default function FAQContentSection() {

  const [activeTopic, setActiveTopic] = useState("FAQ'S");

  const filteredFaqs = faqData.filter(
    (faq) => faq.topic === activeTopic
  );

  return (
    <section className="pb-16">
      <div className="mx-auto grid w-full max-w-[1495px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[250px_1fr]">

        <FAQSidebar
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
        />

        <FAQAccordion faqs={filteredFaqs} />

      </div>
    </section>
  );
}