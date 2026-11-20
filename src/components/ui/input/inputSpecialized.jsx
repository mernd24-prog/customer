import React from "react";
import { Search } from "lucide-react";
import { cn } from "../../../utils/common";
import DynamicInput from "./input";
import { resolveInputClasses } from "./inputConfig";

export const TextInput = React.forwardRef((props, ref) => (
  <DynamicInput ref={ref} type="text" {...props} />
));
TextInput.displayName = "TextInput";

export const PasswordInput = React.forwardRef((props, ref) => (
  <DynamicInput ref={ref} type="password" {...props} />
));
PasswordInput.displayName = "PasswordInput";

export const EmailInput = React.forwardRef((props, ref) => (
  <DynamicInput ref={ref} type="email" {...props} />
));
EmailInput.displayName = "EmailInput";

export const PhoneInput = React.forwardRef((props, ref) => (
  <DynamicInput ref={ref} type="tel" {...props} />
));
PhoneInput.displayName = "PhoneInput";

export const TextareaInput = React.forwardRef((props, ref) => (
  <DynamicInput ref={ref} as="textarea" {...props} />
));
TextareaInput.displayName = "TextareaInput";

export const SearchInputField = React.forwardRef(
  ({ leftIcon = <Search className="size-4" />, ...props }, ref) => (
    <DynamicInput
      ref={ref}
      type="search"
      shape="circle"
      leftIcon={leftIcon}
      {...props}
    />
  ),
);
SearchInputField.displayName = "SearchInputField";

export const CheckboxInput = React.forwardRef(
  (
    {
      id,
      label,
      checked,
      onChange,
      disabled = false,
      className = "",
      registration,
      ...props
    },
    ref,
  ) => (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm text-[var(--customer-ink)]",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        ref={ref}
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
  ),
);
CheckboxInput.displayName = "CheckboxInput";

export const RadioInput = React.forwardRef(
  (
    {
      id,
      name,
      label,
      value,
      checked,
      onChange,
      disabled = false,
      className = "",
      ...props
    },
    ref,
  ) => (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm text-ink",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        ref={ref}
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
  ),
);
RadioInput.displayName = "RadioInput";

export const SelectInput = React.forwardRef(
  (
    {
      id,
      label,
      options = [],
      value,
      onChange,
      placeholder = "Select…",
      required = false,
      disabled = false,
      error,
      variant = "default",
      size = "md",
      shape = "rounded",
      className = "",
      selectClassName = "",
      registration,
      ...props
    },
    ref,
  ) => (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--customer-ink)]"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          resolveInputClasses({
            variant,
            size,
            shape,
            error: Boolean(error),
          }),
          "cursor-pointer appearance-none",
          selectClassName,
        )}
        {...registration}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = opt?.value ?? opt;
          const optLabel = opt?.label ?? opt;
          return (
            <option key={val} value={val}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && (
        <span role="alert" className="min-h-4 text-xs text-red-600">
          {error?.message ?? error}
        </span>
      )}
    </div>
  ),
);
SelectInput.displayName = "SelectInput";


