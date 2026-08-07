import React from "react";
function getTextLines(value = "") {
  return String(value || "")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n|•|&#8226;|&bull;/)
    .map((line) => line.replace(/&nbsp;/g, " ").trim())
    .filter(Boolean);
}

const PolicySection = ({ title, points, description }) => {
  const visiblePoints = Array.isArray(points)
    ? points.filter((point) => point?.title || point?.description)
    : [];

  return (
    <section className="py-1 first:pt-0">
      {title && <h2 className="mb-3 text-h3 font-bold text-ink">{title}</h2>}

      {description && (
        <p className="mb-8 text-[14px] md:text-base leading-relaxed text-muted">
          {description}
        </p>
      )}

      {visiblePoints.length > 0 && (
        <div className="space-y-8">
          {visiblePoints.map((point, pIdx) => (
            <div key={pIdx}>
              {point.title && (
                <h3 className="mb-3 text-h5 font-bold text-ink">
                  {point.title}
                </h3>
              )}

              {getTextLines(point.description).length > 1 ? (
                <ul className="space-y-2">
                  {getTextLines(point.description).map((line, lineIdx) => (
                    <li key={lineIdx} className="flex items-start gap-2 px-2">
                      <img
                        src="/image/png/arrow.svg"
                        alt=""
                        className="my-auto h-3 w-3 flex-shrink-0 object-contain md:h-3.5 md:w-3.5"
                      />
                      <span className="text-[14px] md:text-base leading-relaxed text-muted">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                getTextLines(point.description).map((line, lineIdx) => (
                  <p
                    key={lineIdx}
                    className="text-[14px] md:text-base text-muted"
                  >
                    {line}
                  </p>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {/* {footer && (
        <div className="mt-8">
          <p className="text-[13px] d leading-[20px] leading-relaxed tracking-normal text-muted md:text-[14px] md:leading-[22px]">
            {footer}
          </p>
        </div>
      )} */}
    </section>
  );
};

export default PolicySection;
