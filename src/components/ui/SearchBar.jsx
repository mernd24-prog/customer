import { useState, useEffect, useMemo, useRef } from "react";
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
  if (Array.isArray(data)) {
    return data.flatMap((category) => [
      category,
      ...getCategoryListFromResponse(
        category?.children || category?.subCategories || [],
      ),
    ]);
  }
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items))
    return getCategoryListFromResponse(data.items);
  if (Array.isArray(data?.list)) return getCategoryListFromResponse(data.list);
  if (Array.isArray(data?.categories))
    return getCategoryListFromResponse(data.categories);
  if (data?.category && typeof data.category === "object") {
    return getCategoryListFromResponse([data.category]);
  }
  if (data?.data) return getCategoryListFromResponse(data.data);
  return [
    data,
    ...getCategoryListFromResponse(data?.children || data?.subCategories || []),
  ];
}

const getCategoryId = (category) =>
  category?.id ||
  category?._id ||
  category?.categoryId ||
  category?.categoryKey ||
  category?.key ||
  category?.slug;

const getCategoryLabel = (category) =>
  category?.title ||
  category?.name ||
  category?.label ||
  getCategoryId(category);

let categoriesRequestStarted = false;

const SearchBar = ({
  placeholder = "Search for products, brands and categories...",
  className = "",
  value,
  onChange,
  onSearch,
  onKeyDown,
  enableCategoryDropdown = false,
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
  const categories = useMemo(
    () => getCategoryListFromResponse(categoriesRaw),
    [categoriesRaw],
  );
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

  const catParam =
    searchParams.get("categoryId") ||
    searchParams.get("category") ||
    searchParams.get("categorySlug");

  // Fetch categories if not loaded
  useEffect(() => {
    if (
      enableCategoryDropdown &&
      !categories.length &&
      !categoriesLoading &&
      !categoriesRequestedRef.current &&
      !categoriesRequestStarted
    ) {
      categoriesRequestedRef.current = true;
      categoriesRequestStarted = true;
      dispatch(fetchCategories({ tree: true, active: true, maxDepth: 3 }))
        .catch(() => {})
        .finally(() => {
          categoriesRequestStarted = false;
        });
    }
  }, [dispatch, enableCategoryDropdown, categories.length, categoriesLoading]);

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
    if (!enableCategoryDropdown) {
      setSelectedCategory(null);
      return;
    }
    if (catParam && categories.length) {
      const found = categories.find(
        (c) =>
          (c.categoryId && c.categoryId === catParam) ||
          (c.categoryKey && c.categoryKey === catParam) ||
          (c.key && c.key === catParam) ||
          (c.slug && c.slug === catParam) ||
          (c._id && c._id === catParam) ||
          (c.id && c.id === catParam),
      );
      if (found) {
        setSelectedCategory(found);
        return;
      }
    }
    setSelectedCategory(null);
  }, [catParam, categories, enableCategoryDropdown]);

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
    setIsSuggestionOpen(
      Boolean(enableAutocomplete && nextValue.length >= autocompleteMinLength),
    );

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

    const category = enableCategoryDropdown ? nextCategory : null;

    if (query || category) {
      let url = `/search?q=${encodeURIComponent(query)}`;
      if (category) {
        const catKey = getCategoryId(category);
        const catName = getCategoryLabel(category);
        if (catKey) url += `&categoryId=${encodeURIComponent(catKey)}`;
        if (catName) url += `&categoryName=${encodeURIComponent(catName)}`;
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
    if (enableCategoryDropdown && selectedCategory) {
      const catKey = getCategoryId(selectedCategory);
      const catName = getCategoryLabel(selectedCategory);
      if (catKey) url += `&categoryId=${encodeURIComponent(catKey)}`;
      if (catName) url += `&categoryName=${encodeURIComponent(catName)}`;
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
    <div
      className={`group relative w-full max-w-[720px] ${className}`}
      ref={dropdownRef}
    >
      <div className="rounded-full border border-[#1B1D604D] bg-white shadow-sm outline-0 transition-all duration-200">
        <div className="flex h-[46px] w-full items-center overflow-visible rounded-full border-none bg-white pl-0 pr-0 outline-none">
          {enableCategoryDropdown ? (
            <>
              {/* Categories Selector */}
              <div className="static sm:relative h-full flex items-center">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-full max-w-[118px] items-center gap-1.5 rounded-l-full pl-3 pr-2 text-xs font-medium text-[var(--customer-ink)] outline-none transition-colors hover:bg-black/[0.02] sm:max-w-none sm:gap-2 sm:pl-6 sm:pr-4 sm:text-sm"
                >
                  <span className="truncate">
                    {selectedCategory
                      ? getCategoryLabel(selectedCategory)
                      : "All Categories"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--customer-muted)] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 sm:right-auto top-[calc(100%+10px)] z-50 max-h-[320px] overflow-hidden rounded-2xl border border-[#1B1D601A] bg-white shadow-[0_18px_45px_rgba(3,1,77,0.14)] animate-in fade-in slide-in-from-top-2 duration-200 sm:left-2 sm:min-w-[260px] sm:w-auto">
                    <div className="max-h-[320px] overflow-y-auto overscroll-contain p-1.5 [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(null)}
                        className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-[#F8F3E7] focus-visible:bg-[#F8F3E7] ${
                          !selectedCategory
                            ? "font-semibold text-[#03014D]"
                            : "font-medium text-[var(--customer-ink)]"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => {
                        const label = getCategoryLabel(category);
                        const key = getCategoryId(category);
                        const isSelected =
                          selectedCategory &&
                          (selectedCategory.categoryId === category.categoryId ||
                            selectedCategory.categoryKey === category.categoryKey ||
                            selectedCategory.key === category.key ||
                            selectedCategory.slug === category.slug ||
                            selectedCategory._id === category._id ||
                            selectedCategory.id === category.id);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSelectCategory(category)}
                            className={`w-full rounded-xl px-4 py-3 text-left text-sm leading-snug transition-colors ${
                              isSelected
                                ? "font-semibold text-[#03014D]"
                                : "font-semibold text-[#03014D]"
                            } hover:bg-[#F8F3E7] focus-visible:bg-[#F8F3E7]`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-[24px] w-px shrink-0 bg-[#1B1D604D]" />
            </>
          ) : null}

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
            className="h-full  w-full flex-1 border-none bg-transparent pl-5 pr-4 sm:px-4 text-sm text-[var(--customer-ink)] outline-none ring-0 placeholder:text-[var(--customer-muted)] focus:ring-0 focus-visible:outline-none"
          />

          {/* Search Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="flex h-full w-[52px] shrink-0 items-center justify-center rounded-r-full bg-[#CE9F2D] text-white transition-all duration-200 hover:bg-[#CE9F2D]/95 active:scale-[0.98] sm:w-[64px]"
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
              <Search
                size={15}
                className="shrink-0 text-[var(--customer-muted)]"
              />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
