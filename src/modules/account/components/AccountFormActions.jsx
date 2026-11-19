import React from "react";
import { GoldOutlineButton, PillButton } from "../../../components/ui/button/buttonSpecialized";

export default function AccountFormActions({
  submitLabel = "Save Changes",
  submitIcon,
  loading = false,
  disabled = false,
  onCancel,
  cancelLabel = "Cancel",
  cancelDisabled = false,
  borderTop = false,
  className = "",
  children,
}) {
  return (
    <div
      className={`flex flex-row items-center justify-end gap-2 sm:gap-3 ${
        borderTop ? "border-t border-[#E7D9B8]/60 pt-4" : "pt-2"
      } ${className}`}
    >
      {onCancel && (
        <GoldOutlineButton
          onClick={onCancel}
          disabled={cancelDisabled || loading}
          className="flex-1 sm:flex-none sm:w-auto"
        >
          {cancelLabel}
        </GoldOutlineButton>
      )}

      {children}

      <PillButton
        type="submit"
        size="sm"
        isLoading={loading}
        disabled={disabled || loading}
        leftIcon={submitIcon}
        className={
          onCancel
            ? "flex-1 sm:flex-none sm:w-auto min-w-0 sm:min-w-[130px]"
            : "w-full sm:w-auto"
        }
      >
        {submitLabel}
      </PillButton>
    </div>
  );
}
