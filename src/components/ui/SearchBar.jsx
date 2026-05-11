import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import { icons } from "../../constant/image.constant";

const SearchBar = ({
  placeholder = "Barbour Beadnell wax jacket in black",
  className = "",
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const borderGradient = "linear-gradient(90deg, #A26D27 0%, #CE9F2D 100%)";

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
      return;
    }
    if (searchQuery.trim()) {
      navigate(`/products/search?q=${searchQuery}`);
    }
  };

  const handleKeyDown = (e) => {
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
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-full outline-none border-none ring-0 text-gray-700 bg-transparent focus:ring-0 text-sm lg:text-base"
          />

          <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-2 lg:gap-6">
            <img
              src={icons.Mic}
              alt="mic"
              className="h-4 w-4 cursor-pointer object-contain hover:opacity-80 sm:h-5 sm:w-5 lg:h-7 lg:w-7"
            />

            <Button
              variant="gradient"
              rounded={true}
              icon={<Search size={18} />}
              label="Search"
              size="md"
              className="px-4 2xl:px-6 font-medium"
              onClick={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
