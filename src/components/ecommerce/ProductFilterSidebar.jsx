import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import BrandButton from "../ui/BrandButton";

export function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--customer-border)] py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-sm font-semibold text-[var(--customer-ink)]"
      >
        {title}

        <span className="text-[var(--customer-gold-dark)]">
          {open ? "-" : "+"}
        </span>
      </button>

      {open && <div className="mt-3">{children}</div>}
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
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <label className="mb-1 block text-xs text-[var(--customer-muted)]">
            Min (₹)
          </label>

          <input
            type="number"
            value={localMin}
            onChange={(event) => setLocalMin(event.target.value)}
            placeholder="0"
            min="0"
            className="customer-input min-h-9 w-full px-2.5 py-1.5 text-sm"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-xs text-[var(--customer-muted)]">
            Max (₹)
          </label>

          <input
            type="number"
            value={localMax}
            onChange={(event) => setLocalMax(event.target.value)}
            placeholder="Any"
            min="0"
            className="customer-input min-h-9 w-full px-2.5 py-1.5 text-sm"
          />
        </div>
      </div>

      <BrandButton
        variant="primary"
        rounded
        size="sm"
        label="Apply"
        className="h-8 text-xs"
        onClick={apply}
      />

      {(min || max) && (
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-500 underline-offset-2 hover:underline"
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
  if (!options?.length) {
    return (
      <p className="text-xs text-[var(--customer-muted)]">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid max-h-48 max-w-full gap-2 overflow-y-auto overflow-x-hidden pr-1">
      {options.map((option) => {
        const value =
          option.value ?? option.id ?? option._id ?? option.categoryKey;

        const label =
          option.label ?? option.title ?? option.name ?? value;

        const count = option.count ?? option.doc_count;

        const checked = selected === String(value);

        return (
          <label
            key={value}
            className="flex min-w-0 cursor-pointer items-start gap-2 text-sm text-[var(--customer-ink)]"
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
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--customer-gold)]"
            />

            <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug">
              {label}
            </span>

            {count != null && (
              <span className="shrink-0 text-xs text-[var(--customer-subtle)]">
                ({count})
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function RatingFilter({ selected, onChange }) {
  return (
    <div className="grid gap-2">
      {[4, 3, 2, 1].map((stars) => (
        <label
          key={stars}
          className="flex cursor-pointer items-center gap-2"
        >
          <input
            type="radio"
            name="rating"
            value={stars}
            checked={selected === String(stars)}
            onChange={() =>
              onChange?.(
                selected === String(stars)
                  ? undefined
                  : String(stars)
              )
            }
            className="h-3.5 w-3.5 accent-[var(--customer-gold)]"
          />

          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={12}
                className={
                  index < stars
                    ? "fill-[var(--customer-gold)] text-[var(--customer-gold)]"
                    : "fill-[var(--customer-border)] text-[var(--customer-border)]"
                }
              />
            ))}

            <span className="ml-1 text-xs text-[var(--customer-muted)]">
              & up
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default function ProductFilterSidebar({
  sections = [],
  className = "",
}) {
  return (
    <aside
      className={`w-full overflow-x-hidden lg:sticky lg:top-24 lg:w-64 xl:w-72 lg:shrink-0 lg:self-start lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain [scrollbar-color:#CE9F2D33_transparent]  ${className}`}
    >
      <div className="customer-card w-full overflow-x-hidden px-4 py-1">
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
    </aside>
  );
}