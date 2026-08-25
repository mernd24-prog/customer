const TOKEN_MASK = "sam-global-route-token-v1";
const TOKEN_VERSION = "rt1";

function maskByte(index) {
  return TOKEN_MASK.charCodeAt(index % TOKEN_MASK.length);
}

function encodeBase64Url(value) {
  const text = JSON.stringify(value);
  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(text)
      : Uint8Array.from(unescape(encodeURIComponent(text)), (char) => char.charCodeAt(0));
  const binary = String.fromCharCode(
    ...Array.from(bytes, (byte, index) => byte ^ maskByte(index) ^ ((index * 31) & 255)),
  );
  const encoded =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(token) {
  const normalized = String(token || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  const decodedBinary = String.fromCharCode(
    ...Array.from(binary, (char, index) => char.charCodeAt(0) ^ maskByte(index) ^ ((index * 31) & 255)),
  );

  if (typeof TextDecoder !== "undefined") {
    const bytes = Uint8Array.from(decodedBinary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  return JSON.parse(decodeURIComponent(escape(decodedBinary)));
}

export function encodeRouteToken(kind, payload = {}) {
  return encodeBase64Url({ t: TOKEN_VERSION, k: kind, ...payload });
}

export function decodeRouteToken(token, expectedKind) {
  try {
    const payload = decodeBase64Url(token);
    if (!payload || payload.t !== TOKEN_VERSION) return null;
    if (expectedKind && payload.k !== expectedKind) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getOpaqueOrderPath(orderId, { track = false, query = "" } = {}) {
  if (!orderId) return "/orders";
  const token = encodeRouteToken("order", { id: String(orderId) });
  const suffix = track ? "/track" : "";
  return `/orders/i/${encodeURIComponent(token)}${suffix}${query}`;
}

export function getOpaqueReturnRequestPath(orderId, query = "") {
  if (!orderId) return "/returns";
  const token = encodeRouteToken("order", { id: String(orderId) });
  return `/returns/request/i/${encodeURIComponent(token)}${query}`;
}

export function getOpaqueWarrantyPath(warrantyId) {
  if (!warrantyId) return "/warranty";
  const token = encodeRouteToken("warranty", { id: String(warrantyId) });
  return `/warranty/i/${encodeURIComponent(token)}`;
}

export function getOpaquePaymentResultPath(status, orderId, reason = "") {
  const params = new URLSearchParams();
  if (orderId) params.set("o", encodeRouteToken("order", { id: String(orderId) }));
  if (reason) params.set("reason", reason);
  const query = params.toString();
  return `/payment/${status}${query ? `?${query}` : ""}`;
}
