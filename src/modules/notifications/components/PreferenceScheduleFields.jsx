import React from "react";
import { Clock, Globe } from "lucide-react";
import CustomDropdown from "../../../components/ui/CustomDropdown";

export function PreferenceScheduleFields({
  frequency,
  onFrequencyChange,
  frequencyOptions,
  timezone,
  onTimezoneChange,
  timezoneOptions,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6 pt-5 border-t border-[#F2EADC]">
      {/* Frequency */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clock size={16} className="text-navy shrink-0" />
          <span className="text-sm font-bold text-navy">Frequency</span>
        </div>
        <p className="text-caption sm:text-xs text-muted mb-2.5">
          How often would you like to receive notifications?
        </p>
        <CustomDropdown
          options={frequencyOptions}
          value={frequency}
          onChange={onFrequencyChange}
          className="w-full"
          buttonClassName="h-11 rounded-lg border-[#CE9F2D] bg-white text-xs sm:text-sm font-semibold text-navy"
        />
      </div>

      {/* Timezone */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-navy shrink-0" />
          <span className="text-sm font-bold text-navy">Timezone</span>
        </div>
        <p className="text-caption sm:text-xs text-muted mb-2.5">
          Select your preferred timezone.
        </p>
        <CustomDropdown
          options={timezoneOptions}
          value={timezone}
          onChange={onTimezoneChange}
          className="w-full"
          buttonClassName="h-11 rounded-lg border-[#CE9F2D] bg-white text-xs sm:text-sm font-semibold text-navy"
        />
      </div>
    </div>
  );
}
