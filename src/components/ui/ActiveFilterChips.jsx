import { X } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";

export default function ActiveFilterChips({
  filters = [],
  onRemove,
  className = "mb-4",
}) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        setIsOverflowing(contentRef.current.scrollHeight > 50);
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [filters]);

  if (!filters.length) return null;

  return (
    <div className={`${className} flex flex-col gap-2`}>
      <div
        className={`mt-4 w-full overflow-hidden transition-[max-height] duration-200 ${
          expanded ? "max-h-[1000px]" : "max-h-[50px]"
        }`}
      >
        <div ref={contentRef} className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onRemove?.(filter.key, filter)}
              aria-label={`Remove ${filter.label} filter`}
              className="group inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold leading-4 text-ink transition-colors duration-200 hover:border-gold hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <span>{filter.label}</span>

              <X
                size={11}
                strokeWidth={1.6}
                className="shrink-0 text-[#6B7280] transition-colors group-hover:text-[#172033]"
              />
            </button>
          ))}
        </div>
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="customer-filter-action w-fit"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
