import React from "react";
import PolicyHeader from "../../components/policy/PolicyHeader";
import PolicyIntro from "../../components/policy/PolicyIntro";
import PolicySection from "../../components/policy/PolicySection";
import Seo from "../../components/common/Seo";

/**
 * Generic Policy Page
 * Renders any policy based on the 'data' prop provided.
 */
const PolicyPage = ({ data }) => {
  if (!data) return null;

  return (
    <main className="w-full min-h-screen bg-white font-inter pb-20">
      <Seo
        title={`${data.title} | Sam Global`}
        description={data.intro?.description}
      />

      {/* Dynamic Header */}
      <PolicyHeader title={data.title} />

      {/* Content Area */}
      <div className="w-full px-8 md:px-12 lg:px-16 mt-12 md:mt-16">
        {/* Intro Section */}
        <PolicyIntro
          heading={data.intro?.heading}
          description={data.intro?.description}
        />

        {/* Dynamic Sections */}
        <div className="space-y-14 md:space-y-16">
          {data.sections.map((section, index) => (
            <PolicySection
              key={index}
              index={index}
              title={section.title}
              points={section.points}
              description={section.description}
              footer={section.footer}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default PolicyPage;
