import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronUp, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import FormField from "../../components/ui/FormField";
import SelectField from "../../components/ui/SelectField";
import PhoneField from "../../components/ui/PhoneField";
import CheckboxField from "../../components/ui/CheckboxField";
import Button from "../../components/ui/Button";
import AddressLabel from "../../components/ui/AddressLabel";
import { useToastThunk } from "../../hooks/useToastThunk";
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

  const addresses = user?.addresses || [];
  const addressLabels = [
    { value: "home", label: "Home" },
    { value: "work", label: "Work" },
    { value: "other", label: "Other" },
  ];

  const addForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "", label: "home", isDefault: false },
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

  // Watchers for Add Form
  const addCountry = addForm.watch("country");
  const addState = addForm.watch("state");
  const addCity = addForm.watch("city");
  const addPostalCode = addForm.watch("postalCode");

  const addCountryObj = countries.find((c) => (c.name || c) === addCountry);
  const addCountryId = addCountryObj?._id || addCountryObj?.id;
  const addDialCodes = addCountryObj?.dialCode
    ? [addCountryObj.dialCode]
    : Array.from(
        new Set(countries.map((c) => c.dialCode).filter(Boolean)),
      ).sort((a, b) => Number(a) - Number(b));

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
        addForm.setValue("dialCode", countryObj.dialCode);
      }
    }
  }, [addCountry, countries, addForm]);

  // Watchers for Edit Form
  const editCountry = editForm.watch("country");
  const editState = editForm.watch("state");
  const editCity = editForm.watch("city");
  const editPostalCode = editForm.watch("postalCode");

  const editCountryObj = countries.find((c) => (c.name || c) === editCountry);
  const editCountryId = editCountryObj?._id || editCountryObj?.id;
  const editDialCodes = editCountryObj?.dialCode
    ? [editCountryObj.dialCode]
    : Array.from(
        new Set(countries.map((c) => c.dialCode).filter(Boolean)),
      ).sort((a, b) => Number(a) - Number(b));

  // Clear state and city if they don't match the selected country for Edit Form
  useEffect(() => {
    if (editCountry && editState) {
      const isValid = editStates.some(
        (s) => (s.name || s) === editState,
      );
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
        editForm.setValue("dialCode", countryObj.dialCode);
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
    await run(
      dispatch,
      addAddress({ ...values, isDefault: Boolean(values.isDefault) }),
      "Address added",
    );
    addForm.reset({ country: "", dialCode: "", isDefault: false });
    setShowAddForm(false);
    dispatch(fetchMe());
  };

  const handleUpdate = async (values) => {
    await run(
      dispatch,
      updateAddress({
        addressId: editingId,
        ...values,
        isDefault: Boolean(values.isDefault),
      }),
      "Address updated",
    );
    setEditingId(null);
    dispatch(fetchMe());
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    await run(dispatch, deleteAddress({ addressId }), "Address deleted");
    dispatch(fetchMe());
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 border-b border-gold-soft pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className=" text-base font-semibold text-ink">
            Saved addresses
          </p>
          <p className=" text-sm text-muted">
            {addresses.length
              ? `${addresses.length} address${addresses.length === 1 ? "" : "es"} saved`
              : "Add a delivery address for faster checkout."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((value) => !value)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-gold bg-gold px-4  text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 sm:w-auto"
        >
          {showAddForm ? <ChevronUp size={16} /> : <Plus size={16} />}
          {showAddForm ? "Close form" : "Add address"}
        </button>
      </div>

      {showAddForm && (
        <form
          className="grid gap-4 rounded-[10px] border border-border bg-surface-soft p-4 sm:p-5"
          onSubmit={addForm.handleSubmit(handleAdd)}
          noValidate
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MapPin size={16} className="text-gold" />
            New address
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="add-label"
              label="Label"
              placeholder="Select label"
              options={addressLabels}
              registration={addForm.register("label")}
              error={addForm.formState.errors.label}
            />
            <FormField
              id="add-fullName"
              label="Full name"
              placeholder="Enter your full name"
              registration={addForm.register("fullName")}
              error={addForm.formState.errors.fullName}
              autoComplete="name"
            />
          </div>
          <PhoneField
            id="add-phone"
            dialCodes={addDialCodes}
            phoneRegistration={addForm.register("phone")}
            dialCodeRegistration={addForm.register("dialCode")}
            error={
              addForm.formState.errors.phone ||
              addForm.formState.errors.dialCode
            }
          />
          <FormField
            id="add-line1"
            label="Address line 1"
            registration={addForm.register("line1")}
            error={addForm.formState.errors.line1}
            autoComplete="address-line1"
          />
          <FormField
            id="add-line2"
            label="Address line 2 (optional)"
            registration={addForm.register("line2")}
            error={addForm.formState.errors.line2}
            autoComplete="address-line2"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="add-country"
              label="Country"
              placeholder="Select Country"
              options={countries}
              value={addCountry}
              registration={addForm.register("country", {
                onChange: () => {
                  addForm.setValue("state", "");
                  addForm.setValue("city", "");
                  addForm.setValue("postalCode", "");
                },
              })}
              error={addForm.formState.errors.country}
            />
            <SelectField
              id="add-state"
              label="State"
              placeholder="Select State"
              options={addStates}
              value={addState}
              registration={addForm.register("state", {
                onChange: () => {
                  addForm.setValue("city", "");
                  addForm.setValue("postalCode", "");
                },
              })}
              error={addForm.formState.errors.state}
              disabled={!addCountry}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="add-city"
              label="City"
              placeholder="Select City"
              options={addCities}
              value={addCity}
              registration={addForm.register("city", {
                onChange: () => {
                  addForm.setValue("postalCode", "");
                },
              })}
              error={addForm.formState.errors.city}
              disabled={!addState}
            />
            <SelectField
              id="add-postalCode"
              label="Postal code"
              placeholder="Select Postal code"
              options={(() => {
                const uniquePostalOptions = [];
                const seenPostal = new Set();
                for (const z of addPostalCodes) {
                  const zip = z.zipCode || z;
                  const area = z.areaName;
                  const label = area ? `${zip} - ${area}` : zip;
                  if (!seenPostal.has(label)) {
                    seenPostal.add(label);
                    uniquePostalOptions.push({ value: zip, label });
                  }
                }
                return uniquePostalOptions;
              })()}
              value={addPostalCode}
              registration={addForm.register("postalCode")}
              error={addForm.formState.errors.postalCode}
              disabled={!addCity}
            />
          </div>
          <CheckboxField
            id="add-isDefault"
            label="Set as default address"
            registration={addForm.register("isDefault")}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              loading={loading}
              className="w-full sm:w-auto"
            >
              Save address
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddForm(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addresses.length > 0 ? (
        <div className="grid gap-3">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id;
            const isEditing = editingId === addrId;
            return (
              <div
                key={addrId}
                className="rounded-[10px] border border-border bg-white p-4 transition-all duration-300 ease-in-out hover:border-gold/40 hover:shadow-sm sm:p-5"
              >
                {isEditing ? (
                  <form
                    className="grid gap-4"
                    onSubmit={editForm.handleSubmit(handleUpdate)}
                    noValidate
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Pencil size={16} className="text-gold" />
                      Edit address
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField
                        id={`edit-label-${addrId}`}
                        label="Label"
                        options={addressLabels}
                        registration={editForm.register("label")}
                        error={editForm.formState.errors.label}
                      />
                      <FormField
                        id={`edit-fullName-${addrId}`}
                        label="Full name"
                        placeholder="Enter your full name"
                        registration={editForm.register("fullName")}
                        error={editForm.formState.errors.fullName}
                        autoComplete="name"
                      />
                    </div>
                    <PhoneField
                      id={`edit-phone-${addrId}`}
                      dialCodes={editDialCodes}
                      phoneRegistration={editForm.register("phone")}
                      dialCodeRegistration={editForm.register("dialCode")}
                      error={
                        editForm.formState.errors.phone ||
                        editForm.formState.errors.dialCode
                      }
                    />
                    <FormField
                      id={`edit-line1-${addrId}`}
                      label="Address line 1"
                      registration={editForm.register("line1")}
                      error={editForm.formState.errors.line1}
                      autoComplete="address-line1"
                    />
                    <FormField
                      id={`edit-line2-${addrId}`}
                      label="Address line 2"
                      registration={editForm.register("line2")}
                      error={editForm.formState.errors.line2}
                      autoComplete="address-line2"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField
                        id={`edit-country-${addrId}`}
                        label="Country"
                        placeholder="Select Country"
                        options={countries}
                        value={editCountry}
                        registration={editForm.register("country", {
                          onChange: () => {
                            editForm.setValue("state", "");
                            editForm.setValue("city", "");
                            editForm.setValue("postalCode", "");
                          },
                        })}
                        error={editForm.formState.errors.country}
                      />
                      <SelectField
                        id={`edit-state-${addrId}`}
                        label="State"
                        placeholder="Select State"
                        options={editStates}
                        value={editState}
                        registration={editForm.register("state", {
                          onChange: () => {
                            editForm.setValue("city", "");
                            editForm.setValue("postalCode", "");
                          },
                        })}
                        error={editForm.formState.errors.state}
                        disabled={!editCountry}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField
                        id={`edit-city-${addrId}`}
                        label="City"
                        placeholder="Select City"
                        options={editCities}
                        value={editCity}
                        registration={editForm.register("city", {
                          onChange: () => {
                            editForm.setValue("postalCode", "");
                          },
                        })}
                        error={editForm.formState.errors.city}
                        disabled={!editState}
                      />
                      <SelectField
                        id={`edit-postalCode-${addrId}`}
                        label="Postal code"
                        placeholder="Select Postal code"
                        options={(() => {
                          const uniquePostalOptions = [];
                          const seenPostal = new Set();
                          for (const z of editPostalCodes) {
                            const zip = z.zipCode || z;
                            const area = z.areaName;
                            const label = area ? `${zip} - ${area}` : zip;
                            if (!seenPostal.has(label)) {
                              seenPostal.add(label);
                              uniquePostalOptions.push({ value: zip, label });
                            }
                          }
                          return uniquePostalOptions;
                        })()}
                        value={editPostalCode}
                        registration={editForm.register("postalCode")}
                        error={editForm.formState.errors.postalCode}
                        disabled={!editCity}
                      />
                    </div>
                    <CheckboxField
                      id={`edit-isDefault-${addrId}`}
                      label="Set as default address"
                      registration={editForm.register("isDefault")}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="submit"
                        loading={loading}
                        className="w-full sm:w-auto"
                      >
                        Save changes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelEdit}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <AddressLabel
                      address={addr}
                      showIcon={true}
                      className="min-w-0"
                    />
                    <div className="flex shrink-0 gap-2 sm:self-start">
                      <button
                        type="button"
                        onClick={() => startEdit(addr)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-all duration-300 ease-in-out hover:border-gold hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30"
                        aria-label="Edit address"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addrId)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-100 text-red-500 transition-all duration-300 ease-in-out hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                        aria-label="Delete address"
                      >
                        <Trash2 size={15} />
                      </button>
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
  );
}
