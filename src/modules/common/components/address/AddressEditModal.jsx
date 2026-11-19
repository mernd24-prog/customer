import ConfirmModal from "../../../../components/ui/overlay/ConfirmModal";
import { SquarePen } from "lucide-react";
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
  return (
    <ConfirmModal
      open={isOpen}
      onCancel={onClose}
      onConfirm={onSave}
      title={title}
      description="Where should we deliver your shipment?"
      icon={Icon}
       iconBgClassName = "bg-[#F5E9C9]"
      iconClassName={iconClassName}
      confirmLabel={submitLabel}
      cancelLabel="Cancel"
      loading={loading}
      maxWidth="max-w-2xl"
    >
      <div className="custom-scrollbar max-h-[60vh] min-h-0 overflow-y-auto px-1 py-2 sm:px-2 sm:py-3">
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
    </ConfirmModal>
  );
}
