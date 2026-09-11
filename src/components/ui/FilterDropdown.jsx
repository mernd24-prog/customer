import CustomDropdown from "./CustomDropdown";
import { cn } from "../../utils/common";

/**
 * FilterDropdown - Standardized, reusable page-level filter dropdown
 * Ensures 100% visual and functional consistency across Notifications,
 * Orders, Returns, and all future modules.
 *
 * Defaults:
 * - Responsive width: w-full sm:w-[210px]
 * - Standard height: h-11 (44px)
 * - Gold border (#CE9F2D)
 * - Navy semibold typography (#1B1D60)
 * - Uniform gold icons (text-[var(--customer-gold-dark)])
 * - Fixed compact pill scrollbar (32px) with smooth scrolling
 */
export default function FilterDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select Option",
  className = "",
  buttonClassName = "",
  optionsClassName = "",
  optionClassName = "",
  disabled = false,
  ariaLabel = "Filter options",
  isLoading = false,
}) {
  return (
    <div className={cn("w-full sm:w-[210px] shrink-0", className)}>
      <CustomDropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        isLoading={isLoading}
        className="w-full"
        buttonClassName={buttonClassName}
        optionsClassName={optionsClassName}
        optionClassName={optionClassName}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
