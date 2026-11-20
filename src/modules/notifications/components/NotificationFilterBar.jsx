
import React from "react";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import SearchBar from "../../../components/ui/input/SearchBar";

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

        <SearchBar
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notifications"
          className="w-full min-w-0 sm:max-w-[640px] sm:flex-1"
          showButton={false}
        />

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
