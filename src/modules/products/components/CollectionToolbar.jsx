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
  const shellClassName = `flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 ${className}`;

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

      <div className=" flex w-full sm:w-auto items-center gap-2 sm:gap-3 sm:ml-auto">
        {/* Sort Trigger */}
        {!!sortOptions.length && (
          <CustomDropdown
            className="flex-1 sm:flex-none w-full sm:w-[180px]"
            buttonClassName="h-10 sm:h-11 w-full sm:w-[180px] rounded-lg text-xs sm:text-sm font-semibold text-navy-dark shadow-xs"
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
            buttonClassName="h-10 sm:h-11 w-full sm:w-[180px] rounded-lg text-xs sm:text-sm font-semibold text-navy-dark shadow-xs"
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
            className="flex h-10 flex-1 items-center justify-start gap-1.5 rounded-[var(--customer-radius-sm)] border border-border bg-white px-3 text-xs font-semibold text-navy-dark shadow-xs transition hover:border-gold hover:bg-gold-soft focus-visible:ring-2 focus-visible:ring-gold/50 sm:h-11 sm:flex-none sm:gap-2 sm:px-4 sm:text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} className="shrink-0 text-gold" />
            <span>Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
