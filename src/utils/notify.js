import { createElement } from "react";
import { toast } from "react-toastify";
import CustomerToast from "../components/ui/CustomerToast";

function normalizePayload(type, payload) {
  if (typeof payload === "string") {
    return { message: payload };
  }

  if (payload && typeof payload === "object") {
    return {
      title: payload.title,
      message: payload.message || payload.description || "",
      actionLabel: payload.actionLabel,
      onAction: payload.onAction,
      tone: payload.tone,
      options: payload.options || {},
    };
  }

  return { message: "" };
}

function show(type, payload) {
  const normalized = normalizePayload(type, payload);
  const { options = {}, ...content } = normalized;

  return toast[type](
    createElement(CustomerToast, {
      type,
      title: content.title,
      message: content.message,
      actionLabel: content.actionLabel,
      onAction: content.onAction,
      tone: content.tone,
    }),
    {
      icon: false,
      ...options,
    },
  );
}

export const notify = {
  success: (payload) => show("success", payload),
  error: (payload) => show("error", payload),
  warning: (payload) => show("warning", payload),
  info: (payload) => show("info", payload),
};
