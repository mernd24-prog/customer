import React from "react";
import PolicyHeader from "./PolicyHeader";
import PolicyIntro from "./PolicyIntro";
import PolicySection from "./PolicySection";

/**
 * Policy Component
 * A reusable container component that uses modular sub-components to display policies.
 * @param {Object} props.data - The JSON data containing policy details.
 */
const Policy = ({ data }) => {
  if (!data) return null;

  return (
    <div className="w-full min-h-screen bg-white font-montserrat pb-10">
      <PolicyHeader title={data.title} />

      <main className="w-full px-8 md:px-12 lg:px-16 mt-8 md:mt-12">
        <PolicyIntro {...data.intro} />

        <div className="space-y-2 md:space-y-3">
          {data.sections?.map((section, index) => (
            <PolicySection key={index} index={index} {...section} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Policy;
