import { MapPin } from "lucide-react";
import AddressLabel from "../../components/ui/AddressLabel";

const getAddressId = (addr) => addr?._id || addr?.id || "";

export default function AddressSelection({
  addresses,
  selectedAddressId,
  useNewAddress,
  setValue,
  errors,
}) {
  return (
    <section className="rounded-[12px] border border-border bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-montserrat text-base font-semibold text-ink">
        <MapPin size={16} /> Delivery address
      </h2>
      <div className="grid gap-3">
        {addresses.map((addr) => {
          const addrId = getAddressId(addr);
          return (
            <label
              key={addrId}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-all duration-300 ease-in-out ${
                selectedAddressId === addrId && !useNewAddress
                  ? "border-gold bg-cream"
                  : "border-border hover:border-gold"
              }`}
            >
              <input
                type="radio"
                name="addressSelect"
                value={addrId}
                checked={selectedAddressId === addrId && !useNewAddress}
                onChange={() => {
                  setValue("selectedAddressId", addrId, {
                    shouldValidate: true,
                  });
                  setValue("useNewAddress", false, {
                    shouldValidate: true,
                  });
                }}
                className="mt-1 h-4 w-4 accent-gold"
              />
              <AddressLabel address={addr} showIcon={false} />
            </label>
          );
        })}

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-all duration-300 ease-in-out ${
            useNewAddress ? "border-gold bg-cream" : "border-border hover:border-gold"
          }`}
        >
          <input
            type="radio"
            name="addressSelect"
            checked={useNewAddress}
            onChange={() => {
              setValue("useNewAddress", true, {
                shouldValidate: true,
              });
            }}
            className="h-4 w-4 accent-gold"
          />
          <span className="text-sm font-medium text-ink">
            Use a different address
          </span>
        </label>
        {errors.selectedAddressId && (
          <p className="text-xs text-red-600 font-montserrat mt-1">
            {errors.selectedAddressId.message}
          </p>
        )}
      </div>
    </section>
  );
}
