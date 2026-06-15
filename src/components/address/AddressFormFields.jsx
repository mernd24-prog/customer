import CheckboxField from "../ui/CheckboxField";
import FormField from "../ui/FormField";
import PhoneField from "../ui/PhoneField";
import SelectField from "../ui/SelectField";

export const ADDRESS_LABEL_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

export const buildPostalOptions = (postalCodes = []) => {
  const uniquePostalOptions = [];
  const seenPostal = new Set();
  for (const z of postalCodes) {
    const zip = z.zipCode || z;
    const area = z.areaName;
    const label = area ? `${zip} - ${area}` : zip;
    if (!seenPostal.has(label)) {
      seenPostal.add(label);
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
  cities = [],
  postalCodes = [],
  dialCodes = [],
  selectedCountry,
  selectedState,
  selectedCity,
  selectedPostalCode,
  showLabel = true,
  showDefault = true,
  addressLabels = ADDRESS_LABEL_OPTIONS,
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {showLabel && (
          <SelectField
            id={`${idPrefix}-label`}
            label="Label"
            placeholder="Select label"
            options={addressLabels}
            registration={register("label")}
            error={errors.label}
          />
        )}
        <FormField
          id={`${idPrefix}-fullName`}
          label="Full name"
          placeholder="Enter your full name"
          registration={register("fullName")}
          error={errors.fullName}
          autoComplete="name"
        />
      </div>
      <PhoneField
        id={`${idPrefix}-phone`}
        dialCodes={dialCodes}
        countries={countries}
        phoneRegistration={register("phone")}
        dialCodeRegistration={register("dialCode")}
        error={errors.phone || errors.dialCode}
      />
      <FormField
        id={`${idPrefix}-line1`}
        label="Address line 1"
        registration={register("line1")}
        error={errors.line1}
        autoComplete="address-line1"
      />
      <FormField
        id={`${idPrefix}-line2`}
        label="Address line 2 (optional)"
        registration={register("line2")}
        error={errors.line2}
        autoComplete="address-line2"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id={`${idPrefix}-country`}
          label="Country"
          placeholder="Select Country"
          options={countries}
          value={selectedCountry}
          registration={register("country", {
            onChange: () => {
              setValue("state", "");
              setValue("city", "");
              setValue("postalCode", "");
            },
          })}
          error={errors.country}
        />
        <SelectField
          id={`${idPrefix}-state`}
          label="State"
          placeholder="Select State"
          options={states}
          value={selectedState}
          registration={register("state", {
            onChange: () => {
              setValue("city", "");
              setValue("postalCode", "");
            },
          })}
          error={errors.state}
          disabled={!selectedCountry}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id={`${idPrefix}-city`}
          label="City"
          placeholder="Select City"
          options={cities}
          value={selectedCity}
          registration={register("city", {
            onChange: () => {
              setValue("postalCode", "");
            },
          })}
          error={errors.city}
          disabled={!selectedState}
        />
        <SelectField
          id={`${idPrefix}-postalCode`}
          label="Postal code"
          placeholder="Select Postal code"
          options={buildPostalOptions(postalCodes)}
          value={selectedPostalCode}
          registration={register("postalCode")}
          error={errors.postalCode}
          disabled={!selectedCity}
        />
      </div>
      {showDefault && (
        <CheckboxField
          id={`${idPrefix}-isDefault`}
          label="Set as default address"
          registration={register("isDefault")}
        />
      )}
    </>
  );
}
