export default function CheckboxField({
  id,
  label,
  registration,
  ...props
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-[#FAF6EE] px-3 py-2.5 text-sm text-[#787878]">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-[#cfc6b8] accent-[#CE9F2D]"
        {...registration}
        {...props}
      />
      {label}
    </label>
  );
}
