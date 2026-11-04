
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
    .replace(/&#8226;|&bull;/gi, "\n");

  const fromLines = cleaned
    .split(/\n/)
    .map((line) =>
      line
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

  if (fromLines.length > 1) return fromLines;

  const text = (fromLines[0] || cleaned).trim();
  if (!text) return [];

  const bySentence = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return bySentence.length > 1 ? bySentence : [text];
}

function normalizePoint(point) {
  if (!point || typeof point !== "object") return null;

  const title = String(point.title || "")
    .trim()
    .replace(/^\s*\d+[.)]\s*/, "");

  const description = String(point.description || "").trim();

  if (!title && !description) return null;

  return { ...point, title, description };
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
    <section className="w-full min-w-0 py-1 first:pt-0">
      {sectionTitle && (
        <h2 className="mb-3 text-[21px] font-bold leading-[1.3] tracking-tight text-ink sm:text-[24px] md:mb-4 md:text-[28px] lg:text-[30px]">
          {sectionTitle}
        </h2>
      )}

      {sectionDescription && (
        <p
          className="mb-4 text-[14px] leading-[1.75] text-muted sm:mb-5 sm:text-[15px] md:mb-6 md:text-[16px] lg:text-[17px]"
          dangerouslySetInnerHTML={{ __html: sectionDescription }}
        />
      )}

      {visiblePoints.length > 0 && (
        <div className="space-y-2 sm:space-y-2.5">
          {visiblePoints.map((point, pIdx) => {
            const textLines = getTextLines(point.description);
            const contentLines =
              textLines.length > 0
                ? textLines
                : [point.description].filter(Boolean);

            return (
              <div
                key={`${point.title || "policy-point"}-${pIdx}`}
                className="flex min-w-0 items-start gap-2.5 py-1 sm:gap-3"
              >
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src="/image/png/arrow.svg"
                  alt=""
                  className="mt-[6px] h-3 w-3 shrink-0 object-contain sm:mt-2 sm:h-3.5 sm:w-3.5"
                />

                <div className="min-w-0 flex-1 break-words text-[14px] leading-[1.75] text-muted sm:text-[15px] md:text-[16px] lg:text-[17px]">
                  {point.title && (
                    <span className="font-bold text-ink">
                      {point.title}
                      {contentLines.length > 0 ? ": " : ""}
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
