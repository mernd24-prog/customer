import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sanitizeSearchQuery } from "../../validations";
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

const categoryMatchesParam = (category, value) => {
  if (!category || !value) return false;
  return [
    category.categoryId,
    category.categoryKey,
    category.key,
    category.slug,
    category._id,
    category.id,
  ]
    .filter(Boolean)
    .some((item) => String(item) === String(value));
};

const getCategoryLabel = (category) =>
  category?.title ||
  category?.name ||
  category?.label ||
  getCategoryId(category);

const isCategoryLike = (category) =>
  Boolean(
    category && typeof category === "object" && getCategoryLabel(category),
  );

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

const normalizeSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const boundedEditDistance = (a = "", b = "") => {
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > 2) return 3;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let last = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = previous[j];
      previous[j] =
        a[i - 1] === b[j - 1]
          ? last
          : Math.min(last, previous[j - 1], previous[j]) + 1;
      last = current;
    }
  }
  return previous[b.length];
};

const tokenMatchScore = (query, text = "", scores = {}) => {
  const normalized = normalizeSearchText(text);
  if (!query || !normalized) return 0;

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .reduce((bestScore, token) => {
      if (token === query) return Math.max(bestScore, scores.exact || 100);
      if (
        token.startsWith(query) ||
        token.replace(/s$/, "").startsWith(query)
      ) {
        return Math.max(bestScore, scores.prefix || 90);
      }
      if (query.length >= 4 && token.includes(query)) {
        return Math.max(bestScore, scores.contains || 50);
      }
      if (query.length >= 3 && query[0] === token[0]) {
        const prefix = token.slice(0, query.length);
        const allowedDistance = query.length >= 5 ? 2 : 1;
        if (boundedEditDistance(query, prefix) <= allowedDistance) {
          return Math.max(bestScore, scores.fuzzy || 60);
        }
      }
      return bestScore;
    }, 0);
};

