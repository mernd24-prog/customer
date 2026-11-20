import { useState } from "react";
import DynamicButton from "../button/button.jsx";
import DynamicInput from "./input";

export default function PriceRangeInput({
  min: initialMin,
  max: initialMax,
  currency = "₹",
  onApply,
  onChange,
  className = "",
}) {
  const [localMin, setLocalMin] = useState(initialMin || "");
  const [localMax, setLocalMax] = useState(initialMax || "");

  const apply = () => {
    const result = {
      minPrice: localMin || undefined,
      maxPrice: localMax || undefined,
    };
    onApply?.(result);
    onChange?.(result);
  };

  const clear = () => {
    setLocalMin("");
    setLocalMax("");
    const result = { minPrice: undefined, maxPrice: undefined };
    onApply?.(result);
    onChange?.(result);
  };

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-gray">Min ({currency})</label>
          <DynamicInput
            unwrapped
            variant="uiPriceRange"
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-[6px] border border-border-strong px-2.5 py-1.5 text-sm outline-none transition-all duration-300 ease-in-out focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray">Max ({currency})</label>
          <DynamicInput
            unwrapped
            variant="uiPriceRange"
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Any"
            min="0"
          />
        </div>
      </div>
      <DynamicButton variant="primary" rounded size="sm" onClick={apply}>
        Apply
      </DynamicButton>
      {(initialMin || initialMax) && (
        <DynamicButton
          onClick={clear}
          variant="link"
        >
          Clear Price Filter
        </DynamicButton>
      )}
    </div>
  );
}

