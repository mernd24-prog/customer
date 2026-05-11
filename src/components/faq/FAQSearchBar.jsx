import { useState } from "react";
import SearchBar from "../ui/SearchBar";

export default function FAQSearchBar() {

  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    console.log(searchText);
  };

  return (
    <SearchBar
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onSearch={handleSearch}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
      placeholder="Search Topics"
        showButtonLabel={false}
      className="mx-auto mt-4 mb-4 max-w-[420px] md:mb-8 lg:mb-12"
    />

    
  );
}