import BaseModal from "./BaseModal";
import Button from "../buttons/Button";
import { SendHorizonal, ShieldCheck } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  confirmDisabled = false,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "navy",
  children,
}) {
  if (!open) return null;

  return (
    <BaseModal onClose={onCancel} maxWidth="max-w-md">
      <div className="px-5 sm:px-6 pb-6 pt-7">
        <h2 className="text-[20px] font-bold leading-[28px] text-[#1B1D60]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-black/60">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex items-center justify-end gap-3">
          {cancelLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-[42px] rounded-[10px] border-[#1B1D60] px-5 font-semibold text-[#1B1D60]"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant="custom"
            size="sm"
            onClick={onConfirm}
            disabled={confirmDisabled}
            icon={<SendHorizonal size={14} />}
            iconPosition="left"
            className="h-[42px] rounded-[10px] bg-[#CE9F2D] px-5 font-semibold text-[#1B1D60] hover:bg-[#B88200]"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
