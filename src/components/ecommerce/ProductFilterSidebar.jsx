import { useState } from "react";
import { Star } from "lucide-react";
import BrandButton from "../ui/BrandButton";

export function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#e7dfd1] py-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between font-montserrat text-sm font-semibold text-[#2E2E2E]">
        {title}
        <span className="text-[#A6A6A6]">{open ? "-" : "+"}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function PriceRangeFilter({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min || "");
  const [localMax, setLocalMax] = useState(max || "");

  const apply = () => onChange?.({ minPrice: localMin || undefined, maxPrice: localMax || undefined });
  const clear = () => {
    setLocalMin("");
    setLocalMax("");
    onChange?.({ minPrice: undefined, maxPrice: undefined });
  };

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block font-montserrat text-xs text-[#A6A6A6]">Min (₹)</label>
          <input type="number" value={localMin} onChange={(event) => setLocalMin(event.target.value)} placeholder="0" min="0" className="w-full rounded-[6px] border border-[#cfc6b8] px-2.5 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block font-montserrat text-xs text-[#A6A6A6]">Max (₹)</label>
          <input type="number" value={localMax} onChange={(event) => setLocalMax(event.target.value)} placeholder="Any" min="0" className="w-full rounded-[6px] border border-[#cfc6b8] px-2.5 py-1.5 text-sm" />
        </div>
      </div>
      <BrandButton variant="primary" rounded size="sm" label="Apply" className="h-8 text-xs" onClick={apply} />
      {(min || max) && (
        <button type="button" onClick={clear} className="font-montserrat text-xs text-red-500 underline-offset-2 hover:underline">
          Clear price filter
        </button>
      )}
    </div>
  );
}

export function OptionFilter({ name, options, selected, onChange, emptyText = "Loading..." }) {
  if (!options?.length) return <p className="font-montserrat text-xs text-[#A6A6A6]">{emptyText}</p>;

  return (
    <div className="grid max-h-48 gap-2 overflow-y-auto pr-1">
      {options.map((option) => {
        const value = option.value ?? option.id ?? option._id ?? option.categoryKey;
        const label = option.label ?? option.title ?? option.name ?? value;
        const count = option.count ?? option.doc_count;
        const checked = selected === String(value);

        return (
          <label key={value} className="flex cursor-pointer items-center gap-2 font-montserrat text-sm text-[#2E2E2E]">
            <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange?.(checked ? undefined : String(value))} className="h-3.5 w-3.5 accent-[#CE9F2D]" />
            <span className="flex-1 truncate">{label}</span>
            {count != null && <span className="text-xs text-[#A6A6A6]">({count})</span>}
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
        <label key={stars} className="flex cursor-pointer items-center gap-2">
          <input type="radio" name="rating" value={stars} checked={selected === String(stars)} onChange={() => onChange?.(selected === String(stars) ? undefined : String(stars))} className="h-3.5 w-3.5 accent-[#CE9F2D]" />
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} size={12} className={index < stars ? "fill-[#CE9F2D] text-[#CE9F2D]" : "fill-[#E0E0E0] text-[#E0E0E0]"} />
            ))}
            <span className="ml-1 font-montserrat text-xs text-[#787878]">& up</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default function ProductFilterSidebar({ sections = [], className = "" }) {
  return (
    <aside
      className={`w-full lg:sticky lg:top-24  lg:w-60 lg:shrink-0 lg:self-start lg:overflow-y-auto lg:overscroll-contain ${className}`}
    >
      <div className="card">
        {sections.map((section) => (
          <FilterSection key={section.key || section.title} title={section.title} defaultOpen={section.defaultOpen}>
            {section.content}
          </FilterSection>
        ))}
      </div>
    </aside>
  );
}
