import { Crown, MapPin, Pencil, Phone, Trash2 } from "lucide-react";
import { ADDRESS_LABEL_OPTIONS } from "./AddressFormFields";

function resolveLabel(value) {
  if (!value) return "Home";
  const match = ADDRESS_LABEL_OPTIONS.find(
    (opt) => opt.value === String(value).toLowerCase()
  );
  return match ? match.label : String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export default function SharedAddressCard({
  addr,
  addrId,
  startEdit,
  handleDelete,
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Label badge & Default indicator */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-md bg-[#FAF0D7] px-2.5 py-0.5 text-xs font-semibold text-[#171A3A]">
            {resolveLabel(addr.label)}
          </span>

          {addr.isDefault && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-white shadow-2xs">
              <Crown className="size-3 fill-white text-white" />
              Default
            </span>
          )}
        </div>

        {/* Recipient Full Name */}
        <h3 className="mt-3.5 text-base font-bold text-[#171A3A] sm:text-lg">
          {addr.fullName || "—"}
        </h3>

        {/* Phone */}
        {addr.phone && (
          <p className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm font-normal text-[#4E4E4E]">
            <Phone className="size-4 shrink-0 text-gold" />
            <span>{addr.phone}</span>
          </p>
        )}

        {/* Address Details */}
        <p className="mt-2 flex items-start gap-2 text-xs sm:text-sm font-normal leading-relaxed text-[#525252]">
          <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
          <span>
            {addr.line1}
            {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
            {addr.postalCode || addr.postal_code || ""},{" "}
            {addr.country || "India"}
          </span>
        </p>
      </div>

      {/* Action Buttons: Edit | Remove */}
      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => startEdit(addr)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gold/60 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gold-dark transition-colors hover:bg-gold/10 focus-visible:outline-none"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => handleDelete(addrId)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none"
        >
          <Trash2 className="size-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}
