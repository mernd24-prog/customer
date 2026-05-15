import { useEffect, useState } from "react";
import { faqData } from "../../data/faqData";
import FAQAccordion from "./FAQAccordion";
import FAQSidebar from "./FAQSidebar";

const getTopics = (faqs) => {
  const topics = faqs
    .map((faq) => faq?.topic)
    .filter(Boolean);
  return [...new Set(topics)];
};

export default function FAQContentSection({ faqs = faqData }) {
  const topics = getTopics(faqs);
  const firstTopic = topics[0] || "FAQ'S";
  const [activeTopic, setActiveTopic] = useState(firstTopic);

  useEffect(() => {
    if (!topics.includes(activeTopic)) {
      setActiveTopic(firstTopic);
    }
  }, [activeTopic, firstTopic, topics]);

  const filteredFaqs = faqs.filter(
    (faq) => faq.topic === activeTopic
  );

  return (
    <section className="pb-16">
      <div className="mx-auto grid w-full max-w-[1495px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[250px_1fr]">

        <FAQSidebar
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
          topics={topics.length ? topics : undefined}
        />

        <FAQAccordion faqs={filteredFaqs} />

      </div>
    </section>
  );
}