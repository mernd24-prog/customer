
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "../../../utils/common";
import { sanitizeSearchQuery } from "../../../validations";
import DynamicButton from "../button/button";

const SIZE_CLASSES = {
  sm: "h-9",
  md: "h-11",
  lg: "h-14",
};

export default function SearchBar({
  placeholder = "Search Products...",
  value,
  onChange,
  onSearch,
  onClear,

  className = "",
  inputClassName = "",
  iconClassName = "",
  clearButtonClassName = "",

  size = "md",

  showButton = true,
  buttonLabel = "Search",

  navigateTo = "/search",
  queryParam = "q",

  autoFocus = false,
  ariaLabel = "Search",
}) {
  const [internalValue, setInternalValue] = useState("");
  const navigate = useNavigate();

  const query = value ?? internalValue;

  const handleChange = (event) => {
    const sanitizedValue = sanitizeSearchQuery(event.target.value);

    if (onChange) {
      onChange({
        ...event,
        target: {
          ...event.target,
          value: sanitizedValue,
        },
      });
    } else {
      setInternalValue(sanitizedValue);
    }
  };

  const handleSearch = () => {
    const searchValue = sanitizeSearchQuery(query);

    if (onSearch) {
      onSearch(searchValue);
      return;
    }

    if (searchValue) {
      navigate(
        `${navigateTo}?${queryParam}=${encodeURIComponent(searchValue)}`,
      );
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: "" } });
    } else {
      setInternalValue("");
    }

    onClear?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn("group w-full", className)}>
      <div
        className={cn(
          "flex w-full items-center overflow-hidden rounded-lg border border-[#e4ca8e] bg-white focus-within:shadow-[0_4px_14px_rgba(31,36,48,0.08)]",
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
        )}
      >
        <Search
          size={16}
          className={cn(
            "ml-4 mr-2 shrink-0 text-[#9E886A]",
            iconClassName,
          )}
        />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          className={cn(
            "h-full min-w-0 w-full flex-1 border-none bg-transparent text-sm font-medium text-[#1F2430] outline-none ring-0 placeholder:text-[#6F7480] focus:outline-none focus:ring-0",
            inputClassName,
          )}
        />

        {Boolean(query) && (
          <DynamicButton
            onClick={handleClear}
            className={cn(
              "mr-4 inline-flex shrink-0 items-center justify-center rounded-full p-1 text-[#6F7480] transition-colors hover:text-[#1F2430]",
              clearButtonClassName,
            )}
            aria-label="Clear search"
          >
            <X size={14} />
          </DynamicButton>
        )}

        {showButton && (
          <DynamicButton
            variant="secondary"
            size="sm"
            shape="pill"
            onClick={handleSearch}
            className="mr-1 shrink-0"
          >
            {buttonLabel}
          </DynamicButton>
        )}
      </div>
    </div>
  );
}
