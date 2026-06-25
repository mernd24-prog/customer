import { MapPin } from "lucide-react";
import AddressFormFields from "../../../components/address/AddressFormFields";
import Button from "../../../components/ui/Button";

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
  loading = false,
  onCancel,
  onSave,
}) {
  const form = {
    register,
    setValue,
    formState: { errors },
  };

  const formActionsClass = "flex flex-col gap-3 sm:flex-row";
  const responsiveButtonClass = "w-full sm:w-auto";

  return (
    <div className="w-full grid gap-4 rounded-[10px] border border-border bg-surface-soft p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <MapPin size={16} className="text-gold" />
        Shipping address
      </div>
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
      <div className={formActionsClass}>
        <Button
          type="button"
          loading={loading}
          onClick={onSave}
          className={responsiveButtonClass}
        >
          Save address
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className={responsiveButtonClass}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
