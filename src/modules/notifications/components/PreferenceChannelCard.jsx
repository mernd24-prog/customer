import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../../utils/common";

export function PreferenceChannelCard({ channel, isChecked, onToggle }) {
  const Icon = channel.icon;

  return (
    <div
      onClick={onToggle}
      className={cn(
        "group relative flex items-center justify-between gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        isChecked
          ? "border-[#E2D2B2] bg-[#FAF6EE]/80 shadow-xs"
          : "border-[#ECE2D0] bg-white hover:border-[#CE9F2D]/60 hover:bg-[#FAF6EE]/40",
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200",
            isChecked
              ? "bg-[#FAF4E6] text-[#9A751E] border border-[#EADBBD]"
              : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] group-hover:bg-[#F1F5F9] group-hover:text-[#1B1D60]",
          )}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <h4 className="text-[14px] font-bold text-[#1B1D60] leading-tight">
            {channel.title}
          </h4>
          <p className="text-[11px] sm:text-[12px] text-[#6F7480] mt-1 leading-snug line-clamp-2">
            {channel.description}
          </p>
        </div>
      </div>

      {/* Custom Checkbox */}
      <div
        className={cn(
          "w-5 h-5 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors duration-200",
          isChecked
            ? "bg-[#CE9F2D] border-[#CE9F2D] text-white shadow-2xs"
            : "border-[#CBD5E1] bg-white group-hover:border-[#CE9F2D]",
        )}
      >
        {isChecked && <Check size={13} className="stroke-[3]" />}
      </div>
    </div>
  );
}
