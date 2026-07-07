import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_LIMITS = {
  words: 24,
  characters: 120,
  lines: 2,
};

const normalizeText = (value) => String(value ?? "");

const splitWords = (text) => text.trim().split(/\s+/).filter(Boolean);

export function getShowMoreText(value, options = {}) {
  const text = normalizeText(value);
  const mode = options.mode || "characters";
  const limit = Number(
    options.limit || DEFAULT_LIMITS[mode] || DEFAULT_LIMITS.characters,
  );

  if (!text || limit <= 0) {
    return {
      text: "",
      preview: "",
      isTruncated: false,
    };
  }

  if (mode === "words") {
    const words = splitWords(text);
    const isTruncated = words.length > limit;

    return {
      text,
      preview: isTruncated ? words.slice(0, limit).join(" ") : text,
      isTruncated,
    };
  }

  if (mode === "lines") {
    const lines = text.split(/\r?\n/);
    const isTruncated = lines.length > limit;

    return {
      text,
      preview: isTruncated ? lines.slice(0, limit).join("\n") : text,
      isTruncated,
    };
  }

  const characters = Array.from(text);
  const isTruncated = characters.length > limit;

  return {
    text,
    preview: isTruncated ? characters.slice(0, limit).join("").trimEnd() : text,
    isTruncated,
  };
}

export function ShowMoreText({
  text,
  mode = "characters",
  limit,
  moreLabel = "more",
  lessLabel = "less",
  className = "",
  textClassName = "",
  buttonClassName = "",
  ellipsis = "...",
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hasLineOverflow, setHasLineOverflow] = useState(false);
  const lineTextRef = useRef(null);
  const showMore = useMemo(
    () => getShowMoreText(text, { mode, limit }),
    [limit, mode, text],
  );
  const safeLineLimit = Number(limit || DEFAULT_LIMITS.lines);
  const isLineMode = mode === "lines";

  useEffect(() => {
    if (!isLineMode || !lineTextRef.current) {
      setHasLineOverflow(false);
      return undefined;
    }

    const element = lineTextRef.current;
    const measureOverflow = () => {
      setHasLineOverflow(element.scrollHeight > element.clientHeight + 1);
    };

    measureOverflow();

    if (typeof window.ResizeObserver === "undefined") {
      window.addEventListener("resize", measureOverflow);
      return () => window.removeEventListener("resize", measureOverflow);
    }

    const observer = new window.ResizeObserver(measureOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isLineMode, safeLineLimit, showMore.text]);

  if (!showMore.text) return null;

  if (isLineMode) {
    return (
      <span className={className || "relative block"}>
        <span
          ref={lineTextRef}
          className={textClassName}
          style={
            expanded
              ? undefined
              : {
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: safeLineLimit,
                  overflow: "hidden",
                  paddingRight: hasLineOverflow ? `${moreLabel.length}ch` : undefined,
                }
          }
        >
          {showMore.text}
        </span>
        {hasLineOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className={
              buttonClassName ||
              (expanded
                ? "mt-1 inline whitespace-nowrap font-semibold text-black/50 hover:underline"
                : "absolute bottom-0 right-0 inline whitespace-nowrap bg-white pl-0.5 font-semibold text-black/50 hover:underline")
            }
          >
            {expanded ? lessLabel : moreLabel}
          </button>
        )}
      </span>
    );
  }

  const displayText =
    expanded || !showMore.isTruncated
      ? showMore.text
      : `${showMore.preview}${ellipsis}`;

  return (
    <span className={className}>
      <span className={textClassName}>{displayText}</span>
      {showMore.isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={
            buttonClassName ||
            "ml-0.5 inline font-semibold text-[#0B63F6] hover:underline"
          }
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </span>
  );
}

export default ShowMoreText;
