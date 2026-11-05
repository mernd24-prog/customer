import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };


  return (
    <section className="w-full">
      <div className="w-full space-y-3">
        {faqs.length > 0 ? (
          faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-md bg-navy-soft mb-4"
              >
                {/* Question */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors duration-300 ease-in-out"
                >
                  <span className=" text-[15px] font-medium text-ink md:text-[16px]">
                    {faq.question}
                  </span>

                  <span
                    className={`
                      flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-in-out
                      ${
                        isOpen
                          ? "border-navy bg-navy text-white"
                          : "border-navy bg-white text-navy"
                      }
                    `}
                  >
                    <ChevronDown size={16} className={`transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>

                {/* Answer */}
                <div
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                  <p className="px-5 pb-5 text-base leading-6 text-muted">
                    {faq.answer}
                  </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-10 text-center  text-muted">No FAQs Found.</p>
        )}
      </div>
    </section>
  );
}
