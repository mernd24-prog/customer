import CustomDropdown from "./CustomDropdown";
import { cn } from "../../utils/common";


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
