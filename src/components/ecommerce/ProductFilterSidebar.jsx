import {
  cloneElement,
  isValidElement,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ChevronDown, Search, Star, X } from "lucide-react";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCloseRequest, setSearchCloseRequest] = useState(null);
  const searchInputRef = useRef(null);
  const searchable = ["brand", "category"].some((item) =>
    String(title || "")
      .toLowerCase()
      .includes(item),
  );

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen, title]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
      return;
    }

    setOpen(true);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  const content = isValidElement(children)
    ? cloneElement(children, { searchQuery, searchCloseRequest })
    : children;
  const closeSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      setSearchCloseRequest({ query, requestedAt: Date.now() });
    }
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <div className="border-b border-[#EEDFB9] py-6 last:border-b-0 sm:py-7">
      {searchOpen ? (
        <div className="flex h-9 w-full items-center gap-2 rounded-full bg-[#F4F4F6] px-3">
          <Search size={16} className="shrink-0 text-[#6F7480]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeSearch();
            }}
            placeholder={`Search ${title.toLowerCase()}`}
            className="min-w-0 flex-1 bg-transparent border-none border focus:outline-none text-sm font-semibold text-[#2E2E2E] outline-none placeholder:text-[#8D8F98]"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#5960B8] transition-colors duration-200 hover:bg-white hover:text-[#2D347D]"
            aria-label={`Close ${title} search`}
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left font-dm-sans text-xl font-semibold leading-none tracking-normal text-[#2D347D] transition-colors duration-200 sm:text-[20px]"
          >
            <span className="truncate">{title}</span>
            <ChevronDown
              size={18}
              className={`shrink-0 text-[#3E4093] transition-transform duration-300 ease-in-out ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {searchable && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F6] text-[#6F7480] transition-colors duration-200 hover:bg-[#ECECF0] hover:text-[#2D347D]"
              aria-label={`Search ${title}`}
            >
              <Search size={17} />
            </button>
          )}
        </div>
      )}

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open
            ? "mt-5 grid-rows-[1fr] opacity-100 sm:mt-6"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{content}</div>
      </div>
    </div>
  );
}

const MIN_LIMIT = 0;
const MAX_LIMIT = 150000;
const DEFAULT_MIN_PRICE = MIN_LIMIT;
const DEFAULT_MAX_PRICE = 150000;
const PRICE_STEP = 1000;

export function PriceRangeFilter({ min, max, onChange }) {
  const applyTimerRef = useRef(null);
  const activeThumbRef = useRef(null);
  const rangeValuesRef = useRef({
    min: Number(min || DEFAULT_MIN_PRICE),
    max: Number(max || DEFAULT_MAX_PRICE),
  });
  const [localMin, setLocalMin] = useState(min || DEFAULT_MIN_PRICE);
  const [localMax, setLocalMax] = useState(max || DEFAULT_MAX_PRICE);

  useEffect(() => {
    const nextMin = min || DEFAULT_MIN_PRICE;
    rangeValuesRef.current.min = Number(nextMin);
    setLocalMin(nextMin);
  }, [min]);

  useEffect(() => {
    const nextMax = max || DEFAULT_MAX_PRICE;
    rangeValuesRef.current.max = Number(nextMax);
    setLocalMax(nextMax);
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
    scheduleApply(value, localMax);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), localMin + 1000);
    rangeValuesRef.current.max = value;
    setLocalMax(value);
    scheduleApply(localMin, value);
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
      scheduleApply(nextMin, currentMax);
      return;
    }

    const nextMax = Math.min(
      MAX_LIMIT,
      Math.max(value, currentMin + PRICE_STEP),
    );
    rangeValuesRef.current.max = nextMax;
    setLocalMax(nextMax);
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
    <form className="space-y-3 pt-1" onSubmit={handleSubmit}>
      <div>
        <p className="mb-5 text-sm font-bold uppercase tracking-wide text-[#2E2E2E]">
          PRICE
        </p>

        {/* Slider */}
        <div
          className="relative mx-auto h-8 w-[180px] touch-none"
          onPointerDown={handleRangePointerDown}
          onPointerMove={handleRangePointerMove}
          onPointerUp={stopRangePointer}
          onPointerCancel={stopRangePointer}
        >
          {/* Background Track */}
          <div className="absolute left-[8px] right-[8px] top-1/2 -translate-y-1/2">
            <div className="h-[3px] rounded-full bg-[#E6E1D8]" />

            {/* Active Track */}
            <div
              className="absolute top-0 h-[3px] rounded-full bg-[#CE9F2D]"
              style={{
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`,
              }}
            />
          </div>

          {/* Hidden Inputs */}
          <input
            type="range"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={PRICE_STEP}
            value={localMin}
            onChange={handleMinChange}
            data-price-thumb="min"
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 pointer-events-none focus:outline-none"
          />

          <input
            type="range"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={PRICE_STEP}
            value={localMax}
            onChange={handleMaxChange}
            data-price-thumb="max"
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 pointer-events-none focus:outline-none"
          />

          {/* Left Thumb */}
          <div
            className="absolute top-1/2 z-10 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#CE9F2D] bg-white"
            style={{
              left: `calc(8px + (${minPercent} * (164px / 100)))`,
            }}
          />

          {/* Right Thumb */}
          <div
            className="absolute top-1/2 z-10 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#CE9F2D] bg-white"
            style={{
              left: `calc(8px + (${maxPercent} * (164px / 100)))`,
            }}
          />
        </div>

        {/* Price */}
        <div className="mt-5 text-center">
          <span className="text-lg font-bold text-[#111111]">
            ₹{localMin.toLocaleString("en-IN")} – ₹
            {localMax >= MAX_LIMIT
              ? `${localMax.toLocaleString("en-IN")}+`
              : localMax.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {(min || max) && (
        <button
          type="button"
          onClick={clear}
          className="block mx-auto text-xs font-semibold text-[#CE9F2D] hover:underline"
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
  searchQuery = "",
  searchCloseRequest,
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedValues = useMemo(
    () =>
      Array.isArray(selected)
        ? selected.map(String)
        : selected != null
          ? [String(selected)]
          : [],
    [selected],
  );
  const isMultiSelect = multiple || Array.isArray(selected);
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  useEffect(() => {
    setExpanded(false);
  }, [name, options]);

  useEffect(() => {
    const query = searchCloseRequest?.query?.trim().toLowerCase();
    if (!query || !selectedValues.length || !options?.length) return;

    const valuesToClear = options
      .filter((option) => {
        const value =
          option.value ?? option.id ?? option._id ?? option.categoryKey;
        const label = option.label ?? option.title ?? option.name ?? value;
        return (
          String(label).trim().toLowerCase() === query ||
          String(value).trim().toLowerCase() === query
        );
      })
      .map((option) =>
        String(option.value ?? option.id ?? option._id ?? option.categoryKey),
      )
      .filter((value) => selectedSet.has(value));

    if (!valuesToClear.length) return;

    if (!isMultiSelect) {
      onChange?.(undefined);
      return;
    }

    const clearSet = new Set(valuesToClear);
    onChange?.(selectedValues.filter((value) => !clearSet.has(value)));
  }, [
    isMultiSelect,
    onChange,
    options,
    searchCloseRequest?.query,
    searchCloseRequest?.requestedAt,
    selectedSet,
    selectedValues,
  ]);

  if (!options?.length) {
    return <p className="text-sm text-[#6f7480]">{emptyText}</p>;
  }

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = normalizedSearchQuery
    ? options.filter((option) => {
        const value =
          option.value ?? option.id ?? option._id ?? option.categoryKey;
        const label = option.label ?? option.title ?? option.name ?? value;

        return String(label).toLowerCase().includes(normalizedSearchQuery);
      })
    : options;
  const allowViewMoreForFiltered = (filteredOptions?.length || 0) > 5;
  const visibleOptions =
    allowViewMoreForFiltered && !expanded
      ? filteredOptions.slice(0, 5)
      : filteredOptions;
  const shouldScroll = allowViewMoreForFiltered && expanded;

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
        {!visibleOptions.length && (
          <p className="py-2 text-sm font-medium text-[#6f7480]">
            No matching options
          </p>
        )}
      </div>

      {allowViewMoreForFiltered && (
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
          <h3 className="text-h4 font-semibold  text-[#373737] ">Filters</h3>

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
