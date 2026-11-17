import { ChevronDown, ChevronUp, MapPin, Plus, Trash2 } from "lucide-react";

import AddressFormFields from "../../common/components/address/AddressFormFields";
import AddressEditModal from "../../common/components/address/AddressEditModal";
import SharedAddressCard from "../../common/components/address/SharedAddressCard";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import { useAddressBook } from "../controllers/useAddressBook";
import { AccountTabHeader, AccountEmptyState } from "../components";

import DynamicButton from "../../../components/ui/button/button.jsx";
export default function AddressTab({ user }) {
  const {
    loading,
    editingId,
    showAddForm,
    deleteAddressId,
    setDeleteAddressId,
    showAllAddresses,
    addresses,
    addressLabels,
    addForm,
    editForm,
    countries,
    addStates,
    addCities,
    addPostalCodes,
    addDialCodes,
    addCountry,
    addState,
    addCity,
    addPostalCode,
    editStates,
    editCities,
    editPostalCodes,
    editDialCodes,
    editCountry,
    editState,
    editCity,
    editPostalCode,
    startEdit,
    cancelEdit,
    handleAdd,
    handleUpdate,
    handleInvalidAdd,
    handleInvalidEdit,
    handleDelete,
    confirmDelete,
    handleToggleAddForm,
    handleCloseAddForm,
    handleShowAllAddresses,
  } = useAddressBook(user);

  const visibleAddresses = showAllAddresses ? addresses : addresses.slice(0, 4);

  if ((loading || !user) && !showAddForm) {
    return (
      <section className="mx-auto w-full min-w-0 space-y-5">
        <AccountTabHeader
          icon={MapPin}
          title="Saved Addresses"
          description="Manage your delivery addresses for a faster checkout."
        />

        <div className="animate-pulse rounded-lg border border-[#E7D9B8] bg-white p-6">
          <div className="h-5 w-40 rounded bg-[#F5E9C9]" />
          <div className="mt-4 h-4 w-3/4 rounded bg-[#F5E9C9]" />
          <div className="mt-5 h-10 w-full rounded-lg bg-[#F5E9C9]" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto w-full min-w-0 space-y-5">
        {/* Saved Addresses Header */}
        <AccountTabHeader
          icon={MapPin}
          title="Saved Addresses"
          description="Manage your delivery addresses for a faster checkout."
          action={
            addresses.length > 0 && (
              <DynamicButton
                variant="gold"
                size="sm"
                shape="rounded"
                onClick={handleToggleAddForm}
                leftIcon={showAddForm ? <ChevronUp size={16} /> : <Plus size={16} />}
                className="w-full sm:w-auto"
              >
                <span>{showAddForm ? "Close Form" : "Add New Address"}</span>
              </DynamicButton>
            )
          }
        />

        {/* Add Address Form */}
        <AddressEditModal
          isOpen={showAddForm}
          onClose={handleCloseAddForm}
          onSave={addForm.handleSubmit(handleAdd, handleInvalidAdd)}
          form={addForm}
          idPrefix="add"
          loading={loading}
          countries={countries}
          states={addStates}
          cities={addCities}
          postalCodes={addPostalCodes}
          dialCodes={addDialCodes}
          selectedCountry={addCountry}
          selectedState={addState}
          selectedCity={addCity}
          selectedPostalCode={addPostalCode}
          addressLabels={addressLabels}
          title="Shipping Address"
          submitLabel="Save Address"
          icon={MapPin}
        />
        {addresses.length > 0 ? (
          <div className="min-w-0 bg-white">
            <div className="grid min-w-0 grid-cols-1 gap-4">
              {visibleAddresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const isEditing = editingId === addrId;

                return (
                  <div
                    key={addrId}
                    className={`relative min-w-0 rounded-md bg-white p-3 transition-all duration-200 sm:p-4 ${
                      visibleAddresses.length > 1
                        ? "border border-[#EADCB0] shadow-[0_6px_18px_rgba(27,29,96,0.04)] hover:border-[#D7B55D] hover:shadow-[0_10px_25px_rgba(27,29,96,0.06)]"
                        : "border border-[#E7D9B8] shadow-[0_4px_14px_rgba(27,29,96,0.02)]"
                    }`}
                  >
                    <SharedAddressCard
                      addr={addr}
                      addrId={addrId}
                      startEdit={startEdit}
                      handleDelete={handleDelete}
                    />
                    <AddressEditModal
                      isOpen={isEditing}
                      onClose={cancelEdit}
                      onSave={editForm.handleSubmit(
                        handleUpdate,
                        handleInvalidEdit,
                      )}
                      form={editForm}
                      idPrefix={`edit-${addrId}`}
                      loading={loading}
                      countries={countries}
                      states={editStates}
                      cities={editCities}
                      postalCodes={editPostalCodes}
                      dialCodes={editDialCodes}
                      selectedCountry={editCountry}
                      selectedState={editState}
                      selectedCity={editCity}
                      selectedPostalCode={editPostalCode}
                      addressLabels={addressLabels}
                    />
                  </div>
                );
              })}
            </div>
            {addresses.length > 4 && (
              <div className="flex justify-center border-t border-[#E7D9B8] px-4 py-4">
                <DynamicButton
                  variant="goldOutline"
                  size="sm"
                  shape="rounded"
                  onClick={handleShowAllAddresses}
                >
                  {showAllAddresses ? (
                    <>
                      Show Less
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Show {addresses.length - 4} More Addresses
                      <ChevronDown size={16} />
                    </>
                  )}
                </DynamicButton>
              </div>
            )}
          </div>
        ) : (
          <AccountEmptyState
            icon={MapPin}
            title="No addresses saved yet"
            description="Please add an address to continue."
            actionLabel="Add Address"
            onAction={handleToggleAddForm}
            actionIcon={<Plus size={17} />}
          />
        )}
      </section>

      <ConfirmModal
        open={Boolean(deleteAddressId)}
        title="Delete This Address?"
        icon={Trash2}
        iconBgClassName="bg-red-50"
        iconClassName="text-red-600"
        iconSize={22}
        description="This saved address will be removed from your account. You can add it again later if needed."
        confirmLabel={loading ? "Deleting..." : "Delete Address"}
        cancelLabel="Keep Address"
        onCancel={() => setDeleteAddressId(null)}
        onConfirm={confirmDelete}
        maxWidth="max-w-md"
        confirmClassName="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
      />
    </>
  );
}
