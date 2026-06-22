import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
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
      navigate(
        `${navigateTo}?${queryParam}=${encodeURIComponent(searchValue)}`,
      );
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
      <div className="rounded-full border border-[var(--customer-border)] bg-white shadow-sm focus-within:border-[var(--customer-gold)] focus-within:ring-2 focus-within:ring-[var(--customer-gold)]/15">
        <div
          className={cn(
            "flex w-full items-center overflow-hidden rounded-full bg-white pl-4 pr-1",
            heightMap[size] || heightMap.md,
          )}
        >
          <Search
            size={16}
            className="mr-2 shrink-0 text-[var(--customer-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Search"
            className={cn(
              "h-full w-full border-none bg-transparent text-sm text-[var(--customer-ink)] outline-none ring-0 placeholder:text-[var(--customer-subtle)] focus:ring-0",
              inputClassName,
            )}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 shrink-0 rounded-full p-1 text-[var(--customer-muted)] hover:text-[var(--customer-ink)]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          {showButton && (
            <button
              type="button"
              onClick={handleSearch}
              className="ml-1 shrink-0 rounded-full bg-[var(--customer-gold)] px-4 py-1.5  text-sm font-semibold text-[var(--customer-navy)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-dark)]"
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
