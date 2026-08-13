import { Pencil } from "lucide-react";
import BaseModal from "../ui/overlay/BaseModal";
import Button from "../ui/Button";
import AddressFormFields from "./AddressFormFields";

export default function AddressEditModal({
  isOpen,
  onClose,
  onSave,
  form,
  idPrefix,
  loading,
  countries,
  states,
  cities,
  postalCodes,
  dialCodes,
  selectedCountry,
  selectedState,
  selectedCity,
  selectedPostalCode,
  addressLabels,
}) {
  if (!isOpen) return null;

  return (
    <BaseModal onClose={onClose} maxWidth="max-w-3xl">
      <div className="flex flex-col max-h-[85vh] rounded-[10px] bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
          <Pencil size={24} className="text-gold" />
          Edit Address
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid gap-4 pb-2">
            <AddressFormFields
              form={form}
              idPrefix={idPrefix}
              countries={countries}
              states={states}
              cities={cities}
              postalCodes={postalCodes}
              dialCodes={dialCodes}
              selectedCountry={selectedCountry}
              selectedState={selectedState}
              selectedCity={selectedCity}
              selectedPostalCode={selectedPostalCode}
              addressLabels={addressLabels}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
