import { ArrowRight } from "lucide-react";

export default function FAQSidebar({
  activeTopic,
  setActiveTopic,
  topics = [],
}) {
  return (
    <div className="self-start overflow-hidden rounded-md border border-gray-200 shadow-sm bg-navy-soft">
      <div className="bg-navy p-4 text-white font-semibold">Help Topics</div>

      <div className="flex flex-col">
        {topics.map((topic, index) => {
          const active = activeTopic === topic;

          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`flex items-center justify-between p-4 text-left ${
                active
                  ? "bg-white text-navy font-semibold"
                  : "hover:bg-gray-100"
              } ${
                index !== topics.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <span>{topic}</span>

              {active && <ArrowRight size={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
