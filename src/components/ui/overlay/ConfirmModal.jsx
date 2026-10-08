import BaseModal from "./BaseModal";
import Button from "../buttons/Button";
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
  image,
  children,
  confirmClassName = "",
}) {
  if (!open) return null;

  const imageUrl =
    typeof image === "string" ? image : image?.url || image?.src || "";

  return (
    <BaseModal onClose={onCancel} maxWidth="max-w-md">
      <div className="px-5 pb-6 pt-6 sm:px-6">
        <div className="flex items-start gap-4">
          {Boolean(imageUrl) && (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#E7E7E7] bg-[#F8F9FA] p-2 shadow-sm">
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[19px] font-bold leading-snug text-[#1B1D60] sm:text-[20px]">
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-black/60">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

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
            iconPosition="left"
            className={`h-[42px] rounded-[10px] bg-[#CE9F2D] px-5 font-semibold text-[#1B1D60] hover:bg-[#B88200] ${confirmClassName}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

