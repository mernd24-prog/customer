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
    <section className="rounded-[12px] border border-[#e7dfd1] bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-montserrat text-base font-semibold text-[#2E2E2E]">
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
                  ? "border-[#CE9F2D] bg-[#FAF6EE]"
                  : "border-[#e7dfd1] hover:border-[#CE9F2D]"
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
                className="mt-1 h-4 w-4 accent-[#CE9F2D]"
              />
              <AddressLabel address={addr} showIcon={false} />
            </label>
          );
        })}

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-all duration-300 ease-in-out ${
            useNewAddress ? "border-[#CE9F2D] bg-[#FAF6EE]" : "border-[#e7dfd1] hover:border-[#CE9F2D]"
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
            className="h-4 w-4 accent-[#CE9F2D]"
          />
          <span className="text-sm font-medium text-[#2E2E2E]">
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
