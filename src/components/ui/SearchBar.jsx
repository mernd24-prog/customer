import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sanitizeSearchQuery } from "../../validations";

const SearchBar = ({
  placeholder = "Search for products, brands and categories...",
  className = "",
  value,
  onChange,
  onSearch,
  onKeyDown,
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
    <div className={`group w-full max-w-[720px] ${className}`}>
      <div className="rounded-full border border-[#1B1D604D] bg-white shadow-sm focus-within:border-[#CE9F2D] focus-within:ring-2 focus-within:ring-[#CE9F2D]/15">
        <div className="flex h-[46px] w-full items-center overflow-hidden rounded-full border-none bg-white pl-0 pr-0 outline-none">
          
          {/* Categories Selector */}
          <div className="hidden sm:flex h-full items-center gap-2 pl-6 pr-4 text-sm font-medium text-[var(--customer-ink)] cursor-pointer hover:bg-black/[0.02] transition-colors select-none whitespace-nowrap">
            <span>All Categories</span>
            <ChevronDown size={16} className="text-[var(--customer-muted)]" />
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-[24px] w-px bg-[#1B1D604D] shrink-0" />

          {/* Input field */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search products"
            className="h-full w-full flex-1 border-none bg-transparent pl-5 pr-4 sm:px-4 text-sm text-[var(--customer-ink)] outline-none ring-0 placeholder:text-[var(--customer-muted)] focus:ring-0"
          />

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-full w-[64px] items-center justify-center bg-[#CE9F2D] text-white transition-all duration-200 hover:bg-[#CE9F2D]/95 active:scale-[0.98]"
            aria-label="Search"
          >
            <Search size={20} className="text-white" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default SearchBar;
