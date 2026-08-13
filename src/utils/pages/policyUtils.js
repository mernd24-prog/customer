export function cleanPolicyText(value = "") {
  return String(value || "")
    .replace(/^\s*:\s*/, "")
    .trim();
}
