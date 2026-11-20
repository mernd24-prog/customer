import React, { useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../../utils/common";
import { SpinnerIcon } from "../icons";
import { inputSizes } from "./inputSizes";
import { inputVariants } from "./inputVariants";
import { inputShapes, resolveInputClasses } from "./inputConfig";

export { inputSizes, inputVariants, inputShapes };

export const DynamicInput = React.forwardRef(
  (
    {
      as: Component = "input",
      id,
      name,
      label,
      type = "text",
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      variant = "default",
      size = "md",
      shape = "rounded",
      error,
      hint,
      required = false,
      disabled = false,
      readOnly = false,
      loading = false,
      leftIcon,
      rightIcon,
      showPasswordToggle = true,
      unwrapped = false,
      className = "",
      inputClassName = "",
      labelClassName = "",
      errorClassName = "",
      hintClassName = "",
      registration,
      rows,
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && isPasswordVisible ? "text" : type;

    const hasError = Boolean(error);
    const errorMessage = error?.message ?? (typeof error === "string" ? error : "");

    const inputId = id || registration?.name || name;

    const hasLeftIcon = Boolean(leftIcon);
    const hasRightContent = Boolean(rightIcon || loading || (isPassword && showPasswordToggle));

    const resolvedInputClasses = resolveInputClasses({
      variant,
      size,
      shape,
      error: hasError,
      hasLeftIcon,
      hasRightIcon: hasRightContent,
      className: inputClassName,
      inputVariants,
      inputSizes,
    });

    if (unwrapped) {
      return (
        <Component
          ref={ref}
          id={inputId}
          name={name}
          type={Component === "textarea" ? undefined : resolvedType}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          rows={Component === "textarea" ? (rows || 4) : undefined}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : hint
                ? `${inputId}-hint`
                : undefined
          }
          className={cn(
            resolvedInputClasses,
            Component === "textarea" && "min-h-[104px] resize-y py-3",
          )}
          {...registration}
          {...props}
        />
      );
    }

    return (
      <div className={cn("grid gap-1.5 w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-semibold text-[#171B3F]",
              disabled && "opacity-60 cursor-not-allowed",
              labelClassName,
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {hasLeftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-[#8C8E9E]">
              {leftIcon}
            </div>
          )}

          <Component
            ref={ref}
            id={inputId}
            name={name}
            type={Component === "textarea" ? undefined : resolvedType}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            readOnly={readOnly}
            rows={Component === "textarea" ? (rows || 4) : undefined}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            className={cn(
              resolvedInputClasses,
              Component === "textarea" && "min-h-[104px] resize-y py-3",
            )}
            {...registration}
            {...props}
          />

          {loading ? (
            <div className="absolute right-3.5 flex items-center justify-center text-[var(--customer-gold,#CE9F2D)]">
              <SpinnerIcon className="size-4 animate-spin text-current" />
            </div>
          ) : isPassword && showPasswordToggle ? (
            <button
              type="button"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3 flex size-8 items-center justify-center rounded-md text-[#8C8E9E] transition-colors hover:text-[#171B3F] focus:outline-none"
            >
              {isPasswordVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="pointer-events-none absolute right-3.5 flex items-center justify-center text-[#8C8E9E]">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {hint && !hasError && (
          <p
            id={`${inputId}-hint`}
            className={cn("text-xs text-[#626982]", hintClassName)}
          >
            {hint}
          </p>
        )}

        {hasError && errorMessage && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className={cn("text-xs text-red-600 min-h-4", errorClassName)}
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

DynamicInput.displayName = "DynamicInput";

DynamicInput.propTypes = {
  as: PropTypes.elementType,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.node,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  variant: PropTypes.string,
  size: PropTypes.string,
  shape: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string }),
  ]),
  hint: PropTypes.node,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  loading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  showPasswordToggle: PropTypes.bool,
  unwrapped: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  hintClassName: PropTypes.string,
  registration: PropTypes.object,
  rows: PropTypes.number,
};

export default DynamicInput;

