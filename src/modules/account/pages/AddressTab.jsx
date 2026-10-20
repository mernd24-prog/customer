
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
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

  const visibleAddresses = showAllAddresses
    ? addresses
    : addresses.slice(0, 4);

  if ((loading || !user) && !showAddForm) {
    return (
      <section className="mx-auto w-full min-w-0 space-y-5">
        <header className="flex items-center gap-3 border-b border-[#E7D9B8] pb-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F5E9C9] text-[#1B1D60]">
            <MapPin size={22} />
          </span>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1B1D60]">
              Saved Addresses
            </h2>
            <p className="mt-1 text-sm text-[#64708A]">
              Manage your delivery addresses for a faster checkout.
            </p>
          </div>
        </header>

        <div className="animate-pulse rounded-xl border border-[#E7D9B8] bg-white p-6">
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
        <header className="flex flex-col gap-4 border-b border-[#E7D9B8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F5E9C9] text-[#1B1D60]">
              <MapPin size={22} />
            </span>

            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-6 text-[#1B1D60]">
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
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-gold bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:w-auto"
          >
            {showAddForm ? (
              <ChevronUp size={17} />
            ) : (
              <Plus size={18} />
            )}
            {showAddForm ? "Close Form" : "Add New Address"}
          </button>
        </header>
        {showAddForm && (
          <BaseModal onClose={handleCloseAddForm} maxWidth="max-w-3xl">
            <form
              className="flex max-h-[85vh] flex-col rounded-xl bg-white p-4 sm:p-6"
              onSubmit={addForm.handleSubmit(
                handleAdd,
                handleInvalidAdd
              )}
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

        {/* Unified Saved Addresses Panel */}
        {addresses.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white">
            {/* Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {visibleAddresses.map((addr, index) => {
                const addrId = addr._id || addr.id;
                const isEditing = editingId === addrId;
                const isLastMobileItem =
                  index === visibleAddresses.length - 1;

                const totalRows = Math.ceil(visibleAddresses.length / 2);
                const currentRow = Math.floor(index / 2);
                const isLastDesktopRow = currentRow === totalRows - 1;

                return (
                  <div
                    key={addrId}
                    className={[
                      "relative min-w-0 px-5 py-5 transition-colors sm:px-6 sm:py-6",
                      !isLastMobileItem
                        ? "border-b border-[#E7D9B8] sm:border-b-0"
                        : "",
                      !isLastDesktopRow
                        ? "sm:border-b sm:border-[#E7D9B8]"
                        : "",
                      index % 2 === 0
                        ? "sm:border-r sm:border-[#E7D9B8]"
                        : "",
                    ].join(" ")}
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
                        handleInvalidEdit
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

            {/* Show More Addresses */}
            {addresses.length > 4 && (
              <div className="flex justify-center border-t border-[#E7D9B8] px-4 py-4">
                <button
                  type="button"
                  onClick={handleShowAllAddresses}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#CE9F2D] px-5 py-2 text-sm font-semibold text-[#1B1D60] transition-colors hover:bg-[#FFF8E8]"
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
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-[#CE9F2D] bg-[#FFFCF5] px-5 py-10 text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#F5E9C9] text-[#1B1D60]">
              <MapPin size={23} />
            </span>

            <h3 className="text-base font-semibold text-[#1B1D60]">
              No addresses saved yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-[#64708A]">
              Please add an address to continue.
            </p>

            <button
              type="button"
              onClick={handleToggleAddForm}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              <Plus size={17} />
              Add Address
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
