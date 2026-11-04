
import React from "react";

const PolicyHeader = ({ title }) => {
  return (
    <header
      className="relative w-full overflow-hidden py-6 text-center sm:py-8 md:py-12 lg:py-16"
      style={{
        background:
          "linear-gradient(270deg, var(--customer-navy) 5.77%, var(--customer-navy-dark) 100%)",
      }}
    >
      <div className="relative z-10 mx-auto w-full px-4 sm:px-6">
        <h1 className="break-words text-[21px] font-bold leading-tight text-white sm:text-[25px] md:text-[30px] lg:text-[34px]">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default PolicyHeader;
