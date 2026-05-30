import { ArrowRight } from "lucide-react";

const defaultTopics = [
  "FAQ'S",
  "Return & Refund Policy",
  "Terms & Conditions",
  "Shipping Policy",
];

export default function FAQSidebar({
  activeTopic,
  setActiveTopic,
  topics = defaultTopics,
}) {
  return (
    <div className="self-start overflow-hidden rounded-md border border-gray-200 font-montserrat shadow-sm bg-[#F4F4F6]">
      <div className="bg-[#3E4094] p-4 text-[16px] font-semibold text-white">
        Help Topics
      </div>

      <div className="flex flex-col">
        {topics.map((topic, index) => {
          const isActive = activeTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`flex w-full items-center justify-between p-4 text-left transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-white font-semibold text-[#3E4094]"
                  : "bg-transparent text-gray-500 hover:bg-gray-200"
              } ${index !== topics.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <span className="text-[14px]">{topic}</span>
              {isActive && <ArrowRight size={18} className="text-[#3E4094]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}