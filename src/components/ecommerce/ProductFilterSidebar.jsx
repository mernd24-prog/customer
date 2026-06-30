import { useState, useEffect, useRef } from "react";
import { ChevronDown, Star } from "lucide-react";

function FilterTick({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200 ${
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
const DEFAULT_MIN_PRICE = MIN_LIMIT;
const DEFAULT_MAX_PRICE = 150000;
const PRICE_STEP = 1000;

function formatPriceInput(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function parsePriceInput(value) {
  const parsed = Number(String(value || "").replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function PriceRangeFilter({ min, max, onChange }) {
  const applyTimerRef = useRef(null);
  const activeThumbRef = useRef(null);
  const rangeValuesRef = useRef({
    min: Number(min || DEFAULT_MIN_PRICE),
    max: Number(max || DEFAULT_MAX_PRICE),
  });
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
    rangeValuesRef.current.min = Number(nextMin);
    setLocalMin(nextMin);
    setMinInput(formatPriceInput(nextMin));
  }, [min]);

  useEffect(() => {
    const nextMax = max || DEFAULT_MAX_PRICE;
    rangeValuesRef.current.max = Number(nextMax);
    setLocalMax(nextMax);
    setMaxInput(formatPriceInput(nextMax));
  }, [max]);

  const minPercent = ((localMin - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;
  const maxPercent = ((localMax - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;

  useEffect(
    () => () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    },
    [],
  );

  const applyValues = (nextMin, nextMax) => {
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = null;
    onChange?.({
      minPrice: nextMin > MIN_LIMIT ? nextMin : undefined,
      maxPrice: nextMax < MAX_LIMIT ? nextMax : undefined,
    });
  };

  const scheduleApply = (nextMin, nextMax) => {
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      applyValues(nextMin, nextMax);
    }, 400);
  };

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), localMax - 1000);
    rangeValuesRef.current.min = value;
    setLocalMin(value);
    setMinInput(formatPriceInput(value));
    scheduleApply(value, localMax);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), localMin + 1000);
    rangeValuesRef.current.max = value;
    setLocalMax(value);
    setMaxInput(formatPriceInput(value));
    scheduleApply(localMin, value);
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
    rangeValuesRef.current.min = clampedValue;
    setLocalMin(clampedValue);
    scheduleApply(clampedValue, localMax);
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
    rangeValuesRef.current.max = clampedValue;
    setLocalMax(clampedValue);
    scheduleApply(localMin, clampedValue);
  };

  const handleMinInputBlur = () => {
    setMinInput(formatPriceInput(localMin));
    applyValues(localMin, localMax);
  };

  const handleMaxInputBlur = () => {
    setMaxInput(formatPriceInput(localMax));
    applyValues(localMin, localMax);
  };

  const getPointerPrice = (clientX, element) => {
    const bounds = element.getBoundingClientRect();
    const thumbRadius = 11;
    const usableWidth = Math.max(bounds.width - thumbRadius * 2, 1);
    const position = Math.min(
      Math.max(clientX - bounds.left - thumbRadius, 0),
      usableWidth,
    );
    const rawValue =
      MIN_LIMIT + (position / usableWidth) * (MAX_LIMIT - MIN_LIMIT);
    return Math.round(rawValue / PRICE_STEP) * PRICE_STEP;
  };

  const updateThumbFromPointer = (thumb, value) => {
    const currentMin = rangeValuesRef.current.min;
    const currentMax = rangeValuesRef.current.max;

    if (thumb === "min") {
      const nextMin = Math.max(
        MIN_LIMIT,
        Math.min(value, currentMax - PRICE_STEP),
      );
      rangeValuesRef.current.min = nextMin;
      setLocalMin(nextMin);
      setMinInput(formatPriceInput(nextMin));
      scheduleApply(nextMin, currentMax);
      return;
    }

    const nextMax = Math.min(
      MAX_LIMIT,
      Math.max(value, currentMin + PRICE_STEP),
    );
    rangeValuesRef.current.max = nextMax;
    setLocalMax(nextMax);
    setMaxInput(formatPriceInput(nextMax));
    scheduleApply(currentMin, nextMax);
  };

  const handleRangePointerDown = (event) => {
    event.preventDefault();
    const value = getPointerPrice(event.clientX, event.currentTarget);
    const explicitThumb = event.target.getAttribute?.("data-price-thumb");
    const { min: currentMin, max: currentMax } = rangeValuesRef.current;
    const thumb =
      explicitThumb ||
      (Math.abs(value - currentMin) <= Math.abs(value - currentMax)
        ? "min"
        : "max");

    activeThumbRef.current = thumb;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateThumbFromPointer(thumb, value);
  };

  const handleRangePointerMove = (event) => {
    if (!activeThumbRef.current) return;
    const value = getPointerPrice(event.clientX, event.currentTarget);
    updateThumbFromPointer(activeThumbRef.current, value);
  };

  const stopRangePointer = (event) => {
    if (!activeThumbRef.current) return;
    activeThumbRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const apply = () => {
    applyValues(localMin, localMax);
  };

  const clear = () => {
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = null;
    setLocalMin(DEFAULT_MIN_PRICE);
    setLocalMax(DEFAULT_MAX_PRICE);
    rangeValuesRef.current = {
      min: DEFAULT_MIN_PRICE,
      max: DEFAULT_MAX_PRICE,
    };
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
      <div
        className="relative h-8 cursor-pointer touch-none"
        onPointerDown={handleRangePointerDown}
        onPointerMove={handleRangePointerMove}
        onPointerUp={stopRangePointer}
        onPointerCancel={stopRangePointer}
        role="presentation"
      >
        <div className="absolute left-[11px] right-[11px] top-1/2 h-[4px] -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-[#D9D3C8]" />
          <div
            className="absolute top-0 h-[4px] rounded-full bg-[#CE9F2D]"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={PRICE_STEP}
          value={localMin}
          onChange={handleMinChange}
          data-price-thumb="min"
          aria-label="Minimum price"
          className="price-range-input"
        />

        <input
          type="range"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={PRICE_STEP}
          value={localMax}
          onChange={handleMaxChange}
          data-price-thumb="max"
          aria-label="Maximum price"
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
            aria-label="Minimum price"
            className="h-[50px] w-full rounded-[12px] border border-[#C9CBEB] bg-[#F7F7FB] px-3 text-[16px] font-medium text-[#6F7480] outline-none ring-0 transition-none placeholder:text-[#8A8FA3] focus:border-[#CE9F2D] focus:outline-none focus:ring-0"
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
            aria-label="Maximum price"
            className="h-[50px] w-full rounded-[12px] border border-[#C9CBEB] bg-[#F7F7FB] px-3 text-[16px] font-medium text-[#6F7480] outline-none ring-0 transition-none placeholder:text-[#8A8FA3] focus:border-[#CE9F2D] focus:outline-none focus:ring-0"
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
            className="flex min-w-0 cursor-pointer items-center gap-3 py-2 text-[18px] font-medium leading-none text-[#434343] transition-colors duration-200 hover:text-[#2D347D] sm:text-[16px]"
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
