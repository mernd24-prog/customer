
import { useAnimatedPresence } from "../../../hooks/useAnimatedPresence";
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
  icon: Icon,
  iconBgClassName = "bg-[#F5E9C9]",
  iconClassName = "text-[#1B1D60]",
  iconSize = 22,
  children,
  confirmClassName = "",
  maxWidth = "max-w-md",
  modalClassName = "",
}) {
  const { present, exiting } = useAnimatedPresence(open);

  if (!present) return null;

  const imageUrl =
    typeof image === "string" ? image : image?.url || image?.src || "";

  return (
    <BaseModal
      exiting={exiting}
      onClose={onCancel}
      maxWidth={`w-[calc(100vw-24px)] ${maxWidth}`}
      className={`max-h-[calc(100dvh-24px)] overflow-y-auto ${modalClassName}`}
    >
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {Boolean(imageUrl) && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden shadow-sm sm:h-16 sm:w-16">
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

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {Icon && (
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBgClassName}`}
                >
                  <Icon
                    size={iconSize}
                    strokeWidth={2}
                    className={iconClassName}
                    aria-hidden="true"
                  />
                </span>
              )}

              <h2 className="min-w-0 break-words text-[16px] font-bold leading-tight text-[#1B1D60] sm:text-[20px]">
                {title}
              </h2>
            </div>

            {description && (
              <div className="mt-2.5 whitespace-pre-line break-words text-[13px] leading-[1.5] text-[#1B1D60] sm:mt-3 sm:text-[15px]">
                {description}
              </div>
            )}
          </div>
        </div>

        {children && (
          <div className="mt-4 min-w-0">
            {children}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {cancelLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-10 w-full rounded-lg border-[#1B1D60] bg-white px-4 text-sm font-semibold text-[#1B1D60] transition-colors hover:bg-[#f4f6ff] sm:w-auto sm:min-w-[96px] sm:text-[15px]"
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
            className={`h-10 w-full rounded-lg bg-[#D93C3C] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c52f2f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[96px] sm:text-[15px] ${confirmClassName}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
