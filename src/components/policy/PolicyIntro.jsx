import React from "react";

const PolicyIntro = ({ heading, description }) => {
  if (!heading && !description) return null;

  return (
    <section className="mb-8 text-left animate-fade-in-up">
      {heading && (
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-ink mb-4  tracking-normal leading-tight">
          {heading}
        </h2>
      )}
      {description && (
        <p className="text-ink leading-loose tracking-normal text-[15px] md:text-[17px] ">
          {description}
        </p>
      )}
    </section>
  );
};

export default PolicyIntro;
