import { BriefcaseBusiness, Building2, House } from "lucide-react";
import Button from "../../../../components/ui/buttons/Button";
import FormField from "../../../../components/ui/FormField";
import PhoneField from "../../../../components/ui/PhoneField";
import CustomDropdown from "../../../../components/ui/CustomDropdown";

export const ADDRESS_LABEL_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

const normalizePostalCodeValue = (value = "") =>
  String(value || "")
    .trim()
    .match(/^[A-Za-z0-9]+/)?.[0] || "";

export const buildPostalOptions = (postalCodes = []) => {
  const uniquePostalOptions = [];
  const seenPostal = new Set();
  for (const z of postalCodes) {
    const rawZip =
      z && typeof z === "object"
        ? z.zip ||
          z.zipCode ||
          z.postalCode ||
          z.pinCode ||
          z.pincode ||
          z.code ||
          z.value ||
          z.label
        : z;
    const zip = normalizePostalCodeValue(rawZip);
    const area =
      z && typeof z === "object"
        ? z.areaName || z.area || z.locality || z.name
        : "";
    if (!zip) continue;
    const label = area ? `${zip} - ${area}` : zip;
    if (!seenPostal.has(zip)) {
      seenPostal.add(zip);
      uniquePostalOptions.push({ value: zip, label });
    }
  }
  return uniquePostalOptions;
};

export default function AddressFormFields({
  form,
  idPrefix,
  countries = [],
  states = [],
  dialCodes = [],
  selectedCountry,
  selectedState,
  selectedCity,
  showLabel = true,
  showDefault = true,
  addressLabels = ADDRESS_LABEL_OPTIONS,
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const addressTypeIcons = {
    home: House,
    work: BriefcaseBusiness,
    office: BriefcaseBusiness,
    other: Building2,
  };

  return (
    <div className="grid gap-3.5">
      {showLabel && (
        <div className="grid gap-2">
          <input type="hidden" {...register("label")} />
          <span className="text-xs font-semibold text-[#171A3A]">
            Save address as <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {addressLabels.map((option) => {
              const optionValue = option?.value ?? option;
              const optionLabel = option?.label ?? option;
              const normalizedValue = String(optionValue).toLowerCase();
              const Icon = addressTypeIcons[normalizedValue] || Building2;
              const isSelected = watch("label") === optionValue;
              const label = normalizedValue === "work" ? "Office" : optionLabel;

              return (
                <Button
                  key={optionValue}
                  type="button"
                  variant="custom"
                  onClick={() => setValue("label", optionValue, { shouldValidate: true })}
                  aria-pressed={isSelected}
                  className={`!min-h-8 !rounded-full !px-3 !py-0.5 text-sm ${isSelected ? "!border-[#CE9F2D] !bg-[#FFF7E6] !text-[#9A6500] shadow-sm" : "border border-[#E1E7F0] bg-white text-[#40506B] hover:border-[#CE9F2D] hover:bg-[#FFFDF8]"}`}
                >
                  <Icon size={16} />
                  {label}
                </Button>
              );
            })}
          </div>
          {errors.label?.message && (
            <p role="alert" className="text-xs text-red-600">{errors.label.message}</p>
          )}
        </div>
      )}

        <div className="grid items-start gap-3.5 sm:grid-cols-3">
        <FormField
          id={`${idPrefix}-fullName`}
          label="Full Name"
          placeholder="Enter Your Full Name"
          registration={register("fullName")}
          error={errors.fullName}
          reserveErrorSpace={false}
          autoComplete="name"
          required
        />
        <PhoneField
          id={`${idPrefix}-phone`}
          dialCodes={dialCodes}
          countries={countries}
          phoneRegistration={register("phone")}
          dialCodeRegistration={register("dialCode")}
          error={errors.phone || errors.dialCode}
          reserveErrorSpace={false}
          required
        />
        <CustomDropdown
          label="Country"
          labelClassName="text-sm lg:text-base font-medium leading-5 text-[var(--customer-ink)]"
          labelGapClassName="mb-1.5"
          options={[{ value: "India", label: "India" }]}
          value="India"
          disabled
          required
          buttonClassName="!border-[var(--customer-border)] !bg-[#FAFBFD] !opacity-100"
        />
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-3">
        <input type="hidden" {...register("country")} value="India" />
        <input type="hidden" {...register("state")} />
        <CustomDropdown
          className="pt-0"
          buttonClassName={
            errors.state
              ? "address-state-dropdown-error"
              : "address-state-dropdown !border-[var(--customer-border)]"
          }
          label="State"
          labelClassName="text-sm lg:text-base font-medium leading-5 text-[var(--customer-ink)]"
          labelGapClassName="mb-1.5"
          options={states.map((state) => {
            const name =
              state && typeof state === "object"
                ? state.name ?? state.label ?? state.value ?? ""
                : state;
            return { value: name, label: name };
          })}
          value={watch("state") || selectedState || ""}
          onChange={(value) => {
            setValue("state", value, { shouldValidate: true });
            setValue("city", "");
            setValue("postalCode", "");
          }}
          placeholder="Select State"
          error={errors.state?.message}
          required
          reserveErrorSpace={false}
          searchable
        />
        <FormField
          id={`${idPrefix}-city`}
          label="City"
          placeholder="Enter City"
          registration={register("city", {
            onChange: () => {
              setValue("postalCode", "");
            },
          })}
          error={errors.city}
          reserveErrorSpace={false}
          autoComplete="address-level2"
          required
        />
        <FormField
          id={`${idPrefix}-postalCode`}
          label="Postal Code"
          placeholder="Enter Postal Code"
          maxLength={
            ["india", "bharat", "in"].includes(
              String(selectedCountry || "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z]/g, ""),
            )
              ? 6
              : 12
          }
          registration={register("postalCode", {
            setValueAs: normalizePostalCodeValue,
            onChange: (event) => {
              const postalCode = normalizePostalCodeValue(event.target.value);
              setValue("postalCode", postalCode, { shouldValidate: true });
            },
          })}
          error={errors.postalCode}
          reserveErrorSpace={false}
          autoComplete="postal-code"
          required
        />
      </div>
      <FormField
        id={`${idPrefix}-line1`}
        label="Address Line 1"
        registration={register("line1")}
        error={errors.line1}
        reserveErrorSpace={false}
        autoComplete="address-line1"
        required
      />
      <FormField
        id={`${idPrefix}-line2`}
        label="Address Line 2 (optional)"
        registration={register("line2")}
        error={errors.line2}
        reserveErrorSpace={false}
        autoComplete="address-line2"
      />
      {showDefault && (
        <label
          htmlFor={`${idPrefix}-isDefault`}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-[#E1E7F0] bg-[#FAFBFD] px-4 py-3"
        >
          <span>
            <span className="block text-sm font-semibold text-[#171A3A]">Set as default address</span>
            <span className="mt-0.5 block text-xs text-[#64708A]">Use this address automatically for future shipments</span>
          </span>
          <span className="relative inline-flex shrink-0 items-center">
            <input
              id={`${idPrefix}-isDefault`}
              type="checkbox"
              className="peer sr-only"
              {...register("isDefault")}
            />
            <span className="h-6 w-11 rounded-full bg-[#CBD5E1] transition peer-checked:bg-[#CE9F2D] peer-focus-visible:ring-2 peer-focus-visible:ring-[#CE9F2D]/40" />
            <span className="pointer-events-none absolute left-0.5 size-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
          </span>
        </label>
      )}
    </div>
  );
}
