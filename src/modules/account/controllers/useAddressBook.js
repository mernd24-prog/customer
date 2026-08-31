import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { normalizeDialCode } from "../../../utils/common";
import { addressSchema } from "../../../validations/validationSchemas";
import { validatePostalCodeForCountry } from "../../../validations";
import { scrollToFirstFormError } from "../../../utils/formErrors";
import {
  fetchMe,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../../features/user/userSlice";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchZipCodes,
} from "../../../features/global/globalSlice";
import { fetchFullList } from "../../../utils/pages/checkoutUtils";
import { ADDRESS_LABEL_OPTIONS } from "../../common/components/address/AddressFormFields";

export function useAddressBook(user) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  const addresses = user?.addresses || [];
  const addressLabels = ADDRESS_LABEL_OPTIONS;

  const addForm = useForm({
    resolver: zodResolver(addressSchema),
    shouldFocusError: false,
    defaultValues: {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      dialCode: "+91",
      label: "home",
      isDefault: false,
    },
  });
  const editForm = useForm({
    resolver: zodResolver(addressSchema),
    shouldFocusError: false,
  });

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

  useEffect(() => {
    fetchFullList(dispatch, fetchCountries).then((list) => {
      setCountries(list);
      const currentCountry = addForm.getValues("country");
      if (!currentCountry || currentCountry === "") {
        const india = list.find(
          (c) => String(c.name || c).toLowerCase() === "india",
        );
        if (india) {
          addForm.setValue("country", india.name || india, {
            shouldValidate: false,
          });
        }
      }
    });
  }, [dispatch, addForm]);

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

  useEffect(() => {
    if (addCountry && addState && addStates.length > 0) {
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
          });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [addForm, addPostalCode, addCountry, dispatch]);

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

  useEffect(() => {
    if (editCountry && editState && editStates.length > 0) {
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
          });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editForm, editPostalCode, editCountry, dispatch]);

  useEffect(() => {
    if (editCountry && countries.length > 0) {
      const countryObj = countries.find((c) => (c.name || c) === editCountry);
      if (countryObj?.dialCode) {
        editForm.setValue("dialCode", normalizeDialCode(countryObj.dialCode));
      }
    }
  }, [editCountry, countries, editForm]);

  const startEdit = useCallback((addr) => {
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
  }, [countries, editForm]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    editForm.reset();
  }, [editForm]);

  const handleAdd = async (values) => {
    const addressFields = Object.fromEntries(
      Object.entries(values).filter(([key]) => key !== "dialCode"),
    );
    await run(
      dispatch,
      addAddress({ ...addressFields, isDefault: Boolean(values.isDefault) }),
      "Address added",
    );
    addForm.reset();
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

  const handleInvalidAdd = (validationErrors) => {
    scrollToFirstFormError(validationErrors, { idPrefix: "add" });
  };

  const handleInvalidEdit = (validationErrors) => {
    scrollToFirstFormError(validationErrors, {
      idPrefix: `edit-${editingId}`,
    });
  };

  const handleDelete = useCallback((addressId) => {
    setDeleteAddressId(addressId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteAddressId) return;
    await run(
      dispatch,
      deleteAddress({ addressId: deleteAddressId }),
      "Address deleted",
    );
    setDeleteAddressId(null);
    dispatch(fetchMe());
  }, [deleteAddressId, dispatch, run]);
  
  const handleToggleAddForm = useCallback(() => {
    if (!showAddForm) {
      addForm.reset();
    }
    setShowAddForm((value) => !value);
  }, [showAddForm, addForm]);

  const handleCloseAddForm = useCallback(() => {
    setShowAddForm(false);
    addForm.reset();
  }, [addForm]);

  const handleShowAllAddresses = useCallback(() => {
    setShowAllAddresses(!showAllAddresses);
  }, [showAllAddresses]);

  return {
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
  };
}
