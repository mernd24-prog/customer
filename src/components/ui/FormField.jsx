export default function FormField({ error, id, label, registration, type = "text", ...props }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-800" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-stone-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        aria-invalid={Boolean(error)}
        {...registration}
        {...props}
      />
      <span className="min-h-4 text-xs font-normal text-red-700">{error?.message}</span>
    </label>
  );
}
