import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import BrandButton from "../../components/ui/buttons/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "../../features/notification/notificationSlice";
import { useFetch } from "../customer/helpers";

export function PreferencesPage() {
  const dispatch = useDispatch();
  const state = useFetch(
    fetchNotificationPreferences,
    undefined,
    (s) => s.notification,
  );
  const run = useToastThunk();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
      frequency: "real_time",
      timezone: "Asia/Kolkata",
    },
  });

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

  const CHANNELS = [
    { key: "email", label: "Email notifications" },
    { key: "sms", label: "SMS notifications" },
    { key: "push", label: "Push notifications" },
    { key: "inApp", label: "In-app notifications" },
  ];

  return (
    <>
      <Seo title="Notification Preferences | Sam Global" />
      <div className="">
        <h1 className=" my-6 text-2xl font-bold text-ink">
          Notification Preferences
        </h1>
        <ApiState loading={state.loading} error={state.error} empty={false}>
          <form
            className="rounded-[12px] border border-border bg-white p-6 sm:p-8"
            onSubmit={handleSubmit((v) =>
              run(
                dispatch,
                updateNotificationPreferences({
                  channels: {
                    email: v.email,
                    sms: v.sms,
                    push: v.push,
                    inApp: v.inApp,
                  },
                  eventTypes: {
                    order: true,
                    payment: true,
                    shipping: true,
                    promo: true,
                    referral: true,
                    newProduct: true,
                  },
                  frequency: v.frequency,
                  doNotDisturbStart: "22:00",
                  doNotDisturbEnd: "07:00",
                  timezone: v.timezone,
                }),
                "Preferences saved",
              ),
            )}
          >
            <div className="mb-6">
              <h2 className="mb-1  text-base font-semibold text-ink">
                Channels
              </h2>
              <p className=" text-sm text-muted">
                Choose how you&apos;d like to receive notifications.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {CHANNELS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-border px-4 py-3"
                >
                  <span className=" text-sm font-medium text-ink">{label}</span>
                  <input
                    type="checkbox"
                    {...register(key)}
                    className="h-4 w-4 accent-gold"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className=" text-sm font-medium text-ink">Frequency</span>
                <select
                  {...register("frequency")}
                  className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5  text-sm text-ink outline-none focus:border-gold"
                >
                  <option value="real_time">Real Time</option>
                  <option value="daily">Daily Digest</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className=" text-sm font-medium text-ink">Timezone</span>
                <input
                  {...register("timezone")}
                  className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5  text-sm text-ink outline-none focus:border-gold"
                />
              </label>
            </div>
            <div className="mt-6">
              <BrandButton
                variant="primary"
                rounded
                type="submit"
                label="Save Preferences"
                className="h-11 px-8 text-sm font-semibold"
              />
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}
