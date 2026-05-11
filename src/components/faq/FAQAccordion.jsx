import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQAccordion({ faqs = [], variant }) {
  const [openIndex, setOpenIndex] = useState(1);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full">
      <div className="w-full space-y-3">
        {faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <div key={index} className="overflow-hidden rounded-[4px]">
              {/* Question */}
              <div
                onClick={() => toggleFAQ(index)}
                className={`flex cursor-pointer items-center justify-between px-5 py-4 transition
                                    
                                    ${
                                      openIndex === index &&
                                      variant !== "productDetailPageFAQ"
                                        ? "border border-[#2693FF] bg-[#E9E9F6]"
                                        : "bg-[#E9E9F6] "
                                    }
                                `}
              >
                <h3 className="font-montserrat text-[15px] font-medium text-[#2E2E2E] md:text-[16px]">
                  {faq.question}
                </h3>

                <button
                  className={`
                                        flex h-7 w-7 items-center justify-center rounded-full border transition
                                        
                                        ${
                                          openIndex === index
                                            ? "border-[#3F3D9B] bg-[#3F3D9B] text-white"
                                            : "border-[#3F3D9B] bg-white text-[#3F3D9B]"
                                        }
                                    `}
                >
                  {openIndex === index ? (
                    <Minus size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              </div>

              {/* Answer */}
              {openIndex === index && (
                <div
                  className={`overflow-hidden bg-[#F7F7FB] transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-40 px-5 py-4 opacity-100"
                      : "max-h-0 px-5 py-0 opacity-0"
                  }`}
                >
                  <p className="font-montserrat text-[14px] leading-6 text-[#4F4F4F]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="py-10 text-center font-montserrat text-[#787878]">
            No FAQs found.
          </p>
        )}
      </div>
    </section>
  );
}
