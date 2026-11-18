import React from "react";
import { MapPin, Plus } from "lucide-react";
import { GoldButton } from "../../../components/ui/button/buttonSpecialized";

export default function AccountEmptyState({
  icon: Icon = MapPin,
  title,
  description,
  action,
  actionLabel,
  onAction,
  actionIcon = <Plus size={16} />,
  className = "",
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-[#CE9F2D] bg-[#FFFCF5] px-5 py-10 text-center ${className}`}
    >
      {Icon && (
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#F5E9C9] text-[#1B1D60]">
          <Icon size={23} />
        </span>
      )}

      {title && (
        <h3 className="text-base font-semibold text-[#1B1D60]">
          {title}
        </h3>
      )}

      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-[#64708A]">
          {description}
        </p>
      )}

      {action ? (
        action
      ) : actionLabel && onAction ? (
        <GoldButton
          onClick={onAction}
          leftIcon={actionIcon}
          className="mt-4"
        >
          {actionLabel}
        </GoldButton>
      ) : null}
    </div>
  );
}
