import { useState, useEffect } from "react";
import { ChevronDown, Star } from "lucide-react";

function FilterTick({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-[19px] w-[19px]  shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200 ${
        checked
          ? "border-[#3E4093] bg-[#3E4093]"
          : "border-[#3E4093] bg-transparent"
      }`}
    >
      <span
        className={`h-[8px] w-[8px] rounded-[2px] bg-white transition-opacity duration-200 ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

export function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen, title]);

  return (
    <div className="border-b border-[#EEDFB9] py-6 last:border-b-0 sm:py-7">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left font-dm-sans text-xl font-semibold leading-none tracking-normal text-[#2D347D] transition-colors duration-200 sm:text-[20px]"
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
            ? "mt-5 grid-rows-[1fr] opacity-100 sm:mt-6"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

const MIN_LIMIT = 0;
const MAX_LIMIT = 150000;
const DEFAULT_MIN_PRICE = 5000;
const DEFAULT_MAX_PRICE = 150000;

function formatPriceInput(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function parsePriceInput(value) {
  const parsed = Number(String(value || "").replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function PriceRangeFilter({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min || DEFAULT_MIN_PRICE);
  const [localMax, setLocalMax] = useState(max || DEFAULT_MAX_PRICE);
  const [minInput, setMinInput] = useState(
    formatPriceInput(min || DEFAULT_MIN_PRICE),
  );
  const [maxInput, setMaxInput] = useState(
    formatPriceInput(max || DEFAULT_MAX_PRICE),
  );

  useEffect(() => {
    const nextMin = min || DEFAULT_MIN_PRICE;
    setLocalMin(nextMin);
    setMinInput(formatPriceInput(nextMin));
  }, [min]);

  useEffect(() => {
    const nextMax = max || DEFAULT_MAX_PRICE;
    setLocalMax(nextMax);
    setMaxInput(formatPriceInput(nextMax));
  }, [max]);

  const minPercent = ((localMin - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;
  const maxPercent = ((localMax - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), localMax - 1000);
    setLocalMin(value);
    setMinInput(formatPriceInput(value));
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), localMin + 1000);
    setLocalMax(value);
    setMaxInput(formatPriceInput(value));
  };

  const handleMinInputChange = (event) => {
    const nextValue = event.target.value;
    setMinInput(nextValue);

    const parsedValue = parsePriceInput(nextValue);
    if (parsedValue == null) return;

    const clampedValue = Math.max(
      MIN_LIMIT,
      Math.min(parsedValue, localMax - 1000),
    );
    setLocalMin(clampedValue);
  };

  const handleMaxInputChange = (event) => {
    const nextValue = event.target.value;
    setMaxInput(nextValue);

    const parsedValue = parsePriceInput(nextValue);
    if (parsedValue == null) return;

    const clampedValue = Math.min(
      MAX_LIMIT,
      Math.max(parsedValue, localMin + 1000),
    );
    setLocalMax(clampedValue);
  };

  const handleMinInputBlur = () => {
    setMinInput(formatPriceInput(localMin));
  };

  const handleMaxInputBlur = () => {
    setMaxInput(formatPriceInput(localMax));
  };

  const apply = () => {
    onChange?.({
      minPrice: localMin || undefined,
      maxPrice: localMax || undefined,
    });
  };

  const clear = () => {
    setLocalMin(DEFAULT_MIN_PRICE);
    setLocalMax(DEFAULT_MAX_PRICE);
    setMinInput(formatPriceInput(DEFAULT_MIN_PRICE));
    setMaxInput(formatPriceInput(DEFAULT_MAX_PRICE));

    onChange?.({
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    apply();
  };

  return (
    <form className="grid gap-5 pt-1 " onSubmit={handleSubmit}>
      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#D9D3C8]" />

        <div
          className="absolute top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#CE9F2D]"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        <input
          type="range"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step="1000"
          value={localMin}
          onChange={handleMinChange}
          className="price-range-input"
        />

        <input
          type="range"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step="1000"
          value={localMax}
          onChange={handleMaxChange}
          className="price-range-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-3 block text-[18px] font-medium leading-none text-[#373737] sm:text-[16px]">
            Min
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            className="h-[50px] w-full rounded-[12px] border border-[#C9CBEB] bg-[#F7F7FB]  text-[18px] font-medium text-[#6F7480] outline-none ring-0 transition-none placeholder:text-[#8A8FA3] focus:border-[#C9CBEB] focus:outline-none focus:ring-0"
          />
        </div>

        <div>
          <label className="mb-3 block text-[18px] font-medium leading-none text-[#373737] sm:text-[16px]">
            Max
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            className="h-[50px] w-full rounded-[12px] border border-[#C9CBEB] bg-[#F7F7FB]  text-[18px] font-medium text-[#6F7480] outline-none ring-0 transition-none placeholder:text-[#8A8FA3] focus:border-[#C9CBEB] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* <BrandButton
        variant="primary"
        rounded
        size="sm"
        label="Apply"
        type="submit"
        className="h-[50px] w-full rounded-full text-sm font-bold shadow-none"
      /> */}

      {(min || max) && (
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-red-500 underline-offset-2 hover:text-red-600 hover:underline"
        >
          Clear price filter
        </button>
      )}
    </form>
  );
}

export function OptionFilter({
  name,
  options,
  selected,
  onChange,
  emptyText = "Loading...",
  multiple = false,
}) {
  const isCategoryList = name?.toLowerCase().includes("category");
  const allowViewMore = (options?.length || 0) > 5;
  const [expanded, setExpanded] = useState(false);
  const selectedValues = Array.isArray(selected)
    ? selected.map(String)
    : selected != null
      ? [String(selected)]
      : [];
  const isMultiSelect = multiple || Array.isArray(selected);
  const selectedSet = new Set(selectedValues);

  useEffect(() => {
    setExpanded(false);
  }, [name, options]);

  if (!options?.length) {
    return <p className="text-sm text-[#6f7480]">{emptyText}</p>;
  }

  const visibleOptions =
    allowViewMore && !expanded ? options.slice(0, 5) : options;
  const shouldScroll = allowViewMore && expanded;

  return (
    <div className="grid gap-1">
      <div
        className={`grid max-w-full gap-0.5 ${
          shouldScroll ? "filter-scrollbar  overflow-y-auto pr-2" : ""
        }`}
      >
        {visibleOptions.map((option) => {
          const value =
            option.value ?? option.id ?? option._id ?? option.categoryKey;

          const label = option.label ?? option.title ?? option.name ?? value;

          const count = option.count ?? option.doc_count;

          const checked = selectedSet.has(String(value));

          if (isCategoryList) {
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange?.(checked ? undefined : String(value))}
                className={`w-full py-2  text-left text-[16px] font-semibold  transition-colors duration-200 ${
                  checked ? "text-[#2D347D]" : "text-[#2E2E2E]"
                }`}
              >
                {label}
              </button>
            );
          }

          return (
            <label
              key={value}
              className="flex min-w-0 cursor-pointer items-center gap-3 py-2 text-[18px] font-medium leading-none   text-[#434343] transition-colors duration-200 hover:text-[#2D347D]  sm:text-[16px]"
            >
              <input
                type="checkbox"
                name={name}
                value={value}
                checked={checked}
                onChange={() => {
                  if (!isMultiSelect) {
                    onChange?.(checked ? undefined : String(value));
                    return;
                  }

                  const nextValues = checked
                    ? selectedValues.filter((item) => item !== String(value))
                    : [...selectedValues, String(value)];
                  onChange?.(nextValues);
                }}
                className="sr-only "
              />

              <FilterTick checked={checked} className="" />

              <span className="min-w-0 flex-1 truncate leading-normal">
                {label}
              </span>

              {count != null && (
                <span className="shrink-0  font-medium leading-none text-[#373737] text-[14px]">
                  ( {count} )
                </span>
              )}
            </label>
          );
        })}
      </div>

      {allowViewMore && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="pt-3 text-left text-[16px] font-semibold leading-none text-[#5960B8] transition-colors duration-200 hover:text-[#2D347D]"
        >
          {expanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
}

export function CheckboxListFilter({
  name,
  options = [],
  selected = [],
  onChange,
  emptyText = "No options available",
}) {
  const selectedValues = Array.isArray(selected)
    ? selected.map(String)
    : selected != null
      ? [String(selected)]
      : [];

  if (!options.length) {
    return <p className="text-sm text-[#6f7480]">{emptyText}</p>;
  }

  const selectedSet = new Set(selectedValues);
  const shouldScroll = options.length > 5;

  return (
    <div
      className={`grid gap-1 ${
        shouldScroll ? "filter-scrollbar  overflow-y-auto pr-2" : ""
      }`}
    >
      {options.map((option) => {
        const value = String(option.value ?? option.id ?? option.key ?? "");
        const label = option.label ?? option.name ?? value;
        const checked = selectedSet.has(value);
        const count = option.count;

        return (
          <label
            key={value}
            className="flex min-w-0 cursor-pointer items-center gap-3 py-2 text-[18px] font-medium leading-none   text-[#434343] transition-colors duration-200 hover:text-[#2D347D] sm:text-[16px]"
          >
            <input
              type="checkbox"
              name={name}
              value={value}
              checked={checked}
              onChange={() => {
                const nextValues = checked
                  ? selectedValues.filter((item) => item !== value)
                  : [...selectedValues, value];
                onChange?.(nextValues);
              }}
              className="sr-only"
            />

            <FilterTick checked={checked} />

            <span className="min-w-0  flex-1 truncate leading-normal">
              {label}
            </span>

            {count != null && (
              <span className="shrink-0  font-medium leading-none text-[#373737] text-[14px]">
                ( {count} )
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function RatingFilter({
  selected,
  onChange,
  multiple = false,
  counts = {},
}) {
  const selectedValues = Array.isArray(selected)
    ? selected.map(String)
    : selected != null
      ? [String(selected)]
      : [];
  const isMultiSelect = multiple || Array.isArray(selected);
  const selectedSet = new Set(selectedValues);

  return (
    <div
      className={`grid gap-0.5 ${
        multiple ? "filter-scrollbar overflow-y-auto pr-2" : ""
      }`}
    >
      {[5, 4, 3, 2, 1].map((stars) => {
        const value = String(stars);
        const isSelected = selectedSet.has(value);

        return (
          <label
            key={stars}
            className="flex min-w-0 cursor-pointer items-center gap-3 py-2 text-[18px] font-medium leading-none text-[#434343] transition-colors duration-200 hover:text-[#2D347D] sm:text-[16px]"
          >
            <input
              type="checkbox"
              name="rating"
              value={stars}
              checked={isSelected}
              onChange={() => {
                if (!isMultiSelect) {
                  onChange?.(isSelected ? undefined : value);
                  return;
                }

                const nextValues = isSelected
                  ? selectedValues.filter((item) => item !== value)
                  : [...selectedValues, value];
                onChange?.(nextValues);
              }}
              className="sr-only"
            />

            <FilterTick checked={isSelected} />

            <span className="flex min-w-0 flex-1 items-center gap-1.5 leading-normal">
              <Star size={16} className="fill-[#D4A025] text-[#D4A025]" />
              <span>{stars === 5 ? "(5)" : `(${stars} & Above)`}</span>
            </span>

            {counts[String(stars)] != null && (
              <span className="shrink-0  font-medium leading-none text-[#373737] text-[14px]">
                ( {counts[String(stars)]} )
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default function ProductFilterSidebar({
  sections = [],
  className = "",
  onClearAll,
}) {
  return (
    <aside
      className={`w-full  overflow-x-hidden lg:sticky lg:top-24 lg:w-[320px] lg:shrink-0 lg:self-start xl:w-[263px] ${className}`}
    >
      <div className="w-full overflow-hidden rounded-[20px] border border-[#EEDFB9] bg-[#FFFDF8] shadow-none">
        <div className="flex items-center justify-between gap-4 border-b border-[#EEDFB9] px-4 py-5 min-[375px]:px-5 sm:px-6 sm:py-6">
          <h3 className="font-dm-sans text-[24px] font-semibold  text-[#373737] sm:text-[30px]">
            Filters
          </h3>

          <button
            type="button"
            onClick={onClearAll}
            disabled={!onClearAll}
            className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-[14px]   text-[14px] font-semibold text-[#5960B8]  sm:text-[16px]"
          >
            Clear all
          </button>
        </div>

        <div className="px-4  min-[375px]:px-5 sm:px-6">
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
