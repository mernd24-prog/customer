const FIXED_INDIAN_DIAL_CODE = "+91";

export default function PhoneField({
  id,
  label = "Phone",
  dialCodes = [],
  countries = [],
  phoneRegistration,
  dialCodeRegistration,
  error,
  placeholder = "Enter your phone",
  required = false,
  reserveErrorSpace = true,
  ...props
}) {
  return (
    <label
      className="grid gap-1.5 text-sm font-medium text-[var(--customer-ink)] lg:text-base"
      htmlFor={id}
    >
      <span>
        {label}
        {(required ||
          phoneRegistration?.required ||
          dialCodeRegistration?.required) && (
          <span className="ml-0.5 text-red-500">*</span>
        )}
      </span>

      <div
        className={`relative flex h-11 w-full min-w-0 overflow-hidden rounded-lg border bg-transparent shadow-sm transition-colors duration-200 ease-out focus-within:border-[var(--customer-gold)]/70 ${
          error
            ? "border-red-500"
            : "border-[var(--customer-border)]"
        }`}
      >
       <div className=" flex h-full w-[45px] shrink-0 items-center justify-center px-2 text-lg  font-normal leading-5 text-[var(--customer-ink)]">
  <span>{FIXED_INDIAN_DIAL_CODE}</span>
</div>

        <input
          type="hidden"
          {...dialCodeRegistration}
          value={FIXED_INDIAN_DIAL_CODE}
          readOnly
        />

        <div className="my-auto h-5 w-px shrink-0 bg-[var(--customer-border)]" />

        {/* Phone number */}
        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          maxLength={10}
          inputMode="numeric"
          aria-invalid={Boolean(error)}
          className="customer-input h-full min-w-0 flex-1 !rounded-none !border-0 !bg-transparent !px-3 !py-0 text-base font-normal leading-5 text-[var(--customer-ink)] outline-none placeholder:font-normal placeholder:text-[var(--customer-muted)] focus:!border-0 focus:!ring-0"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
          }}
          {...phoneRegistration}
          {...props}
        />
      </div>

      {(reserveErrorSpace || error?.message) && (
        <span
          className={`mt-0.5 text-xs font-normal leading-[18px] text-red-600 ${reserveErrorSpace ? "min-h-[18px]" : ""}`}
          aria-live="polite"
        >
          {error?.message}
        </span>
      )}
    </label>
  );
}
