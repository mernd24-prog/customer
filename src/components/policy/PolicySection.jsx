import React from "react";
import { infoSection } from "../../constants/image.constant";

const PolicySection = ({ title, points, description, footer }) => {
  const visiblePoints = Array.isArray(points)
    ? points.filter((point) => point?.title || point?.description)
    : [];

  return (
    <section className="group py-2 md:py-3 mt-3 first:mt-0">
      {title && (
        <h2 className="mb-3  text-xl font-bold leading-tight text-ink md:text-2xl">
          {title}
        </h2>
      )}

      {description && (
        <p className="mb-4  text-[15px] leading-relaxed tracking-normal text-ink md:text-[16.5px]">
          {description}
        </p>
      )}

      {visiblePoints.length > 0 && (
        <ul className="space-y-4">
          {visiblePoints.map((point, pIdx) => (
            <li key={pIdx} className="flex items-start gap-2">
              <div className="mt-1 flex-shrink-0">
                <img
                  src={infoSection.arrow}
                  alt="arrow"
                  className="w-4 h-4 md:w-5 md:h-5 object-contain opacity-70"
                />
              </div>

              <div className="text-muted leading-relaxed tracking-normal text-[15px] md:text-[16.5px] ">
                {point.title && (
                  <span className="font-semibold text-ink">
                    {point.title}
                    {point.description ? ": " : ""}
                  </span>
                )}
                <span>{point.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {footer && (
        <div className="mt-2">
          <p className="text-muted leading-relaxed tracking-normal text-[15px] md:text-[16.5px] ">
            {footer}
          </p>
        </div>
      )}
    </section>
  );
};

export default PolicySection;
