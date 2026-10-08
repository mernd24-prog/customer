import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { useFetchThunk as useFetch } from "../../../hooks/useFetchThunk";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "../slices/notificationSlice";
import {
  PREFERENCE_CHANNELS,
  FREQUENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../utils/notificationUtils";

export function useNotificationPreferences() {
  const dispatch = useDispatch();
  const state = useFetch(
    fetchNotificationPreferences,
    undefined,
    (s) => s.notification,
  );
  const run = useToastThunk();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, reset, watch, setValue, register } = useForm({
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

  const onSubmit = useCallback(
    async (v) => {
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
    },
    [dispatch, run],
  );

  return {
    state,
    isSubmitting,
    values,
    setValue,
    register,
    handleSubmit,
    onSubmit,
    channels: PREFERENCE_CHANNELS,
    frequencyOptions: FREQUENCY_OPTIONS,
    timezoneOptions: TIMEZONE_OPTIONS,
  };
}
