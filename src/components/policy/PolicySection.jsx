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
  const cleaned = String(value || "")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/\s*•\s*/g, "\n")
    .replace(/&#8226;/gi, "\n")
    .replace(/&bull;/gi, "\n");

  const fromLines = cleaned
    .split(/\n/)
    .map((line) =>
      line
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);

  if (fromLines.length > 1) {
    return fromLines;
  }

  const text = (fromLines[0] || cleaned).trim();
  if (!text) return [];

  const bySentence = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (bySentence.length > 1) {
    return bySentence;
  }

  return [text];
}

function normalizePoint(point) {
  if (!point || typeof point !== "object") {
    return null;
  }

  const title = String(point.title || "")
    .trim()
    .replace(/^\s*\d+[\.)]\s*/, "");
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
    String(description || "").trim() ||
    fallbackSection.description ||
    "";

  const cmsPoints = Array.isArray(points)
    ? points.map(normalizePoint).filter(Boolean)
    : [];

  const fallbackPoints = Array.isArray(fallbackSection.points)
    ? fallbackSection.points.map(normalizePoint).filter(Boolean)
    : [];

  const visiblePoints =
    typeof points === "undefined" || points === null
      ? fallbackPoints
      : cmsPoints;

  return (
    <section className="py-1 first:pt-0">
      {sectionTitle && (
        <h2 className="mb-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-ink md:text-[34px]">
          {sectionTitle}
        </h2>
      )}

      {sectionDescription && (
        <p
          className="mb-6 text-body leading-relaxed text-muted md:text-title-sm"
          dangerouslySetInnerHTML={{ __html: sectionDescription }}
        />
      )}

      {visiblePoints.length > 0 && (
        <div className="space-y-2.5">
          {visiblePoints.map((point, pIdx) => {
            const textLines = getTextLines(point.description);
            const contentLines = textLines.length > 0 ? textLines : [point.description].filter(Boolean);

            return (
              <div
                key={`${point.title || "policy-point"}-${pIdx}`}
                className="flex items-start gap-3 py-1"
              >
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src="/image/png/arrow.svg"
                  alt=""
                  className="mt-1.5 h-3 w-3 flex-shrink-0 object-contain md:h-3.5 md:w-3.5"
                />

                <div className="flex-1 text-body leading-relaxed text-muted md:text-title-sm">
                  {point.title && (
                    <span className="font-bold text-ink">
                      {point.title}
                      {contentLines.length > 0 && ": "}
                    </span>
                  )}

                  {contentLines.map((line, lineIdx) => (
                    <span
                      key={`${pIdx}-${lineIdx}`}
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PolicySection;