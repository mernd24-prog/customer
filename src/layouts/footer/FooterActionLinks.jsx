import FooterLink from "./FooterLink";

export default function FooterActionLinks({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 border-y border-white/10 py-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <FooterLink
          key={item?.label || `action-link-${index}`}
          href={item?.href}
          className="flex min-h-12 items-center gap-3 rounded-[var(--customer-radius)] border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white/80 hover:border-[var(--customer-gold)] hover:text-white"
        >
          <img
            className="h-9 w-9 object-contain"
            src={item?.icon}
            alt={item?.alt || item?.label || "Action"}
          />
          {item?.label}
        </FooterLink>
      ))}
    </div>
  );
}
