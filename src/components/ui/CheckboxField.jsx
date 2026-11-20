import DynamicInput from "./input/input";

export default function CheckboxField({
  id,
  label,
  registration,
  ...props
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-cream px-3 py-2.5 text-sm text-muted">
      <DynamicInput
        unwrapped
        variant="uiCheckbox"
        id={id}
        type="checkbox"
        registration={registration}
        {...props}
      />
      {label}
    </label>
  );
}
