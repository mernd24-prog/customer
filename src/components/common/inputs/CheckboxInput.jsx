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
        "flex cursor-pointer items-center gap-2 font-montserrat text-sm text-[#2E2E2E]",
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
        className="h-4 w-4 cursor-pointer accent-[#CE9F2D] rounded"
        {...registration}
        {...props}
      />
      {label}
    </label>
  );
}
