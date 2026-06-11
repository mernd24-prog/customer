import { normalizeDialCode } from "../../lib/utils";

export default function PhoneField({
  id,
  label = "Phone",
  dialCodes = [],
  phoneRegistration,
  dialCodeRegistration,
  error,
  placeholder = "Enter your phone",
  ...props
}) {
  const normalizedDialCodes = dialCodes
    .map((c) => normalizeDialCode(c))
    .filter(Boolean);

  const defaultDialCode = normalizedDialCodes.includes("+91")
    ? "+91"
    : normalizedDialCodes[0] || "+91";

  return (
    <label
      className="grid gap-1.5 text-sm font-medium text-ink"
      htmlFor={id}
    >
      <span>{label}</span>

      <div className="flex h-11 w-full overflow-hidden rounded-[6px] border border-[#CBD5E1] bg-white">

        {normalizedDialCodes.length > 1 ? (
          <div className="relative min-w-[78px]">
            <select
              id={`${id}-dialCode`}
              {...dialCodeRegistration}
              defaultValue={defaultDialCode}
              className="h-11 appearance-none border-0 bg-transparent px-3 text-sm text-ink outline-none focus:outline-none focus:ring-0"
            >
              <option value=""></option>

              {normalizedDialCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="flex h-11 min-w-[78px] items-center px-3 text-sm text-ink">
              {defaultDialCode}
            </div>

            <input
              type="hidden"
              {...dialCodeRegistration}
              defaultValue={defaultDialCode}
            />
          </>
        )}

        <div className="my-auto h-5 w-px bg-[#CBD5E1]" />

        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          maxLength={10}
          className="h-11 flex-1 border-0 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-gray focus:outline-none focus:ring-0"
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
