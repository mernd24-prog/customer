import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sanitizeSearchQuery } from "../../validations";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { getImageUrlFromValue } from "../../utils/ecommerce/product";
import {
  clearSuggestions,
  searchAutocomplete,
} from "../../features/search/searchSlice";
import useDebouncedValue from "../../hooks/useDebouncedValue";

// function getCategoryListFromResponse(data) {
//   if (Array.isArray(data)) {
//     return data.flatMap((category) => [
//       category,
//       ...getCategoryListFromResponse(
//         category?.children || category?.subCategories || [],
//       ),
//     ]);
//   }
//   if (!data || typeof data !== "object") return [];
//   if (Array.isArray(data?.items)) return getCategoryListFromResponse(data.items);
//   if (Array.isArray(data?.list)) return getCategoryListFromResponse(data.list);
//   if (Array.isArray(data?.categories)) {
//     return getCategoryListFromResponse(data.categories);
//   }
//   if (Array.isArray(data?.results)) {
//     return getCategoryListFromResponse(data.results);
//   }
//   if (data?.category && typeof data.category === "object") {
//     return getCategoryListFromResponse([data.category]);
//   }
//   if (data?.data) return getCategoryListFromResponse(data.data);
//   return [
//     data,
//     ...getCategoryListFromResponse(data?.children || data?.subCategories || []),
//   ];
// }

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

const isCategoryLike = (category) =>
  Boolean(category && typeof category === "object" && getCategoryLabel(category));

const textValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value === "object") {
    return (
      value.title ||
      value.name ||
      value.label ||
      value.categoryName ||
      value.parentName ||
      ""
    ).trim();
  }
  return "";
};

const formatCategorySubtitle = (value) => {
  const text = textValue(value);
  if (!text) return "";
  return /^in\s+/i.test(text) ? text : `in ${text}`;
};

const getCategoryContextLabel = (category) => {
  const label = getCategoryLabel(category);
  const context =
    textValue(category?.parentCategory) ||
    textValue(category?.parent) ||
    textValue(category?.parentCategoryName) ||
    textValue(category?.parentName) ||
    textValue(category?.categoryName) ||
    textValue(category?.category) ||
    label;

  return context === "Categories" ? label : context;
};


const getSuggestionLabel = (suggestion) => {
  if (typeof suggestion === "string") return suggestion;
  if (!suggestion || typeof suggestion !== "object") return "";

  return (
    suggestion.title ||
    suggestion.name ||
    suggestion.query ||
    suggestion.keyword ||
    suggestion.label ||
    suggestion.productName ||
    suggestion.brandName ||
    suggestion.categoryName ||
    ""
  );
};

const getSuggestionSubtitle = (suggestion) => {
  if (!suggestion || typeof suggestion !== "object") return "";

  const subtitle =
    suggestion.subtitle ||
    suggestion.category ||
    suggestion.categoryName ||
    suggestion.brandName ||
    suggestion.type ||
    "";

  return formatCategorySubtitle(subtitle);
};

const getSuggestionImage = (suggestion) => {
  if (!suggestion || typeof suggestion !== "object") return "";

  return (
    getImageUrlFromValue(suggestion.image) ||
    getImageUrlFromValue(suggestion.images) ||
    getImageUrlFromValue(suggestion.imageUrl) ||
    getImageUrlFromValue(suggestion.thumbnail) ||
    getImageUrlFromValue(suggestion.thumbnailUrl) ||
    getImageUrlFromValue(suggestion.productImage)
  );
};

