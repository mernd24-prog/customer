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
  maxWidth = "max-w-md",
  modalClassName = "",
}) {
  if (!open) return null;

  const imageUrl =
    typeof image === "string" ? image : image?.url || image?.src || "";

  return (
    <BaseModal onClose={onCancel} maxWidth={maxWidth} className={modalClassName}>
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
            <h2 className="text-[24px] font-bold leading-[1.2] text-[#1B1D60] sm:text-[20px]">
              {title}
            </h2>

            {description && (
              <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.5] text-[#1B1D60]">
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
              className="h-[40px] min-w-[96px] rounded-lg border-[#1B1D60] bg-white px-4 text-[15px] font-semibold text-[#1B1D60] transition-colors hover:bg-[#f4f6ff]"
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
            className={`h-[40px] min-w-[96px] rounded-lg bg-[#D93C3C] px-4 font-semibold  text-[15px] text-white hover:bg-[#B88200] transition-colors hover:bg-[#c52f2f]${confirmClassName}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

