import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQAccordion({ faqs = [], variant }) {
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
              <div key={index} className="overflow-hidden rounded-md bg-[#EEEDF5] mb-4">
                {/* Question */}
                <div
                  onClick={() => toggleFAQ(index)}
                  className="flex cursor-pointer items-center justify-between px-5 py-4 transition"
                >
                  <h3 className="font-montserrat text-[15px] font-medium text-[#4D4D4D] md:text-[16px]">
                    {faq.question}
                  </h3>

                  <button
                    className={`
                      flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition
                      ${isOpen
                        ? "border-[#3E4094] bg-[#3E4094] text-white"
                        : "border-[#3E4094] bg-white text-[#3E4094]"
                      }
                    `}
                  >
                    {isOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-40 px-5 pb-5 pt-0 opacity-100"
                      : "max-h-0 px-5 py-0 opacity-0"
                  }`}
                >
                  <p className="font-montserrat text-[14px] leading-6 text-[#5E5E5E]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-10 text-center font-montserrat text-[#787878]">
            No FAQs found.
          </p>
        )}
      </div>
    </section>
  );
}
