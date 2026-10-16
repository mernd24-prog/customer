
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Info,
} from "lucide-react";

import Button from "../../../components/ui/buttons/Button";
import AddressFormFields from "../../common/components/address/AddressFormFields";
import AddressEditModal from "../../common/components/address/AddressEditModal";
import SharedAddressCard from "../../common/components/address/SharedAddressCard";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import BaseModal from "../../../components/ui/overlay/BaseModal";
import { useAddressBook } from "../controllers/useAddressBook";

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

  if (loading && addresses.length === 0 && !showAddForm) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-14 w-full rounded-lg bg-cream" />
        <div className="h-48 w-full rounded-lg bg-cream" />
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto w-full min-w-0 space-y-5">
        {/* Saved Addresses heading */}
        <header className="flex flex-col gap-4 border-b border-[#E7D9B8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F5E9C9] text-[#1B1D60]">
              <MapPin size={21} />
            </span>

            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-6 text-[#1B1D60] sm:text-xl">
                Saved Addresses
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#64708A]">
                Manage your delivery addresses for a faster checkout.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAddForm}
            className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-gold bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:w-auto"
          >
            {showAddForm ? <ChevronUp size={16} /> : <Plus size={17} />}
            {showAddForm ? "Close Form" : "Add New Address"}
          </button>
        </header>

        {/* Add Address Modal */}
        {showAddForm && (
          <BaseModal onClose={handleCloseAddForm} maxWidth="max-w-3xl">
            <form
              className="flex max-h-[85vh] flex-col rounded-xl bg-white p-4 sm:p-6"
              onSubmit={addForm.handleSubmit(handleAdd, handleInvalidAdd)}
              noValidate
            >
              <div className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1B1D60]">
                <MapPin size={22} className="text-gold" />
                Add New Address
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="grid gap-4 pb-2">
                  <AddressFormFields
                    form={addForm}
                    idPrefix="add"
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
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#E7D9B8] pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseAddForm}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full sm:w-auto"
                >
                  Save Address
                </Button>
              </div>
            </form>
          </BaseModal>
        )}

        {/* Address Cards */}
        {addresses.length > 0 ? (
          <div className="space-y-5">
            <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-4">
              {(showAllAddresses ? addresses : addresses.slice(0, 4)).map(
                (addr) => {
                  const addrId = addr._id || addr.id;
                  const isEditing = editingId === addrId;

                  return (
                    <div
                      key={addrId}
                      className="w-full min-w-0 overflow-hidden rounded-lg border border-[#E7D9B8] bg-white transition-colors hover:border-[#CE9F2D]"
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
                },
              )}
            </div>

            {/* Show More */}
            {addresses.length > 4 && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleShowAllAddresses}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#CE9F2D] px-4 py-2 text-sm font-semibold text-[#1B1D60] transition-colors hover:bg-[#FFF8E8] sm:w-auto sm:min-w-52"
                >
                  {showAllAddresses ? (
                    <>
                      Show Less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Show {addresses.length - 4} More Addresses
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bottom Note */}
            <div className="flex items-start gap-3 rounded-lg border border-[#E7D9B8] bg-[#FFFCF5] px-4 py-3">
              <Info
                size={19}
                className="mt-0.5 shrink-0 text-[#9A741D]"
                aria-hidden="true"
              />

              <p className="text-sm leading-5 text-[#64708A]">
                <span className="font-semibold text-[#1B1D60]">
                  Need another delivery location?
                </span>{" "}
                Add another address to make your next checkout quicker and
                easier.
              </p>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-[#CE9F2D] bg-[#FFFCF5] px-5 py-10 text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#F5E9C9] text-[#1B1D60]">
              <MapPin size={23} />
            </span>

            <h3 className="text-base font-semibold text-[#1B1D60]">
              No Saved Addresses Yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-[#64708A]">
              Add your delivery address to make placing future orders easier.
            </p>

            <button
              type="button"
              onClick={handleToggleAddForm}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              <Plus size={17} />
              Add Your First Address
            </button>
          </div>
        )}
      </section>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteAddressId)}
        title="Delete This Address?"
        description="This saved address will be removed from your account. You can add it again later if needed."
        confirmLabel={loading ? "Deleting..." : "Delete Address"}
        cancelLabel="Keep Address"
        onCancel={() => setDeleteAddressId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
