import React from "react";
import { SlidersHorizontal, BookmarkCheck, ChevronRight } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import { cn } from "../../../utils/common";

import { useNotificationPreferences } from "../controllers/useNotificationPreferences";
import { PreferenceChannelCard } from "../components/PreferenceChannelCard";
import { PreferenceScheduleFields } from "../components/PreferenceScheduleFields";

export function PreferencesPage() {
  const {
    state,
    isSubmitting,
    values,
    setValue,
    handleSubmit,
    onSubmit,
    channels,
    frequencyOptions,
    timezoneOptions,
  } = useNotificationPreferences();

  return (
    <>
      <Seo title="Notification Preferences | Sam Global" />
      <div className="w-full py-6 sm:py-8 lg:py-10">
        {/* Top Header */}
        <div className="relative mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1D60] tracking-tight">
                Notification Preferences
              </h1>
              <p className="text-xs sm:text-sm text-[#6F7480] mt-1 font-medium">
                Choose how you&apos;d like to receive notifications and stay
                updated with your orders, offers and more.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <ApiState loading={state.loading} error={state.error} empty={false}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl sm:rounded-3xl border border-[#E7D9B8] bg-white p-5 sm:p-7 lg:p-9 shadow-[0_10px_35px_rgba(17,24,39,0.06)]"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F4F6FB] border border-[#E2E8F0] flex items-center justify-center text-[#3E4093] shrink-0">
                  <SlidersHorizontal size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1B1D60] leading-tight">
                    Notification Channels
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#6F7480] mt-0.5">
                    Select the channels you want to receive notifications
                    through.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {channels.map((ch) => {
                  const isChecked = Boolean(values[ch.key]);
                  return (
                    <PreferenceChannelCard
                      key={ch.key}
                      channel={ch}
                      isChecked={isChecked}
                      onToggle={() =>
                        setValue(ch.key, !isChecked, { shouldDirty: true })
                      }
                    />
                  );
                })}
              </div>

              {/* Frequency & Timezone Row */}
              <PreferenceScheduleFields
                frequency={values.frequency}
                onFrequencyChange={(val) =>
                  setValue("frequency", val, { shouldDirty: true })
                }
                frequencyOptions={frequencyOptions}
                timezone={values.timezone}
                onTimezoneChange={(val) =>
                  setValue("timezone", val, { shouldDirty: true })
                }
                timezoneOptions={timezoneOptions}
              />
            </div>

            {/* Save Preferences Button */}
            <div className="mt-8 flex items-center justify-start">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3 rounded-xl",
                  "bg-gradient-to-r from-[#D6A323] via-[#CE9F2D] to-[#B8871B]",
                  "text-white font-bold text-[14px]",
                  "shadow-[0_4px_16px_rgba(206,159,45,0.35)]",
                  "hover:shadow-[0_6px_22px_rgba(206,159,45,0.45)] hover:scale-[1.01] active:scale-[0.99]",
                  "transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                <BookmarkCheck size={18} className="text-white shrink-0" />
                <span>
                  {isSubmitting ? "Saving Preferences..." : "Save Preferences"}
                </span>
                <ChevronRight size={16} className="text-white/90 shrink-0" />
              </button>
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}

export default PreferencesPage;
