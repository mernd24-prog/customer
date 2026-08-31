import { MapPin, Phone, User, FileText, BadgeCheck } from "lucide-react";
import { getOrderAddressName, getOrderPhone, getOrderAddressValue } from "../../../utils/orderHelpers";

function AddressBlock({ address, title, icon: Icon }) {
  if (!address) return null;

  const fullName = getOrderAddressName(address);
  const phone = getOrderPhone(address);
  const line1 = getOrderAddressValue(address, "line1", "address_line1");
  const line2 = getOrderAddressValue(address, "line2", "address_line2");
  const city = address.city;
  const state = address.state;
  const pincode = getOrderAddressValue(address, "postalCode", "postal_code") || address.pincode || address.zip;
  const country = address.country || "India";

  if (!line1 && !city) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 font-bold text-sm md:text-base text-[#1B1D60]">
        <Icon size={18} className="text-[#1B1D60]" />
        <span>{title}</span>
      </div>
      <div className="flex flex-col gap-2">
        {fullName && (
          <div className="flex items-start gap-2 text-[13px] sm:text-sm font-medium text-[#2E2E2E]">
            <span className="mt-0.5"><User size={15} className="text-[#D4A428]" /></span>
            <span>{fullName}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-start gap-2 text-[13px] sm:text-sm font-medium text-[#2E2E2E]">
            <span className="mt-0.5"><Phone size={15} className="text-[#D4A428]" /></span>
            <span>{phone}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-[13px] sm:text-sm font-medium text-[#2E2E2E]">
          <span className="mt-0.5"><MapPin size={15} className="text-[#D4A428]" /></span>
          <span className="leading-relaxed">
            {line1}
            {line2 ? `, ${line2}` : ""}
            <br />
            {city}, {state} {pincode}
            <br />
            {country}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrderAddressCard({ shippingAddress, billingAddress }) {
  if (!shippingAddress && !billingAddress) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 rounded-xl border border-[#E7D9B8] bg-[#FFFDF8] p-5 md:p-6">
      {shippingAddress && (
        <div className="flex-1">
          <AddressBlock address={shippingAddress} title="Shipping Address" icon={MapPin} />
        </div>
      )}

      {/* {shippingAddress && billingAddress && (
        <div className="hidden md:block w-px bg-gray-200 self-stretch"></div>
      )}
      {shippingAddress && billingAddress && (
        <div className="md:hidden h-px bg-gray-200 w-full"></div>
      )}

      {billingAddress && (
        <div className="flex-1">
          <AddressBlock address={billingAddress} title="Billing Address" icon={FileText} />
        </div>
      )} */}
    </div>
  );
}
