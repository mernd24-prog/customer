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
  const borderGradient = "linear-gradient(90deg, #A26D27 0%, #CE9F2D 100%)";
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
      <div
        className="p-[2px] rounded-full"
        style={{ background: borderGradient }}
      >
        <div className="flex h-[44px] w-full items-center overflow-hidden rounded-full border-none bg-white pl-3 pr-1 outline-none sm:h-[48px] sm:pl-4 lg:h-[54px] lg:pl-6 lg:pr-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search products"
            className="w-full h-full outline-none border-none ring-0 text-gray-700 bg-transparent focus:ring-0 text-sm lg:text-base"
          />

          <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-2 lg:gap-6">
            <Button
              variant="gradient"
              rounded={true}
              icon={<Search size={18} />}
              label={showButtonLabel ? "Search" : ""}
              size="md"
              className={
                showButtonLabel
                  ? "min-h-[20px] px-4 font-medium shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-[0.98] 2xl:px-6"
                  : "flex h-[36px] w-[36px] items-center justify-center !p-0 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-[0.96] sm:h-[40px] sm:w-[40px]"
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
