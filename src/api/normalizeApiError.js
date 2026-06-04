export function normalizeApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (error?.code === "ECONNABORTED") {
    return "The server is taking too long to respond. Please try again.";
  }
  if (typeof data === "string") return data;
  if (data?.message) return normalizeErrorMessage(data.message, fallback);
  if (data?.error) return normalizeErrorMessage(data.error, fallback);
  if (Array.isArray(data?.details) && data.details.length > 0) {
    const first = data.details[0];
    return normalizeErrorMessage(first?.message || first, fallback);
  }
  return error?.message || fallback;
}

export function normalizeErrorMessage(error, fallback = "Request failed") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return error.map((item) => normalizeErrorMessage(item, "")).filter(Boolean).join(", ") || fallback;
  }
  if (typeof error === "object") {
    return (
      error.message ||
      error.error ||
      error.msg ||
      error.detail ||
      error.title ||
      fallback
    );
  }
  return String(error);
}

export function normalizeApiResponse(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    return {
      data: payload.data ?? null,
      meta: payload.meta ?? null,
      message: payload.message ?? ""
    };
  }
  return {
    data: payload ?? null,
    meta: null,
    message: ""
  };
}
