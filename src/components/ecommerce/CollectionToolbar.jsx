import { SlidersHorizontal } from "lucide-react";

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
    : `flex items-center gap-3 ${className}`;

  return (
    <div className={shellClassName}>
      {countText && <p className="font-montserrat text-sm text-[#787878]">{countText}</p>}
      <div className="flex items-center gap-3">
        {!!sortOptions.length && (
          <select
            value={sortValue}
            onChange={(event) => onSortChange?.(event.target.value)}
            className="rounded-[6px] border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
        {!!pageSizes.length && (
          <select
            value={pageSizeValue}
            onChange={(event) => onPageSizeChange?.(event.target.value)}
            className="rounded-[6px] border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        )}
        {viewControls}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="button secondary flex items-center gap-1.5 px-3 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        )}
      </div>
    </div>
  );
}
