import { MapPin, Pencil, Phone, Trash2 } from "lucide-react";

export default function SharedAddressCard({ addr, addrId, startEdit, handleDelete }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 bg-[#CE9F2D33] px-4 py-5">
        <p className="text-sm font-bold capitalize text-[#2E2E2E] lg:text-[18px] ">
          {addr.label || "Address"}
        </p>

        {addr.isDefault && (
          <span className="rounded-full bg-[#D4A428] px-2.5 py-1 text-[14px] font-semibold text-white">
            Default Address
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-h6 font-bold text-[#2E2E2E] ">
            {addr.fullName || "—"}
          </p>

          {addr.phone && (
            <p className="mt-5 flex items-center gap-2 text-sm font-medium text-[#2E2E2E] lg:text-[16px]">
              <Phone className="size-6 shrink-0 text-[#D4A428]" />
              <span>{addr.phone}</span>
            </p>
          )}

          <p className="mt-3 flex items-start gap-2 text-sm font-medium text-[#2E2E2E] lg:text-[16px]">
            <MapPin className="mt-0.5 size-6 shrink-0 text-[#D4A428]" />
            <span>
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
              {addr.postalCode || addr.postal_code || ""},{" "}
              {addr.country || "India"}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 items-center lg:gap-5">
          <button
            type="button"
            onClick={() => startEdit(addr)}
            className="inline-flex  min-h-9 items-center justify-center gap-2 rounded-[6px] bg-[#D4A428] px-2 md:px-8 text-sm font-semibold text-white"
          >
            <Pencil className="size-4" />
            Edit Address
          </button>

          <button
            type="button"
            onClick={() => handleDelete(addrId)}
            className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-[#2E2E2E]"
          >
            <Trash2 className="size-4 text-red-500" />
            Remove Address
          </button>
        </div>
      </div>
    </div>
  );
}
