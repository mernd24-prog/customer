import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../utils/classNames";
import { sanitizeSearchQuery } from "../../../validations";

export default function SearchInput({
  placeholder = "Search products…",
  value,
  onChange,
  onSearch,
  onClear,
  className = "",
  inputClassName = "",
  size = "md",
  showButton = true,
  buttonLabel = "Search",
  navigateTo = "/search",
  queryParam = "q",
  autoFocus = false,
}) {
  const [internal, setInternal] = useState("");
  const navigate = useNavigate();
  const query = value ?? internal;

  const handleChange = (e) => {
    const val = sanitizeSearchQuery(e.target.value);
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: val,
        },
      });
    } else setInternal(val);
  };

  const handleSearch = () => {
    const searchValue = sanitizeSearchQuery(query);

    if (onSearch) {
      onSearch(searchValue);
      return;
    }
    if (searchValue) {
      navigate(`${navigateTo}?${queryParam}=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    if (onChange) onChange({ target: { value: "" } });
    else setInternal("");
    onClear?.();
  };

  const heightMap = { sm: "h-9", md: "h-11", lg: "h-14" };

  return (
    <div className={cn("group w-full", className)}>
      <div
        className="rounded-full p-[2px]"
        style={{ background: "linear-gradient(90deg,#A26D27 0%,#CE9F2D 100%)" }}
      >
        <div
          className={cn(
            "flex w-full items-center overflow-hidden rounded-full bg-white pl-4 pr-1",
            heightMap[size] || heightMap.md,
          )}
        >
          <Search size={16} className="mr-2 shrink-0 text-[#A6A6A6]" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Search"
            className={cn(
              "h-full w-full border-none bg-transparent text-sm text-[#2E2E2E] outline-none ring-0 placeholder:text-[#A6A6A6] focus:ring-0",
              inputClassName,
            )}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 shrink-0 rounded-full p-1 text-[#A6A6A6] hover:text-[#2E2E2E]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          {showButton && (
            <button
              type="button"
              onClick={handleSearch}
              className="ml-1 shrink-0 rounded-full bg-gradient-to-l from-[#A26D27] to-[#CE9F2D] px-4 py-1.5 font-montserrat text-sm font-semibold text-white transition hover:opacity-90"
              aria-label="Search"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
