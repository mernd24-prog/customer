import FormField from "../../components/ui/FormField";
import SelectField from "../../components/ui/SelectField";
import PhoneField from "../../components/ui/PhoneField";

export default function ShippingAddressForm({
  register,
  errors,
  checkoutDialCodes,
  countries,
  selectedCountry,
  states,
  selectedState,
  cities,
  selectedCity,
  watchedPostalCode,
  setValue,
  postalCodes,
}) {
  return (
    <section className="rounded-[12px] border border-border bg-white p-5">
      <h2 className="mb-4  text-base font-semibold text-ink">
        Shipping address
      </h2>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="fullName"
            label="Full name"
            placeholder="Enter your full name"
            registration={register("fullName")}
            error={errors.fullName}
            autoComplete="name"
          />
          <PhoneField
            id="phone"
            dialCodes={checkoutDialCodes}
            countries={countries}
            phoneRegistration={register("phone")}
            dialCodeRegistration={register("dialCode")}
            error={errors.phone || errors.dialCode}
          />
        </div>
        <FormField
          id="line1"
          label="Address line 1"
          registration={register("line1")}
          error={errors.line1}
          autoComplete="address-line1"
        />
        <FormField
          id="line2"
          label="Address line 2 (optional)"
          registration={register("line2")}
          error={errors.line2}
          autoComplete="address-line2"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="country"
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
            id="state"
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
            id="city"
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
            id="postalCode"
            label="Postal code"
            placeholder="Select Postal code"
            options={(() => {
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
            })()}
            value={watchedPostalCode}
            registration={register("postalCode")}
            error={errors.postalCode}
            disabled={!selectedCity}
          />
        </div>
      </div>
    </section>
  );
}
