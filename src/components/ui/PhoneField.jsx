import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { normalizeDialCode } from "../../lib/utils";

const getCountryCode = (country = {}) =>
  (
    country.iso2 ||
    country.isoCode ||
    country.countryCode ||
    country.code ||
    country.alpha2 ||
    ""
  ).toUpperCase();

const getCountryFlag = (country = {}) => {
  if (country.flag || country.emoji) return country.flag || country.emoji;

  const countryCode = getCountryCode(country);
  if (!/^[A-Z]{2}$/.test(countryCode)) return "";

  return countryCode
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

const getDialCodeOptions = (countries, dialCodes) => {
  if (countries.length) {
    return countries
      .map((country) => {
        const code = normalizeDialCode(country.dialCode || country.phoneCode);
        if (!code) return null;

        const flag = getCountryFlag(country);

        return {
          value: code,
          flag,
          name:
            country.name ||
            country.countryName ||
            country.label ||
            "",
          label: [flag, code].filter(Boolean).join(" "),
        };
      })
      .filter(Boolean);
  }

  return dialCodes
    .map((dialCode) => {
      const code = normalizeDialCode(dialCode);
      if (!code) return null;
      return { value: code, flag: "", label: code };
    })
    .filter(Boolean);
};

export default function PhoneField({
  id,
  label = "Phone",
  dialCodes = [],
  countries = [],
  phoneRegistration,
  dialCodeRegistration,
  error,
  placeholder = "Enter your phone",
  ...props
}) {
  const dialCodeOptions = getDialCodeOptions(countries, dialCodes);
  const dialCodeValues = dialCodeOptions.map((option) => option.value);
  const preferredDialCodes = dialCodes
    .map((dialCode) => normalizeDialCode(dialCode))
    .filter(Boolean);
  const preferredDialCode =
    preferredDialCodes.length === 1 ? preferredDialCodes[0] : "";

  const defaultDialCode =
    preferredDialCode ||
    (dialCodeValues.includes("+91") ? "+91" : dialCodeValues[0] || "+91");
  const defaultOption =
    dialCodeOptions.find((option) => option.value === defaultDialCode) || {
      value: defaultDialCode,
      flag: "",
      label: defaultDialCode,
    };
  const [selectedDialCode, setSelectedDialCode] = useState(defaultDialCode);
  const [isDialCodeOpen, setIsDialCodeOpen] = useState(false);
  const dialCodeDropdownRef = useRef(null);
  const selectedOption =
    dialCodeOptions.find((option) => option.value === selectedDialCode) ||
    defaultOption;

  useEffect(() => {
    setSelectedDialCode(defaultDialCode);
  }, [defaultDialCode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dialCodeDropdownRef.current?.contains(event.target)) {
        setIsDialCodeOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (dialCodeDropdownRef.current?.contains(event.target)) return;
      setIsDialCodeOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const updateDialCode = (value) => {
    setSelectedDialCode(value);
    setIsDialCodeOpen(false);
    dialCodeRegistration?.onChange?.({
      target: {
        name: dialCodeRegistration.name,
        value,
      },
    });
  };

  const handleDialCodeBlur = () => {
    dialCodeRegistration?.onBlur?.({
      target: {
        name: dialCodeRegistration.name,
        value: selectedDialCode,
      },
    });
  };

  return (
    <label
      className="grid gap-1.5 text-sm font-medium text-ink"
      htmlFor={id}
    >
      <span>{label}</span>

      <div className="relative flex h-11 w-full min-w-0 rounded-[8px] border border-[var(--customer-border)] bg-white shadow-sm transition-colors duration-200 ease-out focus-within:border-[var(--customer-gold)]/70  ">

        {dialCodeOptions.length > 1 ? (
          <div
            ref={dialCodeDropdownRef}
            className={`relative h-full w-[84px] shrink-0 rounded-l-[8px] transition-colors duration-200 ease-out min-[375px]:w-[90px] sm:w-[96px] `}
          >
            <input
              id={`${id}-dialCode`}
              type="hidden"
              {...dialCodeRegistration}
              value={selectedDialCode}
              readOnly
            />
            <button
              type="button"
              className="flex h-full w-full items-center gap-1 rounded-l-[8px] bg-transparent px-2 pr-6 text-[13px] font-semibold text-[var(--customer-ink)] outline-none transition-colors duration-200 ease-out focus-visible:bg-[var(--customer-gold-soft)] focus-visible:outline-none min-[375px]:gap-1.5 min-[375px]:px-3 min-[375px]:pr-7 sm:text-sm"
              aria-expanded={isDialCodeOpen}
              aria-haspopup="listbox"
              aria-controls={`${id}-dialCode-options`}
              onClick={() => setIsDialCodeOpen((current) => !current)}
              onBlur={handleDialCodeBlur}
            >
              {selectedOption.flag ? (
                <span aria-hidden="true">{selectedOption.flag}</span>
              ) : null}
              <span>{selectedOption.value}</span>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--customer-muted)] transition-transform duration-300 ease-in-out min-[375px]:right-2 ${isDialCodeOpen ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>

            <div
              id={`${id}-dialCode-options`}
              role="listbox"
              className={`absolute left-0 top-[calc(100%+6px)] z-50 max-h-60 w-[min(78vw,220px)] overflow-y-auto rounded-[8px] border border-[var(--customer-border)] bg-white py-1 shadow-[0_12px_30px_rgba(3,1,77,0.14)] transition-all duration-200 ease-out [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin] sm:w-[220px] ${isDialCodeOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
                }`}
            >
              {dialCodeOptions.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === selectedDialCode}
                  className={`flex min-h-9 w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-[var(--customer-ink)] transition-colors duration-150 hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-navy)] sm:text-sm ${option.value === selectedDialCode ? "bg-[var(--customer-gold-soft)] text-[var(--customer-navy)]" : ""
                    }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => updateDialCode(option.value)}
                >
                  {option.flag ? <span aria-hidden="true">{option.flag}</span> : null}
                  <span className="min-w-0 truncate">
                    ({option.value}) {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-full w-[84px] shrink-0 items-center gap-1 rounded-l-[8px] px-2 text-[13px] font-semibold text-[var(--customer-ink)] min-[375px]:w-[90px] min-[375px]:gap-1.5 min-[375px]:px-3 sm:w-[96px] sm:text-sm">
              {defaultOption.flag ? (
                <span aria-hidden="true">{defaultOption.flag}</span>
              ) : null}
              <span>{defaultOption.value}</span>
            </div>

            <input
              type="hidden"
              {...dialCodeRegistration}
              defaultValue={defaultDialCode}
            />
          </>
        )}

        <div className="my-auto h-5 w-px shrink-0 bg-[var(--customer-border)]" />

        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          maxLength={10}
          className="h-full min-w-0 flex-1 rounded-r-[8px] border-0 bg-white px-2 text-[13px] font-semibold text-[var(--customer-ink)] outline-none placeholder:font-normal placeholder:text-[var(--customer-muted)] focus:bg-white focus:outline-none focus:ring-0 min-[375px]:px-3 sm:text-sm autofill:[-webkit-box-shadow:0_0_0_1000px_white_inset] autofill:[-webkit-text-fill-color:var(--customer-ink)]"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
          }}
          {...phoneRegistration}
          {...props}
        />
      </div>

      <span className="min-h-4 text-xs font-normal text-red-600">
        {error?.message}
      </span>
    </label>
  );
}
