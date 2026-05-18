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
    <div className="self-start overflow-hidden rounded-xl border font-montserrat">
      
      <div className="bg-[#3E4094] p-4 text-white">
        Help Topics
      </div>

      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => setActiveTopic(topic)}
          className={`block w-full border-b p-4 text-left transition ${
            activeTopic === topic
              ? "bg-[#ECECFA] font-semibold text-[#2E3192]"
              : "hover:bg-gray-100"
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}