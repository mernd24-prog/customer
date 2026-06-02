import { Link } from "react-router-dom";

import DropdownContainer from "./DropdownContainer";
import DropdownHeader from "./DropdownHeader";

function MenuItem({ item }) {
  return (
    <Link
      to={item.path || "#"}
      className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[var(--customer-ink)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-navy)]"
    >
      {item.icon && <span className="text-[var(--customer-gold-dark)]">{item.icon}</span>}
      <span>{item.label}</span>
    </Link>
  );
}

export default function MenuDropdown({ title, items }) {
  return (
    <DropdownContainer width="w-[250px]">
      <DropdownHeader title={title} />
      <div className="py-2">
        {items.map((item) => (
          <MenuItem key={item.label} item={item} />
        ))}
      </div>
    </DropdownContainer>
  );
}
