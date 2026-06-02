import { cn } from "../../../utils/classNames";

export default function RadioInput({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2  text-sm text-ink",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-3.5 w-3.5 cursor-pointer accent-gold"
        {...props}
      />
      {label}
    </label>
  );
}
