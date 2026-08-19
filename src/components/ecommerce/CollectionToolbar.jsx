import { SlidersHorizontal } from "lucide-react";
import CustomDropdown from "../ui/CustomDropdown";

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
  const shellClassName = ` flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 ${className}`;

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

      <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-3 sm:ml-auto mt-4">
        {/* Sort Trigger */}
        {!!sortOptions.length && (
          <CustomDropdown
            className="flex-1 sm:flex-none w-full sm:w-[180px]"
            buttonClassName="h-10 sm:h-11 w-full sm:w-[180px] rounded-lg border border-[#1B1D604D] text-xs sm:text-sm font-semibold text-[#03014D] shadow-xs"
            optionsClassName="w-[200px] sm:w-[190px] rounded-lg xl:rounded-2xl"
            options={sortOptions}
            value={sortValue}
            onChange={onSortChange}
            placeholder={sortOptions[0]?.label || "Sort"}
          />
        )}

        {/* Page Size Trigger */}
        {!!pageSizes.length && (
          <CustomDropdown
            className="flex-1 sm:flex-none w-full sm:w-[180px]"
            buttonClassName="h-10 sm:h-11 w-full sm:w-[180px] rounded-lg border border-[#1B1D604D] text-xs sm:text-sm font-semibold text-[#03014D] shadow-xs"
            optionsClassName="w-[200px] sm:w-[240px] rounded-2xl"
            options={pageSizeOptions}
            value={pageSizeValue}
            onChange={onPageSizeChange}
            placeholder={pageSizeOptions[0]?.label || "Per page"}
          />
        )}

        {/* Optional View Layout Controls */}
        {viewControls}

        {/* Mobile View Sidebar Toggle Link */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="flex flex-1 sm:flex-none h-10 sm:h-11 justify-start items-center gap-1.5 sm:gap-2 rounded-lg border border-[#1B1D604D] bg-white px-3 sm:px-4 text-xs sm:text-sm font-semibold text-[#03014D] shadow-xs transition hover:border-[#CE9F2D] hover:bg-[#F8F3E7] lg:hidden focus:outline-none"
          >
            <SlidersHorizontal size={16} className="shrink-0 text-[#1B1D60]" />
            <span>Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
