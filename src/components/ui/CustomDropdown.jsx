import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/common";

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select Option",
  label,
  required = false,
  disabled = false,
  error,
  className = "",
  buttonClassName = "",
  optionsClassName = "",
  optionClassName = "",
  ariaLabel,

  // Used when custom option UI is required
  renderOption,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((option) => {
    const optionValue = option?.value ?? option;
    return optionValue === value;
  });

  const displayLabel = selectedOption?.label ?? selectedOption ?? placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (dropdownRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;

    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {label && (
        <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
          {label}

          {required && <span className="text-red-500"> *</span>}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previousState) => !previousState)}
        className={cn(
          "flex h-11 w-full items-center justify-between",
          "rounded-lg border border-[#E7D9B8]",
          "bg-white px-3 text-left",
          "text-sm font-medium text-[#2E2E2E]",
          "transition hover:border-[#CE9F2D]",
          "focus:outline-none",
          "disabled:cursor-not-allowed",
          "disabled:bg-gray-100 disabled:opacity-50",
          buttonClassName,
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || label || placeholder}
      >
        <span className="truncate">{displayLabel}</span>

        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-[#CE9F2D]",
            "transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 top-[calc(100%+6px)]",
            "z-30 w-full overflow-hidden",
            "rounded-lg",
            "border border-[#E7D9B8]",
            "bg-white",

            optionsClassName,
          )}
        >
          <div className="max-h-60 overflow-y-auto[scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </>
            ) : options.length > 0 ? (
              options.map((option, index) => {
                const optionValue = option?.value ?? option;

                const optionLabel = option?.label ?? option;

                const isSelected = value === optionValue;

                return (
                  <button
                    key={`${optionValue}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(optionValue)}
                    className={cn(
                      "block w-full",
                      "px-4 py-2.5",
                      "text-left text-[13px]",
                      "font-semibold",
                      "transition-all",
                      "border-y border-transparent",
                      "hover:border-[#E5DAB5] hover:bg-[#F8F1E2]",
                      "first:hover:border-t-transparent last:hover:border-b-transparent",
                      isSelected
                        ? "bg-[#F8F1E2] text-[#1B1D60]"
                        : "text-[#2E2E2E]",
                      optionClassName,
                    )}
                  >
                    {renderOption
                      ? renderOption(option, {
                          isSelected,
                        })
                      : optionLabel}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">
                No Options Available
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="mt-1 block text-xs text-red-600">
          {error.message || error}
        </span>
      )}
    </div>
  );
}
