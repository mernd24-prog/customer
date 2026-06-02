import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./BrandButton";
import { sanitizeSearchQuery } from "../../validations";

const SearchBar = ({
  placeholder = "Barbour Beadnell wax jacket in black",
  className = "",
  value,
  onChange,
  onSearch,
  onKeyDown,
  showButtonLabel = true,
}) => {
  const [internalQuery, setInternalQuery] = useState("");
  const navigate = useNavigate();
  const searchQuery = value ?? internalQuery;

  const handleChange = (event) => {
    const nextValue = sanitizeSearchQuery(event.target.value);

    if (onChange) {
      onChange({
        ...event,
        target: {
          ...event.target,
          value: nextValue,
        },
      });
      return;
    }

    setInternalQuery(nextValue);
  };

  const handleSearch = () => {
    const query = sanitizeSearchQuery(searchQuery);

    if (onSearch) {
      onSearch(query);
      return;
    }
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    onKeyDown?.(e);
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`group w-full ${className}`}>
      <div className="rounded-full border border-[var(--customer-border)] bg-white shadow-sm focus-within:border-[var(--customer-gold)] focus-within:ring-2 focus-within:ring-[var(--customer-gold)]/15">
        <div className="flex h-[38px] w-full items-center overflow-hidden rounded-full border-none bg-white pl-3 pr-1 outline-none sm:pl-4 lg:h-[42px] lg:pl-5 lg:pr-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search products"
            className="h-full w-full border-none bg-transparent text-xs text-[var(--customer-ink)] outline-none ring-0 placeholder:text-[var(--customer-muted)] focus:ring-0 lg:text-sm"
          />

          <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-2">
            <Button
              variant="primary"
              rounded={true}
              icon={<Search size={18} />}
              label={showButtonLabel ? "Search" : ""}
              size="sm"
              className={
                showButtonLabel
                  ? "min-h-[30px] px-4 font-semibold shadow-none active:translate-y-0 active:scale-[0.98] 2xl:px-5"
                  : "flex h-[32px] w-[32px] items-center justify-center !p-0 shadow-none active:scale-[0.96]"
              }
              onClick={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
