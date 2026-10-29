import { SlidersHorizontal } from "lucide-react";
import CustomDropdown from "../../../components/ui/CustomDropdown";

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
  const shellClassName = `flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 ${className}`;

  const pageSizeOptions = pageSizes.map((size) => ({
    value: size,
    label: `${size} per page`,
  }));

  return (
    <div className={shellClassName}>
      {countText && (
        <p className="text-sm font-semibold  text-[var(--customer-muted)]">
          {countText}
        </p>
      )}

      <div className="flex w-full items-stretch gap-2 sm:w-auto sm:items-center sm:gap-3 sm:ml-auto">
        {/* Sort Trigger */}
        {!!sortOptions.length && (
          <CustomDropdown
            className="flex-1 min-w-0 w-full sm:flex-none sm:w-[180px]"
            buttonClassName="h-[44px] min-h-[44px] w-full sm:w-[180px] rounded-lg text-xs sm:text-sm font-semibold text-[#03014D] shadow-xs"
            options={sortOptions}
            value={sortValue}
            onChange={onSortChange}
            placeholder={sortOptions[0]?.label || "Sort"}
          />
        )}

        {/* Page Size Trigger */}
        {!!pageSizes.length && (
          <CustomDropdown
            className="flex-1 min-w-0 w-full sm:flex-none sm:w-[180px]"
            buttonClassName="h-[44px] min-h-[44px] w-full sm:w-[180px] rounded-lg text-xs sm:text-sm font-semibold text-[#03014D] shadow-xs"
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
            className="flex h-[44px] min-h-[44px] w-full flex-1 items-center justify-start gap-1.5 rounded-lg border border-[#E7D9B8] bg-white px-3 text-xs font-semibold text-[#03014D] shadow-xs transition hover:border-[#CE9F2D] hover:bg-[#F8F3E7] focus:outline-none sm:h-11 sm:w-[180px] sm:flex-none sm:gap-2 sm:px-4 sm:text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} className="shrink-0 text-[#CE9F2D]" />
            <span>Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
