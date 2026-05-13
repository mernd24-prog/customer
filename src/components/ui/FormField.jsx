export default function FormField({ error, id, label, registration, type = "text", ...props }) {
  return (
    <label className="grid gap-1.5 font-montserrat text-sm font-medium text-[#2E2E2E]" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        className="min-h-11 rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none transition placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
        aria-invalid={Boolean(error)}
        {...registration}
        {...props}
      />
      <span className="min-h-4 font-montserrat text-xs font-normal text-red-600">{error?.message}</span>
    </label>
  );
}
