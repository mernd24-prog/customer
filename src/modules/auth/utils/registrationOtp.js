export function registrationOtpMessage(result = {}) {
  const data = result?.data || result || {};
  const mode = String(data.deliveryMode || "").toLowerCase();

  if (mode.includes("whatsapp")) return "A 6-digit registration OTP was sent to your WhatsApp number.";
  if (mode.includes("sms")) return "A 6-digit registration OTP was sent by SMS to your mobile number.";
  if (mode === "fallback_email") return "Mobile delivery failed, so the 6-digit registration OTP was sent to your email address.";
  if (mode.includes("email")) return "A 6-digit registration OTP was sent to your email address.";
  if (mode === "static") return "Testing mode: enter the configured 6-digit test OTP.";

  return data.message || "A 6-digit registration OTP was sent to your registered contact details.";
}
