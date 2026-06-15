import AddressFormFields from "../../components/address/AddressFormFields";

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
  showSavedAddressFields = false,
  addressLabels = [],
}) {
  const form = {
    register,
    setValue,
    formState: { errors },
  };

  return (
    <section className="rounded-[12px] border border-border bg-white p-5">
      <h2 className="mb-4  text-base font-semibold text-ink">
        Shipping address
      </h2>
      <div className="grid gap-4">
        <AddressFormFields
          form={form}
          idPrefix="shipping"
          countries={countries}
          states={states}
          cities={cities}
          postalCodes={postalCodes}
          dialCodes={checkoutDialCodes}
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          selectedCity={selectedCity}
          selectedPostalCode={watchedPostalCode}
          showLabel={showSavedAddressFields}
          showDefault={showSavedAddressFields}
          addressLabels={addressLabels}
        />
      </div>
    </section>
  );
}
