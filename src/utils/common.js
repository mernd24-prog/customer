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

 export function formatPageTitle(value = "") {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function scrollToTop(callback) {
  if (typeof window === "undefined") {
    callback?.();
    return;
  }

  if (window.scrollY <= 10) {
    callback?.();
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (typeof callback === "function") {
    let timer = null;
    const onScroll = () => {
      if (window.scrollY <= 5) {
        window.removeEventListener("scroll", onScroll);
        if (timer) clearTimeout(timer);
        callback();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Fallback in case scroll finishes or is interrupted
    timer = setTimeout(() => {
      window.removeEventListener("scroll", onScroll);
      callback();
    }, 280);
  }
}
