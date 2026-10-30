import { MapPin, SquarePen } from "lucide-react";
import BaseModal from "../../../../components/ui/overlay/BaseModal";
import Button from "../../../../components/ui/buttons/Button";
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
  title = "Edit Address",
  submitLabel = "Save Changes",
  icon: Icon = SquarePen,
  iconClassName = "text-gold",
}) {
  if (!isOpen) return null;

  return (
    <BaseModal onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white p-2">
        <header className="flex shrink-0 items-center gap-3 border-b border-[#E8ECF3] px-5 py-4 sm:px-7">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7E6] text-[#CE9F2D]">
            <Icon size={21} className={iconClassName} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#171A3A] sm:text-lg">{title}</h2>
            <p className="mt-0.5 text-xs text-[#64708A] sm:text-sm">
              Where should we deliver your shipment?
            </p>
          </div>
        </header>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
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

        <footer className="flex shrink-0 flex-row gap-2 border-t border-[#E8ECF3] px-5 py-3 sm:justify-end sm:px-7 sm:py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="min-w-0 flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            loading={loading}
            className="min-w-0 flex-1 sm:flex-none"
          >
            {submitLabel}
          </Button>
        </footer>
      </div>
    </BaseModal>
  );
}
