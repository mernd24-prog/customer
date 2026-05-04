export function normalizeApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (Array.isArray(data?.details) && data.details.length > 0) {
    const first = data.details[0];
    return first?.message || first;
  }
  return error?.message || fallback;
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