const getSuggestionMatchScore = (query, suggestion) => {
  const term = normalizeSearchText(query);
  const label = normalizeSearchText(suggestion.label);
  const subtitle = normalizeSearchText(suggestion.subtitle);
  if (!term || !label) return 0;

  const categoryScore = tokenMatchScore(term, subtitle, {
    exact: 130,
    prefix: 120,
    contains: 105,
    fuzzy: 90,
  });
  const titleScore = tokenMatchScore(term, label, {
    exact: 100,
    prefix: 92,
    contains: 45,
    fuzzy: 70,
  });

  if (label.startsWith(term)) return Math.max(110, categoryScore, titleScore);
  return Math.max(categoryScore, titleScore);
};

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
  const location = useLocation();

  const categoriesRaw =
    useSelector((state) => state.catalog.globalCategories) || [];
  const suggestionsRaw = useSelector((state) => state.search.suggestions) || [];
  const autocompleteLoading = useSelector(
    (state) => state.search.autocompleteLoading,
  );
  const categories = useMemo(
    () =>
      categoriesRaw
        .filter(isCategoryLike)
        .filter(
          (category, index, list) =>
            list.findIndex(
              (item) => getCategoryId(item) === getCategoryId(category),
            ) === index,
        ),
    [categoriesRaw],
  );

  const [internalQuery, setInternalQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [manualSelectedCategory, setManualSelectedCategory] = useState(null);

  const searchBarRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
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
      .map((suggestion) => ({
        ...suggestion,
        matchScore: getSuggestionMatchScore(query, suggestion),
      }))
      .filter((suggestion) => {
        const label = suggestion.label || "";
        const key = label.toLowerCase();
        if (!label || suggestion.matchScore <= 0 || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, autocompleteLimit);
  }, [
    autocompleteLimit,
    autocompleteMinLength,
    sanitizedQuery,
    suggestionsRaw,
  ]);

  const catParam =
    searchParams.get("categoryId") ||
    searchParams.get("category") ||
    searchParams.get("categorySlug") ||
    (location.pathname.startsWith("/categories/")
      ? decodeURIComponent(location.pathname.split("/")[2] || "")
      : null);
  const selectedCategory = useMemo(() => {
    if (!enableCategoryDropdown) return null;
    if (catParam && categories.length) {
      return (
        categories.find((category) =>
          categoryMatchesParam(category, catParam),
        ) || null
      );
    }
    return manualSelectedCategory;
  }, [catParam, categories, enableCategoryDropdown, manualSelectedCategory]);

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

  useEffect(() => {
    if (!catParam) {
      setManualSelectedCategory(null);
    }
  }, [catParam]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setIsSuggestionOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (!categoryDropdownRef.current) return;

      // If scroll is happening inside dropdown → DO NOTHING
      const path = event.target;

      if (categoryDropdownRef.current.contains(path)) return;

      // Scroll happened outside dropdown → close it
      setIsDropdownOpen(false);
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
    const shouldOpenSuggestions = Boolean(
      enableAutocomplete && sanitizedValue.length >= autocompleteMinLength,
    );
    setIsSuggestionOpen(shouldOpenSuggestions);
    if (shouldOpenSuggestions) {
      setIsDropdownOpen(false);
    }
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
    setManualSelectedCategory(category);
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
    !isDropdownOpen &&
    sanitizedQuery.length >= autocompleteMinLength;

  const shouldShowSuggestions =
    shouldShowAutocompletePanel &&
    (suggestions.length > 0 || autocompleteLoading);

  return (
    <div
      ref={searchBarRef}
      className={`group relative w-full max-w-[720px] ${className}`}
    >
      <div className="rounded-full border border-[#1B1D604D] bg-white shadow-sm outline-0 transition-all duration-200">
        <div className="flex h-[42px] w-full min-w-0 items-center overflow-visible rounded-full border-none bg-white pl-0 pr-0 outline-none sm:h-[46px]">
          {enableCategoryDropdown ? (
            <>
              {/* Categories Selector */}
              <div
                className="static sm:relative h-full flex items-center"
                ref={categoryDropdownRef}
              >
                <button
                  type="button"
                  aria-label="Select Category"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                  onClick={() => {
                    setIsDropdownOpen((prev) => {
                      const next = !prev;
                      if (next) {
                        setIsSuggestionOpen(false);
                      }
                      return next;
                    });
                  }}
                  className="flex h-full w-[92px] min-w-0 items-center gap-1 rounded-l-full pl-2 pr-1.5 text-[11px] font-medium text-[var(--customer-ink)] !outline-none transition-all duration-300  ease-in-out hover:bg-black/[0.02] hover:text-[#03014D] focus:!outline-none focus-visible:!outline-none min-[375px]:w-[100px] min-[375px]:pl-2.5 min-[375px]:pr-2 min-[375px]:text-[12px] min-[425px]:w-[108px] sm:w-auto sm:max-w-none sm:gap-2 sm:pl-6 sm:pr-4 sm:text-sm"
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
                  className={`absolute  left-0 top-[calc(100%+10px)] z-50 max-h-[280px] w-[220px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-[#1B1D601A] bg-white  transition-all duration-300 ease-in-out sm:left-2 sm:max-h-[320px] sm:min-w-[260px] sm:w-auto sm:max-w-none ${
                    isDropdownOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="max-h-[280px] overflow-y-auto overscroll-contain p-1.5 [scrollbar-color:#CE9F2D33_transparent]  [scrollbar-width:thin] sm:max-h-[320px]">
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
                          className={`w-full  rounded-xl px-3 py-2.5 text-left text-[13px] leading-snug transition-all duration-300 ease-in-out !outline-none focus:!outline-none focus-visible:!outline-none sm:px-4 sm:py-3 sm:text-sm ${
                            isSelected
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
              setIsDropdownOpen(false);
              if (
                enableAutocomplete &&
                sanitizedQuery.length >= autocompleteMinLength
              ) {
                setIsSuggestionOpen(true);
              }
            }}
            placeholder={placeholder}
            role={enableAutocomplete ? "combobox" : undefined}
            aria-haspopup={enableAutocomplete ? "listbox" : undefined}
            aria-label="Search Products"
            aria-autocomplete={enableAutocomplete ? "list" : undefined}
            aria-expanded={
              enableAutocomplete ? shouldShowSuggestions : undefined
            }
            aria-controls={
              enableAutocomplete ? "search-suggestions" : undefined
            }
            className="h-full min-w-0 w-full flex-1 border-none bg-transparent pl-2 pr-2 text-[11px] font-medium leading-[16px] tracking-[0%] text-[#2E2E2E] outline-none ring-0 placeholder:text-[#2E2E2E] focus:ring-0 focus-visible:outline-none min-[375px]:pl-2.5 min-[375px]:text-[12px] min-[425px]:text-[13px] sm:px-4 xl:text-[15px]"
          />

          {/* Search Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="flex h-full w-[42px] shrink-0 items-center justify-center rounded-r-full bg-[#CE9F2D] text-[#03014D] transition-all duration-200 hover:bg-[#CE9F2D]/95 active:scale-[0.98] min-[375px]:w-[44px] min-[425px]:w-[48px] sm:w-[64px] !outline-none focus:!outline-none focus-visible:!outline-none"
            aria-label="Search"
          >
            <Search size={18} className="text-[#03014D] sm:size-5" />
          </button>
        </div>
      </div>
      {shouldShowSuggestions && (
        <div
          id="search-suggestions"
          ref={searchDropdownRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[390px] overflow-y-auto rounded-xl border border-[#1B1D6020] bg-white  shadow-[0_12px_32px_rgba(0,0,0,0.1)] [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]"
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
                className={`flex min-h-[56px] w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[#CE9F2D]/10 ${
                  isActive ? "bg-[#CE9F2D]/10" : ""
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
          ) : !autocompleteLoading &&
            suggestions.length === 0 &&
            sanitizedQuery.length >= autocompleteMinLength ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <img
                src="/image/png/NoProductFound.png"
                alt="No Products Found"
                className="mb-3 h-20 w-20 object-contain"
              />
              <p className="text-sm font-medium text-[var(--customer-ink)]">
                No results found for &quot;{sanitizedQuery}&quot;
              </p>
              <p className="mt-1 text-xs text-[var(--customer-muted)]">
                Try a Different Search Term or Category.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
