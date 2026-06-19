import { useState, useEffect } from "react";
import { ChevronDown, Star, X } from "lucide-react";
import BrandButton from "../ui/BrandButton";

export function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E8E0D0] py-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-[15px] font-bold text-[#1F2430] transition-colors duration-200"
      >
        {title}
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#3E4093] transition-transform duration-300 ease-in-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export function PriceRangeFilter({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min || "");
  const [localMax, setLocalMax] = useState(max || "");

  useEffect(() => {
    setLocalMin(min || "");
  }, [min]);

  useEffect(() => {
    setLocalMax(max || "");
  }, [max]);

  const apply = () => {
    onChange?.({
      minPrice: localMin || undefined,
      maxPrice: localMax || undefined,
    });
  };

  const clear = () => {
    setLocalMin("");
    setLocalMax("");

    onChange?.({
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-[#6f7480]">
            Min (₹)
          </label>
          <input
            type="number"
            value={localMin}
            onChange={(event) => setLocalMin(event.target.value)}
            placeholder="0"
            min="0"
            className="h-10 w-full rounded-lg border border-[#E8E0D0] bg-white px-3 text-sm text-[#1F2430] outline-none transition-all duration-200 placeholder:text-[#a6a6a6] focus:border-[#3E4093] focus:ring-2 focus:ring-[#3E4093]/10"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-[#6f7480]">
            Max (₹)
          </label>
          <input
            type="number"
            value={localMax}
            onChange={(event) => setLocalMax(event.target.value)}
            placeholder="Any"
            min="0"
            className="h-10 w-full rounded-lg border border-[#E8E0D0] bg-white px-3 text-sm text-[#1F2430] outline-none transition-all duration-200 placeholder:text-[#a6a6a6] focus:border-[#3E4093] focus:ring-2 focus:ring-[#3E4093]/10"
          />
        </div>
      </div>

      <BrandButton
        variant="primary"
        rounded
        size="sm"
        label="Apply"
        className="h-9 text-xs"
        onClick={apply}
      />

      {(min || max) && (
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-red-500 underline-offset-2 transition-colors duration-200 hover:text-red-600 hover:underline"
        >
          Clear price filter
        </button>
      )}
    </div>
  );
}

export function OptionFilter({
  name,
  options,
  selected,
  onChange,
  emptyText = "Loading...",
}) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!options?.length) {
    return (
      <p className="text-xs text-[#6f7480]">
        {emptyText}
      </p>
    );
  }

  const filteredOptions =
    searchTerm.trim()
      ? options.filter((option) => {
          const label =
            option.label ?? option.title ?? option.name ?? option.value ?? "";
          return String(label)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      : options;

  return (
    <div className="grid gap-2">
      {options.length > 6 && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${name || "options"}…`}
          className="mb-1 h-9 w-full rounded-lg border  bg-white px-3 text-xs text-[#1F2430] outline-none transition-all duration-200 placeholder:text-[#a6a6a6]"
        />
      )}

      <div className="grid max-h-52 max-w-full gap-1 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
        {filteredOptions.map((option) => {
          const value =
            option.value ?? option.id ?? option._id ?? option.categoryKey;

          const label =
            option.label ?? option.title ?? option.name ?? value;

          const count = option.count ?? option.doc_count;

          const checked = selected === String(value);

          return (
            <label
              key={value}
              className={`flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200 ${
                checked
                  ? "bg-[#3E4093]/5 font-semibold text-[#3E4093]"
                  : "text-[#1F2430] hover:bg-[#FAF6EE]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() =>
                  onChange?.(
                    checked ? undefined : String(value)
                  )
                }
                className="mt-0 h-4 w-4 shrink-0 accent-[#3E4093]"
              />

              <span className="min-w-0 flex-1 truncate leading-snug">
                {label}
              </span>

              {count != null && (
                <span className="shrink-0 rounded-full bg-[#F0EBE0] px-2 py-0.5 text-[11px] font-medium text-[#6f7480]">
                  {count}
                </span>
              )}
            </label>
          );
        })}

        {filteredOptions.length === 0 && searchTerm && (
          <p className="px-2 py-2 text-xs text-[#a6a6a6]">
            No matches for &ldquo;{searchTerm}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

export function RatingFilter({ selected, onChange }) {
  return (
    <div className="grid gap-1.5">
      {[4, 3, 2, 1].map((stars) => {
        const isSelected = selected === String(stars);

        return (
          <label
            key={stars}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-all duration-200 ${
              isSelected
                ? "bg-[#3E4093]/5 font-semibold text-[#3E4093]"
                : "text-[#1F2430] hover:bg-[#FAF6EE]"
            }`}
          >
            <input
              type="radio"
              name="rating"
              value={stars}
              checked={isSelected}
              onChange={() =>
                onChange?.(
                  isSelected
                    ? undefined
                    : String(stars)
                )
              }
              className="h-4 w-4 accent-[#3E4093]"
            />

            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={
                    index < stars
                      ? "fill-[#CE9F2D] text-[#CE9F2D]"
                      : "fill-[#E8E0D0] text-[#E8E0D0]"
                  }
                />
              ))}

              <span className="ml-1.5 text-xs text-[#6f7480]">
                & up
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function ProductFilterSidebar({
  sections = [],
  className = "",
}) {
  return (
    <aside
      className={`w-full overflow-x-hidden lg:sticky lg:top-24 lg:w-64 xl:w-72 lg:shrink-0 lg:self-start lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin] ${className}`}
    >
      <div className="w-full overflow-hidden rounded-2xl border border-[#E8E0D0] bg-white shadow-[0_4px_20px_rgba(31,36,48,0.04)]">
        {/* Sidebar Header */}
        <div className="border-b border-[#E8E0D0] bg-gradient-to-r from-[#FDFBF7] to-[#F8F3E7] px-5 py-4">
          <h3 className="font-dm-sans text-[16px] font-bold text-[#3E4093]">
            Filters
          </h3>
        </div>

        {/* Filter Sections */}
        <div className="px-5">
          {sections.map((section) => (
            <FilterSection
              key={section.key || section.title}
              title={section.title}
              defaultOpen={section.defaultOpen}
            >
              {section.content}
            </FilterSection>
          ))}
        </div>
      </div>
    </aside>
  );
}
