import React from "react";

const FALLBACK_POLICY_SECTION = {
  title: "Policy Guidelines",
  description:
    "Please review the following guidelines to understand the applicable policy requirements.",
  points: [
    {
      title: "Follow the Policy",
      description:
        "Please follow all applicable guidelines and provide accurate information when using our services.",
    },
    {
      title: "Provide Accurate Information",
      description:
        "Ensure that all submitted details, documents, and information are complete and accurate.",
    },
    {
      title: "Contact Support",
      description:
        "If you have questions or need clarification about a policy, contact our support team for assistance.",
    },
  ],
};

function getTextLines(value = "") {
  return String(value || "")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n|•|&#8226;|&bull;/)
    .map((line) =>
      line
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim(),
    )
    .filter(Boolean);
}

function normalizePoint(point) {
  if (!point || typeof point !== "object") {
    return null;
  }

  const title = String(point.title || "").trim();
  const description = String(point.description || "").trim();

  if (!title && !description) {
    return null;
  }

  return {
    ...point,
    title,
    description,
  };
}

const PolicySection = ({
  title,
  points,
  description,
  fallback = FALLBACK_POLICY_SECTION,
}) => {
  const fallbackSection = fallback || FALLBACK_POLICY_SECTION;

  const sectionTitle =
    String(title || "").trim() || fallbackSection.title || "";

  const sectionDescription =
    String(description || "").trim() || fallbackSection.description || "";

  const cmsPoints = Array.isArray(points)
    ? points.map(normalizePoint).filter(Boolean)
    : [];

  const fallbackPoints = Array.isArray(fallbackSection.points)
    ? fallbackSection.points.map(normalizePoint).filter(Boolean)
    : [];

  const visiblePoints =
    cmsPoints.length > 0 ? cmsPoints : fallbackPoints;

  return (
    <section className="py-1 first:pt-0">
      {sectionTitle && (
        <h2 className="mb-3 text-h3 font-bold text-ink">
          {sectionTitle}
        </h2>
      )}

      {sectionDescription && (
        <p className="mb-8 text-[14px] leading-relaxed text-muted md:text-base">
          {sectionDescription}
        </p>
      )}

      {visiblePoints.length > 0 && (
        <div className="space-y-8">
          {visiblePoints.map((point, pIdx) => {
            const textLines = getTextLines(point.description);

            return (
              <div key={`${point.title || "policy-point"}-${pIdx}`}>
                {point.title && (
                  <h3 className="mb-3 text-h5 font-bold text-ink">
                    {point.title}
                  </h3>
                )}

                {textLines.length > 1 ? (
                  <ul className="space-y-2">
                    {textLines.map((line, lineIdx) => (
                      <li
                        key={`${pIdx}-${lineIdx}`}
                        className="flex items-start gap-2 px-2"
                      >
                        <img
                          loading="lazy"
                          width="400"
                          height="400"
                          src="/image/png/arrow.svg"
                          alt=""
                          className="my-auto h-3 w-3 flex-shrink-0 object-contain md:h-3.5 md:w-3.5"
                        />

                        <span className="text-[14px] leading-relaxed text-muted md:text-base">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : textLines.length === 1 ? (
                  <p className="text-[14px] leading-relaxed text-muted md:text-base">
                    {textLines[0]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PolicySection;
