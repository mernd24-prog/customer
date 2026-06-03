import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sanitizeSearchQuery } from "../../validations";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import {
  clearSuggestions,
  searchAutocomplete,
} from "../../features/search/searchSlice";
import useDebouncedValue from "../../hooks/useDebouncedValue";

function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  if (data?.category && typeof data.category === "object") return [data.category];
  if (data?.data) return getCategoryListFromResponse(data.data);
  return [data];
}

const SearchBar = ({
  placeholder = "Search for products, brands and categories...",
  className = "",
  value,
  onChange,
  onSearch,
  onKeyDown,
  enableAutocomplete = false,
  autocompleteLimit = 8,
  autocompleteMinLength = 2,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoriesRaw = useSelector((state) => state.catalog.list || []);
  const categoriesLoading = useSelector((state) => state.catalog.loading);
  const suggestionsRaw = useSelector((state) => state.search.suggestions || []);
  const categories = getCategoryListFromResponse(categoriesRaw);
  const suggestions = Array.isArray(suggestionsRaw)
    ? Array.from(
        new Set(
          suggestionsRaw
            .map((suggestion) =>
              typeof suggestion === "string"
                ? suggestion
                : suggestion?.title || suggestion?.name || suggestion?.query,
            )
            .filter(Boolean),
        ),
      )
    : [];

  const [internalQuery, setInternalQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const dropdownRef = useRef(null);
  const categoriesRequestedRef = useRef(false);
  const searchQuery = value ?? internalQuery;
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250);

  const catParam = searchParams.get("categoryId") || searchParams.get("category") || searchParams.get("categorySlug");

  // Fetch categories if not loaded
  useEffect(() => {
    if (
      !categories.length &&
      !categoriesLoading &&
      !categoriesRequestedRef.current
    ) {
      categoriesRequestedRef.current = true;
      dispatch(fetchCategories({ tree: true, active: true, maxDepth: 3 }));
    }
  }, [dispatch, categories.length, categoriesLoading]);

  useEffect(() => {
    if (!enableAutocomplete) return;

    const query = sanitizeSearchQuery(debouncedSearchQuery);
    if (query.length < autocompleteMinLength) {
      dispatch(clearSuggestions());
      return;
    }

    dispatch(
      searchAutocomplete({
        params: { q: query, limit: autocompleteLimit },
        cacheKey: `search-autocomplete-${query}-${autocompleteLimit}`,
      }),
    ).catch(() => {});
  }, [
    autocompleteLimit,
    autocompleteMinLength,
    debouncedSearchQuery,
    dispatch,
    enableAutocomplete,
  ]);

  // Sync selectedCategory with query params
  useEffect(() => {
    if (catParam && categories.length) {
      const found = categories.find(
        (c) =>
          (c.categoryKey && c.categoryKey === catParam) ||
          (c.key && c.key === catParam) ||
          (c._id && c._id === catParam) ||
          (c.id && c.id === catParam)
      );
      if (found) {
        setSelectedCategory(found);
        return;
      }
    }
    setSelectedCategory(null);
  }, [catParam, categories]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsSuggestionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (event) => {
    const nextValue = sanitizeSearchQuery(event.target.value);
    setIsSuggestionOpen(Boolean(enableAutocomplete && nextValue.length >= autocompleteMinLength));

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

  const handleSearch = (nextCategory = selectedCategory) => {
    const query = sanitizeSearchQuery(searchQuery);

    setIsSuggestionOpen(false);
    if (onSearch) {
      onSearch(query, nextCategory);
      return;
    }

    if (query || nextCategory) {
      let url = `/search?q=${encodeURIComponent(query)}`;
      if (nextCategory) {
        const catKey = nextCategory.categoryKey || nextCategory.key || nextCategory.id || nextCategory._id;
        url += `&category=${encodeURIComponent(catKey)}&categoryId=${encodeURIComponent(catKey)}&categorySlug=${encodeURIComponent(catKey)}`;
      }
      navigate(url);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const query = sanitizeSearchQuery(suggestion);
    if (!query) return;

    if (onChange) {
      onChange({ target: { value: query } });
    } else {
      setInternalQuery(query);
    }

    setIsSuggestionOpen(false);
    if (onSearch) {
      onSearch(query, selectedCategory);
      return;
    }

    let url = `/search?q=${encodeURIComponent(query)}`;
    if (selectedCategory) {
      const catKey = selectedCategory.categoryKey || selectedCategory.key || selectedCategory.id || selectedCategory._id;
      url += `&category=${encodeURIComponent(catKey)}&categoryId=${encodeURIComponent(catKey)}&categorySlug=${encodeURIComponent(catKey)}`;
    }
    navigate(url);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    // Trigger search immediately upon category selection
    handleSearch(category);
  };

  const handleKeyDown = (e) => {
    onKeyDown?.(e);
    if (e.key === "Escape") {
      setIsSuggestionOpen(false);
      setIsDropdownOpen(false);
      return;
    }
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const shouldShowSuggestions =
    enableAutocomplete &&
    isSuggestionOpen &&
    sanitizeSearchQuery(searchQuery).length >= autocompleteMinLength &&
    suggestions.length > 0;

  return (
    <div className={`group relative w-full max-w-[720px] ${className}`} ref={dropdownRef}>
      <div className="rounded-full border border-[#1B1D604D] bg-white shadow-sm focus-within:border-[#CE9F2D] focus-within:ring-2 focus-within:ring-[#CE9F2D]/15">
        <div className="flex h-[46px] w-full items-center overflow-visible rounded-full border-none bg-white pl-0 pr-0 outline-none">
          
          {/* Categories Selector */}
          <div className="relative h-full flex items-center">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hidden sm:flex h-full items-center gap-2 pl-6 pr-4 text-sm font-medium text-[var(--customer-ink)] cursor-pointer hover:bg-black/[0.02] transition-colors select-none whitespace-nowrap outline-none rounded-l-full"
            >
              <span>{selectedCategory ? (selectedCategory.title || selectedCategory.name) : "All Categories"}</span>
              <ChevronDown size={16} className={`text-[var(--customer-muted)] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute left-4 top-[calc(100%+8px)] z-50 min-w-[220px] max-h-[300px] overflow-y-auto rounded-xl border border-[#1B1D6020] bg-white py-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  type="button"
                  onClick={() => handleSelectCategory(null)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-[#CE9F2D]/10 text-[#03014D] font-semibold"
                      : "text-[var(--customer-ink)] hover:bg-[#CE9F2D]/10 hover:text-[#03014D] font-medium"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => {
                  const label = category.title || category.name || category.categoryKey;
                  const key = category.categoryKey || category.key || category.id || category._id;
                  const isSelected = selectedCategory && (
                    selectedCategory.categoryKey === category.categoryKey ||
                    selectedCategory.key === category.key ||
                    selectedCategory._id === category._id ||
                    selectedCategory.id === category.id
                  );
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-[#CE9F2D]/10 text-[#03014D] font-semibold"
                          : "text-[var(--customer-ink)] hover:bg-[#CE9F2D]/10 hover:text-[#03014D] font-medium"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-[24px] w-px bg-[#1B1D604D] shrink-0" />

          {/* Input field */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (
                enableAutocomplete &&
                sanitizeSearchQuery(searchQuery).length >= autocompleteMinLength
              ) {
                setIsSuggestionOpen(true);
              }
            }}
            placeholder={placeholder}
            aria-label="Search products"
            aria-autocomplete={enableAutocomplete ? "list" : undefined}
            className="h-full w-full flex-1 border-none bg-transparent pl-5 pr-4 sm:px-4 text-sm text-[var(--customer-ink)] outline-none ring-0 placeholder:text-[var(--customer-muted)] focus:ring-0"
          />

          {/* Search Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="flex h-full w-[64px] items-center justify-center bg-[#CE9F2D] text-white transition-all duration-200 hover:bg-[#CE9F2D]/95 active:scale-[0.98] rounded-r-full"
            aria-label="Search"
          >
            <Search size={20} className="text-white" />
          </button>

        </div>
      </div>
      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#1B1D6020] bg-white py-2 shadow-[0_12px_32px_rgba(0,0,0,0.1)]">
          {suggestions.slice(0, autocompleteLimit).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[var(--customer-ink)] transition-colors hover:bg-[#CE9F2D]/10 hover:text-[#03014D]"
            >
              <Search size={15} className="shrink-0 text-[var(--customer-muted)]" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
