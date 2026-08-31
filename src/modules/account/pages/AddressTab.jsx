import { ChevronDown, ChevronUp, MapPin, Plus } from "lucide-react";
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
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-full sm:w-48 self-end rounded bg-cream" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="h-48 w-full rounded-[12px] bg-cream" />
          <div className="h-48 w-full rounded-[12px] bg-cream" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5  ">
        <div className="flex  flex-col gap-3 border-b border-gold-soft pb-5 sm:flex-row  sm:justify-end">
          <button
            type="button"
            onClick={handleToggleAddForm}
            className="inline-flex min-h-10 items-center  justify-center gap-2 rounded-[8px] border border-gold bg-gold px-4  text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 sm:w-auto"
          >
            {showAddForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            {showAddForm ? "Close Form" : "Add New Address"}
          </button>
        </div>

        {showAddForm && (
          <BaseModal onClose={handleCloseAddForm} maxWidth="max-w-3xl">
            <form
              className="flex flex-col max-h-[85vh] rounded-[10px] bg-white p-4 sm:p-6"
              onSubmit={addForm.handleSubmit(handleAdd, handleInvalidAdd)}
              noValidate
            >
              <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                <MapPin size={24} className="text-gold" />
                Add New Address
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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

        {addresses.length > 0 ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {(showAllAddresses ? addresses : addresses.slice(0, 4)).map(
                (addr) => {
                  const addrId = addr._id || addr.id;
                  const isEditing = editingId === addrId;

                  return (
                    <div
                      key={addrId}
                      className="w-full overflow-hidden rounded-[12px] border border-gold bg-white"
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
                        onSave={editForm.handleSubmit(handleUpdate, handleInvalidEdit)}
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

            {addresses.length > 4 && (
              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleShowAllAddresses}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gold px-6 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold-soft hover:text-gold-dark"
                >
                  {showAllAddresses ? (
                    <>
                      Show Less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Show {addresses.length - 4} More Addresses{" "}
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border-strong bg-cream p-8 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold">
              <MapPin size={24} />
            </span>
            <p className=" text-sm font-medium text-ink">
              No Addresses Saved Yet.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteAddressId)}
        title="Delete This Address?"
        description="This saved address will be removed from your account. You can add it again later if needed."
        confirmLabel={loading ? "Deleting..." : "Delete address"}
        cancelLabel="Keep address"
        onCancel={() => setDeleteAddressId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
