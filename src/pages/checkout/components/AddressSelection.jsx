import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pencil, Phone } from "lucide-react";
import Button from "../../../components/ui/Button";
import AddressFormFields, {
  ADDRESS_LABEL_OPTIONS,
} from "../../../components/address/AddressFormFields";
import { updateAddress, fetchMe } from "../../../features/user/userSlice";
import {
  fetchCities,
  fetchStates,
  fetchZipCodes,
} from "../../../features/global/globalSlice";
import OrderDetailSectionCard from "../../orders/components/OrderDetailSectionCard";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { normalizeDialCode } from "../../../lib/utils";
import { addressSchema } from "../../../validations/validationSchemas";
import { validatePostalCodeForCountry } from "../../../validations";

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
        new Set(
          countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean),
        ),
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
  const infoClass =
    "flex items-start gap-2  font-medium leading-[18px] text-[#1B1D60] text-[14px] sm:leading-[22px] md:text-[16px] md:leading-[26px] lg:text-[18px] lg:leading-[30px]";

  return (
    <OrderDetailSectionCard
      title="Delivery Address"
      className="w-full"
      bodyClassName="flex mt-4 sm:mt-0 flex-col w-full max-w-full gap-5 px-4 pb-0 sm:px-5 sm:pt-5 sm:pb-0 md:px-[25px] lg:pb-0"
      headerContent={
        <button
          type="button"
          onClick={() =>
            setValue("useNewAddress", true, { shouldValidate: true })
          }
          className="inline-flex w-full sm:w-[150px] h-10 sm:h-6 items-center justify-center text-[#3E4093] text-center text-sm sm:text-base font-semibold leading-6 transition hover:opacity-90"
        >
          + Add New Address
        </button>
      }
    >
      {addresses.map((addr) => {
        const addrId = getAddressId(addr);
        const isEditing = editingId === addrId;
        const postalCode = addr.postalCode || addr.postal_code || "";
        const label = String(addr.label || "Home");
        return (
          <div
            key={addrId}
            className={`border-b  border-border  transition-all duration-300 ease-in-out last:border-b-0 ${
              selectedAddressId === addrId && !useNewAddress
                ? "bg-white"
                : "bg-white"
            }`}
          >
            {isEditing ? (
              <div className=" grid gap-4 py-4 sm:pb-8">
                <div className="flex  items-center gap-2 text-sm font-semibold text-ink">
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
              <div className="flex w-full items-start gap-3 sm:gap-[15px] border-b border-[#CE9F2D4D]">
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold capitalize text-white sm:px-[15px] sm:py-[7px] sm:text-[13px] ${
                      label?.toLowerCase() === "work"
                        ? "bg-[#1B1D60]"
                        : "bg-[#CE9F2D]"
                    }`}
                  >
                    {label}
                  </span>
                  <label className="my-6 flex w-full cursor-pointer items-start gap-2 sm:gap-3">
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
                      className="mt-1 h-fit w-[18px] shrink-0 accent-[#3E4093] sm:h-5 sm:w-5"
                    />
                    <span className="min-w-0">
                      <span className="block  font-bold leading-[24px] text-[#2E2E2E] text-[18px] sm:leading-[28px] md:text-[20px] md:leading-[30px] lg:text-[24px] lg:leading-[36px]">
                        {addr.fullName || "Address"}
                      </span>
                      <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-[10px]">
                        {addr.phone && (
                          <span className={infoClass}>
                            <Phone
                              size={18}
                              className="text-gold-dark mt-1 shrink-0"
                            />
                            {addr.phone}
                          </span>
                        )}
                        <span className={infoClass}>
                          <MapPin
                            size={18}
                            className="text-gold-dark mt-1 shrink-0 items-center"
                          />
                          <span>
                            {[
                              addr.line1,
                              addr.line2,
                              addr.city,
                              addr.state,
                              postalCode,
                              addr.country || "India",
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </span>
                      </div>
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(addr)}
                  className="inline-flex lg:h-10 lg:w-10 h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#1B1D6099] bg-[#1B1D600D] p-2.5 text-[#1B1D60] transition-all duration-300 hover:border-[#CE9F2D] hover:bg-[#CE9F2D1A]"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
      {errors.selectedAddressId && (
        <p className="text-xs text-red-600  mt-1">
          {errors.selectedAddressId.message}
        </p>
      )}
    </OrderDetailSectionCard>
  );
}
