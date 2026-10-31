import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/common";
import { createPortal } from "react-dom";

const THUMB_HEIGHT = 32; // Fixed compact short pill thumb
const TRACK_PADDING = 6; // Padding from top/bottom borders

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select Option",
  label,
  labelClassName = "",
  labelGapClassName = "mb-2",
  required = false,
  disabled = false,
  error,
  className = "",
  buttonClassName = "",
  optionsClassName = "",
  optionClassName = "",
  ariaLabel,
  searchable = false,
  portal = false,
  typeahead = false,

  // Used when custom option UI is required
  renderOption,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const filteredOptions = searchable || typeahead
    ? options.filter((option) =>
        String(option?.label ?? option?.value ?? option)
          .trim().toLowerCase().startsWith(search.trim().toLowerCase()),
      )
    : options;
  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
    if (!isOpen) {
      setSearch("");
      typedRef.current = { text: "", time: 0 };
    }
  }, [isOpen, searchable]);
  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [search]);
  const dropdownRef = useRef(null);
  const panelRef = useRef(null);
  const typedRef = useRef({ text: "", time: 0 });
  const [panelStyle, setPanelStyle] = useState({});
  useEffect(() => {
    if (!isOpen || !portal) return;
    const rect = dropdownRef.current?.querySelector("button")?.getBoundingClientRect();
    if (!rect) return;
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const upwards = below < 220 && above > below;
    setPanelStyle({
      position: "fixed", left: rect.left, width: rect.width,
      top: upwards ? "auto" : rect.bottom + 6,
      bottom: upwards ? window.innerHeight - rect.top + 6 : "auto",
      zIndex: 11000,
      maxHeight: Math.max(80, Math.min(220, upwards ? above : below)),
    });
  }, [isOpen, portal]);
  const renderPanel = (panel) => portal ? createPortal(panel, document.body) : panel;
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

    // Do not show scrollbar for 5 or fewer options
    if (filteredOptions.length <= 5) {
      setHasScroll(false);
      setThumbTop(0);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 2;

    setHasScroll(canScroll);

    if (canScroll) {
      const availableScrollDistance = scrollHeight - clientHeight;
      const availableTrackDistance =
        clientHeight - THUMB_HEIGHT - TRACK_PADDING * 2;

      const scrollRatio = Math.max(
        0,
        Math.min(1, scrollTop / availableScrollDistance),
      );

      setThumbTop(scrollRatio * availableTrackDistance);
    }
  }, [filteredOptions.length]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      updateScrollState();
    }, 20);
    return () => clearTimeout(timeout);
  }, [isOpen, options, search, updateScrollState]);

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
      const availableTrackDistance =
        el.clientHeight - THUMB_HEIGHT - TRACK_PADDING * 2;
      if (availableTrackDistance > 0) {
        const scrollDelta =
          (deltaY / availableTrackDistance) * availableScrollDistance;
        el.scrollTop = Math.max(
          0,
          Math.min(
            el.scrollHeight - el.clientHeight,
            startScrollTopRef.current + scrollDelta,
          ),
        );
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
    const availableTrackDistance =
      el.clientHeight - THUMB_HEIGHT - TRACK_PADDING * 2;
    if (availableTrackDistance > 0) {
      const clampedClickY = Math.max(
        0,
        Math.min(clickY, availableTrackDistance),
      );
      el.scrollTop =
        (clampedClickY / availableTrackDistance) * availableScrollDistance;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !panelRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (dropdownRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
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
        <span className={cn("block text-sm font-semibold text-[#2E2E2E]", labelGapClassName, labelClassName)}>
          {label}

          {required && <span className="text-red-500"> *</span>}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previousState) => !previousState)}
        onKeyDown={(event) => {
          if (!typeahead) return;
          if (event.key === "Escape") { setIsOpen(false); return; }
          if (event.key === "Backspace") {
            event.preventDefault();
            const text = typedRef.current.text.slice(0, -1);
            typedRef.current = { text, time: Date.now() };
            setSearch(text);
            return;
          }
          if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return;
          event.preventDefault();
          const now = Date.now();
          const previous = now - typedRef.current.time < 700 ? typedRef.current.text : "";
          const text = previous + event.key.toLowerCase();
          typedRef.current = { text, time: now };
          setSearch(text);
          setIsOpen(true);
        }}
        className={cn( 
          
          "custom-dropdown-trigger",
          "customer-dropdown-button",
          "flex h-11 w-full items-center justify-between",
          "rounded-lg border border-[#CE9F2D]",
          "bg-white px-3.5 sm:px-4 text-left",
          "text-sm font-semibold text-[#1B1D60]",
          "shadow-2xs transition-all duration-200",
          "hover:border-[#CE9F2D] hover:shadow-xs",
          "outline-none focus:outline-none focus:ring-0 focus:border-[#CE9F2D]",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CE9F2D]",
          "active:outline-none active:ring-0 active:border-[#CE9F2D]",
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

      {isOpen && renderPanel(
        <div
          ref={panelRef}
          style={portal ? panelStyle : undefined}
          className={cn(
            "absolute left-0 top-[calc(100%+6px)]",
            "z-30 w-full overflow-hidden",
            "rounded-lg",
            "border border-[#CE9F2D]",
            "bg-white shadow-lg",
            optionsClassName,
          )}
        >
          {searchable && (
            <div className="border-b border-[#E7D9B8] p-2">
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setIsOpen(false);
                    dropdownRef.current?.querySelector("button")?.focus();
                  }
                }}
                placeholder="Search..."
                aria-label={`Search ${label || placeholder}`}
                className="h-9 w-full min-w-0 rounded-md border border-[#E7D9B8] bg-white px-2 text-sm outline-none focus:border-[#CE9F2D]"
              />
            </div>
          )}
          <div
            role="listbox"
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            className="max-h-[220px] overflow-y-auto no-scrollbar"
            style={portal ? { maxHeight: panelStyle.maxHeight } : undefined}
          >
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
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
                      "text-left text-sm",
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
                {search ? "No matching options" : "No Options Available"}
              </p>
            )}
          </div>

          {hasScroll && (
            <div
              onPointerDown={handleTrackPointerDown}
              className="absolute right-0.5 bottom-0 w-[14px] z-20 flex justify-center cursor-pointer select-none"
              style={{
                top: searchable ? "53px" : 0,
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
