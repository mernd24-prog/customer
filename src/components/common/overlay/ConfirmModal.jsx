import BaseModal from "./BaseModal";
import Button from "../buttons/Button";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}) {
  if (!open) return null;

  return (
    <BaseModal onClose={onCancel} maxWidth="max-w-md">
      <div className="px-6 py-6 pt-8 ">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
