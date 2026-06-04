import SearchBar from "../ui/SearchBar";

export default function FAQSearchBar({ value, onChange }) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder="Search Topics"
      showButtonLabel={false}
      className="mx-auto mt-4 mb-4 max-w-[420px] md:mb-8 lg:mb-12"
      onSearch={() => {}}
    />
  );
}