const normalizeSuggestion = (suggestion, source = "api") => ({
  label: getSuggestionLabel(suggestion).trim(),
  subtitle: getSuggestionSubtitle(suggestion),
  image: getSuggestionImage(suggestion),
  source,
});

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
  autocompleteMinLength = 1,
  autocompleteDebounceMs = 300,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoriesRaw = useSelector((state) => state.catalog.list || []);
  const categoriesLoading = useSelector((state) => state.catalog.loading);
  const suggestionsRaw = useSelector((state) => state.search.suggestions || []);
   // const categories = useMemo(
  //   () => getCategoryListFromResponse(categoriesRaw),
  //   [categoriesRaw],
  // );
     const categories = categoriesRaw
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
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const dropdownRef = useRef(null);
  const categoriesRequestedRef = useRef(false);
  const searchQuery = value ?? internalQuery;
  const debouncedSearchQuery = useDebouncedValue(
    searchQuery,
    autocompleteDebounceMs,
  );
  const sanitizedQuery = sanitizeSearchQuery(searchQuery);
  const suggestions = useMemo(() => {
    const query = sanitizedQuery.toLowerCase();
    if (query.length < autocompleteMinLength) return [];

    const apiSuggestions = Array.isArray(suggestionsRaw)
      ? suggestionsRaw.map((suggestion) => normalizeSuggestion(suggestion))
      : [];

    const seen = new Set();

    return [...apiSuggestions]
      .filter((suggestion) => {
        const label = suggestion.label || "";
        const haystack = `${label} ${suggestion.subtitle}`.toLowerCase();
        const isMatch = haystack.includes(query);
        const key = label.toLowerCase();
        if (!label || !isMatch || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, autocompleteLimit);
  }, [
    autocompleteLimit,
    autocompleteMinLength,
    categories,
    sanitizedQuery,
    suggestionsRaw,
  ]);

  const catParam =
    searchParams.get("categoryId") ||
    searchParams.get("category") ||
    searchParams.get("categorySlug");

  // Fetch categories if not loaded
  useEffect(() => {
    let ignore = false;

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
        .then(() => {
          if (ignore) return;
          const nextCategories = getCategoryListFromResponse(action?.payload?.data).filter(isCategoryLike);
          setCategoryOptions(nextCategories);
        })
        .catch(() => {})
        .finally(() => {
          categoriesRequestStarted = false;
        });
    }

    return () => {
      ignore = true;
    };
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
    autocompleteDebounceMs,
    debouncedSearchQuery,
    dispatch,
    enableAutocomplete,
  ]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [sanitizedQuery, suggestions.length]);

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
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsSuggestionOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (!dropdownRef.current) return;

      // If scroll is happening inside dropdown → DO NOTHING
      const path = event.target;

      if (dropdownRef.current.contains(path)) return;

      // Scroll happened outside dropdown → close it
      setIsDropdownOpen(false);
      setIsSuggestionOpen(false);
    };

    document.addEventListener("click", handleClickOutside);

    // IMPORTANT: passive scroll + capture phase
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    const sanitizedValue = sanitizeSearchQuery(nextValue);
    setIsSuggestionOpen(
      Boolean(
        enableAutocomplete && sanitizedValue.length >= autocompleteMinLength,
      ),
    );
    setActiveSuggestionIndex(-1);

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
    const query = sanitizedQuery;

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
    const query = sanitizeSearchQuery(getSuggestionLabel(suggestion));
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
      setActiveSuggestionIndex(-1);
      return;
    }
    if (
      e.key === "ArrowDown" &&
      shouldShowAutocompletePanel &&
      suggestions.length > 0
    ) {
      e.preventDefault();
      setActiveSuggestionIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
      return;
    }
    if (
      e.key === "ArrowUp" &&
      shouldShowAutocompletePanel &&
      suggestions.length > 0
    ) {
      e.preventDefault();
      setActiveSuggestionIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
      return;
    }
    if (e.key === "Enter") {
      if (isSuggestionOpen && activeSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[activeSuggestionIndex]);
        return;
      }
      handleSearch();
    }
  };

  const shouldShowAutocompletePanel =
    enableAutocomplete &&
    isSuggestionOpen &&
    sanitizedQuery.length >= autocompleteMinLength;

  const shouldShowSuggestions =
    shouldShowAutocompletePanel &&
    (suggestions.length > 0 || autocompleteLoading);

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
                  className="flex h-full max-w-[118px] items-center gap-1.5 rounded-l-full pl-3 pr-2 text-xs font-medium  text-[var(--customer-ink)] !outline-none focus:!outline-none focus-visible:!outline-none transition-all duration-300 ease-in-out hover:bg-black/[0.02] hover:text-[#03014D] sm:max-w-none sm:gap-2 sm:pl-6 sm:pr-4 sm:text-sm"
                >
                  <span className="truncate">
                    {selectedCategory
                      ? getCategoryLabel(selectedCategory)
                      : "All Categories"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-[var(--customer-muted)] transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute left-0 right-0 sm:right-auto top-[calc(100%+10px)] z-50 max-h-[320px] overflow-hidden rounded-2xl border border-[#1B1D601A] bg-white shadow-[0_18px_45px_rgba(3,1,77,0.14)] transition-all duration-300 ease-in-out sm:left-2 sm:min-w-[260px] sm:w-auto ${isDropdownOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="max-h-[320px]  overflow-y-auto overscroll-contain p-1.5 [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
                    {categories.map((category) => {
                      const label = getCategoryLabel(category);
                      const key = getCategoryId(category);

                      const isSelected =
                        selectedCategory &&
                        (selectedCategory.categoryId === category.categoryId ||
                          selectedCategory.categoryKey ===
                            category.categoryKey ||
                          selectedCategory.key === category.key ||
                          selectedCategory.slug === category.slug ||
                          selectedCategory._id === category._id ||
                          selectedCategory.id === category.id);

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectCategory(category)}
                          className={`w-full rounded-xl px-4 py-3 text-left text-sm leading-snug transition-all duration-300 ease-in-out !outline-none focus:!outline-none focus-visible:!outline-none ${isSelected
                              ? "font-semibold text-[#03014D]"
                              : "font-medium text-[var(--customer-ink)]"
                            } hover:bg-[#F8F3E7] hover:text-[#03014D] focus-visible:bg-[#F8F3E7]`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                sanitizedQuery.length >= autocompleteMinLength
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
            className="flex h-full w-[52px] shrink-0 items-center justify-center rounded-r-full bg-[#CE9F2D] text-white transition-all duration-200 hover:bg-[#CE9F2D]/95 active:scale-[0.98] sm:w-[64px] !outline-none focus:!outline-none focus-visible:!outline-none"
            aria-label="Search"
          >
            <Search size={20} className="text-white" />
          </button>
        </div>
      </div>
      {shouldShowSuggestions && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[390px] overflow-y-auto rounded-xl border border-[#1B1D6020] bg-white py-2 shadow-[0_12px_32px_rgba(0,0,0,0.1)] [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]"
        >
          {suggestions.map((suggestion, index) => {
            const label = getSuggestionLabel(suggestion);
            const subtitle = getSuggestionSubtitle(suggestion);
            const image = getSuggestionImage(suggestion);
            const isActive = index === activeSuggestionIndex;

            return (
              <button
                key={`${label}-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`flex min-h-[56px] w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[#CE9F2D]/10 ${isActive ? "bg-[#CE9F2D]/10" : ""
                  }`}
              >
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#F8F3E7] text-[#CE9F2D]">
                    <Search size={17} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium leading-5 text-[var(--customer-ink)]">
                    {label}
                  </span>
                  {subtitle ? (
                    <span className="block truncate text-sm leading-5 text-[#0B63F6]">
                      {subtitle}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
          {autocompleteLoading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm font-medium text-[var(--customer-muted)]">
              Searching...
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
