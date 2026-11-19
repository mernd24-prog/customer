
import { X } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";

import { GoldOutlineButton } from "./button/buttonSpecialized";

export default function ActiveFilterChips({
  filters = [],
  onRemove,
  className = "mb-4",
}) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const checkOverflow = () => {
      setIsOverflowing(element.scrollHeight > 50);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [filters]);

  if (!filters.length) return null;

  return (
    <div className={`${className} flex flex-col gap-2`}>
      <div
        className={`mt-8 w-full overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[1000px]" : "max-h-[32px]"
        }`}
      >
        <div ref={contentRef} className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <GoldOutlineButton
            size="xs"
            shape="square"       
                   key={filter.key}
              onClick={() => onRemove?.(filter.key, filter)}
              aria-label={`Remove ${filter.label} filter`}
            >
              <span>{filter.label}</span>

              <X
                size={11}
                
              />
            </GoldOutlineButton>
          ))}
        </div>
      </div>

      {isOverflowing && (
        <GoldOutlineButton
          onClick={() => setExpanded((prev) => !prev)}
          className="w-fit text-xs font-semibold uppercase tracking-wide"
        >
          {expanded ? "Show less" : "Show more"}
        </GoldOutlineButton>
      )}
    </div>
  );
}
