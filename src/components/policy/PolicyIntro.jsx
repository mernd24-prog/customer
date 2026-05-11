import React from "react";

const PolicyIntro = ({ heading, description }) => {
  if (!heading && !description) return null;

  return (
    <section className="mb-8 text-left animate-fade-in-up">
      {heading && (
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#2E2E2E] mb-4 font-montserrat tracking-tight leading-tight">
          {heading}
        </h2>
      )}
      {description && (
        <p className="text-[#2E2E2E] leading-loose tracking-wide text-[15px] md:text-[17px] font-montserrat">
          {description}
        </p>
      )}
    </section>
  );
};

export default PolicyIntro;
