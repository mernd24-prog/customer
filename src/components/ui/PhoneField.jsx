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
  ...props
}) {
  return (
    <label
      className="grid gap-1.5 text-sm font-medium text-ink lg:text-base"
      htmlFor={id}
    >
      <span>
        {label}
        {(required || phoneRegistration?.required || dialCodeRegistration?.required) && (
          <span className="ml-0.5 text-red-500">*</span>
        )}
      </span>

      <div className="relative flex h-11 w-full min-w-0 overflow-hidden rounded-[8px] border border-[var(--customer-border)] bg-transparent shadow-sm transition-colors duration-200 ease-out focus-within:border-[var(--customer-gold)]/70">
        <div className="flex h-full w-[60px] shrink-0 items-center justify-center rounded-l-[8px] bg-transparent px-1 text-[13px] font-semibold text-[var(--customer-ink)] sm:text-sm">
          <span>{FIXED_INDIAN_DIAL_CODE}</span>
        </div>

        <input
          type="hidden"
          {...dialCodeRegistration}
          value={FIXED_INDIAN_DIAL_CODE}
          readOnly
        />

        <div className="my-auto h-5 w-px shrink-0 bg-[var(--customer-border)]" />

        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          maxLength={10}
          className="h-full min-w-0 flex-1 rounded-r-[8px] border-0 bg-transparent px-3 text-[13px] font-semibold text-[var(--customer-ink)] outline-none placeholder:font-normal placeholder:text-[var(--customer-muted)] focus:bg-transparent focus:outline-none focus:ring-0 sm:text-sm autofill:[-webkit-box-shadow:0_0_0_1000px_transparent_inset] autofill:[-webkit-text-fill-color:var(--customer-ink)]"
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
