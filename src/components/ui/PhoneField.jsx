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
  const normalizedDialCodes = dialCodes.map((c) => String(c)).filter(Boolean);

  return (
    <label className="grid gap-1.5 font-montserrat text-sm font-medium text-[#2E2E2E]" htmlFor={id}>
      <span>{label}</span>
      <div className="flex items-center min-h-11 w-full rounded-[8px] border border-[#cfc6b8] bg-white focus-within:border-[#CE9F2D] focus-within:ring-2 focus-within:ring-[#CE9F2D]/20 transition-all duration-300 ease-in-out">
        {normalizedDialCodes.length > 1 ? (
          <div className="relative flex h-full items-center min-w-[70px]">
            <select
              id={`${id}-dialCode`}
              {...dialCodeRegistration}
              className="h-full w-full appearance-none bg-transparent pl-3 pr-5 py-2 font-montserrat text-sm text-[#2E2E2E] outline-none border-none focus:ring-0 cursor-pointer"
            >
              <option value=""></option>
              {normalizedDialCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 text-[10px] text-[#666]">
              ▼
            </span>
          </div>
        ) : (
          <>
            <div className="h-full flex items-center pl-3 text-sm text-[#2E2E2E] min-w-[70px]">
              {normalizedDialCodes[0] || ""}
            </div>
            <input
              type="hidden"
              {...dialCodeRegistration}
              defaultValue={normalizedDialCodes[0] || ""}
            />
          </>
        )}
        <div className="h-6 w-[1px] bg-[#cfc6b8]"></div>
        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          maxLength={10}
          className="h-full flex-1 bg-transparent px-3 py-2 font-montserrat text-sm text-[#2E2E2E] outline-none border-none focus:ring-0 placeholder:text-[#A6A6A6]"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
          }}
          {...phoneRegistration}
          {...props}
        />
      </div>
      <span className="min-h-4 font-montserrat text-xs font-normal text-red-600">
        {error?.message}
      </span>
    </label>
  );
}
