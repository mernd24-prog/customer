import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/common";

const THUMB_HEIGHT = 32; // Fixed compact short pill thumb
const TRACK_PADDING = 6; // Padding from top/bottom borders

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select Option",
  label,
  required = false,
  disabled = false,
  error,
  className = "",
  buttonClassName = "",
  optionsClassName = "",
  optionClassName = "",
  ariaLabel,

  // Used when custom option UI is required
  renderOption,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);

  const selectedOption = options.find((option) => {
    const optionValue = option?.value ?? option;
    return optionValue === value;
  });

  const displayLabel = selectedOption?.label ?? selectedOption ?? placeholder;

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 2;
    setHasScroll(canScroll);

    if (canScroll) {
      const availableScrollDistance = scrollHeight - clientHeight;
      const availableTrackDistance = clientHeight - THUMB_HEIGHT - TRACK_PADDING * 2;
      const scrollRatio = Math.max(0, Math.min(1, scrollTop / availableScrollDistance));
      setThumbTop(scrollRatio * availableTrackDistance);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      updateScrollState();
    }, 20);
    return () => clearTimeout(timeout);
  }, [isOpen, options, updateScrollState]);

  const handleThumbPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startScrollTopRef.current = scrollContainerRef.current?.scrollTop || 0;

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      const deltaY = moveEvent.clientY - startYRef.current;
      const el = scrollContainerRef.current;
      const availableScrollDistance = el.scrollHeight - el.clientHeight;
      const availableTrackDistance = el.clientHeight - THUMB_HEIGHT - TRACK_PADDING * 2;
      if (availableTrackDistance > 0) {
        const scrollDelta = (deltaY / availableTrackDistance) * availableScrollDistance;
        el.scrollTop = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, startScrollTopRef.current + scrollDelta));
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleTrackPointerDown = (e) => {
    e.stopPropagation();
    if (!scrollContainerRef.current) return;
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top - TRACK_PADDING - THUMB_HEIGHT / 2;
    const el = scrollContainerRef.current;
    const availableScrollDistance = el.scrollHeight - el.clientHeight;
    const availableTrackDistance = el.clientHeight - THUMB_HEIGHT - TRACK_PADDING * 2;
    if (availableTrackDistance > 0) {
      const clampedClickY = Math.max(0, Math.min(clickY, availableTrackDistance));
      el.scrollTop = (clampedClickY / availableTrackDistance) * availableScrollDistance;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (dropdownRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;

    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {label && (
        <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
          {label}

          {required && <span className="text-red-500"> *</span>}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previousState) => !previousState)}
        className={cn(
          "flex h-11 w-full items-center justify-between",
          "rounded-lg border border-[#CE9F2D]",
          "bg-white px-3.5 sm:px-4 text-left",
          "text-sm font-semibold text-[#1B1D60]",
          "shadow-2xs transition-all duration-200",
          "hover:border-[#CE9F2D] hover:shadow-xs",
          "focus:outline-none",
          "disabled:cursor-not-allowed",
          "disabled:bg-gray-100 disabled:opacity-50",
          buttonClassName,
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || label || placeholder}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate pr-2">
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center text-[var(--customer-gold-dark)]">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">{displayLabel}</span>
        </div>

        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-[#CE9F2D]",
            "transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 top-[calc(100%+6px)]",
            "z-30 w-full overflow-hidden",
            "rounded-lg",
            "border border-[#CE9F2D]",
            "bg-white shadow-lg",
            optionsClassName,
          )}
        >
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            className="max-h-[220px] overflow-y-auto no-scrollbar"
          >
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </>
            ) : options.length > 0 ? (
              options.map((option, index) => {
                const optionValue = option?.value ?? option;

                const optionLabel = option?.label ?? option;

                const isSelected = value === optionValue;

                return (
                  <button
                    key={`${optionValue}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(optionValue)}
                    className={cn(
                      "block w-full",
                      "px-3.5 pr-4 py-2.5",
                      "text-left text-[13px]",
                      "font-semibold",
                      "transition-all",
                      "border-y border-transparent",
                      "hover:border-[#E5DAB5] hover:bg-[#F8F1E2]",
                      "first:hover:border-t-transparent last:hover:border-b-transparent",
                      isSelected
                        ? "bg-[#F8F1E2] text-[#1B1D60]"
                        : "text-[#2E2E2E] hover:text-[#1B1D60]",
                      optionClassName,
                    )}
                  >
                    {renderOption ? (
                      renderOption(option, {
                        isSelected,
                      })
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0">
                        {option?.icon && (
                          <span className="shrink-0 flex items-center text-[var(--customer-gold-dark)]">
                            {option.icon}
                          </span>
                        )}
                        <span className="truncate">{optionLabel}</span>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">
                No Options Available
              </p>
            )}
          </div>

          {hasScroll && (
            <div
              onPointerDown={handleTrackPointerDown}
              className="absolute right-0.5 top-0 bottom-0 w-[14px] z-20 flex justify-center cursor-pointer select-none"
              style={{
                paddingTop: `${TRACK_PADDING}px`,
                paddingBottom: `${TRACK_PADDING}px`,
              }}
            >
              <div
                onPointerDown={handleThumbPointerDown}
                className="w-[4.5px] rounded-full bg-[#CE9F2D] hover:bg-[#A96F14] transition-colors cursor-grab active:cursor-grabbing"
                style={{
                  height: `${THUMB_HEIGHT}px`,
                  transform: `translateY(${thumbTop}px)`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="mt-1 block text-xs text-red-600">
          {error.message || error}
        </span>
      )}
    </div>
  );
}
