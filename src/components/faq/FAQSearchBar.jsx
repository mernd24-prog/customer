import { useState } from "react";
import SearchBar from "../ui/SearchBar";

export default function FAQSearchBar() {
  const [searchText, setSearchText] = useState("");

  return (
    <SearchBar
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      placeholder="Search Topics"
      showButtonLabel={false}
      className="mx-auto mt-4 mb-4 max-w-[420px] md:mb-8 lg:mb-12"
    />
  );
}
