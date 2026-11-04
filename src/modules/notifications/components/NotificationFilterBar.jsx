
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
    <div className="mb-4 w-full min-w-0">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">

        {/* Search */}
        <label className="relative block w-full min-w-0 sm:max-w-[640px] sm:flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications"
            className="h-11 w-full rounded-lg border border-[#e4ca8e] bg-white pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none transition-shadow duration-200 focus:bg-white focus:outline-none focus:shadow-[0_4px_14px_rgba(31,36,48,0.08)]"
          />

          {Boolean(query) && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#6F7480] transition hover:text-[#1F2430]"
            >
              <X size={16} />
            </button>
          )}
        </label>

        {/* Filters */}
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:gap-3">

          <FilterDropdown
            options={[
              { value: 4, label: "4 per page" },
              { value: 6, label: "6 per page" },
              { value: 8, label: "8 per page" },
              { value: 12, label: "12 per page" },
              { value: 20, label: "20 per page" },
            ]}
            value={pageSize}
            onChange={(value) => setPageSize(Number(value))}
            placeholder="Per page"
            className="w-full min-w-0 sm:w-[150px]"
          />

          <FilterDropdown
            options={filterOptions}
            value={activeFilter}
            onChange={setActiveFilter}
            placeholder="Filter"
            className="w-full min-w-0 sm:w-[170px]"
          />

        </div>
      </div>
    </div>
  );
}
