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
        className={`mt-3 w-full overflow-hidden transition-all duration-300 ${
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
              className="
              group inline-flex shrink-0 items-center gap-1.5
              rounded-[5px] border border-[#e3d6b6]
              bg-white px-2 py-1.5
              text-[10px] font-medium leading-[14px]
              text-[#172033]
              transition-colors duration-200
              hover:border-[#D1A128]
              hover:bg-[#FFFBF0]
              focus-visible:outline-none
              focus-visible:ring-1 focus-visible:ring-[#D1A128]
            "
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
          className="w-fit text-[11px] font-semibold uppercase tracking-wide text-[#2874F0] hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
