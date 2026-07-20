import { useEffect, useMemo, useState } from "react";
import FAQAccordion from "./FAQAccordion";
import FAQSidebar from "./FAQSidebar";

export default function FAQContentSection({ faqs = [] }) {
  const topics = useMemo(
    () => [...new Set(faqs.map((faq) => faq.topic))],
    [faqs],
  );

  const [activeTopic, setActiveTopic] = useState("");

  useEffect(() => {
    if (topics.length && !activeTopic) {
      setActiveTopic(topics[0]);
    }
  }, [topics, activeTopic]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => faq.topic === activeTopic);
  }, [faqs, activeTopic]);

  return (
    <section className="pb-16">
      <div className="mx-auto grid w-full max-w-[1495px] grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
        <FAQSidebar
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
          topics={topics}
        />

        <FAQAccordion faqs={filteredFaqs} />
      </div>
    </section>
  );
}
