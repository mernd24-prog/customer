import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Bell,
  BellRing,
  Mail,
  MessageSquareText,
  Smartphone,
  SlidersHorizontal,
  Clock,
  Globe,
  BookmarkCheck,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import CustomDropdown from "../../components/ui/CustomDropdown";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "../../features/notification/notificationSlice";
import { useFetch } from "../customer/helpers";
import { cn } from "../../utils/common";
import { BotanicalLeavesSvg } from "../../components/ui/icons";

const CHANNELS = [
  {
    key: "email",
    title: "Email Notifications",
    description:
      "Receive updates about your orders, offers and account activity via email.",
    icon: Mail,
  },
  {
    key: "sms",
    title: "SMS Notifications",
    description: "Get important updates directly on your mobile number.",
    icon: MessageSquareText,
  },
  {
    key: "push",
    title: "Push Notifications",
    description: "Stay informed with real-time updates on your device.",
    icon: Bell,
  },
  {
    key: "inApp",
    title: "In-app Notifications",
    description: "View all updates directly in the Sam Global app.",
    icon: Smartphone,
  },
];

const FREQUENCY_OPTIONS = [
  { value: "real_time", label: "Real Time" },
  { value: "daily", label: "Daily Digest" },
  { value: "weekly", label: "Weekly Summary" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+05:30)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+04:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+08:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
];


export function PreferencesPage() {
  const dispatch = useDispatch();
  const state = useFetch(
    fetchNotificationPreferences,
    undefined,
    (s) => s.notification,
  );
  const run = useToastThunk();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
      frequency: "real_time",
      timezone: "Asia/Kolkata",
    },
  });

  const values = watch();

  useEffect(() => {
    if (!state.current) return;
    const prefs = state.current;
    reset({
      email: prefs.channels?.email ?? true,
      sms: prefs.channels?.sms ?? true,
      push: prefs.channels?.push ?? true,
      inApp: prefs.channels?.inApp ?? true,
      frequency: prefs.frequency || "real_time",
      timezone: prefs.timezone || "Asia/Kolkata",
    });
  }, [state.current, reset]);

  const onSubmit = async (v) => {
    try {
      setIsSubmitting(true);
      await run(
        dispatch,
        updateNotificationPreferences({
          channels: {
            email: Boolean(v.email),
            sms: Boolean(v.sms),
            push: Boolean(v.push),
            inApp: Boolean(v.inApp),
          },
          eventTypes: {
            order: true,
            payment: true,
            shipping: true,
            promo: true,
            referral: true,
            newProduct: true,
          },
          frequency: v.frequency || "real_time",
          doNotDisturbStart: "22:00",
          doNotDisturbEnd: "07:00",
          timezone: v.timezone || "Asia/Kolkata",
        }),
        "Preferences saved",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {/* Channels Heading with Sliders Icon */}
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

                  {/* 2x2 Channels Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {CHANNELS.map((ch) => {
                      const isChecked = Boolean(values[ch.key]);
                      const Icon = ch.icon;

                      return (
                        <div
                          key={ch.key}
                          onClick={() =>
                            setValue(ch.key, !isChecked, { shouldDirty: true })
                          }
                          className={cn(
                            "group relative flex items-center justify-between gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                            isChecked
                              ? "border-[#E2D2B2] bg-[#FAF6EE]/80 shadow-xs"
                              : "border-[#ECE2D0] bg-white hover:border-[#CE9F2D]/60 hover:bg-[#FAF6EE]/40",
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Soft, balanced icon container */}
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
                                {ch.title}
                              </h4>
                              <p className="text-[11px] sm:text-[12px] text-[#6F7480] mt-1 leading-snug line-clamp-2">
                                {ch.description}
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
                            {isChecked && (
                              <Check size={13} className="stroke-[3]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Frequency & Timezone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6 pt-5 border-t border-[#F2EADC]">
                    {/* Frequency */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-[#1B1D60] shrink-0" />
                        <span className="text-sm font-bold text-[#1B1D60]">
                          Frequency
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#6F7480] mb-2.5">
                        How often would you like to receive notifications?
                      </p>
                      <CustomDropdown
                        options={FREQUENCY_OPTIONS}
                        value={values.frequency}
                        onChange={(val) =>
                          setValue("frequency", val, { shouldDirty: true })
                        }
                        className="w-full"
                        buttonClassName="h-11 rounded-lg border-[#CE9F2D] bg-white text-xs sm:text-sm font-semibold text-[#1B1D60]"
                      />
                    </div>

                    {/* Timezone */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={16} className="text-[#1B1D60] shrink-0" />
                        <span className="text-sm font-bold text-[#1B1D60]">
                          Timezone
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#6F7480] mb-2.5">
                        Select your preferred timezone.
                      </p>
                      <CustomDropdown
                        options={TIMEZONE_OPTIONS}
                        value={values.timezone}
                        onChange={(val) =>
                          setValue("timezone", val, { shouldDirty: true })
                        }
                        className="w-full"
                        buttonClassName="h-11 rounded-lg border-[#CE9F2D] bg-white text-xs sm:text-sm font-semibold text-[#1B1D60]"
                      />
                    </div>
                  </div>
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
                      {isSubmitting
                        ? "Saving Preferences..."
                        : "Save Preferences"}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-white/90 shrink-0"
                    />
                  </button>
                </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}
