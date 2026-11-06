
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
      preview: isTruncated
        ? words.slice(0, limit).join(" ").trimEnd()
        : text,
      isTruncated,
    };
  }

  if (mode === "lines") {
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

const getAvailableWidth = (element) => {
  let container = element?.parentElement;

  while (container) {
    const display = window.getComputedStyle(container).display;

    if (
      display !== "inline" &&
      display !== "contents" &&
      display !== "none"
    ) {
      const styles = window.getComputedStyle(container);

      const width =
        container.clientWidth -
        parseFloat(styles.paddingLeft || 0) -
        parseFloat(styles.paddingRight || 0);

      if (width > 0) {
        return {
          container,
          width,
        };
      }
    }

    container = container.parentElement;
  }

  return null;
};

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
  isHtml = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const lineTextRef = useRef(null);

  const cleanText = useMemo(() => {
    if (!isHtml || !text) return text;
    return text.replace(/<[^>]*>/g, " ");
  }, [isHtml, text]);

  const showMore = useMemo(
    () => getShowMoreText(isHtml ? cleanText : text, { mode, limit }),
    [limit, mode, text, cleanText, isHtml],
  );

  const isLineMode = mode === "lines";
  const safeLineLimit = Number(limit ?? DEFAULT_LIMITS.lines);

  const [dynamicPreview, setDynamicPreview] = useState(null);
  const [isDynamicallyTruncated, setIsDynamicallyTruncated] = useState(false);

  useEffect(() => {
    if (!isLineMode || !showMore.text || safeLineLimit <= 0) {
      setIsDynamicallyTruncated(false);
      setDynamicPreview(null);
      return;
    }

    let isActive = true;
    let observer = null;
    let animationFrame = null;

    const measureOverflow = () => {
      if (!isActive) return;

      const element = lineTextRef.current;
      if (!element) return;

      const originalText = showMore.text;
      const measurement = getAvailableWidth(element);

      if (!measurement) return;

      const { container, width } = measurement;
      const computed = window.getComputedStyle(element);

      const clone = document.createElement("div");

      clone.style.position = "absolute";
      clone.style.visibility = "hidden";
      clone.style.pointerEvents = "none";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = `${width}px`;
      clone.style.minWidth = "0";
      clone.style.maxWidth = `${width}px`;
      clone.style.boxSizing = "border-box";
      clone.style.display = "block";
      clone.style.margin = "0";
      clone.style.padding = "0";
      clone.style.border = "0";

      clone.style.font = computed.font;
      clone.style.fontSize = computed.fontSize;
      clone.style.fontWeight = computed.fontWeight;
      clone.style.fontFamily = computed.fontFamily;
      clone.style.fontStyle = computed.fontStyle;
      clone.style.letterSpacing = computed.letterSpacing;
      clone.style.lineHeight = computed.lineHeight;
      clone.style.wordBreak = computed.wordBreak;
      clone.style.overflowWrap = computed.overflowWrap;
      clone.style.whiteSpace = "pre-wrap";
      clone.style.textIndent = computed.textIndent;

      document.body.appendChild(clone);

      const fontSize = parseFloat(computed.fontSize) || 14;

      const lineHeight =
        computed.lineHeight === "normal"
          ? fontSize * 1.2
          : parseFloat(computed.lineHeight) || fontSize * 1.2;

      const maxHeight = lineHeight * safeLineLimit + 1;

      const fitsWithinLimit = (value) => {
        clone.textContent = value;
        return clone.getBoundingClientRect().height <= maxHeight;
      };

      const overflows = !fitsWithinLimit(originalText);

      if (!overflows) {
        document.body.removeChild(clone);

        if (isActive) {
          setIsDynamicallyTruncated(false);
          setDynamicPreview(originalText);
        }

        return;
      }

      // Always calculate the preview, even when expanded.
      // This ensures Less uses the latest container width.

      let low = 0;
      let high = originalText.length;
      let best = 0;

      const suffix = `${ellipsis} ${moreLabel}`;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const preview = originalText.slice(0, mid).trimEnd();

        if (fitsWithinLimit(preview + suffix)) {
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

      // Keep reference to the current container for observation.
      return container;
    };

    const setupObserver = () => {
      const element = lineTextRef.current;
      if (!element) return;

      const measurement = getAvailableWidth(element);
      if (!measurement) return;

      measureOverflow();

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }

          animationFrame = requestAnimationFrame(() => {
            if (isActive) measureOverflow();
          });
        });

        // Observe the actual width container, not the inline text span.
        observer.observe(measurement.container);
      }
    };

    setupObserver();

    window.addEventListener("resize", measureOverflow);

    return () => {
      isActive = false;

      if (observer) observer.disconnect();

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("resize", measureOverflow);
    };
  }, [
    isLineMode,
    showMore.text,
    safeLineLimit,
    ellipsis,
    moreLabel,
  ]);

  const resolvedButtonClassName =
    typeof buttonClassName === "function"
      ? buttonClassName({ expanded })
      : buttonClassName;

  if (!showMore.text) return null;

  const wrapperClassName = className
    ? `${className} !inline`
    : "!inline";

  const defaultButtonClass =
    "!inline whitespace-nowrap align-baseline font-semibold text-[#0B63F6] hover:underline";

  const finalButtonClass = resolvedButtonClassName || defaultButtonClass;

  let finalPreview = showMore.preview;
  let isTruncated = showMore.isTruncated;

  if (isLineMode) {
    finalPreview = dynamicPreview ?? showMore.text;
    isTruncated = isDynamicallyTruncated;
  }

  const displayText =
    expanded || !isTruncated
      ? showMore.text
      : `${finalPreview}${ellipsis}`;

  return (
    <span className={wrapperClassName}>
      {isHtml ? (
        <span
          ref={isLineMode ? lineTextRef : null}
          className={textClassName}
          dangerouslySetInnerHTML={{
            __html: expanded || !isTruncated ? text : displayText,
          }}
        />
      ) : (
        <span
          ref={isLineMode ? lineTextRef : null}
          className={textClassName}
        >
          {displayText}
        </span>
      )}

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
