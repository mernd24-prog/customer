import { useEffect, useState, useRef } from "react";
import { normalizeDialCode } from "../../../lib/utils";
import { getAddressId, fetchFullList } from "../utils/checkoutUtils";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchZipCodes,
} from "../../../features/global/globalSlice";
import { validatePostalCodeForCountry } from "../../../validations";

export function useCheckoutAddress({
  dispatch,
  userState,
  watch,
  setValue,
  selectedAddressId,
  selectedCountry,
  selectedState,
  selectedCity,
  watchedPostalCode,
  useNewAddress,
}) {
  const addresses = userState.current?.addresses || [];
  
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [postalCodes, setPostalCodes] = useState([]);
  
  const newAddressFormRef = useRef(null);
  const shouldScrollToNewAddressRef = useRef(false);

  useEffect(() => {
    fetchFullList(dispatch, fetchCountries).then((list) => {
      setCountries(list);
    });
  }, [dispatch]);

  const countryObj = countries.find((c) => (c.name || c) === selectedCountry);
  const countryId = countryObj?._id || countryObj?.id;
  const checkoutDialCodes = countryObj?.dialCode
    ? [normalizeDialCode(countryObj.dialCode)]
    : Array.from(
        new Set(
          countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean),
        ),
      ).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return;
    }
    fetchFullList(dispatch, fetchStates, { countryId })
      .then((list) => setStates(list))
      .catch(() => setStates([]));
  }, [countryId, dispatch]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const isValid = states.some((s) => (s.name || s) === selectedState);
      if (!isValid) {
        setValue("state", "");
        setValue("city", "");
      }
    }
  }, [selectedCountry, states, selectedState, setValue]);

  useEffect(() => {
    if (selectedCountry && countryObj?.dialCode) {
      setValue("dialCode", normalizeDialCode(countryObj.dialCode), {
        shouldValidate: true,
      });
    }
  }, [selectedCountry, countryObj, setValue]);

  useEffect(() => {
    if (selectedState) {
      const stateObj = states.find((s) => (s.name || s) === selectedState);
      const stateId = stateObj?._id || stateObj?.id;
      if (stateId) {
        fetchFullList(dispatch, fetchCities, { stateId }).then((list) => {
          setCities(list);
        });
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [selectedState, states, dispatch]);

  useEffect(() => {
    if (selectedCity) {
      const cityObj = cities.find((c) => (c.name || c) === selectedCity);
      const cityId = cityObj?._id || cityObj?.id;
      if (cityId) {
        fetchFullList(dispatch, fetchZipCodes, { cityId }).then((list) => {
          setPostalCodes(list);
        });
      } else {
        setPostalCodes([]);
      }
    } else {
      setPostalCodes([]);
    }
  }, [selectedCity, cities, dispatch]);

  useEffect(() => {
    const isValid =
      watchedPostalCode &&
      validatePostalCodeForCountry(watchedPostalCode, selectedCountry).valid;
    if (isValid) {
      const timer = setTimeout(() => {
        dispatch(fetchZipCodes({ params: { zip: watchedPostalCode } }))
          .unwrap()
          .then((res) => {
            const data = res.data || res || {};
            if (data.city && data.state) {
              setValue("city", data.city, { shouldValidate: true });
              setValue("state", data.state, { shouldValidate: true });
              if (data.country) {
                setValue("country", data.country, { shouldValidate: true });
              }
            }
          });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedPostalCode, selectedCountry, dispatch, setValue]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setValue("selectedAddressId", getAddressId(def), {
        shouldValidate: true,
      });
      setValue("useNewAddress", false);
    }
    if (addresses.length === 0) {
      setValue("useNewAddress", true);
    }
  }, [addresses, selectedAddressId, setValue]);

  const handleAddNewAddress = () => {
    if (useNewAddress && newAddressFormRef.current) {
      newAddressFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    shouldScrollToNewAddressRef.current = true;
    setValue("useNewAddress", true, { shouldValidate: true });
  };

  useEffect(() => {
    if (!useNewAddress || !shouldScrollToNewAddressRef.current) return;
    const frameId = window.requestAnimationFrame(() => {
      newAddressFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      shouldScrollToNewAddressRef.current = false;
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [useNewAddress]);

  return {
    addresses,
    countries,
    setCountries,
    states,
    setStates,
    cities,
    setCities,
    postalCodes,
    setPostalCodes,
    countryObj,
    countryId,
    checkoutDialCodes,
    newAddressFormRef,
    shouldScrollToNewAddressRef,
    handleAddNewAddress,
  };
}
