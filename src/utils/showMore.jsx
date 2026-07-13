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
    options.limit ?? DEFAULT_LIMITS[mode] ?? DEFAULT_LIMITS.characters,
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
      preview: isTruncated ? words.slice(0, limit).join(" ").trimEnd() : text,
      isTruncated,
    };
  }

  if (mode === "lines") {
    const lines = text.split(/\r?\n/);

    const isTruncated = lines.length > limit;

    return {
      text,
      preview: text,
      isTruncated: false,
    };
  }

  const characters = Array.from(text);

  const isTruncated = characters.length > limit;

  let preview = text;

  if (isTruncated) {
    const slicedText = characters.slice(0, limit).join("").trimEnd();

    preview = slicedText.includes(" ")
      ? slicedText.substring(0, slicedText.lastIndexOf(" "))
      : slicedText;
  }

  return {
    text,
    preview,
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
  collapsedPaddingRight,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const lineTextRef = useRef(null);

  const showMore = useMemo(
    () => getShowMoreText(text, { mode, limit }),
    [limit, mode, text],
  );

  const isLineMode = mode === "lines";
  const safeLineLimit = Number(limit || DEFAULT_LIMITS.lines);

  const [dynamicPreview, setDynamicPreview] = useState(null);
  const [isDynamicallyTruncated, setIsDynamicallyTruncated] = useState(false);

  useEffect(() => {
    if (!isLineMode || !showMore.text) {
      setIsDynamicallyTruncated(false);
      setDynamicPreview(null);
      return;
    }

    let isActive = true;
    let observer = null;

    const measureOverflow = () => {
      if (!isActive) return;
      const element = lineTextRef.current;
      if (!element) return;

      const originalText = showMore.text;

      const rect = element.getBoundingClientRect();
      const availableWidth = rect.width;

      if (availableWidth === 0) return;

      const clone = document.createElement("div");

      const computed = window.getComputedStyle(element);
      clone.style.font = computed.font;
      clone.style.fontSize = computed.fontSize;
      clone.style.fontWeight = computed.fontWeight;
      clone.style.fontFamily = computed.fontFamily;
      clone.style.letterSpacing = computed.letterSpacing;
      clone.style.lineHeight = computed.lineHeight;
      clone.style.wordBreak = computed.wordBreak;
      clone.style.overflowWrap = computed.overflowWrap;
      clone.style.whiteSpace = "pre-wrap";

      clone.style.position = "absolute";
      clone.style.visibility = "hidden";
      clone.style.left = "-9999px";
      clone.style.top = "-9999px";
      clone.style.width = `${availableWidth}px`;

      document.body.appendChild(clone);

      clone.textContent = "A";
      const singleLineHeight = clone.clientHeight;

      if (singleLineHeight === 0) {
        document.body.removeChild(clone);
        return;
      }

      const maxHeight =
        singleLineHeight * safeLineLimit + singleLineHeight * 0.2;

      clone.textContent = originalText;
      const overflows = clone.clientHeight > maxHeight;

      if (!overflows) {
        document.body.removeChild(clone);
        if (isActive) {
          setIsDynamicallyTruncated(false);
          setDynamicPreview(originalText);
        }
        return;
      }

      if (expanded) {
        document.body.removeChild(clone);
        if (isActive) {
          setIsDynamicallyTruncated(true);
        }
        return;
      }

      let low = 0;
      let high = originalText.length;
      let best = 0;
      const suffix = ellipsis + moreLabel + "    ";

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        clone.textContent = originalText.slice(0, mid) + suffix;
        if (clone.clientHeight <= maxHeight) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      document.body.removeChild(clone);

      if (isActive) {
        setIsDynamicallyTruncated(true);
        setDynamicPreview(originalText.slice(0, best).trimEnd());
      }
    };

    measureOverflow();

    // Re-measure on resize without causing ResizeObserver infinite loops
    if (
      typeof window.ResizeObserver !== "undefined" &&
      lineTextRef.current &&
      lineTextRef.current.parentElement
    ) {
      observer = new window.ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          if (isActive) measureOverflow();
        });
      });
      // Observe the parent to avoid triggering self-loops when text length changes
      observer.observe(lineTextRef.current.parentElement);
    } else {
      window.addEventListener("resize", measureOverflow);
    }

    return () => {
      isActive = false;
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", measureOverflow);
    };
  }, [isLineMode, expanded, showMore.text, safeLineLimit, ellipsis, moreLabel]);

  const resolvedButtonClassName =
    typeof buttonClassName === "function"
      ? buttonClassName({ expanded })
      : buttonClassName;

  if (!showMore.text) return null;

  const defaultButtonClass =
    "ml-0.5 inline font-semibold text-[#0B63F6] hover:underline";
  const finalButtonClass = resolvedButtonClassName || defaultButtonClass;

  let finalPreview = showMore.preview;
  let isTruncated = showMore.isTruncated;

  if (isLineMode) {
    if (dynamicPreview !== null) {
      finalPreview = dynamicPreview;
      isTruncated = isDynamicallyTruncated;
    } else {
      // Fallback while calculating
      isTruncated = false;
    }
  }

  const displayText =
    expanded || !isTruncated ? showMore.text : `${finalPreview}${ellipsis}`;

  return (
    <span className={className}>
      <span ref={isLineMode ? lineTextRef : null} className={textClassName}>
        {displayText}
      </span>
      {isTruncated && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((value) => !value);
          }}
          className={finalButtonClass}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </span>
  );
}

export default ShowMoreText;
