import { useEffect, useRef, useState } from "react";
import { ChevronDown, ListFilter, SlidersHorizontal } from "lucide-react";

{
  /* DROPDOWN COMPONENT */
}
function ToolbarDropdown({ value = "", options = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-10 w-[180px] items-center justify-between gap-3 rounded-[var(--customer-radius-sm)] border border-[#1B1D604D] bg-white px-3 py-3 text-left text-base md:text-lg font-medium text-[#03014D] shadow-sm transition-all duration-300 ease-in-out"
      >
        <span className="flex items-center gap-2 truncate">
          <ListFilter size={16} className="shrink-0 text-[#03014D]" />
          {selectedOption?.label || options[0]?.label || "Select"}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--customer-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Menu - Fixed size & strict dropdown positioning */}
      <div
        className={`absolute -right-3.5  top-full z-50 mt-1 w-[200px] overflow-hidden rounded-2xl border border-[#1B1D601A] bg-white shadow-[0_12px_30px_rgba(3,1,77,0.08)] transition-all duration-300 ease-in-out ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="max-h-[320px]  overflow-y-auto overscroll-contain p-1.5 [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={`w-full  whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm leading-snug transition-all duration-300 ease-in-out hover:bg-[#F8F3E7] hover:text-[#03014D] focus-visible:bg-[#F8F3E7] focus-visible:outline-none ${
                  isSelected
                    ? "font-semibold text-[#03014D]"
                    : "font-medium text-[var(--customer-ink)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
{
  /* MAIN TOOLBAR */
}
export default function CollectionToolbar({
  countText,
  sortValue = "",
  sortOptions = [],
  onSortChange,
  pageSizeValue,
  pageSizes = [],
  onPageSizeChange,
  viewControls,
  onOpenFilters,
  className = "",
}) {
  const shellClassName = countText
    ? `mb-4 flex flex-wrap items-center justify-between gap-3 ${className}`
    : `flex flex-wrap items-center gap-3 ${className}`;

  const pageSizeOptions = pageSizes.map((size) => ({
    value: size,
    label: `${size} per page`,
  }));

  return (
    <div className={shellClassName}>
      {countText && (
        <p className="text-sm  font-semibold text-[var(--customer-muted)]">
          {countText}
        </p>
      )}

      <div className="flex  flex-wrap items-center gap-3">
        {/* Sort Trigger */}
        {!!sortOptions.length && (
          <ToolbarDropdown
            value={sortValue}
            options={sortOptions}
            onChange={onSortChange}
          />
        )}

        {/* Page Size Trigger */}
        {!!pageSizes.length && (
          <ToolbarDropdown
            value={pageSizeValue}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
        )}

        {/* Optional View Layout Controls */}
        {viewControls}

        {/* Mobile View Sidebar Toggle Link */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="flex min-h-10  items-center gap-1.5 rounded-[var(--customer-radius-sm)] border border-[#1B1D604D] bg-white px-3 py-4  text-sm font-semibold text-[#03014D] shadow-sm transition-all duration-300 ease-in-out hover:border-[var(--customer-gold)] hover:bg-[#F8F3E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/30 lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        )}
      </div>
    </div>
  );
}
