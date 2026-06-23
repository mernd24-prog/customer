import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronUp, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import AddressFormFields, {
  ADDRESS_LABEL_OPTIONS,
} from "../../components/address/AddressFormFields";
import ConfirmModal from "../../components/common/overlay/ConfirmModal";
import { useToastThunk } from "../../hooks/useToastThunk";
import { normalizeDialCode } from "../../lib/utils";
import { addressSchema } from "../../validations/validationSchemas";
import { validatePostalCodeForCountry } from "../../validations";
import {
  fetchMe,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../features/user/userSlice";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchZipCodes,
} from "../../features/global/globalSlice";

async function fetchFullList(dispatch, thunkAction, params = {}) {
  const res = await dispatch(thunkAction({ params })).unwrap();
  const total = res.meta?.total || 20;
  const limit = res.meta?.limit || 20;
  if (total > limit) {
    const allRes = await dispatch(
      thunkAction({ params: { ...params, limit: total } }),
    ).unwrap();
    return allRes.data || allRes.list || allRes || [];
  }
  return res.data || res.list || res || [];
}

export default function AddressTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const addresses = user?.addresses || [];
  const addressLabels = ADDRESS_LABEL_OPTIONS;

  const addForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "",
      dialCode: "+91",
      label: "home",
      isDefault: false,
    },
  });
  const editForm = useForm({ resolver: zodResolver(addressSchema) });

  const normalizeLabelValue = (value) => {
    const normalized = String(value || "").toLowerCase();
    return ["home", "work", "other"].includes(normalized) ? normalized : "home";
  };

  const [countries, setCountries] = useState([]);
  const [addStates, setAddStates] = useState([]);
  const [addCities, setAddCities] = useState([]);
  const [addPostalCodes, setAddPostalCodes] = useState([]);
  const [editStates, setEditStates] = useState([]);
  const [editCities, setEditCities] = useState([]);
  const [editPostalCodes, setEditPostalCodes] = useState([]);

  const addCountry = addForm.watch("country");
  const addState = addForm.watch("state");
  const addCity = addForm.watch("city");
  const addPostalCode = addForm.watch("postalCode");

  const editCountry = editForm.watch("country");
  const editState = editForm.watch("state");
  const editCity = editForm.watch("city");
  const editPostalCode = editForm.watch("postalCode");

  // Fetch initial countries and states
  useEffect(() => {
    fetchFullList(dispatch, fetchCountries)
      .then((list) => {
        setCountries(list);
      })
      .catch((err) => console.error("Error fetching countries:", err));
  }, [dispatch]);

  useEffect(() => {
    if (addCountry) {
      const countryObj = countries.find((c) => (c.name || c) === addCountry);
      const countryId = countryObj?._id || countryObj?.id;
      if (countryId) {
        fetchFullList(dispatch, fetchStates, { countryId })
          .then((list) => setAddStates(list))
          .catch(() => setAddStates([]));
      }
    } else {
      setAddStates([]);
    }
  }, [addCountry, countries, dispatch]);

  useEffect(() => {
    if (editCountry) {
      const countryObj = countries.find((c) => (c.name || c) === editCountry);
      const countryId = countryObj?._id || countryObj?.id;
      if (countryId) {
        fetchFullList(dispatch, fetchStates, { countryId })
          .then((list) => setEditStates(list))
          .catch(() => setEditStates([]));
      }
    } else {
      setEditStates([]);
    }
  }, [editCountry, countries, dispatch]);

  const addCountryObj = countries.find((c) => (c.name || c) === addCountry);
  const addDialCodes = addCountryObj?.dialCode
    ? [normalizeDialCode(addCountryObj.dialCode)]
    : Array.from(
        new Set(
          countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean),
        ),
      ).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));

  // Clear state and city if they don't match the selected country for Add Form
  useEffect(() => {
    if (addCountry && addState) {
      const isValid = addStates.some((s) => (s.name || s) === addState);
      if (!isValid) {
        addForm.setValue("state", "");
        addForm.setValue("city", "");
      }
    }
  }, [addCountry, addStates, addState, addForm]);

  useEffect(() => {
    if (addState) {
      const stateObj = addStates.find((s) => (s.name || s) === addState);
      const stateId = stateObj?._id || stateObj?.id;
      if (stateId) {
        fetchFullList(dispatch, fetchCities, { stateId })
          .then((list) => setAddCities(list))
          .catch(() => setAddCities([]));
      } else {
        setAddCities([]);
      }
    } else {
      setAddCities([]);
    }
  }, [addState, addStates, dispatch]);

  useEffect(() => {
    if (addCity) {
      const cityObj = addCities.find((c) => (c.name || c) === addCity);
      const cityId = cityObj?._id || cityObj?.id;
      if (cityId) {
        fetchFullList(dispatch, fetchZipCodes, { cityId })
          .then((list) => setAddPostalCodes(list))
          .catch(() => setAddPostalCodes([]));
      } else {
        setAddPostalCodes([]);
      }
    } else {
      setAddPostalCodes([]);
    }
  }, [addCity, addCities, dispatch]);

  useEffect(() => {
    const isValid =
      addPostalCode &&
      validatePostalCodeForCountry(addPostalCode, addCountry).valid;
    if (isValid) {
      const timer = setTimeout(() => {
        dispatch(fetchZipCodes({ params: { zip: addPostalCode } }))
          .unwrap()
          .then((res) => {
            const data = res.data || res || {};
            if (data.city && data.state) {
              addForm.setValue("city", data.city, { shouldValidate: true });
              addForm.setValue("state", data.state, { shouldValidate: true });
              if (data.country) {
                addForm.setValue("country", data.country, {
                  shouldValidate: true,
                });
              }
            }
          })
          .catch((err) => console.error("Error fetching zip code:", err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [addForm, addPostalCode, addCountry, dispatch]);

  // Auto-fill dialCode when add country changes
  useEffect(() => {
    if (addCountry && countries.length > 0) {
      const countryObj = countries.find((c) => (c.name || c) === addCountry);
      if (countryObj?.dialCode) {
        addForm.setValue("dialCode", normalizeDialCode(countryObj.dialCode));
      }
    }
  }, [addCountry, countries, addForm]);

  const editCountryObj = countries.find((c) => (c.name || c) === editCountry);
  const editDialCodes = editCountryObj?.dialCode
    ? [normalizeDialCode(editCountryObj.dialCode)]
    : Array.from(
        new Set(
          countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean),
        ),
      ).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));

  // Clear state and city if they don't match the selected country for Edit Form
  useEffect(() => {
    if (editCountry && editState) {
      const isValid = editStates.some((s) => (s.name || s) === editState);
      if (!isValid) {
        editForm.setValue("state", "");
        editForm.setValue("city", "");
      }
    }
  }, [editCountry, editStates, editState, editForm]);

  useEffect(() => {
    if (editState) {
      const stateObj = editStates.find((s) => (s.name || s) === editState);
      const stateId = stateObj?._id || stateObj?.id;
      if (stateId) {
        fetchFullList(dispatch, fetchCities, { stateId })
          .then((list) => setEditCities(list))
          .catch(() => setEditCities([]));
      } else {
        setEditCities([]);
      }
    } else {
      setEditCities([]);
    }
  }, [editState, editStates, dispatch]);

  useEffect(() => {
    if (editCity) {
      const cityObj = editCities.find((c) => (c.name || c) === editCity);
      const cityId = cityObj?._id || cityObj?.id;
      if (cityId) {
        fetchFullList(dispatch, fetchZipCodes, { cityId })
          .then((list) => setEditPostalCodes(list))
          .catch(() => setEditPostalCodes([]));
      } else {
        setEditPostalCodes([]);
      }
    } else {
      setEditPostalCodes([]);
    }
  }, [editCity, editCities, dispatch]);

  useEffect(() => {
    const isValid =
      editPostalCode &&
      validatePostalCodeForCountry(editPostalCode, editCountry).valid;
    if (isValid) {
      const timer = setTimeout(() => {
        dispatch(fetchZipCodes({ params: { zip: editPostalCode } }))
          .unwrap()
          .then((res) => {
            const data = res.data || res || {};
            if (data.city && data.state) {
              editForm.setValue("city", data.city, { shouldValidate: true });
              editForm.setValue("state", data.state, { shouldValidate: true });
              if (data.country) {
                editForm.setValue("country", data.country, {
                  shouldValidate: true,
                });
              }
            }
          })
          .catch((err) => console.error("Error fetching zip code:", err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editForm, editPostalCode, editCountry, dispatch]);

  // Auto-fill dialCode when edit country changes
  useEffect(() => {
    if (editCountry && countries.length > 0) {
      const countryObj = countries.find((c) => (c.name || c) === editCountry);
      if (countryObj?.dialCode) {
        editForm.setValue("dialCode", normalizeDialCode(countryObj.dialCode));
      }
    }
  }, [editCountry, countries, editForm]);

  const startEdit = (addr) => {
    setEditingId(addr._id || addr.id);
    let dialCode = addr.dialCode;
    if (!dialCode && addr.country && countries.length > 0) {
      const c = countries.find(
        (country) => (country.name || country) === addr.country,
      );
      if (c?.dialCode) {
        dialCode = c.dialCode;
      }
    }
    editForm.reset({
      ...addr,
      label: normalizeLabelValue(addr.label),
      dialCode,
      isDefault: Boolean(addr.isDefault),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const handleAdd = async (values) => {
    const addressFields = Object.fromEntries(
      Object.entries(values).filter(([key]) => key !== "dialCode"),
    );
    await run(
      dispatch,
      addAddress({ ...addressFields, isDefault: Boolean(values.isDefault) }),
      "Address added",
    );
    addForm.reset({ country: "", dialCode: "", isDefault: false });
    setShowAddForm(false);
    dispatch(fetchMe());
  };

  const handleUpdate = async (values) => {
    const addressFields = Object.fromEntries(
      Object.entries(values).filter(([key]) => key !== "dialCode"),
    );
    await run(
      dispatch,
      updateAddress({
        addressId: editingId,
        ...addressFields,
        isDefault: Boolean(values.isDefault),
      }),
      "Address updated",
    );
    setEditingId(null);
    dispatch(fetchMe());
  };

  const handleDelete = (addressId) => {
    setDeleteAddressId(addressId);
  };

  const confirmDelete = async () => {
    if (!deleteAddressId) return;
    await run(
      dispatch,
      deleteAddress({ addressId: deleteAddressId }),
      "Address deleted",
    );
    setDeleteAddressId(null);
    dispatch(fetchMe());
  };

  const formActionsClass = "flex flex-col gap-3 sm:flex-row";
  const responsiveButtonClass = "w-full sm:w-auto";
  const sectionHeaderClass =
    "flex items-center gap-2 text-sm font-semibold text-ink";
  return (
    <>
      <div className="grid gap-5  ">
        <div className="flex  flex-col gap-3 border-b border-gold-soft pb-5 sm:flex-row  sm:justify-end">
          <button
            type="button"
            onClick={() => setShowAddForm((value) => !value)}
            className="inline-flex min-h-10 items-center  justify-center gap-2 rounded-[8px] border border-gold bg-gold px-4  text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 sm:w-auto"
          >
            {showAddForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            {showAddForm ? "Close form" : "Add New Address"}
          </button>
        </div>

        {showAddForm && (
          <form
            className="grid gap-4  rounded-[10px] border border-border bg-surface-soft p-4 sm:p-5"
            onSubmit={addForm.handleSubmit(handleAdd)}
            noValidate
          >
            <div className={sectionHeaderClass}>
              <MapPin size={16} className="text-gold" />
              New address
            </div>
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
            <div className={formActionsClass}>
              <Button
                type="submit"
                loading={loading}
                className={responsiveButtonClass}
              >
                Save address
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
                className={responsiveButtonClass}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {addresses.length > 0 ? (
          <div className="grid gap-3  ">
            {addresses.map((addr) => {
              const addrId = addr._id || addr.id;
              const isEditing = editingId === addrId;
              return (
                <div
                  key={addrId}
                  className="w-full   overflow-hidden rounded-[12px] border border-gold bg-white"
                >
                  {isEditing ? (
                    <form
                      className="grid gap-4"
                      onSubmit={editForm.handleSubmit(handleUpdate)}
                      noValidate
                    >
                      <div className={sectionHeaderClass}>
                        <Pencil size={16} className="text-gold " />
                        Edit address
                      </div>
                      <AddressFormFields
                        form={editForm}
                        idPrefix={`edit-${addrId}`}
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
                      <div className={formActionsClass}>
                        <Button
                          type="submit"
                          loading={loading}
                          className={responsiveButtonClass}
                        >
                          Save changes
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={cancelEdit}
                          className={responsiveButtonClass}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-3 bg-[#CE9F2D33] px-4 py-8">
                        <p className="text-sm lg:text-[24px] font-bold capitalize text-[#2E2E2E]">
                          {addr.label || "Address"}
                        </p>
                        {addr.isDefault && (
                          <span className="rounded-full  bg-[#D4A428] px-2.5 py-1 text-[10px] font-semibold text-white">
                            Default Address
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-lg lg:text-2xl font-bold text-[#2E2E2E]">
                          {addr.fullName || "—"}
                        </p>
                        {addr.phone && (
                          <p className="mt-6 flex items-center  font-medium gap-2 text-sm lg:text-[20px] text-[#2E2E2E]">
                            <Phone className="size-6 text-[#D4A428]" />
                            {addr.phone}
                          </p>
                        )}
                        <p className="mt-3 flex items-start font-medium gap-2 text-sm lg:text-[20px] text-[#2E2E2E]">
                          <MapPin className="mt-0.5 size-6 shrink-0 text-[#D4A428]" />
                          <span>
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                            {addr.state}{" "}
                            {addr.postalCode || addr.postal_code || ""},{" "}
                            {addr.country || "India"}
                          </span>
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-8">
                          <button
                            type="button"
                            onClick={() => startEdit(addr)}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] bg-[#D4A428] px-8 text-sm font-semibold text-white"
                          >
                            <Pencil className="size-4" /> Edit Address
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(addrId)}
                            className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-[#2E2E2E]"
                          >
                            <Trash2 className="size-4 text-red-500" /> Remove
                            Address
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border-strong bg-cream p-8 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold">
              <MapPin size={24} />
            </span>
            <p className=" text-sm font-medium text-ink">
              No addresses saved yet.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteAddressId)}
        title="Delete this address?"
        description="This saved address will be removed from your account. You can add it again later if needed."
        confirmLabel={loading ? "Deleting..." : "Delete address"}
        cancelLabel="Keep address"
        onCancel={() => setDeleteAddressId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
