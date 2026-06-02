import { cn } from "../../../utils/classNames";

export default function CheckboxInput({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  registration,
  ...props
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2  text-sm text-[var(--customer-ink)]",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 cursor-pointer rounded accent-[var(--customer-gold)]"
        {...registration}
        {...props}
      />
      {label}
    </label>
  );
}
