import React from "react";

const PolicyHeader = ({ title }) => {
  return (
    <header
      className="relative w-[100vw] left-1/2 -translate-x-1/2 overflow-hidden py-10 md:py-20 text-center "
      style={{
        background: "linear-gradient(270deg, var(--customer-navy) 5.77%, var(--customer-navy-dark) 100%)",
      }}
    >
      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white ">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default PolicyHeader;
