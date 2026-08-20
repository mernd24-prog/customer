import { Link } from "react-router-dom";

import DropdownHeader from "./DropdownHeader";

function MenuItem({ item }) {
  const isExternal =
    item.path &&
    (item.path.startsWith("http://") || item.path.startsWith("https://"));

  if (isExternal) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[var(--customer-ink)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-navy)] ${item.isLast ? "border-t border-[var(--customer-border)]" : ""}`}
      >
        {item.icon && (
          <span className="text-[var(--customer-gold-dark)]">{item.icon}</span>
        )}
        <span>{item.label}</span>
      </a>
    );
  }

  if (item.action) {
    return (
      <button
        onClick={item.action}
        className={`flex w-full items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[var(--customer-ink)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-navy)] ${item.isLast ? "border-t border-[var(--customer-border)]" : ""}`}
      >
        {item.icon && (
          <span className="text-[var(--customer-gold-dark)]">{item.icon}</span>
        )}
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <Link
      to={item.path || "#"}
      className={`flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[var(--customer-ink)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-navy)] ${item.isLast ? "border-t border-[var(--customer-border)]" : ""}`}
    >
      {item.icon && (
        <span className="text-[var(--customer-gold-dark)]">{item.icon}</span>
      )}
      <span>{item.label}</span>
    </Link>
  );
}

export default function MenuDropdown({ title, items }) {
  return (
    <div className="w-[250px] overflow-hidden rounded-[var(--customer-radius)] border border-[var(--customer-border)] bg-white shadow-[var(--customer-shadow-strong)]">
      <DropdownHeader title={title} />
      <div className="flex flex-col ">
        {items.map((item, index) => (
          <MenuItem key={item.label} item={{ ...item, isLast: index === items.length - 1 }} />
        ))}
      </div>
    </div>
  );
}
