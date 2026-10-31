import { useEffect, useRef, useState } from "react";
import { MapPin, MoreVertical, Pencil, Phone, Trash2 } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);
  return (
    <div className="flex h-full flex-col justify-between rounded-md bg-white">
      <div>
        {/* Label badge & Default indicator */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-md bg-[#FAF0D7] px-2.5 py-0.5 text-xs font-semibold text-[#171A3A]">
            {resolveLabel(addr.label)}
          </span>

          <div className="flex items-center gap-2">
          {addr.isDefault && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-white shadow-2xs">
              Default
            </span>
          )}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button ref={triggerRef} type="button" aria-label="Address actions" aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex size-8 items-center justify-center rounded-sm text-muted hover:bg-[#FFF8E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
              <MoreVertical className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-30 w-36 pt-1">
              <div className="space-y-1 rounded-sm bg-white p-1.5 shadow-lg">
                <button type="button" onClick={() => { setMenuOpen(false); startEdit(addr); }}
                  className="flex w-full items-center gap-2 rounded-sm border-0 bg-[#FFF8E8] px-3 py-2 text-xs font-semibold text-gold-dark hover:bg-[#FDEEC6]">
                  <Pencil className="size-3.5" /> Edit
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); handleDelete(addrId); }}
                  className="flex w-full items-center gap-2 rounded-sm border-0 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Recipient Full Name */}
        <h3 className="mt-2 break-words text-base font-bold text-[#171A3A] sm:text-lg">
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
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            {addr.line1}
            {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
            {addr.postalCode || addr.postal_code || ""},{" "}
            {addr.country || "India"}
          </span>
        </p>
      </div>


    </div>
  );
}
