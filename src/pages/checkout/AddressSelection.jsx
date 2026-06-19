import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pencil, Phone } from "lucide-react";
import Button from "../../components/ui/Button";
import AddressFormFields, {
  ADDRESS_LABEL_OPTIONS,
} from "../../components/address/AddressFormFields";
import { updateAddress, fetchMe } from "../../features/user/userSlice";
import {
  fetchCities,
  fetchStates,
  fetchZipCodes,
} from "../../features/global/globalSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { normalizeDialCode } from "../../lib/utils";
import { addressSchema } from "../../validations/validationSchemas";
import { validatePostalCodeForCountry } from "../../validations";

const getAddressId = (addr) => addr?._id || addr?.id || "";

const addressLabels = ADDRESS_LABEL_OPTIONS;

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

const normalizeLabelValue = (value) => {
  const normalized = String(value || "").toLowerCase();
  return ["home", "work", "other"].includes(normalized) ? normalized : "home";
};

export default function AddressSelection({
  addresses,
  selectedAddressId,
  useNewAddress,
  setValue,
  errors,
  countries = [],
}) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const editForm = useForm({ resolver: zodResolver(addressSchema) });
  const [editingId, setEditingId] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [postalCodes, setPostalCodes] = useState([]);

  const editCountry = editForm.watch("country");
  const editState = editForm.watch("state");
  const editCity = editForm.watch("city");
  const editPostalCode = editForm.watch("postalCode");

  const editCountryObj = countries.find((c) => (c.name || c) === editCountry);
  const editDialCodes = editCountryObj?.dialCode
    ? [normalizeDialCode(editCountryObj.dialCode)]
    : Array.from(
        new Set(countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean)),
      ).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));

  useEffect(() => {
    if (!editCountry) {
      setStates([]);
      return;
    }

    const countryObj = countries.find((c) => (c.name || c) === editCountry);
    const countryId = countryObj?._id || countryObj?.id;
    if (!countryId) {
      setStates([]);
      return;
    }

    fetchFullList(dispatch, fetchStates, { countryId })
      .then((list) => setStates(list))
      .catch(() => setStates([]));
  }, [editCountry, countries, dispatch]);

  useEffect(() => {
    if (editCountry && editState) {
      const isValid = states.some((s) => (s.name || s) === editState);
      if (!isValid) {
        editForm.setValue("state", "");
        editForm.setValue("city", "");
      }
    }
  }, [editCountry, states, editState, editForm]);

  useEffect(() => {
    if (!editState) {
      setCities([]);
      return;
    }

    const stateObj = states.find((s) => (s.name || s) === editState);
    const stateId = stateObj?._id || stateObj?.id;
    if (!stateId) {
      setCities([]);
      return;
    }

    fetchFullList(dispatch, fetchCities, { stateId })
      .then((list) => setCities(list))
      .catch(() => setCities([]));
  }, [editState, states, dispatch]);

  useEffect(() => {
    if (!editCity) {
      setPostalCodes([]);
      return;
    }

    const cityObj = cities.find((c) => (c.name || c) === editCity);
    const cityId = cityObj?._id || cityObj?.id;
    if (!cityId) {
      setPostalCodes([]);
      return;
    }

    fetchFullList(dispatch, fetchZipCodes, { cityId })
      .then((list) => setPostalCodes(list))
      .catch(() => setPostalCodes([]));
  }, [editCity, cities, dispatch]);

  useEffect(() => {
    const isValid =
      editPostalCode &&
      validatePostalCodeForCountry(editPostalCode, editCountry).valid;
    if (!isValid) return undefined;

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
  }, [editForm, editPostalCode, editCountry, dispatch]);

  useEffect(() => {
    if (editCountry && editCountryObj?.dialCode) {
      editForm.setValue("dialCode", normalizeDialCode(editCountryObj.dialCode));
    }
  }, [editCountry, editCountryObj, editForm]);

  const startEdit = (addr) => {
    const addrId = getAddressId(addr);
    let dialCode = addr.dialCode;
    if (!dialCode && addr.country && countries.length > 0) {
      const country = countries.find((c) => (c.name || c) === addr.country);
      if (country?.dialCode) dialCode = country.dialCode;
    }

    setEditingId(addrId);
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
    await dispatch(fetchMe());
  };

  return (
    <section className="overflow-hidden rounded-[8px] border border-border bg-white">
      <div className="flex items-center justify-between gap-3 bg-cream-strong px-4 py-3 sm:px-5">
        <h2 className="text-base font-bold text-ink">Delivery Address</h2>
        <button
          type="button"
          onClick={() => setValue("useNewAddress", true, { shouldValidate: true })}
          className="text-xs font-bold text-navy transition hover:text-gold-dark"
        >
          + Add New Address
        </button>
      </div>
      <div className="grid px-4 py-3 sm:px-5">
        {addresses.map((addr) => {
          const addrId = getAddressId(addr);
          const isEditing = editingId === addrId;
          const postalCode = addr.postalCode || addr.postal_code || "";
          const label = String(addr.label || "Home");
          return (
            <div
              key={addrId}
              className={`border-b border-border py-4 transition-all duration-300 ease-in-out last:border-b-0 ${
                selectedAddressId === addrId && !useNewAddress
                  ? "bg-white"
                  : "bg-white"
              }`}
            >
              {isEditing ? (
                <div className="grid gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Pencil size={16} className="text-gold" />
                    Edit address
                  </div>
                  <AddressFormFields
                    form={editForm}
                    idPrefix={`checkout-edit-${addrId}`}
                    countries={countries}
                    states={states}
                    cities={cities}
                    postalCodes={postalCodes}
                    dialCodes={editDialCodes}
                    selectedCountry={editCountry}
                    selectedState={editState}
                    selectedCity={editCity}
                    selectedPostalCode={editPostalCode}
                    addressLabels={addressLabels}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      loading={loading}
                      onClick={editForm.handleSubmit(handleUpdate)}
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
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold capitalize text-white ${
                        label.toLowerCase() === "work" ? "bg-navy" : "bg-gold"
                      }`}
                    >
                      {label}
                    </span>
                    <label className="mt-3 flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        name="addressSelect"
                        value={addrId}
                        checked={selectedAddressId === addrId && !useNewAddress}
                        onChange={() => {
                          setValue("selectedAddressId", addrId, {
                            shouldValidate: true,
                          });
                          setValue("useNewAddress", false, {
                            shouldValidate: true,
                          });
                        }}
                        className="mt-1 h-4 w-4 accent-navy"
                      />
                      <span className="min-w-0">
                        <span className="block text-lg font-bold leading-tight text-ink">
                          {addr.fullName || "Address"}
                        </span>
                        {addr.phone && (
                          <span className="mt-3 flex items-center gap-1.5 text-sm text-ink">
                            <Phone size={13} className="text-gold-dark" />
                            {addr.phone}
                          </span>
                        )}
                        <span className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-ink">
                          <MapPin size={13} className="mt-0.5 shrink-0 text-gold-dark" />
                          <span>
                            {[addr.line1, addr.line2, addr.city, addr.state, postalCode, addr.country || "India"]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(addr)}
                    className="mt-8 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-navy transition-all duration-300 ease-in-out hover:border-gold hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30"
                    aria-label="Edit address"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {useNewAddress && (
          <div className="rounded-[8px] border border-gold bg-gold-soft px-3 py-2 text-sm font-semibold text-navy">
            New address form is selected.
          </div>
        )}
        {errors.selectedAddressId && (
          <p className="text-xs text-red-600  mt-1">
            {errors.selectedAddressId.message}
          </p>
        )}
      </div>
    </section>
  );
}
