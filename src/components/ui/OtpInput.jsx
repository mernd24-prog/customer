import { useRef } from "react";

export default function OtpInput({
  value = "",
  length = 6,
  onChange,
  error = "",
}) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const emit = (nextDigits) => {
    onChange?.(nextDigits.join(""));
  };

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    emit(next);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = (event.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] || "");
    emit(next);
    const nextFocus = Math.min(pasted.length, length - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-12 w-full rounded-[8px] border border-[#cfc6b8] bg-white text-center font-montserrat text-lg font-semibold text-[#2E2E2E] outline-none transition focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
          />
        ))}
      </div>
      {error ? <p className="mt-2 font-montserrat text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
