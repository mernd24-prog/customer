import React from "react";
import { Search, X } from "lucide-react";
import FilterDropdown from "../../../components/ui/FilterDropdown";

export function NotificationFilterBar({
  query,
  setQuery,
  pageSize,
  setPageSize,
  filterOptions,
  activeFilter,
  setActiveFilter,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <label className="relative block w-full sm:max-w-[640px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications"
            className="h-11 w-full rounded-lg border border-[#E4DDCF] bg-[#FAF6EE]/40 pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none transition-all focus:outline-none focus:bg-white focus:ring-3 focus:ring-[#D6A323]/15 shadow-2xs"
          />
          {Boolean(query) && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#6F7480] hover:text-[#1F2430] transition"
            >
              <X size={16} />
            </button>
          )}
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <FilterDropdown
            options={[
              { value: 4, label: "4 per page" },
              { value: 6, label: "6 per page" },
              { value: 8, label: "8 per page" },
              { value: 12, label: "12 per page" },
              { value: 20, label: "20 per page" },
            ]}
            value={pageSize}
            onChange={(v) => setPageSize(Number(v))}
            placeholder="Per page"
            className="w-full sm:w-[150px]"
          />

          <FilterDropdown
            options={filterOptions}
            value={activeFilter}
            onChange={(val) => setActiveFilter(val)}
            placeholder="Filter"
            className="w-full sm:w-[170px]"
          />
        </div>
      </div>
    </div>
  );
}
