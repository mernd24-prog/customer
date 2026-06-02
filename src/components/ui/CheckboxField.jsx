export default function CheckboxField({
  id,
  label,
  registration,
  ...props
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-cream px-3 py-2.5 text-sm text-muted">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-border-strong accent-gold"
        {...registration}
        {...props}
      />
      {label}
    </label>
  );
}
