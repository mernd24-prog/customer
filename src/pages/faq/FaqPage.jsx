import { useState } from "react";
import { Plus, Minus, Search } from "lucide-react";

export default function FAQSection({
    title = "Frequently Asked Questions",
    subtitle = "Here are few of the most frequently asked questions by our valuable customers",
    image,
    faqs = [],
}) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="2xl:container 2xl:mx-auto px-4 py-10 md:px-6 md:py-12 lg:px-20">
            {/* Header */}
            <div>
                <h2 className="font-montserrat text-[30px] font-semibold leading-[40px] text-[#2E2E2E] lg:text-[40px] lg:leading-[50px]">
                    {title}
                </h2>

                <div className="mt-4 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <p className="max-w-[700px] font-montserrat text-[15px] leading-7 text-[#787878]">
                        {subtitle}
                    </p>

                    {/* Search */}
                    <div className="flex w-full items-center border-b border-[#D9D9D9] pb-2 md:w-[380px]">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-transparent font-montserrat text-[15px] text-[#787878] outline-none placeholder:text-[#A6A6A6]"
                        />

                        <Search
                            size={18}
                            className="cursor-pointer text-[#787878]"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mt-10 flex flex-col gap-10 md:flex-row md:gap-12 lg:mt-16">
                {/* Left Image */}
                <div className="w-full md:w-5/12 lg:w-4/12">
                    <img
                        src={image}
                        alt="FAQ"
                        className="h-full w-full rounded-[16px] object-cover"
                    />
                </div>

                {/* FAQ */}
                <div className="w-full md:w-7/12 lg:w-8/12">
                    {faqs.map((faq, index) => (
                        <div key={index}>
                            <div
                                onClick={() => toggleFAQ(index)}
                                className="flex cursor-pointer items-center justify-between py-5"
                            >
                                <h3 className="font-montserrat text-[18px] font-semibold text-[#2E2E2E] sm:text-[20px]">
                                    {faq.question}
                                </h3>

                                <button className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F5F5F5]">
                                    {openIndex === index ? (
                                        <Minus
                                            size={18}
                                            className="text-[#2E2E2E]"
                                        />
                                    ) : (
                                        <Plus
                                            size={18}
                                            className="text-[#2E2E2E]"
                                        />
                                    )}
                                </button>
                            </div>

                            {openIndex === index && (
                                <p className="w-11/12 pb-5 font-montserrat text-[15px] leading-7 text-[#787878]">
                                    {faq.answer}
                                </p>
                            )}

                            <hr className="border-[#E5E5E5]" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}