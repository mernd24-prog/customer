import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";

export default function ActiveFilterChips({
  filters = [],
  onRemove,
  onClear,
  clearLabel = "Clear All",
  className = "mb-4",
}) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        // Chip min-height is 40px. If it wraps with an 8px gap, scrollHeight will be >= 88px.
        // So 50px is a safe threshold for > 1 line.
        const overflowing = contentRef.current.scrollHeight > 50;
        setIsOverflowing(overflowing);
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
        className={`w-full overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[1000px]' : 'max-h-[42px]'}`}
      >
        <div ref={contentRef} className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onRemove?.(filter.key, filter)}
              className="chip inline-flex items-center gap-1.5 text-xs font-medium"
            >
              {filter.label} <X size={12} />
            </button>
          ))}
        </div>
      </div>
      
      {isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-[#2874f0] hover:underline w-fit uppercase"
        >
          {expanded ? "SHOW LESS" : "SHOW MORE"}
        </button>
      )}
    </div>
  );
}
