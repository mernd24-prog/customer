import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeDialCode(dialCode = "") {
  const code = String(dialCode || "").trim();
  if (!code) return "";
  if (code.startsWith("+")) return code;
  if (code.startsWith("00")) return `+${code.slice(2)}`;
  return `+${code}`;
}
