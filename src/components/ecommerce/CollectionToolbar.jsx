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
    <div ref={dropdownRef} className="relative inline-block flex-1 sm:flex-none">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 sm:h-11 w-full sm:w-[220px] items-center justify-between rounded-xl border border-[#1B1D604D] bg-white px-3 sm:px-4 text-[13px] sm:text-[14px] font-medium text-[#03014D] shadow-sm transition hover:border-[#CE9F2D] focus:outline-none"
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <ListFilter size={16} className="shrink-0 text-[#03014D] hidden sm:block" />

          <span className="truncate">
            {selectedOption?.label || options[0]?.label || "Select"}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`ml-1.5 sm:ml-3 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] sm:w-[240px] overflow-hidden rounded-2xl border border-[#E7D9B8] bg-white shadow-[0_12px_32px_rgba(0,0,0,.12)] transition-all duration-200 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="py-2">
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left text-[13px] sm:text-[14px] transition-colors hover:bg-[#F8F3E7] ${
                  isSelected
                    ? "bg-[#F8F3E7] font-semibold text-[#03014D]"
                    : "font-medium text-[#444]"
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
    ? `mb-4 flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 ${className}`
    : `flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 ${className}`;

  const pageSizeOptions = pageSizes.map((size) => ({
    value: size,
    label: `${size} per page`,
  }));

  return (
    <div className={shellClassName}>
      {countText && (
        <p className="text-sm font-semibold text-[var(--customer-muted)]">
          {countText}
        </p>
      )}

      <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-3">
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
            className="flex flex-1 sm:flex-none h-10 sm:h-11 justify-center items-center gap-1.5 sm:gap-2 rounded-xl border border-[#1B1D604D] bg-white px-3 sm:px-4 text-[13px] sm:text-[14px] font-medium text-[#03014D] shadow-sm transition hover:border-[#CE9F2D] hover:bg-[#F8F3E7] lg:hidden focus:outline-none"
          >
            <SlidersHorizontal size={16} className="hidden sm:block" />
            Filters
          </button>
        )}
      </div>
    </div>
  );
}
