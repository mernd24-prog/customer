import React from "react";
import { infoSection } from "../../../constant/image.constant";
import { roadAheadData } from "../../../data/infoSectionData";

const InfoSection = () => {
  const { title, description, brandText } = roadAheadData[0];
  const { image, logo } = infoSection;

  const [part1, part2] = brandText.split(". ");

  return (
    <section className="w-full bg-[linear-gradient(270deg,#3E4094_5.77%,#1B1D60_100%)] pt-6 sm:pt-8 lg:pt-10 pb-0 overflow-hidden ">
      <div className="mx-auto flex max-w-[1648px] flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:px-20">
        {/* Left Content Column */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left w-full lg:w-[60%] px-4 sm:px-10 lg:px-0 lg:py-10">
          <div className="flex flex-col gap-6 w-full">
            <h2 className="font-montserrat text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight text-white mb-2">
              {title}
            </h2>
            <div className="flex flex-col gap-3">
              <p
                className="font-montserrat text-lg sm:text-xl font-light text-white/90"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </div>

          {/* Wider Card (Width increased, vertical padding kept tight) */}
          <div className="relative mt-10 hidden lg:flex flex-col bg-white rounded-2xl shadow-2xl px-6 py-5 lg:px-10 lg:py-6 w-full max-w-md lg:max-w-[550px]">
            <div className="absolute left-0 top-4 bottom-4 w-1.5 bg-[#CE9F2D]"></div>

            {/* Logo and Line Row */}
            <div className="flex items-center mb-3 pl-4 ">
              <div className="shrink-0">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-10 lg:h-14 w-auto object-contain"
                />
              </div>

              <div className="flex-1 h-[2px]  mt-auto bg-gray-100 ml-2"></div>
            </div>
            {/* Bottom Text - All in one line to maintain width look */}
            <div className="pl-4">
              <h3 className="font-montserrat text-xl lg:text-3xl text-wrap font-bold tracking-tight whitespace-nowrap">
                <span className="text-[#CE9F2D]">{part1}.</span>{" "}
                <span className="text-[#1B1D60]">{part2}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Right Image Column */}
        <div className="flex justify-center lg:justify-end items-end w-full lg:w-1/2 mt-8 lg:mt-0 px-4">
          <div className="relative w-full max-w-[260px] sm:max-w-[360px] md:max-w-[450px] lg:max-w-[550px] xl:max-w-[650px] overflow-hidden rounded-t-[12px]">
            <img src={image} alt={title} className="w-full h-full " />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
