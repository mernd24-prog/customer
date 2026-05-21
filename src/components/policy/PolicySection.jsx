import React from "react";
import { infoSection } from "../../constant/image.constant";

const PolicySection = ({ title, points, description, footer }) => {
  console.log("this is the points", points);
  return (
    <section className="group py-2 md:py-3 mt-3 first:mt-0">
      {points && (
        <ul className="space-y-4">
          {points.map((point, pIdx) => (
            <li key={pIdx} className="flex items-start gap-2">
              <div className="mt-1 flex-shrink-0">
                <img
                  src={infoSection.arrow}
                  alt="arrow"
                  className="w-4 h-4 md:w-5 md:h-5 object-contain opacity-70"
                />
              </div>

              <div className="text-muted leading-relaxed tracking-wide text-[15px] md:text-[16.5px] font-montserrat">
                <span className="font-semibold text-[#2E2E2E]">
                  {point.title}
                </span>{" "}
                <span>{point.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {footer && (
        <div className="mt-2">
          <p className="text-muted leading-relaxed tracking-wide text-[15px] md:text-[16.5px] font-montserrat">
            {footer}
          </p>
        </div>
      )}
    </section>
  );
};

export default PolicySection;
