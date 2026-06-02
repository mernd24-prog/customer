import { Home, Briefcase, MapPin } from "lucide-react";

export default function AddressLabel({ address, showIcon = false, className = "" }) {
  if (!address) return null;

  const labelText = String(address.label || "Address").trim();
  const normalizedLabel = labelText.toLowerCase();

  const getIcon = () => {
    switch (normalizedLabel) {
      case "home":
        return <Home size={15} />;
      case "work":
        return <Briefcase size={15} />;
      default:
        return <MapPin size={15} />;
    }
  };

  const postalCode = address.postalCode || address.postal_code || "";
  const country = address.country || "India";

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {showIcon && (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-gold">
            {getIcon()}
          </span>
        )}
        <span className="break-words text-sm font-semibold text-ink capitalize">
          {labelText}
        </span>
        {address.isDefault && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Default
          </span>
        )}
      </div>
      <p className="mt-3 break-words text-sm font-medium text-ink">
        {address.fullName} {address.phone ? `- ${address.phone}` : ""}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-muted">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
        {address.state} {postalCode}, {country}
      </p>
    </div>
  );
}
